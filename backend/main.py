from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json
import os
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
import base64
from io import BytesIO
from datetime import datetime, timedelta
import jwt
from typing import Optional
import logging
import traceback

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Foundry Course Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000") ],
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
        return await image_gen(data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claude API error: {str(e)}")
async def image_gen(claude_response: dict):

    try:
        course_content = claude_response["content"][0]["text"]
        
        clean_json = course_content
        if '```json' in clean_json:
            clean_json = clean_json.replace('```json', '').replace('```', '')
        if '```' in clean_json:
            clean_json = clean_json.replace('```', '')
        
        try:
            course_data = json.loads(clean_json)
        except json.JSONDecodeError:

            return {"content": course_content, "usage": claude_response.get("usage")}
        
        # Configure Gemini
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            print("GEMINI_API_KEY not configured, skipping image generation")
            return {"content": course_content, "usage": claude_response.get("usage")}
        
        genai.configure(api_key=gemini_api_key)

        model = genai.GenerativeModel('gemini-2.5-flash-image')
        

        for module in course_data.get("modules", []):
            for submodule in module.get("subModules", []):
                content = submodule.get("content", {})
                

                if content.get("aiGeneratedImage") == "placeholder":

                    lesson_text = content.get("text", "")
                    lesson_title = submodule.get("title", "")
                    
                    image_prompt = f"Professional educational illustration for: {lesson_title}. Context: {lesson_text[:150]}. Clean, modern style suitable for online learning."
                    
                    try:
                        print(f"Generating image for: {lesson_title}")

                        response = model.generate_content(image_prompt)
                        

                        image_found = False
                        if hasattr(response, 'candidates') and response.candidates:
                            for part in response.candidates[0].content.parts:
                                if hasattr(part, 'inline_data') and part.inline_data:

                                    img_data = part.inline_data.data
                                    img_base64 = base64.b64encode(img_data).decode()
                                    

                                    content["aiGeneratedImage"] = f"data:image/png;base64,{img_base64}"
                                    image_found = True
                                    print(f"Image generated for: {lesson_title}")
                                    break
                        
                        if not image_found:
                            print(f"No image data returned for: {lesson_title}, using placeholder")
                            content["aiGeneratedImage"] = "https://placehold.co/600x400/3b82f6/ffffff?text=" + lesson_title.replace(' ', '+')
                    
                    except Exception as img_error:
                        print(f"Error generating image for {lesson_title}: {str(img_error)}")

                        content["aiGeneratedImage"] = "https://placehold.co/600x400/ef4444/ffffff?text=Generation+Failed"
        

        updated_content = json.dumps(course_data, indent=2)
        return {"content": updated_content, "usage": claude_response.get("usage")}
        
    except Exception as e:
        print(f"Image generation error: {str(e)}")

        return {"content": claude_response["content"][0]["text"], "usage": claude_response.get("usage")}


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
        
        logger.info("Parsing course JSON...")
        clean_json = course_json
        if '```json' in clean_json:
            clean_json = clean_json.replace('```json', '').replace('```', '')
        if '```' in clean_json:
            clean_json = clean_json.replace('```', '')
        
        try:
            course_data = json.loads(clean_json)
            logger.info(f"Course data parsed successfully: {course_data.get('name', 'Unknown')}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")

        course = await parse_and_store_course(course_data)
        logger.info(f"Course created successfully with ID: {course['id']}")
        
        return {"success": True, "courseId": course["id"], "message": "Course created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in parse_course: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to create course: {str(e)}")

async def parse_and_store_course(course_data):
    try:
        logger.info("Connecting to Supabase...")
        supabase = get_supabase_client()

        # Validate required fields
        if "name" not in course_data:
            raise ValueError("Course data missing 'name' field")
        if "modules" not in course_data or not course_data["modules"]:
            raise ValueError("Course data missing 'modules' field or modules array is empty")

        logger.info(f"Creating course: {course_data['name']}")
        course_response = supabase.table("courses").insert({
            "title": course_data["name"],
            "summary": f"Generated course: {course_data['name']}",
            "is_published": False,
            "meta": {
                "learningObjectives": course_data.get("learningObjectives", []),
                "finalAssessment": course_data.get("finalAssessment", {})
            }
        }).execute()
        
        if not course_response.data:
            raise Exception(f"Supabase returned no data when creating course. Response: {course_response}")
        
        course = course_response.data[0]
        course_id = course["id"]
        logger.info(f"Course created with ID: {course_id}")
        

        for module_idx, module in enumerate(course_data["modules"]):
            logger.info(f"Creating module {module_idx + 1}: {module.get('title', 'Untitled')}")
            
            if "title" not in module:
                raise ValueError(f"Module {module_idx} missing 'title' field")
            
            module_response = supabase.table("modules").insert({
                "course_id": course_id,
                "idx": module_idx,
                "title": module["title"],
                "summary": f"Module {module_idx + 1}: {module['title']}",
            }).execute()
            
            if not module_response.data:
                raise Exception(f"Failed to create module {module_idx}: {module['title']}")
            
            module_id = module_response.data[0]["id"]

            for sub_idx, submodule in enumerate(module.get("subModules", [])):
                logger.info(f"  Creating submodule {sub_idx + 1}: {submodule.get('title', 'Untitled')}")
                
                # Get image URL from content if it exists
                image_url = submodule.get("content", {}).get("aiGeneratedImage", None)
                content_text = submodule.get("content", {}).get("text", "")
                
                if not submodule.get("title"):
                    raise ValueError(f"Submodule {sub_idx} in module {module_idx} missing 'title' field")
                
                supabase.table("submodules").insert({
                    "module_id": module_id,
                    "idx": sub_idx,
                    "kind": "instruction",
                    "title": submodule["title"],
                    "body": content_text,
                    "image_url": image_url
                }).execute()
            
            # Create quiz for the module (outside submodule loop)
            if module.get("quiz") and module["quiz"].get("questions"):
                logger.info(f"  Creating quiz for module: {module['title']}")
                quiz_response = supabase.table("submodules").insert({
                    "module_id": module_id,
                    "idx": len(module.get("subModules", [])),
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
                            "prompt": question.get("question", ""),
                            "options": question.get("options", []),
                            "answer": str(question.get("correctAnswer", 0))
                        }).execute()
        
        logger.info(f"Course {course_id} created successfully with all modules")
        return course
        
    except KeyError as e:
        logger.error(f"Missing required field in course data: {str(e)}")
        raise ValueError(f"Missing required field in course data: {str(e)}")
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error in parse_and_store_course: {str(e)}")
        logger.error(traceback.format_exc())
        raise Exception(f"Database error while storing course: {str(e)}")

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


# ---------------------------------------
# LiveKit Connection Route
# ---------------------------------------

def create_participant_token(
    identity: str,
    name: str,
    room_name: str,
    agent_name: Optional[str] = None
) -> str:
    """Create a LiveKit access token for a participant"""
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not api_key or not api_secret:
        raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")
    
    # Create JWT token
    now = datetime.utcnow()
    exp = now + timedelta(minutes=15)
    
    claims = {
        "exp": int(exp.timestamp()),
        "iss": api_key,
        "nbf": int(now.timestamp()),
        "sub": identity,
        "name": name,
        "video": {
            "room": room_name,
            "roomJoin": True,
            "canPublish": True,
            "canPublishData": True,
            "canSubscribe": True,
        }
    }
    
    # Add room configuration with agent if provided
    if agent_name:
        claims["roomConfig"] = {
            "agents": [{"agentName": agent_name}]
        }
    
    token = jwt.encode(claims, api_secret, algorithm="HS256")
    return token


@app.post("/api/connection-details")
async def connection_details(request: dict):
    """
    Generate LiveKit connection details for the frontend.
    This endpoint creates a room and participant token.
    """
    try:
        livekit_url = os.getenv("LIVEKIT_URL")
        if not livekit_url:
            raise HTTPException(status_code=500, detail="LIVEKIT_URL is not configured")
        
        # Parse agent configuration from request body
        room_config = request.get("room_config", {})
        agents = room_config.get("agents", [])
        agent_name = agents[0].get("agent_name") if agents else None
        
        # Generate participant details
        participant_name = "user"
        participant_identity = f"voice_assistant_user_{int(datetime.utcnow().timestamp() * 1000) % 10000}"
        room_name = f"voice_assistant_room_{int(datetime.utcnow().timestamp() * 1000) % 10000}"
        
        # Create participant token
        participant_token = create_participant_token(
            identity=participant_identity,
            name=participant_name,
            room_name=room_name,
            agent_name=agent_name
        )
        
        return {
            "serverUrl": livekit_url,
            "roomName": room_name,
            "participantToken": participant_token,
            "participantName": participant_name,
        }
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create connection details: {str(e)}")


@app.post("/api/course/{courseId}/voice-session")
async def create_course_voice_session(courseId: str):
    """
    Create a voice session specifically for a course's final assessment.
    This fetches the course data and creates a customized agent session.
    """
    try:
        livekit_url = os.getenv("LIVEKIT_URL")
        if not livekit_url:
            raise HTTPException(status_code=500, detail="LIVEKIT_URL is not configured")
        
        # Fetch course data
        supabase = get_supabase_client()
        response = supabase.table("courses").select("title, meta").eq("id", courseId).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = response.data[0]
        meta = course.get("meta", {})
        title = course.get("title", "Unknown Course")
        final_assessment = meta.get("finalAssessment", {})
        
        # Format AR instructions as steps for the agent
        ar_instructions = final_assessment.get("arInstructions", [])
        description = final_assessment.get("description", "Complete the final project")
        
        # Convert to agent step format
        steps = []
        if ar_instructions:
            for i, instruction in enumerate(ar_instructions):
                steps.append({
                    "title": f"Step {i+1}",
                    "description": instruction
                })
        else:
            # Fallback if no AR instructions
            steps = [{
                "title": "Complete Project",
                "description": description
            }]
        
        # Generate room metadata with course information
        room_metadata = {
            "courseId": courseId,
            "courseTitle": title,
            "steps": steps,
            "description": description
        }
        
        # Generate participant details
        participant_name = "user"
        participant_identity = f"course_{courseId}_user_{int(datetime.utcnow().timestamp() * 1000) % 10000}"
        room_name = f"course_{courseId}_room_{int(datetime.utcnow().timestamp() * 1000) % 10000}"
        
        # Create participant token with agent
        participant_token = create_participant_token(
            identity=participant_identity,
            name=participant_name,
            room_name=room_name,
            agent_name="teaching-assistant"
        )
        
        return {
            "serverUrl": livekit_url,
            "roomName": room_name,
            "participantToken": participant_token,
            "participantName": participant_name,
            "courseTitle": title,
            "steps": steps,
            "metadata": room_metadata
        }
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create course voice session: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
