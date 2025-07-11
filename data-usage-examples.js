// DIPSHADE - User Data Management Examples
// This file shows how to use the data management functions from payment.js

// Example 1: Check if user has active subscription (for dashboard)
async function checkUserAccess(userId) {
    const isActive = await isSubscriptionActive(userId);
    
    if (isActive) {
        console.log('User has active subscription - grant access');
        // Show premium features
        document.getElementById('premiumFeatures').style.display = 'block';
    } else {
        console.log('User subscription expired or not found');
        // Redirect to payment page
        window.location.href = 'payment.html';
    }
}

// Example 2: Display user subscription info on dashboard
async function displayUserSubscription(userId) {
    const subscription = await getUserSubscription(userId);
    
    if (subscription) {
        document.getElementById('planName').textContent = subscription.planDisplayName;
        document.getElementById('planStatus').textContent = subscription.status;
        document.getElementById('expiryDate').textContent = new Date(subscription.endDate).toLocaleDateString();
        document.getElementById('amount').textContent = `₹${subscription.amount}`;
    }
}

// Example 3: Show payment history
async function displayPaymentHistory(userId) {
    const payments = await getUserPayments(userId, 5); // Get last 5 payments
    
    const historyContainer = document.getElementById('paymentHistory');
    historyContainer.innerHTML = '';
    
    payments.forEach(payment => {
        const paymentDiv = document.createElement('div');
        paymentDiv.className = 'payment-item';
        paymentDiv.innerHTML = `
            <div class="payment-info">
                <span class="payment-id">${payment.paymentId}</span>
                <span class="payment-amount">₹${payment.amount}</span>
                <span class="payment-date">${new Date(payment.createdAt).toLocaleDateString()}</span>
                <span class="payment-status ${payment.status}">${payment.status}</span>
            </div>
        `;
        historyContainer.appendChild(paymentDiv);
    });
}

// Example 4: Cancel subscription
async function cancelSubscription(userId) {
    const confirmed = confirm('Are you sure you want to cancel your subscription?');
    
    if (confirmed) {
        const success = await updateSubscriptionStatus(userId, 'cancelled', {
            cancelledAt: new Date().toISOString(),
            cancelReason: 'user_requested'
        });
        
        if (success) {
            alert('Subscription cancelled successfully');
            // Refresh the page or update UI
            location.reload();
        } else {
            alert('Error cancelling subscription. Please try again.');
        }
    }
}

// Example 5: Admin dashboard - view all payments
async function loadAdminDashboard() {
    try {
        // Get recent payments
        const payments = await getAllPayments(20);
        
        // Get active subscriptions
        const activeSubscriptions = await getActiveSubscriptions();
        
        // Get revenue analytics for last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const today = new Date().toISOString();
        const analytics = await getRevenueAnalytics(thirtyDaysAgo, today);
        
        // Update admin dashboard UI
        document.getElementById('totalPayments').textContent = payments.length;
        document.getElementById('activeSubscriptions').textContent = activeSubscriptions.length;
        
        if (analytics) {
            document.getElementById('totalRevenue').textContent = `₹${analytics.totalRevenue}`;
            document.getElementById('avgTransaction').textContent = `₹${analytics.averageTransactionValue.toFixed(2)}`;
        }
        
        // Display payments table
        displayPaymentsTable(payments);
        
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

// Helper function to display payments in admin table
function displayPaymentsTable(payments) {
    const tableBody = document.getElementById('paymentsTableBody');
    tableBody.innerHTML = '';
    
    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment.paymentId}</td>
            <td>${payment.userEmail}</td>
            <td>₹${payment.amount}</td>
            <td>${payment.plan}</td>
            <td>${payment.status}</td>
            <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Example 6: User profile management
async function updateUserSettings(userId, newSettings) {
    const success = await updateUserProfile(userId, {
        displayName: newSettings.displayName,
        email: newSettings.email,
        preferences: newSettings.preferences,
        // Add other profile fields as needed
    });
    
    if (success) {
        alert('Profile updated successfully');
    } else {
        alert('Error updating profile');
    }
}

// Example 7: Check subscription expiry and send reminders
async function checkExpiringSubscriptions() {
    try {
        const activeSubscriptions = await getActiveSubscriptions();
        const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        
        const expiringSubscriptions = activeSubscriptions.filter(sub => {
            const endDate = new Date(sub.endDate);
            return endDate <= threeDaysFromNow;
        });
        
        console.log(`Found ${expiringSubscriptions.length} subscriptions expiring in 3 days`);
        
        // Here you would typically send email reminders
        expiringSubscriptions.forEach(sub => {
            console.log(`Subscription expiring for user: ${sub.userEmail} on ${sub.endDate}`);
            // Send email reminder
        });
        
    } catch (error) {
        console.error('Error checking expiring subscriptions:', error);
    }
}

// Example 8: Real-time subscription status checker
function startSubscriptionMonitoring(userId) {
    // Check subscription status every 5 minutes
    setInterval(async () => {
        const isActive = await isSubscriptionActive(userId);
        
        if (!isActive) {
            // Subscription expired - redirect to payment page
            alert('Your subscription has expired. Please renew to continue using premium features.');
            window.location.href = 'payment.html';
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// Example usage in your HTML pages:

/*
// In dashboard.html:
document.addEventListener('DOMContentLoaded', async function() {
    const user = firebase.auth().currentUser;
    if (user) {
        await checkUserAccess(user.uid);
        await displayUserSubscription(user.uid);
        await displayPaymentHistory(user.uid);
        startSubscriptionMonitoring(user.uid);
    }
});

// In admin.html:
document.addEventListener('DOMContentLoaded', function() {
    loadAdminDashboard();
});

// For subscription cancellation button:
document.getElementById('cancelSubscriptionBtn').addEventListener('click', function() {
    const user = firebase.auth().currentUser;
    if (user) {
        cancelSubscription(user.uid);
    }
});
*/

console.log('Data management examples loaded');