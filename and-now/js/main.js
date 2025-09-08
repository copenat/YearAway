/**
 * YearAway "And Now" - Main JavaScript
 * Handles navigation, interactions, and general site functionality
 */

class YearAwayApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupAnimations();
        this.setupLazyLoading();
        this.setupAccessibility();
    }

    /**
     * Setup mobile navigation
     */
    setupNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    /**
     * Setup scroll animations
     */
    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.adventure-card, .link-card, .status-info');
        animateElements.forEach(el => observer.observe(el));
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Skip to main content link
        this.addSkipLink();
        
        // Keyboard navigation for cards
        this.setupKeyboardNavigation();
        
        // ARIA labels for interactive elements
        this.setupARIALabels();
    }

    /**
     * Add skip to main content link
     */
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-brown);
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Setup keyboard navigation for cards
     */
    setupKeyboardNavigation() {
        const cards = document.querySelectorAll('.adventure-card, .link-card');
        
        cards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('a');
                    if (link) {
                        link.click();
                    }
                }
            });
        });
    }

    /**
     * Setup ARIA labels
     */
    setupARIALabels() {
        // Navigation menu
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.setAttribute('role', 'navigation');
            navMenu.setAttribute('aria-label', 'Main navigation');
        }

        // Hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.setAttribute('role', 'banner');
        }

        // Main content
        const main = document.querySelector('.main-content');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('role', 'main');
        }

        // Footer
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.setAttribute('role', 'contentinfo');
        }
    }

    /**
     * Utility function to show loading state
     */
    showLoading(element, show = true) {
        if (show) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }

    /**
     * Utility function to show notifications
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
        });

        // Set background color based on type
        const colors = {
            success: 'linear-gradient(135deg, #4CAF50, #45a049)',
            error: 'linear-gradient(135deg, #f44336, #d32f2f)',
            info: 'linear-gradient(135deg, #2196F3, #1976D2)',
            warning: 'linear-gradient(135deg, #ff9800, #f57c00)'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        // Hide after duration
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Handle page transitions
     */
    handlePageTransition(url) {
        // Add loading state
        document.body.classList.add('loading');
        
        // Navigate to new page
        window.location.href = url;
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.yearawayApp = new YearAwayApp();
    console.log('🚀 YearAway "And Now" App Initialized');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - pause any animations or videos
        console.log('Page hidden - pausing animations');
    } else {
        // Page is visible - resume animations
        console.log('Page visible - resuming animations');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.yearawayApp) {
        window.yearawayApp.showNotification('Connection restored! 🌐', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.yearawayApp) {
        window.yearawayApp.showNotification('You are offline. Some features may not work. 📡', 'warning');
    }
});

// Connect authentication system to tips manager
function connectAuthToTips() {
    if (window.authSystem && window.tipsManager) {
        window.tipsManager.setAuthSystem(window.authSystem);
        console.log('🔗 Auth system connected to tips manager');
        return true;
    } else {
        console.log('⚠️ Auth system or tips manager not ready:', {
            authSystem: !!window.authSystem,
            tipsManager: !!window.tipsManager
        });
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Try to connect immediately
    if (!connectAuthToTips()) {
        // If not ready, try again after a delay
        setTimeout(() => {
            if (!connectAuthToTips()) {
                // Try one more time after another delay
                setTimeout(connectAuthToTips, 1000);
            }
        }, 500);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YearAwayApp;
}
