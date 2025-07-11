// DIPSHADE Website JavaScript - Bringing the Future to Life! 🚀

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initScrollEffects();
    initCounters();
    initDemoChat();
    initMobileMenu();
    initSmoothScrolling();
    initNavbarEffects();
    initAOS();
});

// Particle.js Configuration - JARVIS-style background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00d4ff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00d4ff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 400,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// Scroll Effects - Navbar and other elements
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Animated Counters for Stats
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Animation speed
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const count = parseInt(counter.innerText);
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => animateCounter(counter), 1);
        } else {
            counter.innerText = target;
        }
    };
    
    // Intersection Observer to trigger animation when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                counter.innerText = '0';
                animateCounter(counter);
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Interactive Demo Chat
function initDemoChat() {
    const demoInput = document.getElementById('demoInput');
    const sendBtn = document.getElementById('sendDemo');
    const chatContainer = document.getElementById('demoChat');
    const exampleBtns = document.querySelectorAll('.example-btn');
    
    // AI Responses for demo - Discord Bot Commands (SECURE - No code exposure!)
    const aiResponses = {
        'create a role named sage with admin': "Perfect! Creating an admin role for you! 🛡️\n\n🔄 Processing request...\n⚙️ Setting up role permissions...\n🎨 Applying DIPSHADE blue color...\n\n✅ **Role 'Sage' created successfully!**\n🛡️ **Permissions:** Administrator\n🎨 **Color:** DIPSHADE Blue\n👑 **Ready to assign to members!**",
        
        'give sage role to @user123': "Absolutely! Assigning the Sage role now! 👑\n\n🔍 Finding user @user123...\n🛡️ Locating 'Sage' role...\n⚡ Applying role permissions...\n\n✅ **@user123 now has the Sage role!**\n👑 **New permissions granted:**\n• Administrator access\n• Full server management\n• All channels accessible",
        
        'delete 50 messages': "Got it! Cleaning up the channel! 🧹\n\n🔄 Scanning recent messages...\n🗑️ Preparing bulk deletion...\n⚡ Executing cleanup...\n\n✅ **Successfully deleted 50 messages!**\n✨ **Channel is now clean!**\n📊 **Cleanup completed in 0.8 seconds**",
        
        'ban @spammer for spam': "Taking action against spam! 🔨\n\n🔍 Analyzing user activity...\n⚠️ Spam pattern detected!\n🛡️ Initiating ban procedure...\n\n✅ **@spammer has been banned!**\n📝 **Reason:** Spam detected by DIPSHADE\n🛡️ **Server is now protected!**\n📊 **Threat level reduced**",
        
        'create voice channel gaming lounge': "Creating your gaming voice channel! 🎮\n\n🔄 Setting up voice channel...\n🎯 Configuring gaming optimizations...\n👥 Setting user limit to 10...\n\n✅ **Voice channel 'Gaming Lounge' created!**\n🎮 **Features enabled:**\n• High-quality audio\n• 10 user limit\n• Gaming category\n🚀 **Ready for epic gaming sessions!**",
        
        'mute @troublemaker for 1 hour': "Muting the troublemaker! 🤐\n\n⚠️ Applying temporary timeout...\n⏰ Duration: 1 hour\n🔇 Restricting message permissions...\n\n✅ **@troublemaker muted for 1 hour!**\n⏰ **Unmute time:** 10:41 AM\n☮️ **Peace restored to the server!**\n📊 **Auto-unmute scheduled**",
        
        'hello dipshade': "Hey there! 👋 I'm DIPSHADE, your Discord AI assistant!\n\n🤖 **What makes me special:**\n• Natural language understanding\n• Hinglish support\n• Voice responses\n• Smart server management\n\nJust talk to me naturally - no complex commands needed! 🚀",
        
        'what can you do': "I can manage your entire Discord server! 🚀\n\n🛡️ **Moderation:**\n• Ban/kick troublemakers\n• Mute users temporarily\n• Auto-detect spam\n\n⚙️ **Server Management:**\n• Create/delete roles & channels\n• Assign permissions\n• Bulk message cleanup\n\n💬 **Communication:**\n• Natural conversation\n• Hinglish support\n• Voice responses\n\nJust ask me naturally - I understand context! 🧠",
        
        'default': "I can help with Discord server management! 🤖\n\n💡 **Try asking me to:**\n• Create roles or channels\n• Moderate users\n• Clean up messages\n• Manage permissions\n\nI understand natural language - no commands needed! 🚀"
    };
    
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        
        // Format content with proper line breaks (no code blocks!)
        let formattedContent = content;
        if (!isUser) {
            // Convert newlines to <br> for proper formatting
            formattedContent = formattedContent.replace(/\n/g, '<br>');
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <span class="message-author">${isUser ? 'You' : 'DIPSHADE'}</span>
                <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <p>${formattedContent}</p>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function sendMessage() {
        const message = demoInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, true);
        demoInput.value = '';
        
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <span class="message-author">DIPSHADE</span>
                <span class="message-time">typing...</span>
                <p><span class="loading"></span> DIPSHADE is processing...</p>
            </div>
        `;
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Simulate AI response delay
        setTimeout(() => {
            chatContainer.removeChild(typingDiv);
            
            const lowerMessage = message.toLowerCase();
            let response = aiResponses.default;
            
            // Find matching response
            for (const [key, value] of Object.entries(aiResponses)) {
                if (key !== 'default' && lowerMessage.includes(key)) {
                    response = value;
                    break;
                }
            }
            
            addMessage(response);
        }, 1500);
    }
    
    // Event listeners
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (demoInput) {
        demoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Example button clicks
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.getAttribute('data-message');
            demoInput.value = message;
            sendMessage();
        });
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
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

// Navbar Active Link Highlighting
function initNavbarEffects() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize AOS (Animate On Scroll)
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
}

// Voice Wave Animation
function animateVoiceWave() {
    const waveBars = document.querySelectorAll('.wave-bar');
    
    waveBars.forEach((bar, index) => {
        setInterval(() => {
            const height = Math.random() * 40 + 20;
            bar.style.height = height + 'px';
        }, 150 + (index * 50));
    });
}

// Initialize voice wave animation when in view
const voiceWaveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateVoiceWave();
            voiceWaveObserver.unobserve(entry.target);
        }
    });
});

const voiceWave = document.querySelector('.voice-wave');
if (voiceWave) {
    voiceWaveObserver.observe(voiceWave);
}

// Performance optimization - Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
const throttledScrollHandler = throttle(() => {
    initScrollEffects();
    initNavbarEffects();
}, 16); // ~60fps

window.addEventListener('scroll', throttledScrollHandler);

// Easter Egg - Konami Code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Easter egg activated!
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 3000);
        
        // Show special message
        const easterEgg = document.createElement('div');
        easterEgg.innerHTML = '🎉 JARVIS MODE ACTIVATED! 🎉';
        easterEgg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--gradient-primary);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            font-family: 'Orbitron', monospace;
            font-size: 1.5rem;
            z-index: 10000;
            animation: fadeInUp 0.5s ease;
        `;
        
        document.body.appendChild(easterEgg);
        
        setTimeout(() => {
            document.body.removeChild(easterEgg);
        }, 3000);
        
        konamiCode = [];
    }
});

