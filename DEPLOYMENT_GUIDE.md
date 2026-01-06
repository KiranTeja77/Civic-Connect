# 🚀 Deployment Guide - CivicConnect

This guide covers deployment options for the CivicConnect application (Frontend, Backend, and ML Backend).

## 📋 Prerequisites

1. **MongoDB Database** - MongoDB Atlas (free tier) or self-hosted
2. **Cloud Storage** - Cloudinary account for image storage (free tier available)
3. **Deployment Platform Accounts**:
   - Vercel (Frontend/Backend) - Free tier
   - Render (Backend/ML Backend) - Free tier
   - Railway (All services) - Free tier with credit card
   - AWS/GCP/Azure (Production)

---

## 🎯 Recommended Deployment Strategy

### Option 1: Vercel + Render (Recommended for Free Tier)

**Frontend** → Vercel (Free, automatic deployments)
**Backend** → Render (Free tier, 750 hours/month)
**ML Backend** → Render (Free tier, 750 hours/month)
**Database** → MongoDB Atlas (Free tier, 512MB)

### Option 2: Railway (All-in-One)

**All Services** → Railway (Free tier with $5 credit, then paid)

### Option 3: Vercel + Railway

**Frontend** → Vercel (Free)
**Backend** → Railway
**ML Backend** → Railway
**Database** → MongoDB Atlas (Free)

---

## 📝 Step-by-Step Deployment

### Part 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier
   - Create a new cluster (choose free M0 tier)
   - Wait for cluster to be created (5-10 minutes)

2. **Configure Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save credentials!)
   - Set privileges: "Atlas admin" or "Read and write to any database"

3. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, add specific IPs only

4. **Get Connection String**
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/civicconnect?retryWrites=true&w=majority`

---

### Part 2: Cloudinary Setup (Image Storage)

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com/
   - Sign up for free tier
   - Go to Dashboard

2. **Get Credentials**
   - Cloud Name
   - API Key
   - API Secret
   - Save these for backend environment variables

---

### Part 3: Backend Deployment (Render)

1. **Prepare Backend for Deployment**
   ```bash
   cd backend
   # Ensure package.json has all dependencies
   npm install
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up (GitHub integration recommended)
   - Connect your GitHub repository

3. **Create Web Service (Backend)**
   - Click "New" → "Web Service"
   - Connect your repository
   - Select the repository
   - Configure:
     - **Name**: `civicconnect-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free (or paid for production)

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-random-secret>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ML_API_URL=<ml-backend-url>
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Note the service URL (e.g., `https://civicconnect-backend.onrender.com`)

---

### Part 4: ML Backend Deployment (Render)

1. **Create Web Service (ML Backend)**
   - Click "New" → "Web Service"
   - Connect repository
   - Configure:
     - **Name**: `civicconnect-ml-backend`
     - **Root Directory**: `ml-backend-with-image`
     - **Environment**: `Docker` or `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Instance Type**: Free (may timeout on free tier - upgrade for production)

2. **Add Environment Variables** (if needed)
   ```
   PORT=8000
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Note the service URL (e.g., `https://civicconnect-ml-backend.onrender.com`)

**Note**: Free tier on Render spins down after 15 minutes of inactivity. Consider upgrading for production.

---

### Part 5: Frontend Deployment (Vercel)

1. **Prepare Frontend**
   ```bash
   cd frontend
   # Build to test locally
   npm run build
   ```

2. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up (GitHub integration recommended)
   - Connect your GitHub repository

3. **Import Project**
   - Click "Add New" → "Project"
   - Import your repository
   - Configure:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

4. **Add Environment Variables**
   ```
   REACT_APP_API_BASE=https://civicconnect-backend.onrender.com/api
   REACT_APP_ML_BASE=https://civicconnect-ml-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be available at `https://your-project.vercel.app`

6. **Update Backend CORS**
   - Go back to Render backend environment variables
   - Update `CORS_ORIGIN` with your Vercel domain

---

## 🔄 Alternative: Railway Deployment (All-in-One)

### Railway Setup

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up (GitHub integration)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Deploy Backend**
   - Add service → Select repository → Select `backend` directory
   - Add environment variables (same as Render)
   - Railway auto-detects Node.js

