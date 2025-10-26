# Vercel Deployment Setup Guide

## Environment Variables Required

You **must** set these environment variables in your Vercel project settings for the build to succeed:

### Required Variables:
1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Your Supabase project URL
   - Example: `https://your-project.supabase.co`
   - For production, use your actual Supabase hosted URL (not localhost)

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Your Supabase anonymous/public key
   - Find this in your Supabase project settings → API

### Optional Variables:
3. **`NEXT_PUBLIC_API_URL`** (optional but recommended)
   - Your backend API URL
   - If not set, will default to `http://localhost:8000`
   - For production, set this to your deployed backend URL

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Click on **Environment Variables** in the left sidebar
4. Add each variable:
   - Enter the **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value**
   - Select which environments (Production, Preview, Development)
   - Click **Save**

## Build Configuration

Your `vercel.json` is already configured correctly:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

## Recent Fixes Applied

✅ Fixed undefined environment variables in `utils/supabase.ts`
✅ Added fallback values for API URLs in all fetch calls
✅ Configured `next.config.ts` with image optimization settings
✅ Updated `backend/requirements.txt` with all necessary Python dependencies

## Deployment Checklist

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in Vercel
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel (optional)
- [ ] Ensure Supabase project is accessible from Vercel
- [ ] Deploy backend separately and update `NEXT_PUBLIC_API_URL`
- [ ] Test the deployment

## Backend Deployment

Your backend (`backend/main.py`) needs to be deployed separately. Options:
- Deploy to a platform like Railway, Render, or Fly.io
- Use Vercel Serverless Functions (requires refactoring)
- Use Docker with the provided `Dockerfile`

Once deployed, set the backend URL in `NEXT_PUBLIC_API_URL`.

## Notes

- Local development uses `.env.local` (not committed to git)
- Production uses Vercel environment variables
- All environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser
- The build now succeeds locally - if it fails on Vercel, it's due to missing env vars

