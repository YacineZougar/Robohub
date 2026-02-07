/**
 * API Service Layer
 * Handles all communication with the FastAPI backend
 */

const API = {
    /**
     * Make a fetch request with error handling
     * @param {string} url - API endpoint URL
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };
        
        // Merge headers properly
        if (options.headers) {
            config.headers = { ...defaultOptions.headers, ...options.headers };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

            const response = await fetch(`${CONFIG.API_BASE_URL}${url}`, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Handle 204 No Content
            if (response.status === 204) {
                return { success: true };
            }

            // Handle non-OK responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your connection');
            }
            console.error('API Request Error:', error);
            throw error;
        }
    },

    /**
     * GET request helper
     */
    async get(url) {
        return this.request(url, { method: 'GET' });
    },

    /**
     * POST request helper
     */
    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PATCH request helper
     */
    async patch(url, data) {
        return this.request(url, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE request helper
     */
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    },

    // ==========================================
    // ROBOTS API
    // ==========================================

    /**
     * Get all robots
     * @returns {Promise<Array>} List of robots
     */
    async getAllRobots() {
        return this.get('/robots');
    },

    /**
     * Get a specific robot by ID
     * @param {number} id - Robot ID
     * @returns {Promise<Object>} Robot data
     */
    async getRobot(id) {
        return this.get(`/robots/${id}`);
    },

    /**
     * Create a new robot
     * @param {Object} robotData - Robot data {name, type}
     * @returns {Promise<Object>} Created robot
     */
    async createRobot(robotData) {
        return this.post('/robots', robotData);
    },

    /**
     * Update a robot
     * @param {number} id - Robot ID
     * @param {Object} robotData - Updated robot data
     * @returns {Promise<Object>} Updated robot
     */
    async updateRobot(id, robotData) {
        return this.patch(`/robots/${id}`, robotData);
    },

    /**
     * Delete a robot
     * @param {number} id - Robot ID
     * @returns {Promise<Object>} Success response
     */
    async deleteRobot(id) {
        return this.delete(`/robots/${id}`);
    },

    // ==========================================
    // PARTS API
    // ==========================================

    /**
     * Get all parts for a robot
     * @param {number} robotId - Robot ID
     * @returns {Promise<Object>} Parts data
     */
    async getRobotParts(robotId) {
        return this.get(`/robots/${robotId}/parts`);
    },

    /**
     * Get a specific part of a robot
     * @param {number} robotId - Robot ID
     * @param {number} partId - Part ID
     * @returns {Promise<Object>} Part data
     */
    async getRobotPart(robotId, partId) {
        return this.get(`/robots/${robotId}/parts/${partId}`);
    },

    /**
     * Add a part to a robot
     * @param {number} robotId - Robot ID
     * @param {Object} partData - Part data {name, quantity, last_checked}
     * @returns {Promise<Object>} Created part
     */
    async addRobotPart(robotId, partData) {
        return this.post(`/robots/${robotId}/parts`, partData);
    },

    /**
     * Update a robot part
     * @param {number} robotId - Robot ID
     * @param {number} partId - Part ID
     * @param {Object} partData - Updated part data
     * @returns {Promise<Object>} Updated part
     */
    async updateRobotPart(robotId, partId, partData) {
        return this.patch(`/robots/${robotId}/parts/${partId}`, partData);
    },

    /**
     * Delete a robot part
     * @param {number} robotId - Robot ID
     * @param {number} partId - Part ID
     * @returns {Promise<Object>} Success response
     */
    async deleteRobotPart(robotId, partId) {
        return this.delete(`/robots/${robotId}/parts/${partId}`);
    },

    // ==========================================
    // MAINTENANCE LOGS API
    // ==========================================

    /**
     * Get all maintenance logs
     * @returns {Promise<Object>} All maintenance logs
     */
    async getAllMaintenanceLogs() {
        return this.get('/maintenance_logs');
    },

    /**
     * Get a specific maintenance log
     * @param {number} id - Log ID
     * @returns {Promise<Object>} Maintenance log
     */
    async getMaintenanceLog(id) {
        return this.get(`/maintenance_logs/${id}`);
    },

    /**
     * Get maintenance logs for a robot
     * @param {number} robotId - Robot ID
     * @param {boolean} includeParts - Include part-specific logs
     * @returns {Promise<Object>} Robot maintenance logs
     */
    async getRobotMaintenanceLogs(robotId, includeParts = true) {
        return this.get(`/robots/${robotId}/maintenance_logs?parts=${includeParts}`);
    },

    /**
     * Add a maintenance log for a robot
     * @param {number} robotId - Robot ID
     * @param {Object} logData - Log data {parts_id, description, done_by}
     * @returns {Promise<Object>} Created log
     */
    async addMaintenanceLog(robotId, logData) {
        return this.post(`/robots/${robotId}/maintenance_logs`, logData);
    }
};
