# LiveKit Voice Assistant Integration

This document explains how to use the LiveKit voice assistant integration in Foundry.

## Overview

The LiveKit integration provides a voice assistant that can guide users through course projects using real-time video and audio. The assistant uses Google's Gemini Realtime API and can see what the user sees through their camera.

## Architecture

### Backend Components

1. **`backend/agent.py`** - The LiveKit agent that handles voice interactions
   - `TeachingAssistant` class - Main agent implementation with Google Gemini Realtime
   - `TeachingSession` - Manages the current teaching session state
   - `StepEvaluator` - Evaluates user progress through video analysis
   - `entrypoint()` function - LiveKit worker entry point
   - Runs independently as `python agent.py`

2. **`backend/main.py`** - FastAPI endpoints with comprehensive error handling
   - `POST /api/connection-details` - Generates generic LiveKit room tokens
   - `POST /api/course/{courseId}/voice-session` - Creates course-specific session with AR instructions
   - `GET /api/course/{courseId}/voice-prompt` - Fetches course-specific prompts
   - Includes detailed logging and validation

3. **`backend/Dockerfile`** - Docker configuration
   - Python 3.12-slim base image
   - Security updates included
   - Health check enabled

4. **`docker-compose.yml`** - Container orchestration
   - Backend service with LiveKit environment variables
   - Volume mounting for development

### Frontend Components

- **`app/voice-assistant/page.tsx`** - Standalone voice assistant page for testing
- **`app/course/[id]/voice-assistant/page.tsx`** - Course-specific voice assistant with AR instructions
- **`components/course/final-assessment.tsx`** - Updated to link to voice assistant
- Beautiful UI with loading states, error handling, and step display

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The following LiveKit packages are included:
- `livekit==1.0.17`
- `livekit-agents==1.2.15`
- `livekit-api==1.0.7`
- `livekit-plugins-anthropic==1.2.15`
- `livekit-plugins-deepgram==1.2.15`
- `livekit-plugins-google==1.2.15`
- `PyJWT==2.10.1`

### 2. Configure Environment Variables

Add these to your `.env` file in the backend directory:

```env
# LiveKit Configuration
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Google AI (for voice agent)
GOOGLE_API_KEY=your_google_api_key

# Existing variables...
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...
```

### 3. Start the LiveKit Agent

The agent must be running to handle voice interactions:

```bash
cd backend
python agent.py
```

This will start the LiveKit agent worker that connects to your LiveKit server.

### 4. Start the FastAPI Backend

In a separate terminal:

```bash
cd backend
uvicorn main:app --reload
```

### 5. Start the Next.js Frontend

```bash
npm run dev
```

### 6. Access the Voice Assistant

**Option A: Test standalone page**
- Navigate to `http://localhost:3000/voice-assistant`

**Option B: Use course integration**
1. Navigate to any course page: `http://localhost:3000/course/[course-id]`
2. Click on "Final Assessment" tab
3. Click "Begin AR Assessment"
4. You'll be taken to `/course/[course-id]/voice-assistant`
5. Click "Start Voice Session" to connect

### 7. Using Docker (Alternative)

You can also run the backend in Docker:

```bash
docker-compose up --build
```

This will:
- Build the backend with Python 3.12-slim
- Install all dependencies including LiveKit packages
- Run the FastAPI server on port 8000
- Mount the backend directory for hot reloading

## How It Works

### Agent Flow

1. **User clicks "Start Voice Session"**
   - Frontend calls `/api/connection-details`
   - Backend generates a LiveKit room and participant token
   - Frontend receives connection details

2. **Agent connects to room**
   - LiveKit server dispatches job to agent worker
   - Agent initializes with course instructions
   - Agent starts greeting the user

3. **Teaching session**
   - Agent watches video feed from user's camera
   - Agent listens to user's audio
   - Agent periodically checks progress on current step
   - Agent provides verbal guidance and corrections
   - Agent marks steps complete and moves to next step

4. **Step evaluation**
   - Every 10 seconds, agent checks video feed
   - If step is complete, moves to next step
   - If user is doing something wrong/dangerous, warns them
   - Otherwise, provides encouragement

### Customizing for Course Projects

The integration includes automatic course customization via the `POST /api/course/{courseId}/voice-session` endpoint:

**How it works:**
1. Endpoint fetches course data from Supabase
2. Extracts `finalAssessment.arInstructions` from course metadata
3. Formats AR instructions as agent steps
4. Creates LiveKit room with course-specific data

**To further customize the agent:**

You can modify the `entrypoint` function in `agent.py` to read room metadata:

```python
async def entrypoint(ctx: JobContext):
    # Extract course data from room metadata
    metadata = ctx.room.metadata
    if metadata:
        course_data = json.loads(metadata)
        course_title = course_data.get('courseTitle', DEFAULT_COURSE_TITLE)
        steps = course_data.get('steps', DEFAULT_STEPS)
    else:
        course_title = DEFAULT_COURSE_TITLE
        steps = DEFAULT_STEPS
    
    session = AgentSession()
    await session.start(
        agent=TeachingAssistant(course_title, steps),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            video_enabled=True, 
            noise_cancellation=noise_cancellation.BVC()
        ),
    )
```

Then update the backend to pass metadata when creating tokens.

## Advanced Integration

