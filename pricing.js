// DIPSHADE Pricing Page - Subscription Management
// Handles subscription status, billing toggle, and upgrade buttons

let auth, db, currentUser;
let subscriptionStatus = {
    isActive: false,
    plan: 'free',
    endDate: null,
    loading: true
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏷️ Pricing page loaded');
    initFirebase();
    initPricingPage();
    checkSubscriptionStatus();
});

// Initialize Firebase
async function initFirebase() {
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
                updatePricingDisplay();
            }
        });

    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        subscriptionStatus.loading = false;
        updatePricingDisplay();
    }
}

// Initialize pricing page functionality
function initPricingPage() {
    // Billing toggle functionality
    const billingToggle = document.getElementById('billingToggle');
    if (billingToggle) {
        billingToggle.addEventListener('change', toggleBilling);
    }
    
    // FAQ accordion functionality
    initFAQAccordion();
    
    // Smooth scrolling for anchor links
    initSmoothScrolling();
}

// Check subscription status
async function checkSubscriptionStatus() {
    console.log('🔍 Checking subscription status...');
    
    try {
        // Only use Firestore for subscription status
        if (currentUser) {
            await checkUserSubscription(currentUser.uid);
        } else {
            subscriptionStatus.loading = false;
            updatePricingDisplay();
        }
    } catch (error) {
        console.error('❌ Error checking subscription:', error);
        subscriptionStatus.loading = false;
        updatePricingDisplay();
    }
}

// Check user subscription in Firebase
async function checkUserSubscription(userId) {
    console.log('🔍 Checking Firebase user data for user:', userId);
    
    try {
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
            
            console.log('✅ Subscription status updated:', subscriptionStatus);
            
        } else {
            console.log('❌ No user data found');
            subscriptionStatus = {
                isActive: false,
                plan: 'free',
                endDate: null,
                loading: false
            };
        }
        
        updatePricingDisplay();
        
    } catch (error) {
        console.error('❌ Error checking Firebase user data:', error);
        subscriptionStatus.loading = false;
        updatePricingDisplay();
    }
}

// Update pricing display based on subscription status
function updatePricingDisplay() {
    console.log('🔄 Updating pricing display...', subscriptionStatus);
    
    // Update subscription status banner
    updateStatusBanner();
    
    // Update upgrade buttons
    updateUpgradeButtons();
    
    // Update plan highlighting
    updatePlanHighlighting();

    // Also update any elements that show the user's current plan
    const statusElements = document.querySelectorAll('.user-plan');
    statusElements.forEach(element => {
        if (subscriptionStatus.isActive) {
            element.textContent = subscriptionStatus.plan.charAt(0).toUpperCase() + subscriptionStatus.plan.slice(1);
            element.classList.add('active');
        } else {
            element.textContent = 'Free';
            element.classList.remove('active');
        }
    });
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

// Update subscription status banner
function updateStatusBanner() {
    const banner = document.getElementById('subscription-status-banner');
    const planName = document.getElementById('statusPlanName');
    const expiry = document.getElementById('statusExpiry');
    
    if (!banner) return;
    
    if (subscriptionStatus.isActive) {
        // Show banner for active subscribers
        banner.style.display = 'block';
        
        if (planName) {
            planName.textContent = `You're on the ${subscriptionStatus.plan.toUpperCase()} plan!`;
        }
        
        if (expiry && subscriptionStatus.endDate) {
            const endDate = new Date(subscriptionStatus.endDate).toLocaleDateString();
            expiry.textContent = `Your subscription is active until ${endDate}`;
        }
        
    } else {
        // Hide banner for non-subscribers
        banner.style.display = 'none';
    }
}

// Update upgrade buttons
function updateUpgradeButtons() {
    const proUpgradeBtn = document.getElementById('proUpgradeBtn');
    
    if (!proUpgradeBtn) return;
    
    if (subscriptionStatus.loading) {
        // Show loading state
        proUpgradeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        proUpgradeBtn.style.pointerEvents = 'none';
        proUpgradeBtn.style.opacity = '0.7';
        return;
    }
    
    if (subscriptionStatus.isActive && subscriptionStatus.plan === 'pro') {
        // User has active Pro subscription
        proUpgradeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Current Plan';
        proUpgradeBtn.style.background = '#10b981'; // Green color
        proUpgradeBtn.style.borderColor = '#10b981';
        proUpgradeBtn.style.cursor = 'default';
        proUpgradeBtn.style.pointerEvents = 'none';
        
        // Remove href to prevent navigation
        proUpgradeBtn.removeAttribute('href');
        
        // Add click handler to show subscription info
        proUpgradeBtn.onclick = function(e) {
            e.preventDefault();
            showSubscriptionInfo();
            return false;
        };
        
    } else {
        // User doesn't have Pro subscription - restore original functionality
        proUpgradeBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade to Pro';
        proUpgradeBtn.style.background = ''; // Reset to original
        proUpgradeBtn.style.borderColor = '';
        proUpgradeBtn.style.cursor = 'pointer';
        proUpgradeBtn.style.pointerEvents = 'auto';
        proUpgradeBtn.style.opacity = '1';
        
        // Restore href if it was removed
        if (!proUpgradeBtn.getAttribute('href')) {
            proUpgradeBtn.setAttribute('href', 'payment.html?plan=pro');
        }
        
        // Remove custom click handler
        proUpgradeBtn.onclick = null;
    }
}

// Update plan highlighting
function updatePlanHighlighting() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        // Remove any existing current plan styling
        card.classList.remove('current-plan');
        
        // Add current plan styling if applicable
        if (subscriptionStatus.isActive) {
            const planHeader = card.querySelector('.plan-header h3');
            if (planHeader && planHeader.textContent.toLowerCase() === subscriptionStatus.plan.toLowerCase()) {
                card.classList.add('current-plan');
            }
        }
    });
}

