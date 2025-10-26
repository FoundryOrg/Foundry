import json
import os
import asyncio
import base64
from dotenv import load_dotenv
from typing import Optional
from enum import Enum

# LiveKit agent runtime
from livekit import agents, rtc
from livekit.agents import (
    AgentSession,
    Agent,
    WorkerOptions,
    get_job_context,
    cli,
    ChatContext,
    ChatMessage,
    JobContext,
    RoomInputOptions,
)
from livekit.agents.llm import ImageContent
from livekit.agents.utils.images import encode, EncodeOptions, ResizeOptions

# Plugins
from livekit.plugins import anthropic
from livekit.plugins import deepgram
from livekit.plugins import google
from livekit.plugins import noise_cancellation

# Load .env/.env.local
load_dotenv(".env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY must be set in .env")

# ---------------------------------------
# Course setup (can be overridden)
# ---------------------------------------

DEFAULT_COURSE_TITLE = "Replacing a light switch"

DEFAULT_STEPS = [
    {"title": "Turn off power", "description": "Go to your circuit breaker and switch off the power to the room."},
    {"title": "Remove the switch plate", "description": "Use a screwdriver to remove the screws and gently pull off the plate."},
    {"title": "Unscrew the old switch", "description": "Loosen the screws on the sides and pull it out of the box."},
    {"title": "Disconnect the wires", "description": "Unscrew or unclip the wires from the old switch carefully."},
    {"title": "Install the new switch", "description": "Connect the wires to the new switch and tighten the screws."},
    {"title": "Reattach the plate and test", "description": "Screw the plate back on, turn on power, and test the switch."},
]

def get_initial_prompt(course_title: str, steps: list) -> str:
    return f"""
You are a live teaching assistant helping a user complete a task in real time.
The user is wearing glasses with a video feed, so you are seeing what they are seeing.
You are teaching: "{course_title}"

Here are the steps for this task:
{json.dumps(steps, indent=2)}

You should:
- Encourage or guide the user verbally.
- If they are on the wrong step or doing something dangerous, correct them.
- Keep responses short and conversational (1–2 sentences).
- Rely heavily on images, every time a user says something double check it with the image. Remember you are seeing what the user is seeing.
- You can bypass relying on an image if a user confirms that they have completed a step, otherwise you should prioritize relying on the images.

Start by explaining to them what you are teaching them and give a general rundown of all the steps in 3 total sentences.
"""

# -------------------------
# Enum for Step Progress
# -------------------------
class StepStatus(Enum):
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    NEEDS_ATTENTION = "needs_attention"

# -------------------------
# Teaching Session Manager
# -------------------------
class TeachingSession:
    def __init__(self, course_title, steps):
        self.course_title = course_title
        self.steps = steps
        self.current_step = 0
        self.last_response = None

    def get_current_step(self):
        return self.steps[self.current_step]

    def mark_complete(self):
        self.current_step += 1

    def is_done(self):
        return self.current_step >= len(self.steps)

# -------------------------
# Step Evaluation Logic
# -------------------------
class StepEvaluator:
    @staticmethod
    def evaluate_llm_response(response_text: str) -> StepStatus:
        t = response_text.lower()
        if "awesome" in t and "complete" in t:
            return StepStatus.COMPLETE
        elif "danger" in t or "wrong" in t:
            return StepStatus.NEEDS_ATTENTION
        else:
            return StepStatus.IN_PROGRESS

# -------------------------
# The Teaching Agent
# -------------------------
class TeachingAssistant(Agent):
    def __init__(self, course_title, steps):
        initial_prompt = get_initial_prompt(course_title, steps)
        super().__init__(
            instructions=initial_prompt,
            llm=google.realtime.RealtimeModel(
                voice="Puck",
                temperature=0.6,
            ),
        )
        self.session_data = TeachingSession(course_title, steps)
        self.periodic_task = None

    async def on_enter(self):
        print(f"[TeachingAssistant] Agent entering room for course: {self.session_data.course_title}")
        initial_prompt = get_initial_prompt(
            self.session_data.course_title, 
            self.session_data.steps
        )
        print(f"[TeachingAssistant] Generating initial reply...")
        await self.session.generate_reply(instructions=initial_prompt)
        print(f"[TeachingAssistant] Speaking current step...")
        await self.speak_current_step()
        print(f"[TeachingAssistant] Starting periodic check...")
        self.periodic_task = asyncio.create_task(self.periodic_check(10))

    async def speak_current_step(self):
        step = self.session_data.get_current_step()
        if step:
            prompt = f"Please introduce the current step: '{step['title']}'. {step['description']}"
            await self.session.generate_reply(instructions=prompt)

    async def on_user_turn_completed(self, turn_ctx: ChatContext, new_message: ChatMessage) -> None:
        # Add the latest video frame, if any, to the new message
        print(new_message.text_content)
            

    async def periodic_check(self, interval_sec):
        while not self.session_data.is_done():
            step = self.session_data.get_current_step()
            user_check = f"""
            I am currently on step {self.session_data.current_step + 1}: "{step['title']}".
            Assume that the video feed is exactly what I am seeing from my perspective, 
            check if I am where I should be to start the first step. 
            You must check the video feed in determining whether I am done or not.

            If I am done, respond clearly with "Awesome, step complete".
            If not, encourage me briefly (e.g., 'Almost there, make sure you tighten the screws.').
            If I am doing something unsafe, warn me.
            """
            

            response = await self.session.generate_reply(user_input=user_check)
            response_text = response.chat_items[-1].content
            print(f"[LLM Check Response] {response_text}")

            status = StepEvaluator.evaluate_llm_response(response_text)
            if status == StepStatus.COMPLETE:
                self.session_data.mark_complete()
                if not self.session_data.is_done():
                    await self.speak_current_step()
            elif status == StepStatus.NEEDS_ATTENTION:
                await self.session.generate_reply(user_input="I am doing something wrong or dangerous. Warn me.")
            else:
                pass


            await asyncio.sleep(interval_sec)


# ---------------------------------------
# Entrypoint for LiveKit
# ---------------------------------------

async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for LiveKit agent.
    This can be customized with course data from the metadata.
    """
    # Try to read course data from room metadata
    course_title = DEFAULT_COURSE_TITLE
    steps = DEFAULT_STEPS
    
    try:
        # Access room metadata if available
        if hasattr(ctx, 'room') and ctx.room and ctx.room.metadata:
            metadata = json.loads(ctx.room.metadata)
            course_title = metadata.get("courseTitle", DEFAULT_COURSE_TITLE)
            steps = metadata.get("steps", DEFAULT_STEPS)
            print(f"[Agent] Using course data from metadata: {course_title}")
        else:
            print(f"[Agent] No metadata found, using defaults: {DEFAULT_COURSE_TITLE}")
    except Exception as e:
        print(f"[Agent] Error reading metadata: {e}, using defaults")
    
    session = AgentSession()
    await session.start(
        agent=TeachingAssistant(course_title, steps),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            video_enabled=True, 
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

def run_agent():
    """Run the LiveKit agent CLI"""
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="teaching-assistant"))

if __name__ == "__main__":
    run_agent()

