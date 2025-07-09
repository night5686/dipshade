// DIPSHADE Auth Page JavaScript - PRODUCTION READY

// Initialize auth page
document.addEventListener('DOMContentLoaded', function() {
    initAuthPage();
    initPasswordStrength();
    initFormValidation();
    checkAuthState();
});

// Auth mode state
let isSignUpMode = false;

// API Configuration
const API_BASE_URL = 'https://api.dipshade.com'; // Replace with your actual API
const DISCORD_CLIENT_ID = 'YOUR_DISCORD_CLIENT_ID'; // Replace with your Discord app client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Google client ID

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
        // Switch to Sign Up
        signInForm.classList.remove('active');
        signUpForm.classList.add('active');
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Join the future of Discord AI';
        authSwitchText.textContent = 'Already have an account?';
        authSwitchBtn.textContent = 'Sign in here';
    } else {
        // Switch to Sign In
        signUpForm.classList.remove('active');
        signInForm.classList.add('active');
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to manage your AI assistant';
        authSwitchText.textContent = "Don't have an account?";
        authSwitchBtn.textContent = 'Sign up here';
    }
}

// Check if user is already authenticated
function checkAuthState() {
    const token = localStorage.getItem('dipshade_token');
    if (token) {
        // Verify token with backend
        verifyToken(token).then(valid => {
            if (valid) {
                window.location.href = 'dashboard.html';
            } else {
                localStorage.removeItem('dipshade_token');
            }
        });
    }
}

// Initialize auth page
function initAuthPage() {
    // Handle form submissions
    document.getElementById('signInForm').addEventListener('submit', handleSignIn);
    document.getElementById('signUpForm').addEventListener('submit', handleSignUp);
    
    // Handle password confirmation
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
    
    // Handle terms checkbox
    document.getElementById('agreeTerms').addEventListener('change', updateSignUpButton);
    
    // Load Google OAuth script
    loadGoogleOAuth();
}

// Load Google OAuth SDK
function loadGoogleOAuth() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
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
        
        // Update color based on strength
        if (strength.score < 2) {
            strengthBar.style.background = '#ef4444';
        } else if (strength.score < 4) {
            strengthBar.style.background = '#f59e0b';
        } else {
            strengthBar.style.background = '#10b981';
        }
    });
}

// Calculate password strength
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
    
    return {
        score: score,
        ...strength[score] || strength[0]
    };
}

// Validate password match
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

// Update sign up button state
function updateSignUpButton() {
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const signUpBtn = document.querySelector('#signUpForm .auth-btn');
    
    if (agreeTerms) {
        signUpBtn.disabled = false;
        signUpBtn.style.opacity = '1';
    } else {
        signUpBtn.disabled = true;
        signUpBtn.style.opacity = '0.5';
    }
}

// Form validation
function initFormValidation() {
    // Real-time email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });
}

// Validate email format
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

// Handle sign in
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Show loading
    showLoading('Signing you in...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
                remember: rememberMe
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store auth token
            localStorage.setItem('dipshade_token', data.token);
            if (data.user) {
                localStorage.setItem('dipshade_user', JSON.stringify(data.user));
            }
            
            hideLoading();
            showSuccess('Welcome back! Redirecting to dashboard...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            hideLoading();
            showError(data.message || 'Sign in failed. Please check your credentials.');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Sign in error:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

// Handle sign up
async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Validate password strength
    const strength = calculatePasswordStrength(password);
    if (strength.score < 3) {
        showError('Please choose a stronger password');
        return;
    }
    
    // Validate terms agreement
    if (!agreeTerms) {
        showError('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    // Show loading
    showLoading('Creating your account...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store auth token
            localStorage.setItem('dipshade_token', data.token);
            if (data.user) {
                localStorage.setItem('dipshade_user', JSON.stringify(data.user));
            }
            
            hideLoading();
            showSuccess('Account created successfully! Redirecting to dashboard...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            hideLoading();
            showError(data.message || 'Account creation failed. Please try again.');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Sign up error:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

// Discord OAuth
async function signInWithDiscord() {
    showLoading('Connecting with Discord...');
    
    try {
        // Redirect to Discord OAuth
        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/discord/callback')}&response_type=code&scope=identify%20email`;
        
        window.location.href = discordAuthUrl;
        
    } catch (error) {
        hideLoading();
        console.error('Discord auth error:', error);
        showError('Discord authentication failed. Please try again.');
    }
}

async function signUpWithDiscord() {
    // Same as sign in for Discord OAuth
    signInWithDiscord();
}

// Google OAuth
async function signInWithGoogle() {
    showLoading('Connecting with Google...');
    
    try {
        // Initialize Google OAuth
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback
            });
            
            google.accounts.id.prompt();
        } else {
            throw new Error('Google OAuth not loaded');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Google auth error:', error);
        showError('Google authentication failed. Please try again.');
    }
}

async function signUpWithGoogle() {
    // Same as sign in for Google OAuth
    signInWithGoogle();
}

// Handle Google OAuth callback
async function handleGoogleCallback(response) {
    try {
        const result = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credential: response.credential
            })
        });
        
        const data = await result.json();
        
        if (result.ok) {
            // Store auth token
            localStorage.setItem('dipshade_token', data.token);
            if (data.user) {
                localStorage.setItem('dipshade_user', JSON.stringify(data.user));
            }
            
            hideLoading();
            showSuccess('Google authentication successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            hideLoading();
            showError(data.message || 'Google authentication failed');
        }
        
    } catch (error) {
        hideLoading();
        console.error('Google callback error:', error);
        showError('Google authentication failed. Please try again.');
    }
}

// Verify token with backend
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
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
    // Create error notification
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
    
    // Add error styles
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    // Create success notification
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
    
    // Add success styles
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 3000);
}

// Handle Discord OAuth callback (if redirected back from Discord)
function handleDiscordCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        showLoading('Processing Discord authentication...');
        
        fetch(`${API_BASE_URL}/auth/discord/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('dipshade_token', data.token);
                if (data.user) {
                    localStorage.setItem('dipshade_user', JSON.stringify(data.user));
                }
                
                hideLoading();
                showSuccess('Discord authentication successful! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                hideLoading();
                showError(data.message || 'Discord authentication failed');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Discord callback error:', error);
            showError('Discord authentication failed. Please try again.');
        });
    }
}

// Check for Discord callback on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.search.includes('code=')) {
        handleDiscordCallback();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.error-content,
.success-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.error-content button,
.success-content button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.25rem;
    margin-left: auto;
}
`;

document.head.appendChild(style);