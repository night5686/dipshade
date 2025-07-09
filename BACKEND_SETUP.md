# DIPSHADE Backend Setup Guide

## 🚀 Production-Ready Authentication Backend

To make the auth system fully functional, you need to set up a backend API. Here are your options:

## Option 1: Node.js + Express Backend (Recommended)

### 1. Create Backend Structure
```bash
mkdir dipshade-backend
cd dipshade-backend
npm init -y
npm install express cors bcryptjs jsonwebtoken mongoose dotenv
npm install passport passport-discord passport-google-oauth20
```

### 2. Basic Server Setup (`server.js`)
```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 3. Environment Variables (`.env`)
```env
MONGODB_URI=mongodb://localhost:27017/dipshade
JWT_SECRET=your-super-secret-jwt-key
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. User Model (`models/User.js`)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    discordId: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### 5. Auth Routes (`routes/auth.js`)
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create user
        const user = new User({ name, email, password });
        await user.save();
        
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Sign In
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        res.json({ valid: true, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
```

## Option 2: Firebase Authentication (Easier Setup)

### 1. Setup Firebase
```bash
npm install firebase
```

### 2. Firebase Config (`firebase-config.js`)
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. Update Frontend to Use Firebase
```javascript
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from 'firebase/auth';

// Replace API calls with Firebase methods
```

## Option 3: Supabase (Recommended for Quick Setup)

### 1. Setup Supabase
```bash
npm install @supabase/supabase-js
```

### 2. Supabase Config
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. Update Auth Functions
```javascript
// Sign Up
const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
        data: {
            name: name
        }
    }
});

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
});

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord' // or 'google'
});
```

## 🔧 Frontend Configuration

Update these values in `auth.js`:

```javascript
// For custom backend
const API_BASE_URL = 'https://your-api-domain.com';

// For Discord OAuth
const DISCORD_CLIENT_ID = 'your-discord-client-id';

// For Google OAuth
const GOOGLE_CLIENT_ID = 'your-google-client-id';
```

## 🚀 Deployment Options

### Backend Deployment:
- **Railway** (easiest)
- **Render** (free tier)
- **Heroku** (paid)
- **DigitalOcean** (VPS)

### Database Options:
- **MongoDB Atlas** (free tier)
- **Supabase** (free tier)
- **Firebase** (free tier)

## 📝 OAuth Setup

### Discord OAuth:
1. Go to https://discord.com/developers/applications
2. Create new application
3. Add redirect URI: `https://yourdomain.com/auth/discord/callback`
4. Copy Client ID and Secret

### Google OAuth:
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized domains

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secret
- [ ] Validate all inputs
- [ ] Rate limit auth endpoints
- [ ] Use secure cookies
- [ ] Implement CSRF protection
- [ ] Add email verification
- [ ] Set up password reset

## 🎯 Quick Start (Recommended)

For fastest setup, use **Supabase**:
1. Create Supabase project
2. Enable Auth providers
3. Update frontend config
4. Deploy to Vercel

This gives you production-ready auth in under 30 minutes!