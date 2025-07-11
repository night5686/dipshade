// Backend Configuration for DIPSHADE Razorpay Integration

const BACKEND_CONFIG = {
    // Development (local testing)
    development: {
        baseUrl: 'http://localhost:3000',
        createOrderUrl: 'http://localhost:3000/api/create-order',
        verifyPaymentUrl: 'http://localhost:3000/api/verify-payment',
        healthCheckUrl: 'http://localhost:3000/health'
    },
    
    // Production (deployed to Vercel)
    production: {
        baseUrl: 'https://backend-omega-virid.vercel.app',
        createOrderUrl: 'https://backend-omega-virid.vercel.app/api/create-order',
        verifyPaymentUrl: 'https://backend-omega-virid.vercel.app/api/verify-payment',
        healthCheckUrl: 'https://backend-omega-virid.vercel.app/api/health'
    }
};

// Automatically detect environment - Force production for now
const isDevelopment = false; // Force production to use Vercel backend

// Alternative: More specific detection
// const isDevelopment = (window.location.hostname === 'localhost' && window.location.port === '3000') ||
//                      window.location.protocol === 'file:';

const currentConfig = isDevelopment ? BACKEND_CONFIG.development : BACKEND_CONFIG.production;

console.log('🔧 Backend Config Debug:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    fullUrl: window.location.href,
    isDevelopment: isDevelopment,
    environment: isDevelopment ? 'development' : 'production',
    baseUrl: currentConfig.baseUrl,
    createOrderUrl: currentConfig.createOrderUrl
});

// Export configuration
window.DIPSHADE_BACKEND = currentConfig;

// Test backend connection immediately with detailed logging
console.log('🧪 Testing backend connection...');
console.log('🔗 Using URL:', currentConfig.healthCheckUrl);

fetch(currentConfig.healthCheckUrl, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(response => {
        console.log('📡 Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            url: response.url
        });
        return response.json();
    })
    .then(data => {
        console.log('✅ Backend connection test successful:', data);
        console.log('🎯 Razorpay status:', data.razorpay);
        console.log('🔥 Firebase status:', data.firebase);
    })
    .catch(error => {
        console.error('❌ Backend connection test failed:', error);
        console.error('🔍 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        console.log('💡 Troubleshooting:');
        console.log('1. Check if URL is correct:', currentConfig.healthCheckUrl);
        console.log('2. Check browser network tab for CORS errors');
        console.log('3. Try opening URL directly in browser');
    });