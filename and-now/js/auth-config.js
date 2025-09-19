/**
 * YearAway Authentication Configuration
 * Centralized configuration for member tokens and authentication settings
 */

window.YearAwayAuthConfig = {
    // Valid member tokens
    validTokens: [
        'YEARAWAY-ULZE-1SVR-Z0JG',
        'YEARAWAY-I80B-HJ7Y-FKNO', 
        'YEARAWAY-Q2FZ-KID3-ISML',
        'YEARAWAY-9ND6-6QMU-KYW7',
        'YEARAWAY-1G9L-Q9I4-4AMQ'
    ],
    
    // LocalStorage keys
    tokenKey: 'yearaway_member_token',
    
    /**
     * Validate a token
     * @param {string} token - The token to validate
     * @returns {boolean} - Whether the token is valid
     */
    validateToken(token) {
        return this.validTokens.includes(token.toUpperCase());
    },
    
    /**
     * Get the current token from localStorage
     * @returns {string|null} - The current token or null
     */
    getCurrentToken() {
        return localStorage.getItem(this.tokenKey);
    },
    
    /**
     * Check if user is currently authenticated
     * @returns {boolean} - Whether the user is authenticated
     */
    isAuthenticated() {
        const token = this.getCurrentToken();
        return token && this.validateToken(token);
    },
    
    /**
     * Set authentication token
     * @param {string} token - The token to set
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token.toUpperCase());
        localStorage.setItem(this.memberStatusKey, 'true');
    },
    
    /**
     * Clear authentication
     */
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.memberStatusKey);
    }
};
