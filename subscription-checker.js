// DIPSHADE Subscription Status Checker
// This script checks user subscription status and manages upgrade buttons

let auth, db, currentUser;
let subscriptionStatus = {
    isActive: false,
    plan: 'free',
    endDate: null,
    loading: true
};

// Initialize subscription checker
document.addEventListener('DOMContentLoaded', function() {
    initSubscriptionChecker();
});

// Initialize Firebase and check subscription
async function initSubscriptionChecker() {
    console.log('🔍 Initializing subscription checker...');
    
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

    try {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        db = firebase.firestore();

        // Listen for auth state changes
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                console.log('✅ User authenticated:', user.email);
                await checkUserSubscription(user.uid);
            } else {
                console.log('❌ No authenticated user');
                subscriptionStatus = {
                    isActive: false,
                    plan: 'free',
                    endDate: null,
                    loading: false
                };
                updateUpgradeButtons();
            }
        });

    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        subscriptionStatus.loading = false;
        updateUpgradeButtons();
    }
}

// Check user subscription status
async function checkUserSubscription(userId) {
    console.log('🔍 Checking subscription for user:', userId);
    
    try {
        // Check user data in Firestore users collection
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('📊 User data found:', userData);
            
            // Check if subscription is active and not expired
            const now = new Date();
            const endDate = userData.subscriptionEndDate ? new Date(userData.subscriptionEndDate) : null;
            const isActive = userData.subscriptionStatus === 'active' && (!endDate || endDate > now);
            
            subscriptionStatus = {
                isActive: isActive,
                plan: userData.currentPlan || 'free',
                endDate: userData.subscriptionEndDate,
                loading: false,
                data: userData
            };
            
            console.log('✅ Subscription status:', subscriptionStatus);
            
        } else {
            console.log('❌ No user data found');
            subscriptionStatus = {
                isActive: false,
                plan: 'free',
                endDate: null,
                loading: false
            };
        }
        
    } catch (error) {
        console.error('❌ Error checking subscription:', error);
        subscriptionStatus.loading = false;
    }
    
    updateUpgradeButtons();
}

// Update upgrade buttons based on subscription status
function updateUpgradeButtons() {
    console.log('🔄 Updating upgrade buttons...', subscriptionStatus);
    
    // Find all upgrade buttons
    const upgradeButtons = document.querySelectorAll('a[href*="payment.html"], .plan-btn[href*="payment.html"]');
    const upgradeLinks = document.querySelectorAll('a[href*="payment.html?plan=pro"]');
    
    upgradeButtons.forEach(button => {
        updateSingleUpgradeButton(button);
    });
    
    upgradeLinks.forEach(link => {
        updateSingleUpgradeButton(link);
    });
    
    // Update pricing section if exists
    updatePricingSection();
    
    // Update any subscription status displays
    updateSubscriptionDisplays();
}

// Update a single upgrade button
function updateSingleUpgradeButton(button) {
    if (!button) return;
    
    if (subscriptionStatus.loading) {
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.7';
        return;
    }
    
    if (subscriptionStatus.isActive) {
        // User has active subscription
        button.innerHTML = '<i class="fas fa-check-circle"></i> Active Subscription';
        button.style.background = '#10b981'; // Green color
        button.style.cursor = 'default';
        button.style.pointerEvents = 'none';
        
        // Remove href to prevent navigation
        button.removeAttribute('href');
        
        // Add click handler to show subscription info
        button.onclick = function(e) {
            e.preventDefault();
            showSubscriptionInfo();
            return false;
        };
        
        // Add tooltip
        button.title = `You have an active ${subscriptionStatus.plan} subscription until ${new Date(subscriptionStatus.endDate).toLocaleDateString()}`;
        
    } else {
        // User doesn't have active subscription - restore original functionality
        button.innerHTML = 'Upgrade Now';
        button.style.background = ''; // Reset to original
        button.style.cursor = 'pointer';
        button.style.pointerEvents = 'auto';
        button.style.opacity = '1';
        
        // Restore href if it was removed
        if (!button.getAttribute('href')) {
            button.setAttribute('href', 'payment.html?plan=pro');
        }
        
        // Remove custom click handler
        button.onclick = null;
        button.title = 'Upgrade to Pro plan';
    }
}

// Update pricing section
function updatePricingSection() {
    const pricingSection = document.querySelector('#pricing');
    if (!pricingSection) return;
    
    if (subscriptionStatus.isActive) {
        // Add subscription status banner
        let statusBanner = document.getElementById('subscription-status-banner');
        if (!statusBanner) {
            statusBanner = document.createElement('div');
            statusBanner.id = 'subscription-status-banner';
            statusBanner.className = 'subscription-status-banner';
            pricingSection.insertBefore(statusBanner, pricingSection.firstChild);
        }
        
        const endDate = new Date(subscriptionStatus.endDate).toLocaleDateString();
        statusBanner.innerHTML = `
            <div class="status-banner-content">
                <div class="status-icon">
                    <i class="fas fa-crown"></i>
                </div>
                <div class="status-info">
                    <h3>You're on the ${subscriptionStatus.plan.toUpperCase()} plan!</h3>
                    <p>Your subscription is active until ${endDate}</p>
                </div>
                <div class="status-actions">
                    <button onclick="showSubscriptionInfo()" class="btn-secondary">
                        <i class="fas fa-cog"></i>
                        Manage Subscription
                    </button>
                </div>
            </div>
        `;
    } else {
        // Remove status banner if it exists
        const statusBanner = document.getElementById('subscription-status-banner');
        if (statusBanner) {
            statusBanner.remove();
        }
    }
}

