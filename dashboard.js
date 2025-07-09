// DIPSHADE Dashboard - User Management & Profile

let auth, db, currentUser;

// Initialize Firebase and Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initFirebase();
    initDashboard();
});

// Initialize Firebase
async function initFirebase() {
    // Firebase config
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

    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loadUserProfile(user);
        } else {
            // User is not signed in, redirect to auth page
            window.location.href = 'auth.html';
        }
    });
}

// Initialize Dashboard
function initDashboard() {
    // User profile dropdown toggle
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userProfile && userDropdown) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });
        
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Load User Profile
async function loadUserProfile(user) {
    try {
        console.log('[DEBUG] Loading user profile for:', user.email);
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        // Determine authentication method
        const authMethod = getAuthenticationMethod(user, userData);
        
        // Update UI elements
        updateUserInterface(user, userData, authMethod);
        
        console.log('[DEBUG] User profile loaded successfully');
        
    } catch (error) {
        console.error('[ERROR] Failed to load user profile:', error);
        showError('Failed to load user profile');
    }
}

// Determine Authentication Method
function getAuthenticationMethod(user, userData) {
    // Check provider data
    if (user.providerData && user.providerData.length > 0) {
        const provider = user.providerData[0].providerId;
        
        switch (provider) {
            case 'google.com':
                return {
                    icon: 'fab fa-google',
                    text: 'Google Account',
                    color: '#4285f4'
                };
            case 'password':
                return {
                    icon: 'fas fa-envelope',
                    text: 'Email & Password',
                    color: '#10b981'
                };
            case 'facebook.com':
                return {
                    icon: 'fab fa-facebook',
                    text: 'Facebook Account',
                    color: '#1877f2'
                };
            case 'github.com':
                return {
                    icon: 'fab fa-github',
                    text: 'GitHub Account',
                    color: '#333'
                };
            default:
                return {
                    icon: 'fas fa-shield-alt',
                    text: 'Unknown Method',
                    color: '#6b7280'
                };
        }
    }
    
    // Fallback to Firestore data
    if (userData.provider) {
        switch (userData.provider) {
            case 'google':
                return {
                    icon: 'fab fa-google',
                    text: 'Google Account',
                    color: '#4285f4'
                };
            case 'email':
                return {
                    icon: 'fas fa-envelope',
                    text: 'Email & Password',
                    color: '#10b981'
                };
            default:
                return {
                    icon: 'fas fa-shield-alt',
                    text: userData.provider,
                    color: '#6b7280'
                };
        }
    }
    
    // Default fallback
    return {
        icon: 'fas fa-user',
        text: 'Standard Account',
        color: '#6b7280'
    };
}

// Update User Interface
function updateUserInterface(user, userData, authMethod) {
    const displayName = user.displayName || userData.name || 'User';
    const email = user.email || 'No email';
    const avatar = user.photoURL || userData.avatar;
    const plan = userData.plan || 'Free';
    const createdAt = userData.createdAt ? userData.createdAt.toDate() : new Date();
    
    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome back, ${displayName.split(' ')[0]}!`;
    }
    
    // Update user info in navigation
    updateElement('userName', displayName);
    updateElement('userEmail', email);
    updateElement('userNameLarge', displayName);
    updateElement('userEmailSmall', email);
    updateElement('userPlan', plan.charAt(0).toUpperCase() + plan.slice(1));
    
    // Update authentication method
    const authMethodElement = document.getElementById('authMethodText');
    if (authMethodElement) {
        authMethodElement.textContent = authMethod.text;
        authMethodElement.parentElement.style.color = authMethod.color;
        
        const authIcon = authMethodElement.parentElement.querySelector('i');
        if (authIcon) {
            authIcon.className = authMethod.icon;
        }
    }
    
    // Update avatars
    updateUserAvatars(avatar);
    
    // Update profile modal
    updateProfileModal(user, userData, authMethod, createdAt);
}

// Update User Avatars
function updateUserAvatars(avatarUrl) {
    const avatarElements = [
        'userAvatar',
        'userAvatarLarge',
        'profileAvatarLarge'
    ];
    
    avatarElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            if (avatarUrl) {
                element.innerHTML = `<img src="${avatarUrl}" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                element.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
    });
}

// Update Profile Modal
function updateProfileModal(user, userData, authMethod, createdAt) {
    updateElement('profileName', user.displayName || userData.name || '');
    updateElement('profileEmail', user.email || '');
    updateElement('memberSince', createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }));
    
    const profileAuthMethod = document.getElementById('profileAuthMethod');
    if (profileAuthMethod) {
        profileAuthMethod.innerHTML = `
            <i class="${authMethod.icon}" style="color: ${authMethod.color}"></i>
            <span>${authMethod.text}</span>
        `;
    }
}

// Utility function to update element content
function updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        if (element.tagName === 'INPUT') {
            element.value = content;
        } else {
            element.textContent = content;
        }
    }
}

