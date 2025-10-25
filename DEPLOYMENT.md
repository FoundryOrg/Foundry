# Deployment Guide

## Split Deployment: Railway (Backend) + Vercel (Frontend)

### Prerequisites
- GitHub repository with your code
- Railway account
- Vercel account

### Step 1: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically:
   - Detect `docker-compose.yml`
   - Deploy the `backend` service
   - Provide a URL like `https://your-app.railway.app`

5. Set environment variables in Railway dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANTHROPIC_API_KEY=your_anthropic_key
   FRONTEND_URL=https://your-app.vercel.app (set after Vercel deployment)
   ```

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will automatically:
   - Detect Next.js
   - Ignore Docker files
   - Deploy the frontend
   - Provide a URL like `https://your-app.vercel.app`

5. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```

### Step 3: Update CORS Settings

After both deployments, update the Railway backend:
1. Go to Railway dashboard
2. Add environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Step 4: Test the Connection

1. Visit your Vercel frontend URL
2. Check browser console for any CORS errors
3. Test API calls to ensure backend communication works

### Troubleshooting

**CORS Errors:**
- Ensure `FRONTEND_URL` is set correctly in Railway
- Check that the URL matches exactly (including https://)

**API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check Railway logs for backend errors

**Environment Variables:**
- Double-check all API keys are set correctly
- Ensure Supabase URLs and keys match your project