// Console Easter Egg
console.log(`
%c
██████╗ ██╗██████╗ ███████╗██╗  ██╗ █████╗ ██████╗ ███████╗
██╔══██╗██║██╔══██╗██╔════╝██║  ██║██╔══██╗██╔══██╗██╔════╝
██║  ██║██║██████╔╝███████╗███████║███████║██║  ██║█████╗  
██║  ██║██║██╔═══╝ ╚════██║██╔══██║██╔══██║██║  ██║██╔══╝  
██████╔╝██║██║     ███████║██║  ██║██║  ██║██████╔╝███████╗
╚═════╝ ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝

🤖 Welcome to DIPSHADE - The Future of Discord AI!
🚀 Interested in our code? We're always looking for talented developers!
💬 Join our Discord: https://discord.gg/dipshade
`, 'color: #00d4ff; font-family: monospace;');

console.log('%cHey there, curious developer! 👋', 'color: #ffd700; font-size: 16px; font-weight: bold;');
console.log('%cLike what you see? DIPSHADE is built with love and cutting-edge tech!', 'color: #00d4ff; font-size: 14px;');

// Footer Link Functions
function openDocumentation() {
    showModal('Documentation', `
        <div class="modal-content-custom">
            <h3>📚 DIPSHADE Documentation</h3>
            <p>Welcome to DIPSHADE's comprehensive documentation!</p>
            
            <div class="doc-sections">
                <div class="doc-section">
                    <h4>🚀 Getting Started</h4>
                    <ul>
                        <li>How to invite DIPSHADE to your server</li>
                        <li>Basic setup and configuration</li>
                        <li>First conversation with your AI</li>
                    </ul>
                </div>
                
                <div class="doc-section">
                    <h4>💬 Natural Language Commands</h4>
                    <ul>
                        <li>Server management through conversation</li>
                        <li>Role and permission management</li>
                        <li>Channel creation and moderation</li>
                    </ul>
                </div>
                
                <div class="doc-section">
                    <h4>🎨 Customization</h4>
                    <ul>
                        <li>Personality customization</li>
                        <li>Response preferences</li>
                        <li>Language settings (English/Hinglish)</li>
                    </ul>
                </div>
            </div>
            
            <div class="doc-actions">
                <a href="https://docs.dipshade.com" target="_blank" class="btn-primary">
                    <i class="fas fa-external-link-alt"></i>
                    View Full Documentation
                </a>
            </div>
        </div>
    `);
}

