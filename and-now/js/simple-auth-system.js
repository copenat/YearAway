/**
 * YearAway Simple Authentication System
 * Client-side token-based authentication with simple tokens
 */

class SimpleYearAwayAuth {
    constructor() {
        this.tokenKey = 'yearaway_member_token';
        this.memberStatusKey = 'yearaway_member_status';
        this.validTokens = [
            'YEARAWAY-ULZE-1SVR-Z0JG',
            'YEARAWAY-I80B-HJ7Y-FKNO', 
            'YEARAWAY-Q2FZ-KID3-ISML',
            'YEARAWAY-9ND6-6QMU-KYW7',
            'YEARAWAY-1G9L-Q9I4-4AMQ'
        ];
        this.init();
    }

    init() {
        // Check if user is already authenticated
        this.checkAuthStatus();
        
        // Listen for auth events
        this.setupEventListeners();
    }

    /**
     * Check if user has valid authentication
     */
    checkAuthStatus() {
        const token = localStorage.getItem(this.tokenKey);
        
        if (token && this.validateToken(token)) {
            this.setMemberStatus(true);
            this.showMemberContent();
        } else {
            this.setMemberStatus(false);
            this.hideMemberContent();
        }
    }

    /**
     * Validate simple token
     */
    validateToken(token) {
        // Check if token is in our valid tokens list
        return this.validTokens.includes(token.toUpperCase());
    }

    /**
     * Login with token
     */
    login(token) {
        const cleanToken = token.trim().toUpperCase();
        
        if (this.validateToken(cleanToken)) {
            localStorage.setItem(this.tokenKey, cleanToken);
            localStorage.setItem(this.memberStatusKey, 'true');
            this.setMemberStatus(true);
            this.showMemberContent();
            this.showNotification('Welcome back, member! 🎉', 'success');
            return true;
        } else {
            this.showNotification('Invalid token. Please check and try again. ❌', 'error');
            return false;
        }
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.memberStatusKey);
        this.setMemberStatus(false);
        this.hideMemberContent();
        this.showNotification('You have been logged out. 👋', 'info');
    }

    /**
     * Check if user is a member
     */
    isMember() {
        return localStorage.getItem(this.memberStatusKey) === 'true';
    }

    /**
     * Set member status in UI
     */
    setMemberStatus(isMember) {
        const authStatus = document.getElementById('auth-status');
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');

        if (authStatus) {
            authStatus.textContent = isMember ? 'Member' : 'Guest';
            authStatus.className = isMember ? 'member-status member' : 'member-status guest';
        }

        if (loginForm) {
            loginForm.style.display = isMember ? 'none' : 'block';
        }

        if (logoutBtn) {
            logoutBtn.style.display = isMember ? 'block' : 'none';
        }
    }

    /**
     * Show member-only content
     */
    showMemberContent() {
        const memberContent = document.querySelectorAll('.members-only');
        memberContent.forEach(element => {
            element.style.display = 'block';
            element.classList.add('member-visible');
        });

        // Show member indicators
        const memberIndicators = document.querySelectorAll('.member-indicator');
        memberIndicators.forEach(indicator => {
            indicator.style.display = 'inline';
        });
    }

    /**
     * Hide member-only content
     */
    hideMemberContent() {
        const memberContent = document.querySelectorAll('.members-only');
        memberContent.forEach(element => {
            element.style.display = 'none';
            element.classList.remove('member-visible');
        });

        // Hide member indicators
        const memberIndicators = document.querySelectorAll('.member-indicator');
        memberIndicators.forEach(indicator => {
            indicator.style.display = 'none';
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const tokenInput = document.getElementById('member-token');
                if (tokenInput) {
                    this.login(tokenInput.value.trim());
                    tokenInput.value = '';
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    /**
     * Get current token (for debugging)
     */
    getCurrentToken() {
        return localStorage.getItem(this.tokenKey);
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.yearawayAuth = new SimpleYearAwayAuth();
    
    // Add some helpful info to console
    console.log('🔐 YearAway Authentication System Loaded');
    console.log('Valid tokens:', window.yearawayAuth.validTokens);
    console.log('Current token:', window.yearawayAuth.getCurrentToken());
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleYearAwayAuth;
}
