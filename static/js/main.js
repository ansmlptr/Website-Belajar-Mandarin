// Main JavaScript file for Chinese Learning App

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize responsive features
    initializeResponsive();
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Highlight active navigation item
    highlightActiveNav();
}

function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
}

// Animation functionality
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for stat numbers
                if (entry.target.classList.contains('stat-item')) {
                    animateStatNumber(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-item, .vocab-card').forEach(el => {
        observer.observe(el);
    });
}

function animateStatNumber(statItem) {
    const numberElement = statItem.querySelector('.stat-number');
    if (!numberElement) return;
    
    const finalNumber = numberElement.textContent;
    
    // Only animate if it's a number
    if (!isNaN(finalNumber) && finalNumber !== '∞') {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = parseInt(finalNumber) / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= parseInt(finalNumber)) {
                numberElement.textContent = finalNumber;
                clearInterval(timer);
            } else {
                numberElement.textContent = Math.floor(current);
            }
        }, duration / steps);
    }
}

// Responsive functionality
function initializeResponsive() {
    // Handle window resize
    window.addEventListener('resize', function() {
        handleResize();
    });
    
    // Initial resize handling
    handleResize();
}

function handleResize() {
    const width = window.innerWidth;
    
    // Close mobile menu on desktop
    if (width > 768) {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
}

// Utility functions
function showLoading(element) {
    if (element) {
        element.style.display = 'block';
    }
}

function hideLoading(element) {
    if (element) {
        element.style.display = 'none';
    }
}

function showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <p>${message}</p>
        </div>
    `;
    
    if (container) {
        container.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

function showSuccess(message, container) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <span class="success-icon">✅</span>
            <p>${message}</p>
        </div>
    `;
    
    if (container) {
        container.appendChild(successDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}

// API helper functions
async function fetchAPI(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

// Text-to-Speech functionality using Google Cloud TTS
async function speakChinese(text) {
    try {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'tts-loading';
        loadingIndicator.innerHTML = '🔊 Memuat...';
        loadingIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 9999;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(loadingIndicator);
        
        // Call Google Cloud TTS API
        const response = await fetch('/api/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });
        
        const data = await response.json();
        
        if (data.success && data.audio) {
            // Convert base64 to audio and play
            const audioData = `data:audio/mp3;base64,${data.audio}`;
            const audio = new Audio(audioData);
            
            // Update loading indicator
            loadingIndicator.innerHTML = '🔊 Memutar...';
            
            // Play audio
            await audio.play();
            
            // Remove loading indicator when audio ends
            audio.addEventListener('ended', () => {
                document.body.removeChild(loadingIndicator);
            });
            
            // Remove loading indicator on error
            audio.addEventListener('error', () => {
                document.body.removeChild(loadingIndicator);
                console.error('Error playing audio');
            });
            
        } else {
            // Check if fallback is suggested
            if (data.fallback) {
                // Remove loading indicator
                document.body.removeChild(loadingIndicator);
                // Use fallback speech
                fallbackSpeech(text);
                return;
            }
            throw new Error(data.error || 'Gagal menghasilkan suara');
        }
        
    } catch (error) {
        console.error('TTS Error:', error);
        
        // Remove loading indicator
        const loadingIndicator = document.querySelector('.tts-loading');
        if (loadingIndicator) {
            document.body.removeChild(loadingIndicator);
        }
        
        // Fallback to browser TTS
        fallbackSpeech(text);
    }
}

// Fallback to browser speech synthesis
function fallbackSpeech(text) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        const voices = speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice => 
            voice.lang.includes('zh') || voice.lang.includes('cmn')
        );
        
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }
        
        speechSynthesis.speak(utterance);
    } else {
        console.warn('Sintesis suara tidak didukung di browser ini');
    }
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize modal close buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Export functions for use in other scripts
window.ChineseLearningApp = {
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    fetchAPI,
    speakChinese,
    openModal,
    closeModal
};