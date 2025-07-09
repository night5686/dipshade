// DIPSHADE Payment Integration with Razorpay

let auth, db, currentUser;
let selectedPlan = {
    name: 'pro',
    displayName: 'Pro Plan',
    price: 999,
    period: 'month'
};

// Razorpay Configuration
const RAZORPAY_CONFIG = {
    key: 'rzp_live_7Kbj7gkjr6RD28', // Live Razorpay Key ID
    currency: 'INR',
    name: 'DIPSHADE',
    description: 'Premium AI Assistant Subscription',
    image: 'https://your-domain.com/logo.png', // Replace with your logo URL
    theme: {
        color: '#00d4ff'
    }
};

// Razorpay Key Secret (for backend use only - DO NOT expose in frontend)
// Key Secret: AxwcnAVQZooVSrU0jN8v1Ujo

// Initialize Firebase and Payment Page
document.addEventListener('DOMContentLoaded', function() {
    initFirebase();
    initPaymentPage();
    updatePaymentSummary();
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
            console.log('[DEBUG] User authenticated:', user.email);
        } else {
            // Redirect to auth page if not logged in
            window.location.href = 'auth.html';
        }
    });
}

// Initialize Payment Page
function initPaymentPage() {
    // Set default selected plan
    const proCard = document.querySelector('[data-plan="pro"]');
    if (proCard) {
        proCard.classList.add('selected');
    }
    
    // Add click listeners to plan cards
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
    // Update selected plan data
    selectedPlan = {
        name: planName,
        displayName: 'Pro Plan',
        price: price,
        period: period
    };
    
    // Update UI
    document.querySelectorAll('.plan-card').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('.plan-btn');
        btn.classList.remove('active');
        btn.textContent = 'Select Pro Plan';
    });
    
    const selectedCard = document.querySelector(`[data-plan="${planName}"]`);
    selectedCard.classList.add('selected');
    const selectedBtn = selectedCard.querySelector('.plan-btn');
    selectedBtn.classList.add('active');
    selectedBtn.textContent = `Selected - ${selectedPlan.displayName}`;
    
    // Update payment summary
    updatePaymentSummary();
    
    console.log('[DEBUG] Plan selected:', selectedPlan);
}

// Update Payment Summary
function updatePaymentSummary() {
    const subtotal = selectedPlan.price;
    const gst = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + gst;
    
    // Update UI elements
    document.getElementById('selectedPlan').textContent = selectedPlan.displayName;
    document.getElementById('billingPeriod').textContent = selectedPlan.period === 'month' ? 'Monthly' : 'Yearly';
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('gst').textContent = `₹${gst}`;
    document.getElementById('totalAmount').textContent = `₹${total}`;
    
    console.log('[DEBUG] Payment summary updated:', { subtotal, gst, total });
}

// Calculate GST and Total
function calculateTotal(price) {
    const gst = Math.round(price * 0.18);
    return {
        subtotal: price,
        gst: gst,
        total: price + gst
    };
}

// Initiate Payment
async function initiatePayment() {
    if (!currentUser) {
        showError('Please sign in to continue with payment');
        return;
    }
    
    const amounts = calculateTotal(selectedPlan.price);
    
    try {
        showLoading('Preparing payment...');
        
        // Create order on your backend (you'll need to implement this)
        const orderData = await createRazorpayOrder(amounts.total, selectedPlan);
        
        hideLoading();
        
        // Configure Razorpay options
        const options = {
            ...RAZORPAY_CONFIG,
            amount: amounts.total * 100, // Amount in paise
            order_id: orderData.orderId,
            prefill: {
                name: currentUser.displayName || 'User',
                email: currentUser.email,
                contact: '' // You can collect this in a form
            },
            notes: {
                plan: selectedPlan.name,
                userId: currentUser.uid,
                period: selectedPlan.period
            },
            handler: function(response) {
                handlePaymentSuccess(response, amounts);
            },
            modal: {
                ondismiss: function() {
                    console.log('[DEBUG] Payment modal dismissed');
                }
            }
        };
        
        // Open Razorpay checkout
        const rzp = new Razorpay(options);
        rzp.open();
        
    } catch (error) {
        hideLoading();
        console.error('[ERROR] Payment initiation failed:', error);
        showError('Failed to initiate payment. Please try again.');
    }
}

// Create Razorpay Order (Mock function - implement backend)
async function createRazorpayOrder(amount, plan) {
    // This is a mock function. In production, you need to:
    // 1. Send request to your backend
    // 2. Backend creates order using Razorpay API
    // 3. Backend returns order ID
    
    // For demo purposes, returning mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                orderId: 'order_' + Date.now(),
                amount: amount,
                currency: 'INR'
            });
        }, 1000);
    });
    
    /* 
    // Production implementation would look like:
    const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
            amount: amount,
            plan: plan,
            userId: currentUser.uid
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to create order');
    }
    
    return await response.json();
    */
}

// Handle Payment Success
async function handlePaymentSuccess(response, amounts) {
    try {
        showLoading('Verifying payment...');
        
        console.log('[DEBUG] Payment successful:', response);
        
        // Verify payment on backend (implement this)
        const verification = await verifyPayment(response);
        
        if (verification.success) {
            // Update user subscription in Firestore
            await updateUserSubscription(response, amounts);
            
            hideLoading();
            showSuccessModal(response, amounts);
        } else {
            throw new Error('Payment verification failed');
        }
        
    } catch (error) {
        hideLoading();
        console.error('[ERROR] Payment verification failed:', error);
        showError('Payment verification failed. Please contact support.');
    }
}

// Verify Payment (Mock function - implement backend)
async function verifyPayment(paymentResponse) {
    // This should be done on your backend for security
    // Backend should verify the payment signature using Razorpay webhook
    
    // For demo purposes, returning success
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transactionId: paymentResponse.razorpay_payment_id
            });
        }, 2000);
    });
    
    /*
    // Production implementation:
    const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify(paymentResponse)
    });
    
    return await response.json();
    */
}

// Update User Subscription
async function updateUserSubscription(paymentResponse, amounts) {
    try {
        const subscriptionData = {
            plan: selectedPlan.name,
            planDisplayName: selectedPlan.displayName,
            amount: amounts.total,
            currency: 'INR',
            period: selectedPlan.period,
            paymentId: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
            signature: paymentResponse.razorpay_signature,
            status: 'active',
            startDate: firebase.firestore.FieldValue.serverTimestamp(),
            endDate: new Date(Date.now() + (selectedPlan.period === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Update user document
        await db.collection('users').doc(currentUser.uid).update({
            plan: selectedPlan.name,
            subscription: subscriptionData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Create payment record
        await db.collection('payments').add({
            userId: currentUser.uid,
            userEmail: currentUser.email,
            ...subscriptionData
        });
        
        console.log('[DEBUG] User subscription updated successfully');
        
    } catch (error) {
        console.error('[ERROR] Failed to update user subscription:', error);
        throw error;
    }
}

// Show Success Modal
function showSuccessModal(paymentResponse, amounts) {
    document.getElementById('transactionId').textContent = paymentResponse.razorpay_payment_id;
    document.getElementById('successPlan').textContent = selectedPlan.displayName;
    document.getElementById('successAmount').textContent = `₹${amounts.total}`;
    
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
}

// Go to Dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Utility Functions
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
.error-content {
    display: flex; align-items: center; gap: 0.5rem;
}
.error-content button {
    background: none; border: none; color: white; cursor: pointer; padding: 0.25rem; margin-left: auto;
}
`;
document.head.appendChild(style);