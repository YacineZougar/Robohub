/**
 * Main Application Logic
 * Robot Management System Frontend
 */

const App = {
    // State management
    state: {
        currentView: 'robots',
        robots: [],
        maintenanceLogs: [],
        selectedRobot: null,
        isLoading: false
    },

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Robot Management System...');
        
        // Setup event listeners
        this.setupNavigation();
        this.setupRobotModal();
        this.setupPartModal();
        this.setupMaintenanceModal();
        this.setupRobotDetailModal();
        
        // Load initial data
        await this.loadRobots();
        
        console.log('Application initialized successfully');
    },

    // ==========================================
    // NAVIGATION
    // ==========================================

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });
    },

    switchView(viewName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });

        this.state.currentView = viewName;

        // Load data for the view
        if (viewName === 'robots') {
            this.loadRobots();
        } else if (viewName === 'maintenance') {
            this.loadAllMaintenanceLogs();
        }
    },

    // ==========================================
    // ROBOTS MANAGEMENT
    // ==========================================

    async loadRobots() {
        const container = document.getElementById('robots-grid');
        const loading = document.getElementById('robots-loading');
        const empty = document.getElementById('robots-empty');

        try {
            loading.classList.remove('hidden');
            container.classList.add('hidden');
            empty.classList.add('hidden');

            const robots = await API.getAllRobots();
            this.state.robots = robots;

            loading.classList.add('hidden');

            if (robots.length === 0) {
                empty.classList.remove('hidden');
            } else {
                container.classList.remove('hidden');
                this.renderRobots(robots);
            }
        } catch (error) {
            loading.classList.add('hidden');
            Toast.error('Error', `Failed to load robots: ${error.message}`);
            console.error('Load robots error:', error);
        }
    },

    renderRobots(robots) {
        const container = document.getElementById('robots-grid');
        
        container.innerHTML = robots.map(robot => `
            <div class="robot-card" data-robot-id="${robot.id}">
                <div class="robot-card-header">
                    <div>
                        <h3 class="robot-card-title">${Utils.escapeHtml(robot.name)}</h3>
                        <div class="robot-card-type">${Utils.escapeHtml(robot.type)}</div>
                    </div>
                    <div class="robot-card-actions">
                        <button class="icon-btn edit" onclick="App.openEditRobotModal(${robot.id})" aria-label="Edit robot">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="icon-btn delete" onclick="App.deleteRobot(${robot.id})" aria-label="Delete robot">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="robot-card-meta">
                    <div class="robot-card-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Added ${Utils.formatDate(robot.created_at)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers to open detail modal
        container.querySelectorAll('.robot-card').forEach(card => {
            // Only open detail on card body click, not on action buttons
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.robot-card-actions')) {
                    const robotId = parseInt(card.dataset.robotId);
                    this.openRobotDetailModal(robotId);
                }
            });
        });
    },

    setupRobotModal() {
        const addBtn = document.getElementById('add-robot-btn');
        const form = document.getElementById('robot-form');

        addBtn.addEventListener('click', () => {
            this.openAddRobotModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRobotFormSubmit(e.target);
        });
    },

    openAddRobotModal() {
        const modal = document.getElementById('robot-modal');
        const title = document.getElementById('robot-modal-title');
        const form = document.getElementById('robot-form');

        title.textContent = 'Add Robot';
        form.reset();
        form.dataset.mode = 'create';
        delete form.dataset.robotId;

        Modal.open('robot-modal');
    },

    async openEditRobotModal(robotId) {
        const modal = document.getElementById('robot-modal');
        const title = document.getElementById('robot-modal-title');
        const form = document.getElementById('robot-form');

        try {
            const robot = await API.getRobot(robotId);

            title.textContent = 'Edit Robot';
            form.dataset.mode = 'edit';
            form.dataset.robotId = robotId;

            document.getElementById('robot-name').value = robot.name;
            document.getElementById('robot-type').value = robot.type;

            Modal.open('robot-modal');
        } catch (error) {
            Toast.error('Error', `Failed to load robot: ${error.message}`);
        }
    },

    async handleRobotFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        try {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');

            const formData = new FormData(form);
            const robotData = {
                name: formData.get('name'),
                type: formData.get('type')
            };

            const mode = form.dataset.mode;
            const robotId = form.dataset.robotId;

            if (mode === 'create') {
                await API.createRobot(robotData);
                Toast.success('Success', 'Robot created successfully');
            } else {
                await API.updateRobot(robotId, robotData);
                Toast.success('Success', 'Robot updated successfully');
            }

            Modal.close('robot-modal');
            await this.loadRobots();
        } catch (error) {
            Toast.error('Error', `Failed to save robot: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    },

    async deleteRobot(robotId) {
        const confirmed = await Confirm.show(
            'Delete Robot',
            'Are you sure you want to delete this robot? This will also delete all associated parts and maintenance logs.'
        );

        if (!confirmed) return;

        try {
            await API.deleteRobot(robotId);
            Toast.success('Success', 'Robot deleted successfully');
            await this.loadRobots();
        } catch (error) {
            Toast.error('Error', `Failed to delete robot: ${error.message}`);
        }
    },

    // ==========================================
    // ROBOT DETAIL MODAL (Parts & Maintenance)
    // ==========================================

    setupRobotDetailModal() {
        const tabs = document.querySelectorAll('#robot-detail-modal .tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchDetailTab(tabName);
            });
        });

        // Filter checkbox for maintenance logs
        const filterCheckbox = document.getElementById('filter-parts-logs');
        if (filterCheckbox) {
            filterCheckbox.addEventListener('change', () => {
                if (this.state.selectedRobot) {
                    this.loadRobotMaintenanceLogs(this.state.selectedRobot.id);
                }
            });
        }
    },

    switchDetailTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('#robot-detail-modal .tab').forEach(tab => {
            const isActive = tab.dataset.tab === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update tab panels
        document.querySelectorAll('#robot-detail-modal .tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    },

    async openRobotDetailModal(robotId) {
        try {
            const robot = await API.getRobot(robotId);
            this.state.selectedRobot = robot;

            const title = document.getElementById('robot-detail-title');
            const subtitle = document.getElementById('robot-detail-subtitle');

            title.textContent = robot.name;
            subtitle.textContent = `${robot.type} • ID: ${robot.id}`;

            Modal.open('robot-detail-modal');

            // Load parts and maintenance logs
            await this.loadRobotParts(robotId);
            await this.loadRobotMaintenanceLogs(robotId);
        } catch (error) {
            Toast.error('Error', `Failed to load robot details: ${error.message}`);
        }
    },

    // ==========================================
    // PARTS MANAGEMENT
    // ==========================================

    async loadRobotParts(robotId) {
        const list = document.getElementById('parts-list');
        const loading = document.getElementById('parts-loading');
        const empty = document.getElementById('parts-empty');

        try {
            loading.classList.remove('hidden');
            list.classList.add('hidden');
            empty.classList.add('hidden');

            const response = await API.getRobotParts(robotId);
            const parts = response["robot's parts"] || [];

            loading.classList.add('hidden');

            if (parts.length === 0) {
                empty.classList.remove('hidden');
            } else {
                list.classList.remove('hidden');
                this.renderParts(parts, robotId);
            }
        } catch (error) {
            loading.classList.add('hidden');
            Toast.error('Error', `Failed to load parts: ${error.message}`);
        }
    },

    renderParts(parts, robotId) {
        const list = document.getElementById('parts-list');
        
        list.innerHTML = parts.map(part => `
            <div class="part-item">
                <div class="part-info">
                    <div class="part-name">${Utils.escapeHtml(part.name)}</div>
                    <div class="part-meta">
                        <span>
                            <strong>Qty:</strong> ${part.quantity}
                        </span>
                        <span>
                            <strong>Last Checked:</strong> ${Utils.formatDate(part.last_checked)}
                        </span>
                    </div>
                </div>
                <div class="part-actions">
                    <button class="icon-btn edit" onclick="App.openEditPartModal(${robotId}, ${part.id})" aria-label="Edit part">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="icon-btn delete" onclick="App.deletePart(${robotId}, ${part.id})" aria-label="Delete part">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    setupPartModal() {
        const addBtn = document.getElementById('add-part-btn');
        const form = document.getElementById('part-form');

        addBtn.addEventListener('click', () => {
            this.openAddPartModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePartFormSubmit(e.target);
        });
    },

    openAddPartModal() {
        const modal = document.getElementById('part-modal');
        const title = document.getElementById('part-modal-title');
        const form = document.getElementById('part-form');

        title.textContent = 'Add Part';
        form.reset();
        form.dataset.mode = 'create';
        delete form.dataset.partId;

        // Set default date to today
        document.getElementById('part-last-checked').value = Utils.getTodayDate();

        Modal.open('part-modal');
    },

    async openEditPartModal(robotId, partId) {
        const modal = document.getElementById('part-modal');
        const title = document.getElementById('part-modal-title');
        const form = document.getElementById('part-form');

        try {
            const response = await API.getRobotPart(robotId, partId);
            const part = response.part;

            title.textContent = 'Edit Part';
            form.dataset.mode = 'edit';
            form.dataset.partId = partId;

            document.getElementById('part-name').value = part.name;
            document.getElementById('part-quantity').value = part.quantity;
            document.getElementById('part-last-checked').value = part.last_checked;

            Modal.open('part-modal');
        } catch (error) {
            Toast.error('Error', `Failed to load part: ${error.message}`);
        }
    },

    async handlePartFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        try {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');

            const formData = new FormData(form);
            const partData = {
                name: formData.get('name'),
                quantity: parseInt(formData.get('quantity'))
            };

            const lastChecked = formData.get('last_checked');
            if (lastChecked) {
                partData.last_checked = lastChecked;
            }

            const mode = form.dataset.mode;
            const partId = form.dataset.partId;
            const robotId = this.state.selectedRobot.id;

            if (mode === 'create') {
                await API.addRobotPart(robotId, partData);
                Toast.success('Success', 'Part added successfully');
            } else {
                await API.updateRobotPart(robotId, partId, partData);
                Toast.success('Success', 'Part updated successfully');
            }

            Modal.close('part-modal');
            await this.loadRobotParts(robotId);
        } catch (error) {
            Toast.error('Error', `Failed to save part: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    },

    async deletePart(robotId, partId) {
        const confirmed = await Confirm.show(
            'Delete Part',
            'Are you sure you want to delete this part?'
        );

        if (!confirmed) return;

        try {
            await API.deleteRobotPart(robotId, partId);
            Toast.success('Success', 'Part deleted successfully');
            await this.loadRobotParts(robotId);
        } catch (error) {
            Toast.error('Error', `Failed to delete part: ${error.message}`);
        }
    },

    // ==========================================
    // MAINTENANCE LOGS MANAGEMENT
    // ==========================================

    async loadRobotMaintenanceLogs(robotId) {
        const list = document.getElementById('robot-maintenance-list');
        const loading = document.getElementById('robot-maintenance-loading');
        const empty = document.getElementById('robot-maintenance-empty');
        const filterCheckbox = document.getElementById('filter-parts-logs');

        try {
            loading.classList.remove('hidden');
            list.classList.add('hidden');
            empty.classList.add('hidden');

            const includeParts = filterCheckbox ? filterCheckbox.checked : true;
            const response = await API.getRobotMaintenanceLogs(robotId, includeParts);
            const logs = response["robot's maintenance logs"] || [];

            loading.classList.add('hidden');

            if (logs.length === 0) {
                empty.classList.remove('hidden');
            } else {
                list.classList.remove('hidden');
                this.renderMaintenanceLogsForRobot(logs);
            }
        } catch (error) {
            loading.classList.add('hidden');
            Toast.error('Error', `Failed to load maintenance logs: ${error.message}`);
        }
    },

    renderMaintenanceLogsForRobot(logs) {
        const list = document.getElementById('robot-maintenance-list');
        
        list.innerHTML = logs.map(log => `
            <div class="maintenance-item">
                <div class="maintenance-header">
                    <div class="maintenance-id">#${log.id}</div>
                    <div class="maintenance-date">${Utils.formatDate(log.log_date)}</div>
                </div>
                <div class="maintenance-description">${Utils.escapeHtml(log.description)}</div>
                <div class="maintenance-footer">
                    <div>
                        <span style="color: var(--color-text-tertiary)">By:</span>
                        <span class="maintenance-by">${Utils.escapeHtml(log.done_by)}</span>
                    </div>
                    ${log.parts_id !== null ? `
                        <div class="maintenance-part-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Part #${log.parts_id}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    setupMaintenanceModal() {
        const addBtn = document.getElementById('add-maintenance-btn');
        const form = document.getElementById('maintenance-form');

        addBtn.addEventListener('click', () => {
            this.openAddMaintenanceModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleMaintenanceFormSubmit(e.target);
        });
    },

    async openAddMaintenanceModal() {
        const modal = document.getElementById('maintenance-modal');
        const form = document.getElementById('maintenance-form');
        const partSelect = document.getElementById('maintenance-part');

        form.reset();

        // Load parts for the selected robot
        try {
            const robotId = this.state.selectedRobot.id;
            const response = await API.getRobotParts(robotId);
            const parts = response["robot's parts"] || [];

            // Populate parts dropdown
            partSelect.innerHTML = '<option value="">General Maintenance</option>' +
                parts.map(part => `<option value="${part.id}">${Utils.escapeHtml(part.name)}</option>`).join('');

            Modal.open('maintenance-modal');
        } catch (error) {
            Toast.error('Error', `Failed to load parts: ${error.message}`);
        }
    },

    async handleMaintenanceFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        try {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');

            const formData = new FormData(form);
            const logData = {
                description: formData.get('description'),
                done_by: formData.get('done_by')
            };

            const partsId = formData.get('parts_id');
            if (partsId) {
                logData.parts_id = parseInt(partsId);
            }

            const robotId = this.state.selectedRobot.id;
            await API.addMaintenanceLog(robotId, logData);

            Toast.success('Success', 'Maintenance log added successfully');
            Modal.close('maintenance-modal');
            await this.loadRobotMaintenanceLogs(robotId);
        } catch (error) {
            Toast.error('Error', `Failed to save maintenance log: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    },

    // ==========================================
    // ALL MAINTENANCE LOGS VIEW
    // ==========================================

    async loadAllMaintenanceLogs() {
        const tableContainer = document.getElementById('maintenance-table-container');
        const tbody = document.getElementById('maintenance-table-body');
        const loading = document.getElementById('maintenance-loading');
        const empty = document.getElementById('maintenance-empty');

        try {
            loading.classList.remove('hidden');
            tableContainer.classList.add('hidden');
            empty.classList.add('hidden');

            const response = await API.getAllMaintenanceLogs();
            const logs = response['all maintenance logs'] || [];

            loading.classList.add('hidden');

            if (logs.length === 0) {
                empty.classList.remove('hidden');
            } else {
                tableContainer.classList.remove('hidden');
                this.renderAllMaintenanceLogs(logs);
            }
        } catch (error) {
            loading.classList.add('hidden');
            Toast.error('Error', `Failed to load maintenance logs: ${error.message}`);
        }
    },

    renderAllMaintenanceLogs(logs) {
        const tbody = document.getElementById('maintenance-table-body');
        
        tbody.innerHTML = logs.map(log => `
            <tr>
                <td><strong>${log.id}</strong></td>
                <td>${log.robot_id}</td>
                <td>${log.parts_id !== null ? log.parts_id : '-'}</td>
                <td>${Utils.escapeHtml(log.description)}</td>
                <td>${Utils.formatDate(log.log_date)}</td>
                <td>${Utils.escapeHtml(log.done_by)}</td>
            </tr>
        `).join('');
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
