/**
 * SecureAuth Frontend - Shared Authentication Utilities
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/dashboard')
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
async function authenticatedFetch(endpoint, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
        throw new Error('No access token found');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers
    };
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(accessToken && user);
}

/**
 * Get current user from localStorage
 * @returns {object|null}
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

/**
 * Format date nicely
 * @param {string} isoDate - ISO 8601 date string
 * @returns {string}
 */
function formatDate(isoDate) {
    if (!isoDate) return 'N/A';
    
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show error alert
 * @param {string} elementId - Alert element ID
 * @param {string} message - Error message
 */
function showError(elementId, message) {
    const alert = document.getElementById(elementId);
    if (alert) {
        alert.textContent = message;
        alert.classList.remove('d-none');
    }
}

/**
 * Hide error alert
 * @param {string} elementId - Alert element ID
 */
function hideError(elementId) {
    const alert = document.getElementById(elementId);
    if (alert) {
        alert.classList.add('d-none');
    }
}

/**
 * Set loading state on button
 * @param {string} buttonId - Button element ID
 * @param {boolean} loading - Loading state
 */
function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    button.disabled = loading;
    
    const spinner = button.querySelector('.spinner-border');
    if (spinner) {
        if (loading) {
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
        }
    }
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} - { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (password.length < 8) {
        return {
            valid: false,
            message: 'Password must be at least 8 characters long'
        };
    }
    
    return { valid: true, message: 'Password is valid' };
}

/**
 * Check JWT expiry (client-side only, not cryptographically secure)
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        return Date.now() >= exp;
    } catch (error) {
        console.error('Error checking token expiry:', error);
        return true;
    }
}

/**
 * Auto-logout on token expiry
 */
function setupAutoLogout() {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) return;
    
    if (isTokenExpired(accessToken)) {
        logout();
        return;
    }
    
    // Check every minute
    setInterval(() => {
        const token = localStorage.getItem('accessToken');
        if (token && isTokenExpired(token)) {
            alert('Your session has expired. Please log in again.');
            logout();
        }
    }, 60000); // 1 minute
}

// Initialize auto-logout on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoLogout);
} else {
    setupAutoLogout();
}

// Export functions for use in other scripts
window.SecureAuth = {
    API_BASE_URL,
    authenticatedFetch,
    isAuthenticated,
    getCurrentUser,
    logout,
    formatDate,
    showError,
    hideError,
    setButtonLoading,
    isValidEmail,
    validatePassword,
    isTokenExpired
};
