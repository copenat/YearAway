/**
 * YearAway Access Request System
 * Handles member access requests via email
 */

class AccessRequestSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormHandlers();
    }

    /**
     * Setup form submission handlers
     */
    setupFormHandlers() {
        const form = document.getElementById('access-request-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAccessRequest(form);
            });
        }
    }

    /**
     * Handle access request form submission
     */
    async handleAccessRequest(form) {
        try {
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Validate required fields
            if (!this.validateFormData(data)) {
                return;
            }

            // Show loading state
            this.showLoading(true);

            // Send request via email service
            const success = await this.sendAccessRequest(data);
            
            if (success) {
                this.showSuccessMessage();
                form.reset();
            } else {
                this.showErrorMessage();
            }

        } catch (error) {
            console.error('Error handling access request:', error);
            this.showErrorMessage();
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Validate form data
     */
    validateFormData(data) {
        const required = ['name', 'email', 'relationship', 'reason'];
        
        for (const field of required) {
            if (!data[field] || data[field].trim() === '') {
                this.showFieldError(field, 'This field is required');
                return false;
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            return false;
        }

        return true;
    }

    /**
     * Send access request via email service
     */
    async sendAccessRequest(data) {
        // Option 1: EmailJS Integration
        if (typeof emailjs !== 'undefined') {
            return await this.sendViaEmailJS(data);
        }
        
        // Option 2: Formspree Integration
        if (this.isFormspreeForm()) {
            return await this.sendViaFormspree(data);
        }
        
        // Fallback: Log to console (for development)
        console.log('Access request data:', data);
        return true;
    }

    /**
     * Send via EmailJS
     */
    async sendViaEmailJS(data) {
        try {
            const templateParams = {
                to_name: 'Nathan',
                from_name: data.name,
                from_email: data.email,
                relationship: data.relationship,
                reason: data.reason,
                how_did_you_hear: data['how-did-you-hear'] || 'Not specified',
                request_date: new Date().toLocaleDateString(),
                request_time: new Date().toLocaleTimeString()
            };

            const response = await emailjs.send(
                'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
                'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
                templateParams
            );

            return response.status === 200;
        } catch (error) {
            console.error('EmailJS error:', error);
            return false;
        }
    }

    /**
     * Send via Formspree
     */
    async sendViaFormspree(data) {
        try {
            const form = document.getElementById('access-request-form');
            const formspreeUrl = form.action; // Should be set to Formspree endpoint
            
            const response = await fetch(formspreeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            return response.ok;
        } catch (error) {
            console.error('Formspree error:', error);
            return false;
        }
    }

    /**
     * Check if form is using Formspree
     */
    isFormspreeForm() {
        const form = document.getElementById('access-request-form');
        return form && form.action.includes('formspree.io');
    }

    /**
     * Show field validation error
     */
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        if (field) {
            field.style.borderColor = '#f44336';
            
            // Remove existing error message
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.color = '#f44336';
            errorDiv.style.fontSize = '14px';
            errorDiv.style.marginTop = '5px';
            errorDiv.textContent = message;
            
            field.parentNode.appendChild(errorDiv);
            
            // Remove error styling on focus
            field.addEventListener('focus', () => {
                field.style.borderColor = '#ddd';
                const error = field.parentNode.querySelector('.field-error');
                if (error) {
                    error.remove();
                }
            });
        }
    }

    /**
     * Show loading state
     */
    showLoading(show) {
        const button = document.querySelector('#access-request-form button');
        if (button) {
            if (show) {
                button.disabled = true;
                button.textContent = 'Sending Request...';
            } else {
                button.disabled = false;
                button.textContent = 'Send Access Request';
            }
        }
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        this.showNotification(
            'Thank you for your request! We\'ll review it and get back to you within 24-48 hours.',
            'success'
        );
    }

    /**
     * Show error message
     */
    showErrorMessage() {
        this.showNotification(
            'Sorry, there was an error sending your request. Please try again or contact us directly.',
            'error'
        );
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
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
            info: 'linear-gradient(135deg, #2196F3, #1976D2)'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        // Hide after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accessRequestSystem = new AccessRequestSystem();
    console.log('🔐 YearAway Access Request System Loaded');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessRequestSystem;
}
