# YearAway Authentication System

## Overview

The YearAway authentication system provides centralized member authentication across all pages. It uses simple token-based authentication with localStorage persistence.

## Files

### Core Files
- `js/auth-config.js` - Centralized configuration and token management
- `js/simple-auth-system.js` - Main authentication class
- `js/auth-utils.js` - Utility functions for other pages

### Pages Using Authentication
- `hints-and-tips.html` - Full authentication integration with tips manager
- `gallery.html` - Basic authentication
- `adventures.html` - Basic authentication  
- `index.html` - Basic authentication

## Setup

### For Pages with Full Authentication
```html
<!-- Include in this order -->
<script src="js/auth-config.js?v=22"></script>
<script src="js/simple-auth-system.js?v=22"></script>
<script src="js/main.js?v=22"></script>
<!-- Other page-specific scripts -->
```

### For Pages with Basic Authentication Check
```html
<!-- Include in this order -->
<script src="js/auth-config.js?v=22"></script>
<script src="js/simple-auth-system.js?v=22"></script>
<script src="js/auth-utils.js?v=22"></script>
<!-- Other page-specific scripts -->
```

## Usage

### Basic Authentication Check
```javascript
// Check if user is authenticated
if (YearAwayAuthUtils.isAuthenticated()) {
    // User is a member
    console.log('Member access granted');
} else {
    // User is a guest
    console.log('Guest access only');
}
```

### Show/Hide Content Based on Auth
```javascript
// Show content only for members
YearAwayAuthUtils.toggleContentByAuth('.members-only', true);

// Show content only for guests
YearAwayAuthUtils.toggleContentByAuth('.guest-only', false);
```

### Add Authentication Status Display
```javascript
// Add auth status to a container
YearAwayAuthUtils.addAuthStatus('#auth-status-container');
```

### Direct Configuration Access
```javascript
// Get current token
const token = YearAwayAuthConfig.getCurrentToken();

// Validate a token
const isValid = YearAwayAuthConfig.validateToken('YEARAWAY-ULZE-1SVR-Z0JG');

// Check authentication
const isAuth = YearAwayAuthConfig.isAuthenticated();
```

## Valid Tokens

The following tokens are currently valid for member access:

- `YEARAWAY-ULZE-1SVR-Z0JG`
- `YEARAWAY-I80B-HJ7Y-FKNO`
- `YEARAWAY-Q2FZ-KID3-ISML`
- `YEARAWAY-9ND6-6QMU-KYW7`
- `YEARAWAY-1G9L-Q9I4-4AMQ`

## Adding New Tokens

To add new member tokens:

1. Edit `js/auth-config.js`
2. Add the new token to the `validTokens` array
3. Update the version number in all HTML files that include `auth-config.js`
4. Test the new token

## LocalStorage Keys

- `yearaway_member_token` - Stores the current authentication token
- `yearaway_member_status` - Stores the member status ('true'/'false')

## Security Notes

- Tokens are stored in localStorage (client-side)
- This is a simple authentication system for demo/preview purposes
- For production, consider implementing server-side token validation
- Tokens are case-insensitive (automatically converted to uppercase)

## Troubleshooting

### Auth Not Working on Page Refresh
- Ensure `auth-config.js` is loaded before other auth scripts
- Check browser console for errors
- Verify localStorage contains the token

### Content Not Showing/Hiding
- Check that `YearAwayAuthUtils` is available
- Verify CSS selectors are correct
- Ensure auth-config.js is loaded first

### Token Not Valid
- Verify token is in the `validTokens` array in `auth-config.js`
- Check token format (should be uppercase)
- Clear localStorage and try logging in again
