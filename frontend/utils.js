/**
 * Utility Functions for Robot Management System
 * Contains helper functions for common operations
 */

const Utils = {
    /**
     * Format a date string to a readable format
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(CONFIG.DATE_FORMAT.locale, CONFIG.DATE_FORMAT.options);
    },

    /**
     * Get today's date in YYYY-MM-DD format
     * @returns {string} Today's date
     */
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },

    /**
     * Debounce function to limit rate of function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if value is empty (null, undefined, empty string, empty array)
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    isEmpty(value) {
        return value === null || 
               value === undefined || 
               value === '' || 
               (Array.isArray(value) && value.length === 0);
    },

    /**
     * Validate form data
     * @param {FormData} formData - Form data to validate
     * @param {Array} requiredFields - Array of required field names
     * @returns {Object} Validation result {isValid, errors}
     */
    validateForm(formData, requiredFields) {
        const errors = {};
        let isValid = true;

        requiredFields.forEach(field => {
            const value = formData.get(field);
            if (this.isEmpty(value)) {
                errors[field] = `${field} is required`;
                isValid = false;
            }
        });

        return { isValid, errors };
    }
};

/**
 * Toast Notification Manager
 * Handles displaying toast notifications to the user
 */
const Toast = {
    container: null,

    /**
     * Initialize toast container
     */
    init() {
        this.container = document.getElementById('toast-container');
    },

    /**
     * Show a toast notification
     * @param {string} type - Type of toast (success, error, warning, info)
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Duration in milliseconds
     */
    show(type, title, message, duration = CONFIG.TOAST_DURATION) {
        if (!this.container) this.init();

        const toastId = Utils.generateId();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');

        const icons = {
            success: '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
            error: '<path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
            warning: '<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
            info: '<path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        };

        toast.innerHTML = `
            <svg class="toast-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                ${icons[type] || icons.info}
            </svg>
            <div class="toast-content">
                <div class="toast-title">${Utils.escapeHtml(title)}</div>
                <div class="toast-message">${Utils.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;

        this.container.appendChild(toast);

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toastId));

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => this.hide(toastId), duration);
        }

        return toastId;
    },

    /**
     * Hide a specific toast
     * @param {string} toastId - ID of toast to hide
     */
    hide(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    },

    /**
     * Show success toast
     */
    success(title, message, duration) {
        return this.show('success', title, message, duration);
    },

    /**
     * Show error toast
     */
    error(title, message, duration) {
        return this.show('error', title, message, duration);
    },

    /**
     * Show warning toast
     */
    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    },

    /**
     * Show info toast
     */
    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }
};

/**
 * Modal Manager
 * Handles opening and closing modals
 */
const Modal = {
    activeModal: null,

    /**
     * Open a modal
     * @param {string} modalId - ID of modal to open
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        this.activeModal = modal;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Setup close handlers
        const closeButtons = modal.querySelectorAll('.modal-close, [data-dismiss-modal]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close(modalId));
        });

        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.close(modalId));
        }

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close(modalId);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    },

    /**
     * Close a modal
     * @param {string} modalId - ID of modal to close
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.activeModal = null;

        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            // Remove any error states
            const inputs = form.querySelectorAll('.form-input');
            inputs.forEach(input => input.classList.remove('error'));
        }
    },

    /**
     * Check if a modal is open
     * @returns {boolean} True if a modal is open
     */
    isOpen() {
        return this.activeModal !== null;
    }
};

/**
 * Confirmation Dialog
 * Handles confirmation prompts
 */
const Confirm = {
    /**
     * Show confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @returns {Promise<boolean>} Promise that resolves to true if confirmed
     */
    show(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-modal-title');
            const messageEl = document.getElementById('confirm-modal-message');
            const confirmBtn = document.getElementById('confirm-action-btn');

            titleEl.textContent = title;
            messageEl.textContent = message;

            Modal.open('confirm-modal');

            // Handle confirm
            const handleConfirm = () => {
                Modal.close('confirm-modal');
                cleanup();
                resolve(true);
            };

            // Handle cancel
            const handleCancel = () => {
                Modal.close('confirm-modal');
                cleanup();
                resolve(false);
            };

            // Cleanup event listeners
            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                modal.querySelectorAll('[data-dismiss-modal]').forEach(btn => {
                    btn.removeEventListener('click', handleCancel);
                });
            };

            confirmBtn.addEventListener('click', handleConfirm);
            modal.querySelectorAll('[data-dismiss-modal]').forEach(btn => {
                btn.addEventListener('click', handleCancel);
            });
        });
    }
};

/**
 * Loading State Manager
 * Handles showing/hiding loading states
 */
const Loading = {
    /**
     * Show loading state
     * @param {string} containerId - ID of container
     */
    show(containerId) {
        const loading = document.getElementById(`${containerId}-loading`);
        const content = document.getElementById(containerId);
        const empty = document.getElementById(`${containerId}-empty`);

        if (loading) loading.classList.remove('hidden');
        if (content) content.classList.add('hidden');
        if (empty) empty.classList.add('hidden');
    },

    /**
     * Hide loading state
     * @param {string} containerId - ID of container
     * @param {boolean} isEmpty - Whether content is empty
     */
    hide(containerId, isEmpty = false) {
        const loading = document.getElementById(`${containerId}-loading`);
        const content = document.getElementById(containerId);
        const empty = document.getElementById(`${containerId}-empty`);

        if (loading) loading.classList.add('hidden');

        if (isEmpty) {
            if (empty) empty.classList.remove('hidden');
            if (content) content.classList.add('hidden');
        } else {
            if (content) content.classList.remove('hidden');
            if (empty) empty.classList.add('hidden');
        }
    }
};