// Update subscription displays
function updateSubscriptionDisplays() {
    // Update any elements that show subscription status
    const statusElements = document.querySelectorAll('.subscription-status, .user-plan');
    
    statusElements.forEach(element => {
        if (subscriptionStatus.isActive) {
            element.textContent = subscriptionStatus.plan.toUpperCase();
            element.classList.add('active');
        } else {
            element.textContent = 'FREE';
            element.classList.remove('active');
        }
    });

    // Also update the dashboard stat card for current plan
    const userPlanEl = document.getElementById('userPlan');
    if (userPlanEl) {
        if (subscriptionStatus.isActive) {
            userPlanEl.textContent = subscriptionStatus.plan.charAt(0).toUpperCase() + subscriptionStatus.plan.slice(1);
            userPlanEl.classList.add('active');
        } else {
            userPlanEl.textContent = 'Free';
            userPlanEl.classList.remove('active');
        }
    }
}

// Show subscription info modal
function showSubscriptionInfo() {
    if (!subscriptionStatus.isActive) {
        alert('No active subscription found.');
        return;
    }
    
    const endDate = new Date(subscriptionStatus.endDate).toLocaleDateString();
    const daysLeft = Math.ceil((new Date(subscriptionStatus.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'subscription-info-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-crown"></i> Your Subscription</h2>
                <button class="modal-close" onclick="closeSubscriptionModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="subscription-details">
                    <div class="subscription-card">
                        <div class="subscription-header">
                            <h3>${subscriptionStatus.plan.toUpperCase()} Plan</h3>
                            <span class="status-badge active">Active</span>
                        </div>
                        
                        <div class="subscription-info">
                            <div class="info-item">
                                <i class="fas fa-calendar"></i>
                                <div>
                                    <strong>Expires on:</strong>
                                    <span>${endDate}</span>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <strong>Days remaining:</strong>
                                    <span>${daysLeft} days</span>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <i class="fas fa-credit-card"></i>
                                <div>
                                    <strong>Last payment:</strong>
                                    <span>${subscriptionStatus.data?.paymentId || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="subscription-actions">
                            <button onclick="goToDashboard()" class="btn-primary">
                                <i class="fas fa-tachometer-alt"></i>
                                Go to Dashboard
                            </button>
                            <button onclick="showCancelSubscription()" class="btn-secondary">
                                <i class="fas fa-times-circle"></i>
                                Cancel Subscription
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSubscriptionModal();
        }
    });
}

// Close subscription modal
function closeSubscriptionModal() {
    const modal = document.getElementById('subscription-info-modal');
    if (modal) {
        modal.remove();
    }
}

// Go to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Show cancel subscription confirmation
function showCancelSubscription() {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
        alert('Subscription cancellation requested. You will receive a confirmation email shortly.');
        closeSubscriptionModal();
    }
}

// Force refresh subscription status
async function refreshSubscriptionStatus() {
    if (currentUser) {
        subscriptionStatus.loading = true;
        updateUpgradeButtons();
        await checkUserSubscription(currentUser.uid);
    }
}

// Public API for other scripts
window.subscriptionChecker = {
    getStatus: () => subscriptionStatus,
    refresh: refreshSubscriptionStatus,
    isActive: () => subscriptionStatus.isActive,
    getPlan: () => subscriptionStatus.plan
};

// Add CSS for subscription status elements
const subscriptionStyles = document.createElement('style');
subscriptionStyles.textContent = `
/* Subscription Status Banner */
.subscription-status-banner {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 3rem;
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.status-banner-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.status-icon {
    font-size: 3rem;
    color: #ffd700;
}

.status-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-family: 'Orbitron', monospace;
}

.status-info p {
    margin: 0;
    opacity: 0.9;
}

.status-actions {
    margin-left: auto;
}

/* Subscription Details Modal */
.subscription-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 2rem;
    text-align: center;
}

.subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.subscription-header h3 {
    margin: 0;
    color: #00d4ff;
    font-family: 'Orbitron', monospace;
}

.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.active {
    background: #10b981;
    color: white;
}

.subscription-info {
    margin-bottom: 2rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
}

.info-item i {
    color: #00d4ff;
    width: 20px;
    text-align: center;
}

.info-item div {
    flex: 1;
    text-align: left;
}

.info-item strong {
    display: block;
    color: white;
    margin-bottom: 0.25rem;
}

.info-item span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
}

.subscription-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.subscription-actions button {
    flex: 1;
    max-width: 200px;
}

/* Button States */
.plan-btn:disabled,
.plan-btn[disabled] {
    opacity: 0.7;
    cursor: not-allowed;
    pointer-events: none;
}

.plan-btn.active-subscription {
    background: #10b981 !important;
    border-color: #10b981 !important;
}

.plan-btn.active-subscription:hover {
    background: #059669 !important;
    border-color: #059669 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
    .status-banner-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .status-actions {
        margin-left: 0;
    }
    
    .subscription-actions {
        flex-direction: column;
    }
    
    .subscription-actions button {
        max-width: none;
    }
}
`;

document.head.appendChild(subscriptionStyles);

console.log('🔍 Subscription checker loaded');