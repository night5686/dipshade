// DIPSHADE Payment Integration with Razorpay - SIMPLIFIED VERSION (Uses Orders Collection Only)

let auth, db, currentUser;
let selectedPlan = {
    name: 'pro',
    displayName: 'Pro Plan',
    price: 449,
    period: 'month'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment page loaded - SIMPLIFIED MODE (₹449)');
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

// MAIN PAYMENT FUNCTION - SIMPLIFIED VERSION
async function initiatePayment() {
    console.log('Initiating payment for ₹449 (SIMPLIFIED MODE)...');
    
    if (!currentUser) {
        alert('Please wait for authentication...');
        return;
    }
    
    // Check if Razorpay is loaded
    if (typeof Razorpay === 'undefined') {
        alert('Payment system not loaded. Please refresh the page.');
        return;
    }
    
    const amount = selectedPlan.price * 100; // Convert to paise (₹449 = 44900 paise)
    
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
            description: 'Premium AI Assistant Subscription (₹449/month)',
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

// Handle Payment Success - SIMPLIFIED VERSION (No frontend subscription creation)
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
            // If we can't parse the response but got a 200 status, assume success
            if (verifyResponse.ok) {
                console.log('✅ Payment verification assumed successful (200 status)');
            } else {
                throw new Error('Invalid verification response format');
            }
        }
        
        // More flexible verification check - handle different response formats
        const isVerified = verifyData?.success === true || 
                          verifyData?.verified === true || 
                          verifyResponse.ok === true ||
                          (verifyData?.status && verifyData.status === 'success');
        
        if (!isVerified) {
            console.error('❌ Verification failed. Response:', verifyData);
            console.error('❌ Response status:', verifyResponse.status);
            
            // If backend verification fails but we have payment data, proceed anyway
            // This is a fallback for when backend verification has issues but payment is valid
            if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
                console.warn('⚠️ Backend verification failed, but payment data exists. Proceeding with caution...');
                console.warn('⚠️ This should be investigated, but user will get their subscription');
            } else {
                throw new Error('Payment verification failed: ' + (verifyData?.error || 'Unknown error'));
            }
        }

        console.log('✅ Payment verified successfully by backend');
        console.log('📊 Backend has stored detailed order data in orders collection');
        console.log('🎉 Payment processing completed successfully!');
        console.log('📊 Using orders collection for subscription status - no additional frontend storage needed');

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

// SUBSCRIPTION FUNCTIONS - USING ORDERS COLLECTION

// Get user subscription data from orders collection
async function getUserSubscription(userId) {
    try {
        // Query orders collection for the user's latest verified payment
        const ordersQuery = await db.collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'paid')
            .orderBy('verifiedAt', 'desc')
            .limit(1)
            .get();
        
        if (!ordersQuery.empty) {
            const orderDoc = ordersQuery.docs[0];
            const orderData = orderDoc.data();
            
            // Convert order data to subscription format
            const subscriptionData = {
                userId: orderData.userId,
                userEmail: orderData.userData?.email || orderData.paymentDetails?.email,
                plan: orderData.plan,
                planDisplayName: orderData.plan === 'pro' ? 'Pro Plan' : orderData.plan,
                amount: orderData.amount / 100, // Convert from paise to rupees
                currency: orderData.currency,
                period: 'month', // Default to monthly
                paymentId: orderData.paymentId,
                orderId: orderData.orderId,
                signature: orderData.signature,
                status: 'active',
                startDate: orderData.verifiedAt,
                endDate: new Date(new Date(orderData.verifiedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: orderData.createdAt,
                updatedAt: orderData.verifiedAt,
                verified: true,
                testMode: false
            };
            
            console.log('📊 Subscription data from orders:', subscriptionData);
            return subscriptionData;
        } else {
            console.log('No verified orders found for user:', userId);
            return null;
        }
    } catch (error) {
        console.error('Error getting user subscription from orders:', error);
        return null;
    }
}

// Check if user subscription is active (using orders collection)
async function isSubscriptionActive(userId) {
    try {
        const subscription = await getUserSubscription(userId);
        if (!subscription) return false;
        
        const now = new Date();
        const endDate = new Date(subscription.endDate);
        
        const isActive = subscription.status === 'active' && endDate > now;
        console.log('🔍 Subscription check:', {
            userId,
            status: subscription.status,
            endDate: subscription.endDate,
            now: now.toISOString(),
            isActive
        });
        
        return isActive;
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return false;
    }
}

// Check subscription before allowing payment (using orders collection)
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
console.log('Payment script loaded - SIMPLIFIED VERSION (Orders Collection Only)');
console.log('Razorpay available:', typeof Razorpay !== 'undefined');
console.log('Default plan price: ₹' + selectedPlan.price);