// Handle Logout
async function handleLogout() {
    try {
        showLoading('Signing you out...');
        
        await auth.signOut();
        
        hideLoading();
        showSuccess('Signed out successfully! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        hideLoading();
        console.error('[ERROR] Logout failed:', error);
        showError('Failed to sign out. Please try again.');
    }
}

// Show Profile Modal
function showProfile() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Show Account Settings (placeholder)
function showAccountSettings() {
    showNotification('Account settings coming soon!', 'info');
}

// Show Billing Info (placeholder)
function showBillingInfo() {
    showNotification('Billing information coming soon!', 'info');
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Save Profile
async function saveProfile() {
    try {
        const newName = document.getElementById('profileName').value.trim();
        
        if (!newName) {
            showError('Display name cannot be empty');
            return;
        }
        
        showLoading('Saving profile...');
        
        // Update Firebase Auth profile
        await currentUser.updateProfile({
            displayName: newName
        });
        
        // Update Firestore document
        await db.collection('users').doc(currentUser.uid).update({
            name: newName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoading();
        showSuccess('Profile updated successfully!');
        
        // Refresh user interface
        loadUserProfile(currentUser);
        
        // Close modal
        closeModal('profileModal');
        
    } catch (error) {
        hideLoading();
        console.error('[ERROR] Failed to save profile:', error);
        showError('Failed to save profile. Please try again.');
    }
}

// Utility Functions
function showLoading(message = 'Loading...') {
    // Create loading overlay if it doesn't exist
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>${message}</h3>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('h3').textContent = message;
    }
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: 'rgba(16, 185, 129, 0.9)',
        error: 'rgba(239, 68, 68, 0.9)',
        info: 'rgba(59, 130, 246, 0.9)'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icons[type]}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${colors[type]};
        color: white;
        padding: 1rem;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for dashboard components
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
/* Dashboard Navigation */
.dashboard-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
    padding: 1rem 0;
}

.dashboard-nav .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--primary-blue);
}

.nav-user {
    position: relative;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.user-profile:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--primary-blue);
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.user-name {
    font-weight: 600;
    color: white;
    font-size: 0.9rem;
}

.user-email {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
}

.user-dropdown-toggle {
    color: rgba(255, 255, 255, 0.7);
    transition: transform 0.3s ease;
}

.user-profile.active .user-dropdown-toggle {
    transform: rotate(180deg);
}

.user-dropdown {
    position: absolute;
    top: calc(100% + 1rem);
    right: 0;
    width: 320px;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 1.5rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.user-dropdown.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar-large {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.user-details {
    flex: 1;
}

.user-name-large {
    display: block;
    font-weight: 600;
    color: white;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
}

.user-email-small {
    display: block;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
}

.auth-method {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--primary-blue);
}

.dropdown-menu {
    display: flex;
    flex-direction: column;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.dropdown-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.dropdown-item.logout {
    color: #ef4444;
}

.dropdown-item.logout:hover {
    background: rgba(239, 68, 68, 0.1);
}

.dropdown-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0.5rem 0;
}

/* Dashboard Content */
.dashboard-section {
    padding-top: 120px;
    min-height: 100vh;
}

.dashboard-header {
    text-align: center;
    margin-bottom: 3rem;
}

.dashboard-header h1 {
    font-family: 'Orbitron', monospace;
    font-size: 2.5rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
}

/* User Stats */
.user-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
}

.stat-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--primary-blue);
    transform: translateY(-5px);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-number {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    font-family: 'Orbitron', monospace;
}

.stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
}

/* Feature Cards */
.dashboard-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.feature-card:hover::before {
    opacity: 1;
}

.feature-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--primary-blue);
    transform: translateY(-10px);
}

.feature-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.feature-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: var(--primary-blue);
}

.feature-btn.primary {
    background: var(--gradient-primary);
    border-color: var(--primary-blue);
}

.feature-btn.primary:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
}

/* Modal Styles */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal.active .modal-content {
    transform: scale(1);
}

.modal-header {
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    color: white;
    font-family: 'Orbitron', monospace;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    padding: 1rem 2rem 2rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

/* Profile Section */
.profile-section {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
}

.profile-avatar-section {
    text-align: center;
}

.profile-avatar-large {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    margin-bottom: 1rem;
}

.change-avatar-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
}

.change-avatar-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.profile-form {
    flex: 1;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    color: white;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-blue);
    background: rgba(255, 255, 255, 0.1);
}

.form-group input[readonly] {
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.7);
}

.form-group small {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    margin-top: 0.25rem;
    display: block;
}

.auth-method-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
}

/* Loading Overlay */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.loading-overlay.active {
    opacity: 1;
    visibility: visible;
}

.loading-content {
    text-align: center;
    color: white;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid var(--primary-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Notification Styles */
.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.notification-content button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.25rem;
    margin-left: auto;
    border-radius: 4px;
    transition: background 0.3s ease;
}

.notification-content button:hover {
    background: rgba(255, 255, 255, 0.2);
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

/* Responsive Design */
@media (max-width: 768px) {
    .dashboard-nav .nav-container {
        padding: 0 1rem;
    }
    
    .nav-logo {
        font-size: 1.2rem;
    }
    
    .user-profile {
        padding: 0.5rem;
    }
    
    .user-info {
        display: none;
    }
    
    .user-dropdown {
        width: 280px;
        right: -1rem;
    }
    
    .dashboard-header h1 {
        font-size: 2rem;
    }
    
    .user-stats {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
    
    .stat-card {
        padding: 1rem;
    }
    
    .stat-icon {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
    }
    
    .stat-number {
        font-size: 1.4rem;
    }
    
    .dashboard-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .profile-section {
        flex-direction: column;
        text-align: center;
    }
    
    .modal-content {
        width: 95%;
        margin: 1rem;
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1.5rem;
    }
}
`;

document.head.appendChild(dashboardStyles);