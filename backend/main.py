from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

app = FastAPI(title="Foundry Course Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_supabase_client():
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    return create_client(url, key)


initial_prompt = """# Course Generation System Prompt

You are an expert course designer tasked with creating comprehensive educational courses. Generate a complete course structure following this EXACT JSON format:

## Required Structure

```json
{
  "id": "course-slug",
  "name": "Course Name",
  "learningObjectives": [
    "Objective 1",
    "Objective 2", 
    "Objective 3",
    "Objective 4"
  ],
  "modules": [
    {
      "id": "module-slug",
      "title": "Module Title",
      "isSafetyCheck": false,
      "subModules": [
        {
          "id": "submodule-slug",
          "title": "Lesson Title",
          "content": {
            "text": "Detailed lesson content (2-3 sentences explaining key concepts)",
            "aiGeneratedImage": "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Lesson+Title"
          }
        },
        {
          "id": "submodule-slug-2", 
          "title": "Lesson Title 2",
          "content": {
            "text": "Detailed lesson content",
            "aiGeneratedImage": "https://via.placeholder.com/400x200/059669/FFFFFF?text=Lesson+Title+2"
          }
        },
        {
          "id": "submodule-slug-3",
          "title": "Lesson Title 3", 
          "content": {
            "text": "Detailed lesson content",
            "aiGeneratedImage": "https://via.placeholder.com/400x200/DC2626/FFFFFF?text=Lesson+Title+3"
          }
        }
      ],
      "quiz": {
        "id": "module-quiz-slug",
        "questions": [
          {
            "id": "question-slug-1",
            "question": "Multiple choice question?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0, reasoning behind the correct answer, and why the other options are wrong (this should stay in the correctAnswer column)
          },
          {
            "id": "question-slug-2", 
            "question": "Another question?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 2, reasoning behind the correct answer, and why the other options are wrong (this should stay in the correctAnswer column)
          }
        ]
      }
    }
  ],
  "finalAssessment": {
    "title": "AR-Guided Project Title",
    "description": "Detailed description of the final hands-on project (2-3 sentences)",
    "arInstructions": [
      "Step 1 instruction",
      "Step 2 instruction", 
      "Step 3 instruction",
      "Step 4 instruction",
      "Step 5 instruction"
    ],
    "metaRayBansIntegration": true
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Requirements

### Course Structure:
- **3 modules minimum** (can be more)
- **3 sub-modules per module** (exactly 3 lessons)
- **2 quiz questions per module** (minimum)
- **1 final AR-guided assessment**

### ID Formatting:
- Use kebab-case: `"safety-checks"`, `"basic-tools"`
- Be descriptive but concise
- Ensure uniqueness

### Content Guidelines:
- **Learning Objectives**: 4 clear, measurable goals
- **Lesson Content**: 1 detailed paragraphs (100-200 words) explaining key concepts with:
  - Comprehensive explanations of concepts
  - Real-world examples and applications
  - Step-by-step procedures where applicable
  - Safety considerations and warnings
  - Common mistakes and how to avoid them
  - Best practices and tips
- **Quiz Questions**: Test understanding of module concepts
- **AR Instructions**: 5 step-by-step instructions for final project

### Safety Considerations:
- Set `"isSafetyCheck": true` for safety-related modules
- Include safety protocols in relevant lessons
- Emphasize safety in AR instructions

## Example Output Format

Generate ONLY the JSON object, no additional text or explanations. The JSON should be valid and ready to use directly in the application.

## User Prompt Integration

When given a user prompt like "Create a course about [TOPIC]", structure the course around that topic while following all the requirements above.

Create a course about: """

@app.get("/")
def read_root():
    return {"message": "Foundry Course Builder API"}

@app.post("/api/claude")
async def claude_chat(request: dict):
    try:
        prompt = request.get("prompt")
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": os.getenv("ANTHROPIC_API_KEY"),
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 8000,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": initial_prompt + prompt}
                            ],
                        }
                    ],
                },
            )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Claude API error: {response.status_code} - {response.text}")

        data = response.json()
        return {"content": data["content"][0]["text"], "usage": data.get("usage")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claude API error: {str(e)}")

@app.post("/api/course")
async def parse_course(request: dict):
    try:
        course_json = request.get("courseJson")
        if not course_json:
            raise HTTPException(status_code=400, detail="courseJson is required")   
        clean_json = course_json
        if '```json' in clean_json:
            clean_json = clean_json.replace('```json', '').replace('```', '')
        if '```' in clean_json:
            clean_json = clean_json.replace('```', '')
        
        try:
            course_data = json.loads(clean_json)
        except json.JSONDecodeError as e:

            raise HTTPException(status_code=500, detail=f"Invalid JSON: {str(e)}")

        course = await parse_and_store_course(course_data)
       
        
        return {"success": True, "courseId": course["id"], "message": "Course created successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse course data: {str(e)}")

async def parse_and_store_course(course_data):
    try:

        supabase = get_supabase_client()

        # Insert course
        course_response = supabase.table("courses").insert({
            "title": course_data["name"],
            "summary": f"Generated course: {course_data['name']}",

        }).execute()
        
        if course_response.data:
            course = course_response.data[0]
            course_id = course["id"]
            
            # Insert modules
            for module_idx, module in enumerate(course_data["modules"]):
                module_response = supabase.table("modules").insert({
                    "course_id": course_id,
                    "idx": module_idx,
                    "title": module["title"],
                    "summary": f"Module {module_idx + 1}: {module['title']}",
                }).execute()
                
                if module_response.data:
                    module_id = module_response.data[0]["id"]
                    
                    # Insert submodules
                    for sub_idx, submodule in enumerate(module["subModules"]):
                        supabase.table("submodules").insert({
                            "module_id": module_id,
                            "idx": sub_idx,
                            "kind": "instruction",
                            "title": submodule["title"],
                            "body": submodule["content"]["text"],
                        }).execute()
                    
                    # Insert quiz if exists
                    if module.get("quiz") and module["quiz"].get("questions"):
                        quiz_response = supabase.table("submodules").insert({
                            "module_id": module_id,
                            "idx": len(module["subModules"]),
                            "kind": "quiz",
                            "title": f"Quiz: {module['title']}",
                            "body": f"Quiz for {module['title']}",
                        }).execute()
                        
                        if quiz_response.data:
                            quiz_id = quiz_response.data[0]["id"]
                            
                            # Insert quiz questions
                            for q_idx, question in enumerate(module["quiz"]["questions"]):
                                supabase.table("quiz_questions").insert({
                                    "submodule_id": quiz_id,
                                    "idx": q_idx,
                                    "type": "multiple_choice",
                                    "prompt": question["question"],
                                    "options": question["options"],
                                    "answer": str(question["correctAnswer"])
                                }).execute()
            
            return course
        else:
            raise Exception("Failed to create course")
    except Exception as e:
        raise e

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
