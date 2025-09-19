/**
 * YearAway Authentication Utilities
 * Helper functions for pages that need to check authentication status
 */

window.YearAwayAuthUtils = {
    /**
     * Check if user is authenticated (requires auth-config.js to be loaded first)
     * @returns {boolean} - Whether the user is authenticated
     */
    isAuthenticated() {
        if (!window.YearAwayAuthConfig) {
            console.warn('YearAwayAuthConfig not loaded. Make sure auth-config.js is included.');
            return false;
        }
        return window.YearAwayAuthConfig.isAuthenticated();
    },
    
    /**
     * Get current token (requires auth-config.js to be loaded first)
     * @returns {string|null} - The current token or null
     */
    getCurrentToken() {
        if (!window.YearAwayAuthConfig) {
            console.warn('YearAwayAuthConfig not loaded. Make sure auth-config.js is included.');
            return null;
        }
        return window.YearAwayAuthConfig.getCurrentToken();
    },
    
    /**
     * Show/hide content based on authentication status
     * @param {string} selector - CSS selector for elements to show/hide
     * @param {boolean} showForMembers - Whether to show for members (true) or guests (false)
     */
    toggleContentByAuth(selector, showForMembers = true) {
        const elements = document.querySelectorAll(selector);
        const isMember = this.isAuthenticated();
        const shouldShow = showForMembers ? isMember : !isMember;
        
        elements.forEach(element => {
            element.style.display = shouldShow ? 'block' : 'none';
        });
    },
    
    /**
     * Add authentication status to page
     * @param {string} containerSelector - CSS selector for container to add status to
     */
    addAuthStatus(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        const isMember = this.isAuthenticated();
        const statusHtml = `
            <div class="auth-status" style="padding: 10px; margin: 10px 0; border-radius: 5px; ${isMember ? 'background: #d4edda; color: #155724;' : 'background: #f8d7da; color: #721c24;'}">
                ${isMember ? '🔓 Member Access' : '🔒 Guest Access'}
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', statusHtml);
    }
};
