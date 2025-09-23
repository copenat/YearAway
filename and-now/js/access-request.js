/**
 * YearAway Access Request Handler
 * Handles member access requests via email
 */

class AccessRequestHandler {
    constructor() {
        this.recipientEmail = 'request-member-access@yearaway.com';
        this.subject = 'YearAway Member Access Request';
    }

    /**
     * Generate email body for access request
     */
    generateEmailBody() {
        const timestamp = new Date().toLocaleString();
        const userAgent = navigator.userAgent;
        const currentPage = window.location.href;
        
        return `Hello,

I would like to request member access to YearAway.

Request Details:
- Request Date: ${timestamp}
- Page Requested From: ${currentPage}
- Browser: ${userAgent}

Kind regards,
[Your Name]`;
    }

    /**
     * Open email client with pre-filled access request
     */
    sendAccessRequest() {
        const emailBody = this.generateEmailBody();
        const mailtoLink = `mailto:${this.recipientEmail}?subject=${encodeURIComponent(this.subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Open email client
        window.open(mailtoLink, '_blank');
        
        // Show confirmation message
        this.showNotification('Your email client should now open with a pre-filled access request. Please send the email to complete your request.', 'info');
    }

    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `access-request-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'info' ? '#2196F3' : type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    /**
     * Handle access request button click
     */
    handleAccessRequest() {
        // Check if user is already a member
        if (window.yearawayAuth && window.yearawayAuth.isMember()) {
            this.showNotification('You already have member access! 🎉', 'success');
            return;
        }
        
        // Send access request
        this.sendAccessRequest();
    }
}

// Initialize access request handler
window.accessRequestHandler = new AccessRequestHandler();

/**
 * Function to handle Request Member Access button clicks
 */
function handleRequestMemberAccess() {
    if (window.accessRequestHandler) {
        window.accessRequestHandler.handleAccessRequest();
    } else {
        console.error('Access request handler not initialized');
    }
}
