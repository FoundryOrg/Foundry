# Foundry

AI-powered platform that turns a prompt into an interactive AR training course using Gemini, Supabase, and LiveKit.

## Installation

```bash
# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd ../frontend
npm install
npm run dev

# Supabase setup
cd ../
supabase init        # if not already initialized
supabase start       # runs local db + studio
supabase db push     # apply migrations
