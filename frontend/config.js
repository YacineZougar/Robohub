/**
 * Configuration file for the Robot Management System
 * Contains API base URL and other configurable settings
 */

const CONFIG = {
    // API Base URL - Update this to match your FastAPI backend
    // The backend is served at root_path="/ROBOHUB"
    API_BASE_URL: 'http://localhost:8000/ROBOHUB',
    
    // Request timeout in milliseconds
    REQUEST_TIMEOUT: 30000,
    
    // Toast notification duration in milliseconds
    TOAST_DURATION: 5000,
    
    // Animation delays
    ANIMATION_DELAY: 300,
    
    // Pagination settings (for future enhancement)
    ITEMS_PER_PAGE: 20,
    
    // Date format settings
    DATE_FORMAT: {
        locale: 'en-US',
        options: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }
    }
};

// Freeze the config object to prevent accidental modifications
Object.freeze(CONFIG);