// Toggle between monthly and yearly billing
function toggleBilling() {
    const billingToggle = document.getElementById('billingToggle');
    const isYearly = billingToggle.checked;
    
    // Update price displays
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    const monthlyPeriods = document.querySelectorAll('.monthly-period');
    const yearlyPeriods = document.querySelectorAll('.yearly-period');
    const yearlySavings = document.querySelectorAll('.yearly-savings');
    
    if (isYearly) {
        // Show yearly pricing
        monthlyPrices.forEach(el => el.style.display = 'none');
        yearlyPrices.forEach(el => el.style.display = 'inline');
        monthlyPeriods.forEach(el => el.style.display = 'none');
        yearlyPeriods.forEach(el => el.style.display = 'inline');
        yearlySavings.forEach(el => el.style.display = 'block');
    } else {
        // Show monthly pricing
        monthlyPrices.forEach(el => el.style.display = 'inline');
        yearlyPrices.forEach(el => el.style.display = 'none');
        monthlyPeriods.forEach(el => el.style.display = 'inline');
        yearlyPeriods.forEach(el => el.style.display = 'none');
        yearlySavings.forEach(el => el.style.display = 'none');
    }
    
    console.log('💰 Billing toggled to:', isYearly ? 'Yearly' : 'Monthly');
}

// Initialize FAQ accordion
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherIcon = otherItem.querySelector('.faq-question i');
                otherIcon.style.transform = 'rotate(0deg)';
            });
            
            // Toggle current item
            if (!isOpen) {
                item.classList.add('active');
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Initialize smooth scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Show subscription info modal
function showSubscriptionInfo() {
    if (!subscriptionStatus.isActive) {
        alert('No active subscription found.');
        return;
    }
    
    const endDate = subscriptionStatus.endDate ? 
        new Date(subscriptionStatus.endDate).toLocaleDateString() : 'Unknown';
    
    const message = `You have an active ${subscriptionStatus.plan.toUpperCase()} subscription!\n\n` +
                   `Expires on: ${endDate}\n\n` +
                   `Would you like to go to your dashboard to manage your subscription?`;
    
    if (confirm(message)) {
        goToDashboard();
    }
}

// Go to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Public API for manual refresh
window.refreshPricingStatus = function() {
    subscriptionStatus.loading = true;
    updatePricingDisplay();
    checkSubscriptionStatus();
};

// Listen for storage changes (when user pays in another tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'dipshade_subscription' || e.key === 'dipshade_user') {
        console.log('🔄 Subscription data changed in another tab, refreshing...');
        checkSubscriptionStatus();
    }
});

// Check periodically for subscription updates (every 30 seconds)
setInterval(() => {
    if (!subscriptionStatus.loading) {
        checkSubscriptionStatus();
    }
}, 30000);

console.log('🏷️ Pricing page script loaded');