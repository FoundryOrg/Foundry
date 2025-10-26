# Foundry Backend

This is the FastAPI backend for the Foundry course builder platform.

## Features

- **Course Generation**: Uses Claude AI to generate course content
- **Image Generation**: Uses Google Gemini to generate educational images
- **Course Management**: Store and retrieve courses from Supabase
- **LiveKit Voice Assistant**: Real-time voice assistant for course projects

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_API_KEY=your_google_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LiveKit (for voice assistant)
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Running the Server

### FastAPI Server (main.py)

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### LiveKit Agent (agent.py)

The LiveKit agent must be run separately to handle voice interactions:

```bash
python agent.py
```

This will start the LiveKit agent worker that connects to your LiveKit server and handles voice assistant sessions.

## API Endpoints

### Course Generation

#### `POST /api/claude`
Generate a course using Claude AI.

**Request:**
```json
{
  "prompt": "Introduction to Python Programming"
}
```

**Response:**
```json
{
  "content": "{ /* Generated course JSON */ }",
  "usage": { /* Token usage stats */ }
}
```

### Course Management

#### `POST /api/course`
Parse and store a generated course.

**Request:**
```json
{
  "courseJson": "{ /* Course JSON */ }"
}
```

**Response:**
```json
{
  "success": true,
  "courseId": "uuid",
  "message": "Course created successfully"
}
```

#### `POST /api/course/publish`
Publish a course.

**Request:**
```json
{
  "courseId": "uuid"
}
```

### Voice Assistant

#### `GET /api/course/{courseId}/voice-prompt`
Get the voice assistant prompt for a specific course.

**Response:**
```json
{
  "voice_prompt": "You are a helpful voice assistant..."
}
```

#### `POST /api/connection-details`
Generate LiveKit connection details for a voice session.

**Request:**
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
  "serverUrl": "wss://...",
  "roomName": "voice_assistant_room_1234",
  "participantToken": "jwt_token",
  "participantName": "user"
}
```

#### `POST /api/course/{courseId}/voice-session`
Create a course-specific voice session with customized instructions from the course's final assessment.

**Response:**
```json
{
  "serverUrl": "wss://...",
  "roomName": "course_123_room_1234",
  "participantToken": "jwt_token",
  "participantName": "user",
  "courseTitle": "Course Title",
  "steps": [/* AR instructions as steps */],
  "metadata": {/* Course metadata */}
}
```

## Development

### Running Tests

```bash
pytest
```

### Docker Development

```bash
docker-compose up backend
```

### Hot Reload

The `--reload` flag enables hot reload during development. Changes to Python files will automatically restart the server.

## Architecture

### agent.py

Contains the LiveKit voice agent implementation:

- `TeachingAssistant` - Main agent class that handles voice interactions
- `TeachingSession` - Manages the state of a teaching session
- `StepEvaluator` - Evaluates user progress through steps
- Uses Google Gemini Realtime for voice and vision capabilities
- Periodically checks video feed to assess progress

### main.py

FastAPI application with endpoints for:

- Course generation (Claude + Gemini)
- Course storage (Supabase)
- LiveKit token generation
- Course metadata for voice assistant

## Troubleshooting

### ImportError: No module named 'livekit'

Make sure you've installed all dependencies:
```bash
pip install -r requirements.txt
```

### LiveKit agent not connecting

1. Verify `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are set correctly
2. Check that your LiveKit server is running and accessible
3. Ensure the agent is running (`python agent.py`)

### CORS errors

Add your frontend URL to the CORS middleware in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "your-frontend-url"],
    ...
)
```

## License

See the main repository LICENSE file.
