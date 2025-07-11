// DIPSHADE - Admin Setup Script
// Run this once to set up admin users in Firestore

// Admin user UIDs - replace with actual user IDs
const ADMIN_USERS = [
    'your-admin-user-id-1',
    'your-admin-user-id-2'
    // Add more admin user IDs as needed
];

// Function to set up admin users
async function setupAdminUsers() {
    if (!firebase.apps.length) {
        console.error('Firebase not initialized. Please include Firebase SDK first.');
        return;
    }

    const db = firebase.firestore();
    
    try {
        console.log('Setting up admin users...');
        
        for (const adminId of ADMIN_USERS) {
            await db.collection('admins').doc(adminId).set({
                isAdmin: true,
                createdAt: new Date().toISOString(),
                permissions: [
                    'read_all_payments',
                    'read_all_subscriptions',
                    'read_all_users',
                    'manage_analytics',
                    'view_logs'
                ]
            });
            
            console.log(`✅ Admin user ${adminId} set up successfully`);
        }
        
        console.log('🎉 All admin users set up successfully!');
        
    } catch (error) {
        console.error('❌ Error setting up admin users:', error);
    }
}

// Function to check if current user is admin
async function checkAdminStatus() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('No user logged in');
        return false;
    }
    
    const db = firebase.firestore();
    try {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        const isAdmin = adminDoc.exists && adminDoc.data().isAdmin;
        
        console.log(`User ${user.email} admin status:`, isAdmin);
        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Function to remove admin access
async function removeAdminUser(userId) {
    const db = firebase.firestore();
    try {
        await db.collection('admins').doc(userId).delete();
        console.log(`✅ Admin access removed for user ${userId}`);
    } catch (error) {
        console.error('❌ Error removing admin access:', error);
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupAdminUsers,
        checkAdminStatus,
        removeAdminUser,
        ADMIN_USERS
    };
}

console.log('Admin setup script loaded. Available functions:');
console.log('- setupAdminUsers()');
console.log('- checkAdminStatus()');
console.log('- removeAdminUser(userId)');