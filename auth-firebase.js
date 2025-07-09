// DIPSHADE Auth with Firebase - PRODUCTION READY (Google + Email Only)

// Import Firebase functions (using CDN for HTML compatibility)
let auth, db, authFunctions;

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', function() {
    initFirebase();
    initAuthPage();
    initPasswordStrength();
    initFormValidation();
});

// Initialize Firebase using CDN
async function initFirebase() {
    // Firebase config - DIPSHADE Production Config
    const firebaseConfig = {
        apiKey: "AIzaSyBY9-hGpKZ5dPV3E9GHQjP2wSNy3yRcjkE",
        authDomain: "dipshade-3dd03.firebaseapp.com",
        projectId: "dipshade-3dd03",
        storageBucket: "dipshade-3dd03.firebasestorage.app",
        messagingSenderId: "824019034596",
        appId: "1:824019034596:web:42a46443127644e5f427f1",
        measurementId: "G-0VNZE2BXN5"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    // Check if user is already signed in
    auth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.includes('auth.html')) {
            // User is signed in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    });
}

// Auth mode state
let isSignUpMode = false;

// Switch between sign in and sign up
function switchAuthMode() {
    isSignUpMode = !isSignUpMode;
    
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    
    if (isSignUpMode) {
        signInForm.classList.remove('active');
        signUpForm.classList.add('active');
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Join the future of Discord AI';
        authSwitchText.textContent = 'Already have an account?';
        authSwitchBtn.textContent = 'Sign in here';
    } else {
        signUpForm.classList.remove('active');
        signInForm.classList.add('active');
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to manage your AI assistant';
        authSwitchText.textContent = "Don't have an account?";
        authSwitchBtn.textContent = 'Sign up here';
    }
}

// Initialize auth page
function initAuthPage() {
    document.getElementById('signInForm').addEventListener('submit', handleSignIn);
    document.getElementById('signUpForm').addEventListener('submit', handleSignUp);
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
    document.getElementById('agreeTerms').addEventListener('change', updateSignUpButton);
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('fa-eye');
        toggle.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('fa-eye-slash');
        toggle.classList.add('fa-eye');
    }
}

// Password strength indicator
function initPasswordStrength() {
    const passwordInput = document.getElementById('signUpPassword');
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        strengthBar.style.width = strength.percentage + '%';
        strengthText.textContent = strength.text;
        
        if (strength.score < 2) {
            strengthBar.style.background = '#ef4444';
        } else if (strength.score < 4) {
            strengthBar.style.background = '#f59e0b';
        } else {
            strengthBar.style.background = '#10b981';
        }
    });
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strength = {
        0: { text: 'Very weak', percentage: 10 },
        1: { text: 'Weak', percentage: 25 },
        2: { text: 'Fair', percentage: 50 },
        3: { text: 'Good', percentage: 75 },
        4: { text: 'Strong', percentage: 90 },
        5: { text: 'Very strong', percentage: 100 },
        6: { text: 'Excellent', percentage: 100 }
    };
    
    return { score: score, ...strength[score] || strength[0] };
}

function validatePasswordMatch() {
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#ef4444';
        confirmInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    } else {
        confirmInput.style.borderColor = '';
        confirmInput.style.boxShadow = '';
    }
}

function updateSignUpButton() {
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const signUpBtn = document.querySelector('#signUpForm .auth-btn');
    
    signUpBtn.disabled = !agreeTerms;
    signUpBtn.style.opacity = agreeTerms ? '1' : '0.5';
}

function initFormValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });
}

function validateEmail(event) {
    const email = event.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        event.target.style.borderColor = '#ef4444';
        event.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    } else {
        event.target.style.borderColor = '';
        event.target.style.boxShadow = '';
    }
}

// Handle sign in with Firebase
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    showLoading('Signing you in...');
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        hideLoading();
        showSuccess('Welcome back! Redirecting to dashboard...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        hideLoading();
        let errorMessage = 'Sign in failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
        }
        
        showError(errorMessage);
    }
}

// Handle sign up with Firebase
async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    const strength = calculatePasswordStrength(password);
    if (strength.score < 3) {
        showError('Please choose a stronger password');
        return;
    }
    
    if (!agreeTerms) {
        showError('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    showLoading('Creating your account...');
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile
        await user.updateProfile({
            displayName: name
        });
        
        // Save additional user data to Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            provider: 'email',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            plan: 'free'
        });
        
        hideLoading();
        showSuccess('Account created successfully! Redirecting to dashboard...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        hideLoading();
        let errorMessage = 'Account creation failed. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters long.';
                break;
        }
        
        showError(errorMessage);
    }
}

// Google Sign In
async function signInWithGoogle() {
    showLoading('Connecting with Google...');
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Add additional scopes if needed
        provider.addScope('email');
        provider.addScope('profile');
        
        // Set custom parameters
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        console.log('[DEBUG] Starting Google sign-in...');
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('[DEBUG] Google sign-in successful:', user.email);
        
        // Check if user exists in Firestore, if not create profile
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            console.log('[DEBUG] Creating new user profile in Firestore...');
            await db.collection('users').doc(user.uid).set({
                name: user.displayName,
                email: user.email,
                avatar: user.photoURL,
                provider: 'google',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                plan: 'free'
            });
        }
        
        hideLoading();
        showSuccess('Google authentication successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        hideLoading();
        console.error('[ERROR] Google auth failed:', error);
        
        let errorMessage = 'Google authentication failed. Please try again.';
        
        // Handle specific Google OAuth errors
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Sign-in was cancelled. Please try again.';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage = 'This domain is not authorized for Google sign-in. Please contact support.';
                console.error('[ERROR] Domain not authorized. Check Firebase Console → Authentication → Settings → Authorized domains');
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Google sign-in is not enabled. Please contact support.';
                console.error('[ERROR] Google provider not enabled in Firebase Console');
                break;
            case 'auth/account-exists-with-different-credential':
                errorMessage = 'An account already exists with this email using a different sign-in method.';
                break;
            default:
                console.error('[ERROR] Unknown Google auth error:', error.code, error.message);
        }
        
        showError(errorMessage);
    }
}

async function signUpWithGoogle() {
    signInWithGoogle(); // Same process for Google OAuth
}

// Utility functions
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = overlay.querySelector('h3');
    loadingText.textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    successDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 3000);
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
.error-content, .success-content {
    display: flex; align-items: center; gap: 0.5rem;
}
.error-content button, .success-content button {
    background: none; border: none; color: white; cursor: pointer; padding: 0.25rem; margin-left: auto;
}
`;
document.head.appendChild(style);