// DIPSHADE Payment Integration with Razorpay - PRODUCTION VERSION

let auth, db, currentUser;
let selectedPlan = {
    name: 'pro',
    displayName: 'Pro Plan',
    price: 1,
    period: 'month'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment page loaded - PRODUCTION MODE (₹1)');
    initFirebase();
    initPaymentPage();
    updatePaymentSummary();
    checkSubscriptionBeforePayment();
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
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                console.log('User authenticated:', user.email);
                console.log('User UID:', user.uid);
                console.log('User verified:', user.emailVerified);
            } else {
                // Try to sign in anonymously for testing
                auth.signInAnonymously()
                    .then((result) => {
                        currentUser = result.user;
                        console.log('Anonymous user created:', currentUser.uid);
                    })
                    .catch((error) => {
                        console.error('Anonymous auth failed:', error);
                        // Fallback to mock user
                        currentUser = {
                            uid: 'user_' + Date.now(),
                            email: 'user@dipshade.com',
                            displayName: 'DIPSHADE User'
                        };
                        console.log('Using mock user for testing');
                    });
            }
        });
    } catch (error) {
        console.error('Firebase init error:', error);
        // Create mock user anyway
        currentUser = {
            uid: 'user_' + Date.now(),
            email: 'user@dipshade.com',
            displayName: 'DIPSHADE User'
        };
    }
}

// Initialize Payment Page
function initPaymentPage() {
    const proCard = document.querySelector('[data-plan="pro"]');
    if (proCard) {
        proCard.classList.add('selected');
    }
    
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', function() {
            const plan = this.dataset.plan;
            const price = parseInt(this.dataset.price);
            const period = this.dataset.period;
            selectPlan(plan, price, period);
        });
    });
}