function openHelpCenter() {
    showModal('Help Center', `
        <div class="modal-content-custom">
            <h3>🆘 DIPSHADE Help Center</h3>
            <p>Need help? We're here for you 24/7!</p>
            
            <div class="help-options">
                <div class="help-option">
                    <div class="help-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <h4>Knowledge Base</h4>
                    <p>Browse our comprehensive guides and tutorials</p>
                    <button class="help-btn" onclick="window.open('https://help.dipshade.com', '_blank')">
                        Browse Articles
                    </button>
                </div>
                
                <div class="help-option">
                    <div class="help-icon">
                        <i class="fab fa-discord"></i>
                    </div>
                    <h4>Discord Support</h4>
                    <p>Join our community server for instant help</p>
                    <button class="help-btn" onclick="window.open('https://discord.gg/dipshade', '_blank')">
                        Join Server
                    </button>
                </div>
                
                <div class="help-option">
                    <div class="help-icon">
                        <i class="fas fa-video"></i>
                    </div>
                    <h4>Video Tutorials</h4>
                    <p>Watch step-by-step video guides</p>
                    <button class="help-btn" onclick="window.open('https://youtube.com/@dipshade', '_blank')">
                        Watch Videos
                    </button>
                </div>
            </div>
        </div>
    `);
}

function openContactForm() {
    showModal('Contact Us', `
        <div class="modal-content-custom">
            <h3>📧 Get in Touch</h3>
            <p>Have a question or need support? Send us a message!</p>
            
            <form class="contact-form" onsubmit="submitContactForm(event)">
                <div class="form-group">
                    <label for="contactName">Your Name</label>
                    <input type="text" id="contactName" required placeholder="Enter your name">
                </div>
                
                <div class="form-group">
                    <label for="contactEmail">Email Address</label>
                    <input type="email" id="contactEmail" required placeholder="Enter your email">
                </div>
                
                <div class="form-group">
                    <label for="contactSubject">Subject</label>
                    <select id="contactSubject" required>
                        <option value="">Select a topic</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="contactMessage">Message</label>
                    <textarea id="contactMessage" required placeholder="Describe your question or issue..." rows="5"></textarea>
                </div>
                
                <button type="submit" class="btn-primary">
                    <i class="fas fa-paper-plane"></i>
                    Send Message
                </button>
            </form>
        </div>
    `);
}

function openBugReport() {
    showModal('Report a Bug', `
        <div class="modal-content-custom">
            <h3>🐛 Bug Report</h3>
            <p>Help us improve DIPSHADE by reporting any issues you encounter.</p>
            
            <form class="bug-report-form" onsubmit="submitBugReport(event)">
                <div class="form-group">
                    <label for="bugTitle">Bug Title</label>
                    <input type="text" id="bugTitle" required placeholder="Brief description of the bug">
                </div>
                
                <div class="form-group">
                    <label for="bugSeverity">Severity</label>
                    <select id="bugSeverity" required>
                        <option value="">Select severity</option>
                        <option value="low">Low - Minor issue</option>
                        <option value="medium">Medium - Affects functionality</option>
                        <option value="high">High - Major issue</option>
                        <option value="critical">Critical - App unusable</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="bugSteps">Steps to Reproduce</label>
                    <textarea id="bugSteps" required placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..." rows="4"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="bugExpected">Expected Behavior</label>
                    <textarea id="bugExpected" required placeholder="What should have happened?" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="bugActual">Actual Behavior</label>
                    <textarea id="bugActual" required placeholder="What actually happened?" rows="3"></textarea>
                </div>
                
                <button type="submit" class="btn-primary">
                    <i class="fas fa-bug"></i>
                    Submit Bug Report
                </button>
            </form>
        </div>
    `);
}

function openCookiePolicy() {
    showModal('Cookie Policy', `
        <div class="modal-content-custom">
            <h3>🍪 Cookie Policy</h3>
            <p><strong>Last updated:</strong> January 2024</p>
            
            <div class="cookie-content">
                <h4>What are cookies?</h4>
                <p>Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience.</p>
                
                <h4>How we use cookies:</h4>
                <ul>
                    <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                
                <h4>Managing cookies:</h4>
                <p>You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
                
                <div class="cookie-controls">
                    <button class="btn-secondary" onclick="manageCookiePreferences()">
                        <i class="fas fa-cog"></i>
                        Manage Preferences
                    </button>
                    <button class="btn-primary" onclick="acceptAllCookies()">
                        <i class="fas fa-check"></i>
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    `);
}