### Full Frontend UI

For a complete LiveKit UI, you can:

1. Install LiveKit components:
```bash
npm install @livekit/components-react livekit-client
```

2. Copy components from the calhacks project:
   - `components/livekit/*` - UI components
   - `components/app/*` - App-specific components
   - `hooks/*` - Custom hooks

3. Replace the simple connection page with the full LiveKit UI from `calhacks/frontend`

### Course-Specific Sessions

The `/api/course/{courseId}/voice-session` endpoint automatically creates course-specific sessions:

**Features:**
- Fetches course title and final assessment from Supabase
- Converts AR instructions to agent steps
- Creates room with course metadata
- Generates participant token with agent name

**Example implementation in `main.py`:**
```python
@app.post("/api/course/{courseId}/voice-session")
async def create_course_voice_session(courseId: str):
    # Fetch course data from Supabase
    course = supabase.table("courses").select("title, meta").eq("id", courseId).execute()
    
    # Extract AR instructions
    ar_instructions = course.data[0]["meta"]["finalAssessment"]["arInstructions"]
    
    # Convert to agent steps
    steps = [{"title": f"Step {i+1}", "description": inst} 
             for i, inst in enumerate(ar_instructions)]
    
    # Create room and token
    return {
        "serverUrl": LIVEKIT_URL,
        "roomName": f"course_{courseId}_room_{timestamp}",
        "participantToken": create_participant_token(...),
        "steps": steps,
        "courseTitle": course.data[0]["title"]
    }
```

## Troubleshooting

### Agent not connecting
- Ensure `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are set correctly
- Check that the agent is running (`python agent.py`)
- Verify your LiveKit server is accessible

### No video feed
- Browser needs camera permissions
- Ensure `video_enabled=True` in agent room options
- Check browser console for WebRTC errors

### Agent not responding
- Verify `GOOGLE_API_KEY` is set and valid
- Check agent logs for errors
- Ensure proper microphone permissions

### Token generation errors
- Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` match your LiveKit server
- Check that JWT encoding is working correctly

### Docker build errors
- If you see "COPY backend/ ." errors, ensure build context is correct in `docker-compose.yml`
- Build context should be `./backend`, and Dockerfile should use `COPY . .`
- Run `docker-compose build --no-cache` to rebuild from scratch

### 500 Internal Server Errors
- Check backend logs for detailed error messages (now includes comprehensive logging)
- Common issues:
  - Missing required fields in course data
  - Supabase connection errors
  - Invalid course ID
- Logs will show exactly which step failed (e.g., "Creating module 2: Safety Basics")

## API Reference

### POST `/api/connection-details`

Generates LiveKit connection details for a participant.

**Request Body:**
```json
{
  "room_config": {
    "agents": [
      {
        "agent_name": "teaching-assistant"
      }
    ]
  }
}
```

**Response:**
```json
{
  "serverUrl": "wss://your-server.livekit.cloud",
  "roomName": "voice_assistant_room_1234",
  "participantToken": "jwt_token_here",
  "participantName": "user"
}
```

### GET `/api/course/{courseId}/voice-prompt`

Gets the voice assistant prompt for a specific course.

**Response:**
```json
{
  "voice_prompt": "You are a helpful voice assistant..."
}
```

### POST `/api/course/{courseId}/voice-session`

Creates a course-specific LiveKit session with AR instructions from the course's final assessment.

**No request body required.**

**Response:**
```json
{
  "serverUrl": "wss://your-server.livekit.cloud",
  "roomName": "course_abc123_room_1234",
  "participantToken": "jwt_token_here",
  "participantName": "user",
  "courseTitle": "Woodworking Basics",
  "steps": [
    {
      "title": "Step 1",
      "description": "Safety check your workspace"
    },
    {
      "title": "Step 2", 
      "description": "Gather your materials"
    }
  ],
  "metadata": {
    "courseId": "abc123",
    "courseTitle": "Woodworking Basics",
    "steps": [...],
    "description": "Build a birdhouse"
  }
}
```

## Files Created/Modified

### Created
- `backend/agent.py` - LiveKit agent implementation
- `backend/Dockerfile` - Updated with Python 3.12-slim and security updates
- `backend/.dockerignore` - Excludes unnecessary files from Docker builds
- `backend/README.md` - Backend-specific documentation
- `app/voice-assistant/page.tsx` - Standalone voice assistant page
- `app/course/[id]/voice-assistant/page.tsx` - Course-specific voice assistant page
- `LIVEKIT_INTEGRATION.md` - This file

### Modified
- `backend/main.py` - Added LiveKit endpoints and comprehensive logging
- `backend/requirements.txt` - Added LiveKit dependencies
- `docker-compose.yml` - Added LiveKit environment variables, removed version field
- `components/course/final-assessment.tsx` - Added navigation to voice assistant

## Environment Variables Reference

Add these to `backend/.env`:

```env
# LiveKit (Required for voice assistant)
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
GOOGLE_API_KEY=your_google_api_key

# Existing (Required for course generation)
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:3000
```

## Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Agents Guide](https://docs.livekit.io/agents/)
- [Google Gemini Realtime API](https://ai.google.dev/gemini-api/docs/realtime)
- [Original calhacks implementation](../calhacks)
- [Backend README](./backend/README.md) - Additional backend documentation

