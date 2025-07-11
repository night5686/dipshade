// DIPSHADE Subscription Status Checker - Universal Module

class SubscriptionChecker {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.subscriptionCache = null;
        this.cacheExpiry = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
        
        this.initFirebase();
    }

    // Initialize Firebase
    async initFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
                const firebaseConfig = {
                    apiKey: "AIzaSyBY9-hGpKZ5dPV3E9GHQjP2wSNy3yRcjkE",
                    authDomain: "dipshade-3dd03.firebaseapp.com",
                    projectId: "dipshade-3dd03",
                    storageBucket: "dipshade-3dd03.firebasestorage.app",
                    messagingSenderId: "824019034596",
                    appId: "1:824019034596:web:42a46443127644e5f427f1",
                    measurementId: "G-0VNZE2BXN5"
                };

                firebase.initializeApp(firebaseConfig);
            }

            this.db = firebase.firestore();
            
            // Listen for auth changes
            firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                this.clearCache(); // Clear cache when user changes
            });

            console.log('✅ Subscription checker initialized');
        } catch (error) {
            console.error('❌ Subscription checker init failed:', error);
        }
    }

    // Clear subscription cache
    clearCache() {
        this.subscriptionCache = null;
        this.cacheExpiry = null;
    }

    // Get current user (with fallback)
    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        // Fallback: try to get from global variables
        if (typeof currentUser !== 'undefined' && currentUser) {
            return currentUser;
        }

        // Fallback: try to get from Firebase auth directly
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }

        return null;
    }

    // Get user subscription data with caching
    async getUserSubscription(userId = null) {
        try {
            const user = userId || this.getCurrentUser()?.uid;
            if (!user) {
                console.log('No user found for subscription check');
                return null;
            }

            // Check cache first
            if (this.subscriptionCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
                console.log('📋 Using cached subscription data');
                return this.subscriptionCache;
            }

            if (!this.db) {
                console.error('Firestore not initialized');
                return null;
            }

            console.log('🔍 Fetching subscription for user:', user);
            const doc = await this.db.collection('subscriptions').doc(user).get();
            
            if (doc.exists) {
                const subscription = doc.data();
                
                // Cache the result
                this.subscriptionCache = subscription;
                this.cacheExpiry = Date.now() + this.cacheTimeout;
                
                console.log('✅ Subscription found:', subscription.plan, subscription.status);
                return subscription;
            } else {
                console.log('❌ No subscription found for user:', user);
                return null;
            }
        } catch (error) {
            console.error('❌ Error getting user subscription:', error);
            return null;
        }
    }

    // Check if user subscription is active
    async isSubscriptionActive(userId = null) {
        try {
            const subscription = await this.getUserSubscription(userId);
            if (!subscription) {
                console.log('📋 No subscription - not active');
                return false;
            }
            
            const now = new Date();
            const endDate = new Date(subscription.endDate);
            const isActive = subscription.status === 'active' && endDate > now;
            
            console.log('📋 Subscription check:', {
                status: subscription.status,
                endDate: subscription.endDate,
                isActive: isActive,
                daysRemaining: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
            });
            
            return isActive;
        } catch (error) {
            console.error('❌ Error checking subscription status:', error);
            return false;
        }
    }

    // Get subscription details
    async getSubscriptionDetails(userId = null) {
        try {
            const subscription = await this.getUserSubscription(userId);
            if (!subscription) return null;

            const now = new Date();
            const startDate = new Date(subscription.startDate);
            const endDate = new Date(subscription.endDate);
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            const isActive = subscription.status === 'active' && endDate > now;

            return {
                ...subscription,
                isActive: isActive,
                daysRemaining: daysRemaining,
                isExpired: endDate <= now,
                isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0,
                formattedStartDate: startDate.toLocaleDateString(),
                formattedEndDate: endDate.toLocaleDateString()
            };
        } catch (error) {
            console.error('❌ Error getting subscription details:', error);
            return null;
        }
    }

    // Check subscription and redirect if needed
    async checkAndRedirect(options = {}) {
        const {
            requireActive = true,
            redirectUrl = 'payment.html',
            allowExpired = false,
            showAlert = true
        } = options;

        try {
            const details = await this.getSubscriptionDetails();
            
            if (!details) {
                if (requireActive) {
                    if (showAlert) {
                        alert('You need an active subscription to access this feature. Redirecting to payment page...');
                    }
                    window.location.href = redirectUrl;
                    return false;
                }
                return true;
            }

            if (requireActive && !details.isActive && !allowExpired) {
                if (showAlert) {
                    const message = details.isExpired 
                        ? 'Your subscription has expired. Please renew to continue.'
                        : 'Your subscription is not active. Please check your payment status.';
                    alert(message + ' Redirecting to payment page...');
                }
                window.location.href = redirectUrl;
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Error in checkAndRedirect:', error);
            return false;
        }
    }

    // Show subscription status in UI
    async displaySubscriptionStatus(containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Container not found:', containerId);
                return;
            }

            const details = await this.getSubscriptionDetails();
            
            if (!details) {
                container.innerHTML = `
                    <div class="subscription-status no-subscription">
                        <i class="fas fa-times-circle"></i>
                        <span>No Active Subscription</span>
                        <a href="payment.html" class="btn-upgrade">Upgrade Now</a>
                    </div>
                `;
                return;
            }

            let statusClass = 'active';
            let statusIcon = 'fas fa-check-circle';
            let statusText = 'Active';

            if (details.isExpired) {
                statusClass = 'expired';
                statusIcon = 'fas fa-times-circle';
                statusText = 'Expired';
            } else if (details.isExpiringSoon) {
                statusClass = 'expiring';
                statusIcon = 'fas fa-exclamation-triangle';
                statusText = 'Expiring Soon';
            }

            container.innerHTML = `
                <div class="subscription-status ${statusClass}">
                    <div class="status-header">
                        <i class="${statusIcon}"></i>
                        <span class="status-text">${statusText}</span>
                    </div>
                    <div class="status-details">
                        <div class="detail-item">
                            <strong>Plan:</strong> ${details.planDisplayName || details.plan.toUpperCase()}
                        </div>
                        <div class="detail-item">
                            <strong>Expires:</strong> ${details.formattedEndDate}
                        </div>
                        ${details.daysRemaining > 0 ? `
                        <div class="detail-item">
                            <strong>Days Remaining:</strong> ${details.daysRemaining}
                        </div>
                        ` : ''}
                    </div>
                    ${details.isExpired || details.isExpiringSoon ? `
                    <a href="payment.html" class="btn-renew">Renew Subscription</a>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('❌ Error displaying subscription status:', error);
        }
    }

    // Update subscription status
    async updateSubscriptionStatus(status, additionalData = {}) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('No user found');
            }

            const updateData = {
                status: status,
                updatedAt: new Date().toISOString(),
                ...additionalData
            };
            
            await this.db.collection('subscriptions').doc(user.uid).update(updateData);
            
            // Also update user profile
            await this.db.collection('users').doc(user.uid).update({
                subscriptionStatus: status,
                updatedAt: new Date().toISOString()
            });
            
            // Clear cache to force refresh
            this.clearCache();
            
            console.log('✅ Subscription status updated:', { userId: user.uid, status, additionalData });
            return true;
        } catch (error) {
            console.error('❌ Error updating subscription status:', error);
            return false;
        }
    }

    // Cancel subscription
    async cancelSubscription(reason = '') {
        try {
            const details = await this.getSubscriptionDetails();
            if (!details) {
                throw new Error('No subscription found');
            }

            const success = await this.updateSubscriptionStatus('cancelled', {
                cancelledAt: new Date().toISOString(),
                cancelReason: reason,
                originalEndDate: details.endDate
            });

            if (success) {
                console.log('✅ Subscription cancelled successfully');
                alert('Your subscription has been cancelled. You can continue using the service until ' + details.formattedEndDate);
            }

            return success;
        } catch (error) {
            console.error('❌ Error cancelling subscription:', error);
            alert('Failed to cancel subscription. Please contact support.');
            return false;
        }
    }
}

// Create global instance
const subscriptionChecker = new SubscriptionChecker();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.subscriptionChecker = subscriptionChecker;
}

// Utility functions for easy access
window.checkSubscription = () => subscriptionChecker.isSubscriptionActive();
window.getSubscriptionDetails = () => subscriptionChecker.getSubscriptionDetails();
window.requireActiveSubscription = (options) => subscriptionChecker.checkAndRedirect(options);

console.log('📋 Subscription status checker loaded');