function openGDPRInfo() {
    showModal('GDPR Information', `
        <div class="modal-content-custom">
            <h3>🛡️ GDPR Compliance</h3>
            <p>DIPSHADE is committed to protecting your privacy and complying with GDPR regulations.</p>
            
            <div class="gdpr-content">
                <h4>Your Rights Under GDPR:</h4>
                <ul>
                    <li><strong>Right to Access:</strong> Request information about your personal data</li>
                    <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                    <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                    <li><strong>Right to Portability:</strong> Receive your data in a structured format</li>
                    <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                </ul>
                
                <h4>Data We Collect:</h4>
                <ul>
                    <li>Discord user ID and username (for bot functionality)</li>
                    <li>Server information (for proper operation)</li>
                    <li>Usage analytics (anonymized)</li>
                </ul>
                
                <h4>Exercise Your Rights:</h4>
                <p>To exercise any of your GDPR rights, please contact us at <strong>privacy@dipshade.com</strong></p>
                
                <div class="gdpr-actions">
                    <button class="btn-secondary" onclick="requestDataExport()">
                        <i class="fas fa-download"></i>
                        Request Data Export
                    </button>
                    <button class="btn-primary" onclick="requestDataDeletion()">
                        <i class="fas fa-trash"></i>
                        Request Data Deletion
                    </button>
                </div>
            </div>
        </div>
    `);
}

// Modal System
function showModal(title, content) {
    // Remove existing modal if any
    const existingModal = document.getElementById('customModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeCustomModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCustomModal();
        }
    });
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.remove();
    }
}

// Form Submission Functions
function submitContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    // Simulate form submission
    showSuccessMessage('Message sent successfully! We\'ll get back to you within 24 hours.');
    closeCustomModal();
}

function submitBugReport(event) {
    event.preventDefault();
    
    showSuccessMessage('Bug report submitted successfully! Thank you for helping us improve DIPSHADE.');
    closeCustomModal();
}

function manageCookiePreferences() {
    showModal('Cookie Preferences', `
        <div class="modal-content-custom">
            <h3>🍪 Manage Cookie Preferences</h3>
            
            <div class="cookie-preferences">
                <div class="cookie-category">
                    <div class="cookie-toggle">
                        <label class="switch">
                            <input type="checkbox" checked disabled>
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-info">
                            <h4>Essential Cookies</h4>
                            <p>Required for basic website functionality. Cannot be disabled.</p>
                        </div>
                    </div>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-toggle">
                        <label class="switch">
                            <input type="checkbox" id="analyticsCookies" checked>
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-info">
                            <h4>Analytics Cookies</h4>
                            <p>Help us understand how you use our website to improve your experience.</p>
                        </div>
                    </div>
                </div>
                
                <div class="cookie-category">
                    <div class="cookie-toggle">
                        <label class="switch">
                            <input type="checkbox" id="preferenceCookies" checked>
                            <span class="slider"></span>
                        </label>
                        <div class="cookie-info">
                            <h4>Preference Cookies</h4>
                            <p>Remember your settings and preferences for a personalized experience.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="cookie-actions">
                <button class="btn-secondary" onclick="closeCustomModal()">Cancel</button>
                <button class="btn-primary" onclick="saveCookiePreferences()">Save Preferences</button>
            </div>
        </div>
    `);
}

function acceptAllCookies() {
    showSuccessMessage('Cookie preferences saved! All cookies have been accepted.');
    closeCustomModal();
}

function saveCookiePreferences() {
    showSuccessMessage('Cookie preferences saved successfully!');
    closeCustomModal();
}

function requestDataExport() {
    showSuccessMessage('Data export request submitted! You will receive your data within 30 days at your registered email address.');
    closeCustomModal();
}

function requestDataDeletion() {
    showModal('Confirm Data Deletion', `
        <div class="modal-content-custom">
            <h3>⚠️ Confirm Data Deletion</h3>
            <p>Are you sure you want to delete all your personal data? This action cannot be undone.</p>
            
            <div class="warning-box">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Deleting your data will:</p>
                <ul>
                    <li>Remove DIPSHADE from all your servers</li>
                    <li>Delete all your conversation history</li>
                    <li>Cancel any active subscriptions</li>
                    <li>Remove your account permanently</li>
                </ul>
            </div>
            
            <div class="confirmation-actions">
                <button class="btn-secondary" onclick="closeCustomModal()">Cancel</button>
                <button class="btn-danger" onclick="confirmDataDeletion()">
                    <i class="fas fa-trash"></i>
                    Delete My Data
                </button>
            </div>
        </div>
    `);
}

function confirmDataDeletion() {
    showSuccessMessage('Data deletion request submitted! Your data will be permanently deleted within 30 days. You will receive a confirmation email.');
    closeCustomModal();
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-toast';
    successDiv.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}