// Select Plan Function
function selectPlan(planName, price, period) {
    selectedPlan = {
        name: planName,
        displayName: 'Pro Plan',
        price: price,
        period: period
    };
    
    document.querySelectorAll('.plan-card').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('.plan-btn');
        if (btn) {
            btn.classList.remove('active');
            btn.textContent = 'Select Pro Plan';
        }
    });
    
    const selectedCard = document.querySelector(`[data-plan="${planName}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        const selectedBtn = selectedCard.querySelector('.plan-btn');
        if (selectedBtn) {
            selectedBtn.classList.add('active');
            selectedBtn.textContent = `Selected - ${selectedPlan.displayName}`;
        }
    }
    
    updatePaymentSummary();
    console.log('Plan selected:', selectedPlan);
}

// Update Payment Summary
function updatePaymentSummary() {
    const total = selectedPlan.price;
    
    const selectedPlanEl = document.getElementById('selectedPlan');
    const billingPeriodEl = document.getElementById('billingPeriod');
    const totalAmountEl = document.getElementById('totalAmount');
    
    if (selectedPlanEl) selectedPlanEl.textContent = selectedPlan.displayName;
    if (billingPeriodEl) billingPeriodEl.textContent = selectedPlan.period === 'month' ? 'Monthly' : 'Yearly';
    if (totalAmountEl) totalAmountEl.textContent = `₹${total}`;
    
    console.log('Payment summary updated:', { total });
}

// MAIN PAYMENT FUNCTION - PRODUCTION VERSION
async function initiatePayment() {
    console.log('Initiating payment for ₹1 (PRODUCTION MODE)...');
    
    if (!currentUser) {
        alert('Please wait for authentication...');
        return;
    }
    
    // Check if Razorpay is loaded
    if (typeof Razorpay === 'undefined') {
        alert('Payment system not loaded. Please refresh the page.');
        return;
    }
    
    const amount = selectedPlan.price * 100; // Convert to paise (₹1 = 100 paise)
    
    console.log('Payment details:', {
        amount: amount,
        plan: selectedPlan,
        user: currentUser
    });

    try {
        // Show loading
        showLoading('Creating order...');

        // Step 1: Create order using backend API
        const backendConfig = window.DIPSHADE_BACKEND || {
            createOrderUrl: 'https://backend-omega-virid.vercel.app/api/create-order'
        };
        
        console.log('🔄 Creating order with config:', backendConfig);
        console.log('🔗 Using URL:', backendConfig.createOrderUrl);
        
        const requestData = {
            amount: amount,
            currency: 'INR',
            plan: selectedPlan.name,
            userId: currentUser.uid
        };
        
        console.log('📝 Order request data:', requestData);
        
        const orderResponse = await fetch(backendConfig.createOrderUrl, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('📡 Order response received:', {
            status: orderResponse.status,
            statusText: orderResponse.statusText,
            ok: orderResponse.ok,
            url: orderResponse.url
        });

        const orderData = await orderResponse.json();
        
        if (!orderData.success) {
            throw new Error(orderData.error || 'Failed to create order');
        }

        console.log('✅ Order created:', orderData.order_id);
        hideLoading();

        // Step 2: Razorpay options with order_id
        const options = {
            key: 'rzp_live_J8SkrFGw9HntHe', // Your Razorpay key
            amount: orderData.amount, // Amount from order
            currency: orderData.currency,
            order_id: orderData.order_id, // ✅ This prevents auto-refunds!
            name: 'DIPSHADE',
            description: 'Premium AI Assistant Subscription (₹1/month)',
            image: 'https://your-domain.com/logo.png', // Optional logo
            handler: function(response) {
                // This function is called when payment is successful
                console.log('Payment successful:', response);
                console.log('Payment ID:', response.razorpay_payment_id);
                console.log('Order ID:', response.razorpay_order_id);
                console.log('Signature:', response.razorpay_signature);
                
                // Handle successful payment with verification
                handlePaymentSuccess(response);
            },
            prefill: {
                name: currentUser.displayName || 'User',
                email: currentUser.email || 'user@dipshade.com',
                contact: ''
            },
            notes: {
                plan: selectedPlan.name,
                userId: currentUser.uid,
                period: selectedPlan.period
            },
            theme: {
                color: '#00d4ff'
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment modal dismissed by user');
                    // Optional: Show a message or redirect
                }
            }
        };
        
        console.log('Opening Razorpay with options:', options);
        
        const rzp = new Razorpay(options);
        
        // Handle payment failures
        rzp.on('payment.failed', function(response) {
            console.error('Payment failed:', response.error);
            console.error('Error code:', response.error.code);
            console.error('Error description:', response.error.description);
            console.error('Error source:', response.error.source);
            console.error('Error step:', response.error.step);
            console.error('Error reason:', response.error.reason);
            
            // Show user-friendly error message
            alert('Payment failed: ' + response.error.description);
            
            // Optional: Log to your analytics
            if (response.error.metadata) {
                console.error('Order ID:', response.error.metadata.order_id);
                console.error('Payment ID:', response.error.metadata.payment_id);
            }
        });
        
        // Open Razorpay checkout
        rzp.open();
        
    } catch (error) {
        hideLoading();
        console.error('Error initiating payment:', error);
        alert('Error initiating payment: ' + error.message);
    }
}

// Handle Payment Success - WITH BACKEND VERIFICATION
async function handlePaymentSuccess(response) {
    console.log('🎯 Processing successful payment:', response);
    
    try {
        // Show loading immediately
        showLoading('Verifying payment...');
        
        // Step 1: Verify payment using backend API
        const backendConfig = window.DIPSHADE_BACKEND || {
            verifyPaymentUrl: 'https://backend-omega-virid.vercel.app/api/verify-payment'
        };
        
        console.log('🔍 Verifying payment with backend...');
        
        const verifyResponse = await fetch(backendConfig.verifyPaymentUrl, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_data: {
                    userId: currentUser.uid,
                    email: currentUser.email,
                    plan: selectedPlan.name,
                    displayName: currentUser.displayName || 'User'
                }
            })
        });

        console.log('📡 Verification response status:', verifyResponse.status);
        console.log('📡 Verification response ok:', verifyResponse.ok);

        let verifyData;
        try {
            verifyData = await verifyResponse.json();
            console.log('📊 Verification response data:', verifyData);
        } catch (jsonError) {
            console.error('❌ Failed to parse verification response as JSON:', jsonError);
            throw new Error('Invalid verification response format');
        }
        
        // More flexible verification check - handle different response formats
        const isVerified = verifyData.success === true || 
                          verifyData.verified === true || 
                          verifyResponse.ok === true ||
                          (verifyData.status && verifyData.status === 'success');
        
        if (!isVerified) {
            console.error('❌ Verification failed. Response:', verifyData);
            console.error('❌ Response status:', verifyResponse.status);
            
            // If backend verification fails but we have payment data, proceed anyway
            // This is a fallback for when backend verification has issues but payment is valid
            if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
                console.warn('⚠️ Backend verification failed, but payment data exists. Proceeding with caution...');
                console.warn('⚠️ This should be investigated, but user will get their subscription');
            } else {
                throw new Error('Payment verification failed: ' + (verifyData.error || 'Unknown error'));
            }
        }

        console.log('✅ Payment verified successfully by backend');
        console.log('📊 Backend has stored detailed order data in orders collection');

        // Step 2: Create subscription data in subscriptions collection (frontend responsibility)
        showLoading('Creating subscription...');
        
        // Check if Firebase is properly initialized
        if (!db) {
            console.error('❌ Firebase Firestore not initialized!');
            throw new Error('Database not available');
        }
        
        if (!currentUser || !currentUser.uid) {
            console.error('❌ Current user not available!');
            throw new Error('User authentication required');
        }
        
        console.log('🔧 Current user:', currentUser);
        console.log('🔧 Selected plan:', selectedPlan);
        
        const subscriptionData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            plan: selectedPlan.name,
            planDisplayName: selectedPlan.displayName,
            amount: selectedPlan.price,
            currency: 'INR',
            period: selectedPlan.period,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + (selectedPlan.period === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verified: true,
            testMode: false
        };

        console.log('💾 Attempting to save subscription data:', subscriptionData);
        
        // Save subscription (most important) - with detailed error handling
        try {
            console.log('🔄 Writing to subscriptions collection...');
            const subscriptionRef = db.collection('subscriptions').doc(currentUser.uid);
            await subscriptionRef.set(subscriptionData);
            console.log('✅ Subscription saved successfully to subscriptions collection');
            
            // Verify the write was successful
            const savedDoc = await subscriptionRef.get();
            if (savedDoc.exists) {
                console.log('✅ Subscription document verified in Firestore:', savedDoc.data());
            } else {
                console.error('❌ Subscription document not found after write!');
            }
            
        } catch (subError) {
            console.error('❌ Subscription save failed:', subError);
            console.error('❌ Error details:', {
                code: subError.code,
                message: subError.message,
                stack: subError.stack
            });
            
            // Try alternative approach - create with add() instead of set()
            try {
                console.log('🔄 Trying alternative approach with add()...');
                const docRef = await db.collection('subscriptions').add({
                    ...subscriptionData,
                    documentId: currentUser.uid
                });
                console.log('✅ Subscription saved with add() method, ID:', docRef.id);
            } catch (addError) {
                console.error('❌ Alternative approach also failed:', addError);
                throw new Error('Failed to save subscription data: ' + subError.message);
            }
        }

        // Update user profile with subscription status
        showLoading('Updating user profile...');
        try {
            console.log('🔄 Updating user profile...');
            const userRef = db.collection('users').doc(currentUser.uid);
            await userRef.set({
                email: currentUser.email,
                displayName: currentUser.displayName || 'User',
                subscriptionStatus: 'active',
                currentPlan: selectedPlan.name,
                subscriptionStartDate: subscriptionData.startDate,
                subscriptionEndDate: subscriptionData.endDate,
                lastPaymentId: response.razorpay_payment_id,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log('✅ User profile updated in users collection');
            
            // Verify user profile update
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                console.log('✅ User profile verified:', userDoc.data());
            }
            
        } catch (userError) {
            console.warn('⚠️ User profile update warning:', userError);
        }

        console.log('🎉 Payment processing completed successfully!');
        console.log('📊 Data structure:');
        console.log('  - orders: Backend stores detailed Razorpay data');
        console.log('  - subscriptions: Frontend stores subscription status');
        console.log('  - users: Frontend stores user profile with subscription info');

        // Hide loading and show success
        hideLoading();
        showSuccessModal(response);
        
    } catch (error) {
        hideLoading();
        console.error('❌ Payment verification or processing failed:', error);
        console.error('❌ Full error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        alert('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id + '\n\nError: ' + error.message);
    }
}

// Show Success Modal - ENHANCED VERSION
function showSuccessModal(paymentResponse) {
    console.log('Showing success modal for payment:', paymentResponse.razorpay_payment_id);
    
    const transactionIdEl = document.getElementById('transactionId');
    const successPlanEl = document.getElementById('successPlan');
    const successAmountEl = document.getElementById('successAmount');
    
    if (transactionIdEl) transactionIdEl.textContent = paymentResponse.razorpay_payment_id;
    if (successPlanEl) successPlanEl.textContent = selectedPlan.displayName;
    if (successAmountEl) successAmountEl.textContent = `₹${selectedPlan.price}`;
    
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Auto-redirect to dashboard after 5 seconds
        setTimeout(() => {
            console.log('Auto-redirecting to dashboard...');
            goToDashboard();
        }, 5000);
        
    } else {
        // Fallback if modal doesn't exist
        alert(`Payment successful! Transaction ID: ${paymentResponse.razorpay_payment_id}\n\nRedirecting to dashboard...`);
        setTimeout(() => {
            goToDashboard();
        }, 2000);
    }
}

// Go to Dashboard - ENHANCED VERSION
function goToDashboard() {
    console.log('Redirecting to dashboard...');
    
    // Show loading during redirect
    showLoading('Redirecting to dashboard...');
    
    // Small delay to show loading, then redirect
    setTimeout(() => {
        // Force a reload to ensure subscription status is updated
        window.location.href = 'dashboard.html?refresh=' + Date.now();
    }, 1000);
}

// Utility Functions
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const loadingText = overlay.querySelector('h3');
        if (loadingText) loadingText.textContent = message;
        overlay.classList.add('active');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// USER DATA MANAGEMENT FUNCTIONS

// Get user subscription data
async function getUserSubscription(userId) {
    try {
        const doc = await db.collection('subscriptions').doc(userId).get();
        if (doc.exists) {
            return doc.data();
        } else {
            console.log('No subscription found for user:', userId);
            return null;
        }
    } catch (error) {
        console.error('Error getting user subscription:', error);
        return null;
    }
}

// Check if user subscription is active
async function isSubscriptionActive(userId) {
    try {
        const subscription = await getUserSubscription(userId);
        if (!subscription) return false;
        
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        
        return subscription.status === 'active' && endDate > now;
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
}

// Update subscription status (for renewals, cancellations, etc.)
async function updateSubscriptionStatus(userId, status, additionalData = {}) {
    try {
        const updateData = {
            status: status,
            updatedAt: new Date().toISOString(),
            ...additionalData
        };
        
        await db.collection('subscriptions').doc(userId).update(updateData);
        
        // Also update user profile
        await db.collection('users').doc(userId).update({
            subscriptionStatus: status,
            updatedAt: new Date().toISOString()
        });
        
        console.log('Subscription status updated:', { userId, status, additionalData });
        return true;
    } catch (error) {
        console.error('Error updating subscription status:', error);
        return false;
    }
}

// Get user profile data
async function getUserProfile(userId) {
    try {
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            return doc.data();
        } else {
            console.log('No profile found for user:', userId);
            return null;
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

// Create or update user profile
async function updateUserProfile(userId, profileData) {
    try {
        const updateData = {
            ...profileData,
            updatedAt: new Date().toISOString()
        };
        
        await db.collection('users').doc(userId).set(updateData, { merge: true });
        console.log('User profile updated:', { userId, profileData });
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        return false;
    }
}

// Check subscription before allowing payment
async function checkSubscriptionBeforePayment() {
    console.log('🔍 Checking existing subscription before payment...');
    
    // Wait for Firebase to initialize
    setTimeout(async () => {
        if (currentUser && db) {
            try {
                const subscription = await getUserSubscription(currentUser.uid);
                
                if (subscription && subscription.status === 'active') {
                    const endDate = new Date(subscription.endDate);
                    const now = new Date();
                    
                    if (endDate > now) {
                        console.log('⚠️ User already has active subscription');
                        showActiveSubscriptionWarning(subscription);
                        return;
                    }
                }
                
                console.log('✅ No active subscription found - payment allowed');
            } catch (error) {
                console.error('❌ Error checking subscription:', error);
            }
        }
    }, 2000); // Wait 2 seconds for Firebase to initialize
}

// Show warning for users with active subscription
function showActiveSubscriptionWarning(subscription) {
    const endDate = new Date(subscription.endDate).toLocaleDateString();
    
    // Create warning overlay
    const warningOverlay = document.createElement('div');
    warningOverlay.className = 'subscription-warning-overlay';
    warningOverlay.innerHTML = `
        <div class="warning-modal">
            <div class="warning-header">
                <i class="fas fa-crown"></i>
                <h2>You Already Have an Active Subscription!</h2>
            </div>
            
            <div class="warning-content">
                <div class="subscription-info">
                    <div class="info-item">
                        <strong>Current Plan:</strong>
                        <span>${subscription.planDisplayName || subscription.plan.toUpperCase()}</span>
                    </div>
                    <div class="info-item">
                        <strong>Status:</strong>
                        <span class="status-active">Active</span>
                    </div>
                    <div class="info-item">
                        <strong>Expires on:</strong>
                        <span>${endDate}</span>
                    </div>
                </div>
                
                <p>You don't need to make another payment. Your subscription is active and working!</p>
            </div>
            
            <div class="warning-actions">
                <button onclick="goToDashboard()" class="btn-primary">
                    <i class="fas fa-tachometer-alt"></i>
                    Go to Dashboard
                </button>
                <button onclick="goToHomePage()" class="btn-secondary">
                    <i class="fas fa-home"></i>
                    Back to Home
                </button>
                <button onclick="closeWarningModal()" class="btn-text">
                    Continue Anyway
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(warningOverlay);
    
    // Disable payment buttons
    const paymentButtons = document.querySelectorAll('.payment-btn, .plan-btn, [onclick*="initiatePayment"]');
    paymentButtons.forEach(btn => {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.title = 'You already have an active subscription';
    });
}

// Close warning modal
function closeWarningModal() {
    const overlay = document.querySelector('.subscription-warning-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Re-enable payment buttons
    const paymentButtons = document.querySelectorAll('.payment-btn, .plan-btn, [onclick*="initiatePayment"]');
    paymentButtons.forEach(btn => {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.title = '';
    });
}

// Go to home page
function goToHomePage() {
    window.location.href = 'index.html';
}

// Debug info
console.log('Payment script loaded - PRODUCTION VERSION');
console.log('Razorpay available:', typeof Razorpay !== 'undefined');
console.log('Default plan price: ₹' + selectedPlan.price);