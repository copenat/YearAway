// YearAway - Enhanced Mobile Experience and Device Detection
(function() {
    'use strict';

    // Simple device detection
    function detectDevice() {
        const width = window.innerWidth;
        if (width <= 767) return 'mobile';
        if (width <= 1023) return 'tablet';
        return 'desktop';
    }

    // Add device class to body
    function addDeviceClass() {
        const deviceType = detectDevice();
        document.body.classList.add(`device-${deviceType}`);
        
        // Check if touch enabled
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.body.classList.add('touch-enabled');
        }
    }

    // Initialize mobile navigation
    function initMobileNav() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        // Create mobile toggle button
        const navToggle = document.createElement('button');
        navToggle.className = 'nav-toggle';
        navToggle.innerHTML = '<span></span><span></span><span></span>';
        navToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Add toggle functionality
        navToggle.addEventListener('click', function() {
            nav.classList.toggle('nav-open');
            navToggle.classList.toggle('active');
        });

        // Insert toggle before navigation
        nav.parentNode.insertBefore(navToggle, nav);
        nav.classList.add('mobile-nav');
    }

    // Add smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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
    }

    // Add loading state
    function addLoadingState() {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.classList.add('loaded');
        });
    }

    // Initialize everything when DOM is ready
    function init() {
        try {
            addDeviceClass();
            initMobileNav();
            initSmoothScrolling();
            addLoadingState();
        } catch (error) {
            console.log('YearAway initialization error:', error);
            // Fallback: ensure basic functionality works
            document.body.classList.add('device-desktop');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
