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


initial_prompt = """Create a course with this JSON structure:

{
  "id": "course-slug",
  "name": "Course Name",
  "learningObjectives": ["Goal 1", "Goal 2", "Goal 3", "Goal 4"],
  "modules": [
    {
      "id": "module-slug",
      "title": "Module Title",
      "isSafetyCheck": false,
      "subModules": [
        {
          "id": "lesson-slug",
          "title": "Lesson Title",
          "content": {
            "text": "5-6 sentences worth of lesson content",
            "aiGeneratedImage": "placeholder"
          }
        }
      ],
      "quiz": {
        "id": "quiz-slug",
        "questions": [
          {
            "id": "q1",
            "question": "Question text?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0
          }
        ]
      }
    }
  ],
  "finalAssessment": {
    "title": "Final Project",
    "description": "Project description",
    "arInstructions": ["Step 1", "Step 2", "Step 3"],
    "metaRayBansIntegration": true
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}

Requirements: 3 modules, 3 lessons each, 2 quiz questions per module. Use kebab-case IDs. Generate ONLY valid JSON.

Create a course about: """

@app.get("/")
def read_root():
    return {"message": "Foundry Course Builder API"}

@app.post("/api/generate-image")
async def generate_image(request: dict):
    try:
        prompt = request.get("prompt")
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "dall-e-3",
                    "prompt": f"Professional educational illustration: {prompt}. Clean, modern, suitable for online learning.",
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "standard"
                },
            )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {response.status_code} - {response.text}")

        data = response.json()
        return {"image_url": data["data"][0]["url"]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation error: {str(e)}")

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
                    "max_tokens": 4000,
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

@app.post("/api/course/publish")
async def publish_course(request: dict):
    try:
        course_id = request.get("courseId")
        if not course_id:
            raise HTTPException(status_code=400, detail="courseId is required")
        
        supabase = get_supabase_client()
        

        response = supabase.table("courses").update({
            "is_published": True
        }).eq("id", course_id).execute()
        
        if response.data:
            return {"success": True, "message": "Course published successfully"}
        else:
            raise HTTPException(status_code=404, detail="Course not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish course: {str(e)}")

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


        course_response = supabase.table("courses").insert({
            "title": course_data["name"],
            "summary": f"Generated course: {course_data['name']}",
            "is_published": False,
            "meta": {
                "learningObjectives": course_data.get("learningObjectives", []),
                "finalAssessment": course_data.get("finalAssessment", {})
            }
        }).execute()
        
        if course_response.data:
            course = course_response.data[0]
            course_id = course["id"]
            

            for module_idx, module in enumerate(course_data["modules"]):
                module_response = supabase.table("modules").insert({
                    "course_id": course_id,
                    "idx": module_idx,
                    "title": module["title"],
                    "summary": f"Module {module_idx + 1}: {module['title']}",
                }).execute()
                
                if module_response.data:
                    module_id = module_response.data[0]["id"]

                    for sub_idx, submodule in enumerate(module["subModules"]):
                        supabase.table("submodules").insert({
                            "module_id": module_id,
                            "idx": sub_idx,
                            "kind": "instruction",
                            "title": submodule["title"],
                            "body": submodule["content"]["text"]
                        }).execute()
                
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

@app.get("/api/course/{courseId}/voice-prompt")
async def getVoicePrompt(courseId: str):
    try:
        supabase = get_supabase_client()
        response = supabase.table("courses").select("title, meta").eq("id", courseId).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = response.data[0]
        meta = course.get("meta", {})
        title = course.get("title", "Unknown Course")
        
        final_assessment = meta.get("finalAssessment", {})
        
        ## optional below, may not affect prompt too much
        #if learning_objectives: 
           # objectives_text = "Learning objectives:\n" + "\n".join([f"- {obj}" for obj in learning_objectives]) 
        
        assessment_description = final_assessment.get("description", "Complete the final project")
        ar_instructions = final_assessment.get("arInstructions", [])

        ar_text = ""
        if ar_instructions:
            ar_text = "AR Instructions:\n" + "\n".join([f"{i+1}. {instruction}" for i, instruction in enumerate(ar_instructions)])
        
        voice_prompt = f"""You are a helpful voice assistant with live video input from your user. The user said the prompt was "{title}", 
        and then supply the metadata that shows the instructions, and description for this final project.

        Final project description: {assessment_description}

        {ar_text}"""
        
        return {"voice_prompt": voice_prompt}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating voice prompt: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