4. **Deploy ML Backend**
   - Add service → Select repository → Select `ml-backend-with-image` directory
   - Railway auto-detects Python
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Deploy Frontend**
   - Add service → Select repository → Select `frontend` directory
   - Build command: `npm run build`
   - Start command: `npx serve -s build -p $PORT`
   - Add environment variables

6. **Get URLs**
   - Railway provides public URLs for each service
   - Update environment variables accordingly

---

## 🔧 Environment Variables Summary

### Backend (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civicconnect
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=https://your-frontend.vercel.app
ML_API_URL=https://your-ml-backend.onrender.com
```

### Frontend (.env)
```env
REACT_APP_API_BASE=https://your-backend.onrender.com/api
REACT_APP_ML_BASE=https://your-ml-backend.onrender.com
```

### ML Backend (if needed)
```env
PORT=8000
```

---

## 🧪 Post-Deployment Testing

1. **Test Backend**
   ```bash
   curl https://your-backend.onrender.com/health
   # Should return: {"success":true,"message":"CivicConnect API is running"}
   ```

2. **Test ML Backend**
   ```bash
   curl https://your-ml-backend.onrender.com/docs
   # Should show FastAPI documentation
   ```

3. **Test Frontend**
   - Visit your Vercel/Railway URL
   - Try registering a new user
   - Report an issue
   - Check if images upload correctly

---

## 🚨 Common Issues & Solutions

### Backend Issues

**Issue**: MongoDB connection fails
- **Solution**: Check MongoDB Atlas network access (allow 0.0.0.0/0)
- **Solution**: Verify connection string format
- **Solution**: Check database user credentials

**Issue**: Cloudinary upload fails
- **Solution**: Verify Cloudinary credentials in environment variables
- **Solution**: Check API key permissions

**Issue**: CORS errors
- **Solution**: Update `CORS_ORIGIN` in backend environment variables
- **Solution**: Include exact frontend URL (with https://)

### Frontend Issues

**Issue**: API calls fail
- **Solution**: Check `REACT_APP_API_BASE` environment variable
- **Solution**: Verify backend is running and accessible
- **Solution**: Check browser console for CORS errors

**Issue**: Build fails
- **Solution**: Run `npm install` locally first to check for dependency issues
- **Solution**: Check Node.js version (should be 16+)

### ML Backend Issues

**Issue**: Service times out on free tier
- **Solution**: Render free tier spins down after inactivity
- **Solution**: Use Railway or upgrade Render plan
- **Solution**: Add health check endpoint to keep service alive

**Issue**: Models don't load
- **Solution**: Check logs for download errors
- **Solution**: Increase timeout in Render settings
- **Solution**: Pre-download models in Docker image

---

## 📊 Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Cloudinary account set up
- [ ] Backend deployed and health check passes
- [ ] ML Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured correctly
- [ ] CORS configured properly
- [ ] Database indexes created (if needed)
- [ ] SSL certificates enabled (automatic on Vercel/Railway)
- [ ] Custom domain configured (optional)
- [ ] Error logging/monitoring set up (optional)
- [ ] Backup strategy for database (MongoDB Atlas has backups)

---

## 🔗 Quick Links

- **Vercel**: https://vercel.com
- **Render**: https://render.com
- **Railway**: https://railway.app
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Cloudinary**: https://cloudinary.com

---

## 💡 Tips

1. **Free Tier Limitations**:
   - Render free tier spins down after 15 min inactivity (cold starts)
   - Railway free tier has limited hours/month
   - Consider paid plans for production

2. **Cost Optimization**:
   - Use MongoDB Atlas free tier (512MB)
   - Use Cloudinary free tier (25GB storage)
   - Monitor usage on platforms

3. **Security**:
   - Never commit `.env` files
   - Use strong JWT secrets
   - Limit MongoDB network access in production
   - Enable MongoDB authentication

4. **Monitoring**:
   - Use platform logs (Vercel/Render/Railway)
   - Set up error tracking (Sentry - free tier)
   - Monitor database usage

---

## 🎉 Deployment Complete!

Once deployed, your application will be accessible at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **ML Backend**: `https://your-ml-backend.onrender.com`

Happy deploying! 🚀

