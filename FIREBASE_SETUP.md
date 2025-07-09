# 🔥 Firebase Setup for DIPSHADE Auth

## Quick 15-Minute Setup Guide

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it "dipshade-auth"
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase console, click "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable these providers:
   - ✅ **Email/Password** (click Enable)
   - ✅ **Google** (click Enable, add your domain)

### Step 3: Enable Firestore Database
1. Click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select your region
5. Click "Done"

### Step 4: Get Firebase Config
1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Name your app "DIPSHADE Web"
5. Copy the config object

### Step 5: Update Your Code
Replace the config in `auth-firebase.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "dipshade-auth.firebaseapp.com",
    projectId: "dipshade-auth",
    storageBucket: "dipshade-auth.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-actual-app-id"
};
```

### Step 6: Configure Authorized Domains
1. In Authentication → Settings → Authorized domains
2. Add your domains:
   - `localhost` (for testing)
   - `your-domain.com` (your actual domain)
   - `your-vercel-app.vercel.app` (if using Vercel)

### Step 7: Set Up Google OAuth (Optional)
1. Go to https://console.cloud.google.com
2. Select your Firebase project
3. Go to "APIs & Services" → "Credentials"
4. Your OAuth client should already be created by Firebase
5. Add authorized domains to the OAuth client

## 🚀 Deploy to Vercel

1. Push your code to GitHub
2. Connect to Vercel
3. Deploy instantly!

## 🔒 Security Rules (Switch to Production Mode)

**After testing in test mode, update to these production rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow reading public bot stats (optional)
    match /stats/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Server configurations (admin only)
    match /servers/{serverId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.admins;
    }
  }
}
```

**To switch to production mode:**
1. Go to Firestore → Rules
2. Replace the rules with the above
3. Click "Publish"
4. Test that auth still works

## ✅ Test Your Setup

1. Open your website
2. Try signing up with email
3. Try signing in with Google
4. Check Firebase console for new users

## 🎯 What You Get

- ✅ **Real user authentication**
- ✅ **Google OAuth working**
- ✅ **User data storage**
- ✅ **Session management**
- ✅ **Password reset** (Firebase handles this)
- ✅ **Email verification** (can be enabled)

## 🔧 Advanced Features

### Enable Email Verification
```javascript
// After user signs up
await user.sendEmailVerification();
```

### Enable Password Reset
```javascript
// Password reset
await auth.sendPasswordResetEmail(email);
```

### Add Custom Claims (for premium users)
```javascript
// In Firebase Functions
await admin.auth().setCustomUserClaims(uid, { premium: true });
```

## 💰 Pricing

Firebase is **FREE** for:
- 50,000 reads/day
- 20,000 writes/day
- 10,000 authentications/month

Perfect for starting out! 🎉

## 🆘 Troubleshooting

**Common Issues:**

1. **"Firebase not defined"**
   - Make sure Firebase CDN scripts load before your auth script

2. **"Domain not authorized"**
   - Add your domain to Firebase Auth settings

3. **Google OAuth not working**
   - Check OAuth client configuration in Google Cloud Console

4. **CORS errors**
   - Make sure you're testing on a proper domain (not file://)

## 🎉 You're Done!

Your auth system is now **PRODUCTION READY** with:
- Real Firebase authentication
- Google OAuth
- User data storage
- Secure session management

No backend needed! 🚀