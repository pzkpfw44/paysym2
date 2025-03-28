/**
 * Scenario management functionality for the Payout Elasticity Simulator
 */

// Register this module with the application
PayoutSimulator.features.scenarios.manager = {
    // Maintain arrays of saved structures and performance profiles
    payoutStructures: [],
    performanceProfiles: [],
    
    // Currently selected items for comparison
    selectedStructures: [],
    selectedPerformances: [],
    
    /**
     * Initialize scenarios from localStorage
     */
    init: function() {
        console.log("Initializing scenario manager...");
        
        this.payoutStructures = JSON.parse(localStorage.getItem('payoutStructures') || '[]');
        this.performanceProfiles = JSON.parse(localStorage.getItem('performanceProfiles') || '[]');
        
        this.updateStructureList();
        this.updatePerformanceList();
        this.updateSelectors();
        
        console.log("Scenario manager initialized");
    },
    
    /**
     * Update the payout structure list in the UI
     */
    updateStructureList: function() {
        const structureList = document.getElementById('structureList');
        if (!structureList) return;
        
        structureList.innerHTML = '';
        
        if (this.payoutStructures.length === 0) {
            structureList.innerHTML = '<p>No saved payout structures.</p>';
            return;
        }
        
        this.payoutStructures.forEach((structure, index) => {
            const structureItem = document.createElement('div');
            structureItem.className = 'scenario-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'scenario-name';
            nameSpan.textContent = structure.name;
            
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'scenario-buttons';
            
            const loadButton = document.createElement('button');
            loadButton.className = 'scenario-button';
            loadButton.textContent = 'Load';
            loadButton.addEventListener('click', () => this.loadPayoutStructure(index));
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'scenario-button';
            deleteButton.style.backgroundColor = '#d2004b';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => this.deletePayoutStructure(index));
            
            buttonGroup.appendChild(loadButton);
            buttonGroup.appendChild(deleteButton);
            
            structureItem.appendChild(nameSpan);
            structureItem.appendChild(buttonGroup);
            
            structureList.appendChild(structureItem);
        });
    },
    
    /**
     * Update the performance profile list in the UI
     */
    updatePerformanceList: function() {
        const performanceList = document.getElementById('performanceList');
        if (!performanceList) return;
        
        performanceList.innerHTML = '';
        
        if (this.performanceProfiles.length === 0) {
            performanceList.innerHTML = '<p>No saved performance profiles.</p>';
            return;
        }
        
        this.performanceProfiles.forEach((profile, index) => {
            const profileItem = document.createElement('div');
            profileItem.className = 'scenario-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'scenario-name';
            nameSpan.textContent = profile.name;
            
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'scenario-buttons';
            
            const loadButton = document.createElement('button');
            loadButton.className = 'scenario-button';
            loadButton.textContent = 'Load';
            loadButton.addEventListener('click', () => this.loadPerformanceProfile(index));
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'scenario-button';
            deleteButton.style.backgroundColor = '#d2004b';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => this.deletePerformanceProfile(index));
            
            buttonGroup.appendChild(loadButton);
            buttonGroup.appendChild(deleteButton);
            
            profileItem.appendChild(nameSpan);
            profileItem.appendChild(buttonGroup);
            
            performanceList.appendChild(profileItem);
        });
    },
    
    /**
     * Update selectors for scenario comparison
     */
    updateSelectors: function() {
        // Update structure selector
        const structureSelector = document.getElementById('structureSelector');
        if (!structureSelector) return;
        
        structureSelector.innerHTML = '';
        
        if (this.payoutStructures.length === 0) {
            structureSelector.innerHTML = '<p class="empty-message">No payout structures saved</p>';
        } else {
            // Create a compact list view container
            const listContainer = document.createElement('div');
            listContainer.className = 'selector-list-container';
            structureSelector.appendChild(listContainer);
            
            // Add header for the list
            const headerRow = document.createElement('div');
            headerRow.className = 'selector-header-row';
            headerRow.innerHTML = `
                <div class="selector-cell cell-select">Select</div>
                <div class="selector-cell cell-name">Structure Name</div>
                <div class="selector-cell cell-details">Details</div>
            `;
            listContainer.appendChild(headerRow);
            
            // Add items in a compact list format
            this.payoutStructures.forEach((structure, index) => {
                const item = document.createElement('div');
                item.className = 'selector-row' + (this.selectedStructures.includes(index) ? ' selected' : '');
                item.dataset.index = index;
                
                // Calculate some key metrics for display
                const comTopRate = Math.max(...structure.commissionThresholds.map(t => t.percentage));
                const qBonusMax = Math.max(...structure.quarterlyThresholds.map(t => t.bonus));
                
                item.innerHTML = `
                    <div class="selector-cell cell-select">
                        <input type="checkbox" class="structure-checkbox" 
                               ${this.selectedStructures.includes(index) ? 'checked' : ''}>
                    </div>
                    <div class="selector-cell cell-name">${structure.name}</div>
                    <div class="selector-cell cell-details">
                        <span class="detail-tag">${structure.useRollingAverage ? 'Rolling Avg' : 'Monthly'}</span>
                        <span class="detail-tag">Com: ${comTopRate}%</span>
                        <span class="detail-tag">QB: €${qBonusMax}</span>
                    </div>
                `;
                
                // Add event listener to the checkbox
                const checkbox = item.querySelector('.structure-checkbox');
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation(); // Prevent row click from being triggered
                    this.toggleStructureSelection(index, item);
                });
                
                // Add event listener to the row
                item.addEventListener('click', (e) => {
                    if (e.target.type !== 'checkbox') {
                        checkbox.checked = !checkbox.checked;
                        this.toggleStructureSelection(index, item);
                    }
                });
                
                listContainer.appendChild(item);
            });
        }
        
        // Update performance selector
        const performanceSelector = document.getElementById('performanceSelector');
        if (!performanceSelector) return;
        
        performanceSelector.innerHTML = '';
        
        if (this.performanceProfiles.length === 0) {
            performanceSelector.innerHTML = '<p class="empty-message">No performance profiles saved</p>';
        } else {
            // Create a compact list view container
            const listContainer = document.createElement('div');
            listContainer.className = 'selector-list-container';
            performanceSelector.appendChild(listContainer);
            
            // Add header for the list
            const headerRow = document.createElement('div');
            headerRow.className = 'selector-header-row';
            headerRow.innerHTML = `
                <div class="selector-cell cell-select">Select</div>
                <div class="selector-cell cell-name">Profile Name</div>
                <div class="selector-cell cell-details">Performance</div>
                <div class="selector-cell cell-fte">FTE</div>
            `;
            listContainer.appendChild(headerRow);
            
            // Add profiles as rows
            this.performanceProfiles.forEach((profile, index) => {
                const item = document.createElement('div');
                item.className = 'selector-row' + (this.selectedPerformances.includes(index) ? ' selected' : '');
                item.dataset.index = index;
                
                // Calculate average achievement
                const avgAchievement = profile.quarterlyAchievements.reduce((a, b) => a + b, 0) / 4;
                
                item.innerHTML = `
                    <div class="selector-cell cell-select">
                        <input type="checkbox" class="performance-checkbox" 
                               ${this.selectedPerformances.includes(index) ? 'checked' : ''}>
                    </div>
                    <div class="selector-cell cell-name">${profile.name}</div>
                    <div class="selector-cell cell-details">
                        <span class="detail-tag">Avg: ${avgAchievement.toFixed(0)}%</span>
                        <span class="detail-tag">${profile.quarterlyAchievements.join('% | ')}%</span>
                    </div>
                    <div class="selector-cell cell-fte">${profile.fte}</div>
                `;
                
                // Add event listener to the checkbox
                const checkbox = item.querySelector('.performance-checkbox');
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation(); // Prevent row click from being triggered
                    this.togglePerformanceSelection(index, item);
                });
                
                // Add event listener to the row
                item.addEventListener('click', (e) => {
                    if (e.target.type !== 'checkbox') {
                        checkbox.checked = !checkbox.checked;
                        this.togglePerformanceSelection(index, item);
                    }
                });
                
                listContainer.appendChild(item);
            });
        }
        
        // Update visibility of comparison elements
        const noScenariosMessage = document.getElementById('noScenariosMessage');
        if (noScenariosMessage) {
            if (this.payoutStructures.length === 0 || this.performanceProfiles.length === 0) {
                noScenariosMessage.style.display = 'block';
                if (document.getElementById('scenarioComparison')) {
                    document.getElementById('scenarioComparison').style.display = 'none';
                }
            } else {
                noScenariosMessage.style.display = 'none';
            }
        }
    },
    
    /**
     * Toggle selection of a payout structure
     */
    toggleStructureSelection: function(index, element) {
        const position = this.selectedStructures.indexOf(index);
        
        if (position === -1) {
            // Only allow up to 3 selections
            if (this.selectedStructures.length >= 3) {
                alert('You can select a maximum of 3 payout structures');
                // Make sure the checkbox is unchecked
                const checkbox = element.querySelector('.structure-checkbox');
                if (checkbox) checkbox.checked = false;
                return;
            }
            
            // Add to selected
            this.selectedStructures.push(index);
            element.classList.add('selected');
        } else {
            // Remove from selected
            this.selectedStructures.splice(position, 1);
            element.classList.remove('selected');
        }
    },
    
    /**
     * Toggle selection of a performance profile
     */
    togglePerformanceSelection: function(index, element) {
        const position = this.selectedPerformances.indexOf(index);
        
        if (position === -1) {
            // Only allow up to 12 selections
            if (this.selectedPerformances.length >= 12) {
                alert('You can select a maximum of 12 performance profiles');
                // Make sure the checkbox is unchecked
                const checkbox = element.querySelector('.performance-checkbox');
                if (checkbox) checkbox.checked = false;
                return;
            }
            
            // Add to selected
            this.selectedPerformances.push(index);
            element.classList.add('selected');
        } else {
            // Remove from selected
            this.selectedPerformances.splice(position, 1);
            element.classList.remove('selected');
        }
    },
    
    /**
     * Save current payout structure settings
     */
    savePayoutStructure: function() {
        const name = document.getElementById('structureName').value.trim();
        if (!name) {
            alert('Please enter a structure name');
            return;
        }
        
        // Get commission settings
        const useRollingAverage = document.getElementById('useRollingAverage').checked;
        const previousMonths = [
            parseFloat(document.getElementById('previousMonth1').value),
            parseFloat(document.getElementById('previousMonth2').value)
        ];
        
        // Get commission thresholds
        const commissionThresholds = [];
        for (let i = 1; i <= 3; i++) {
            commissionThresholds.push({
                threshold: parseFloat(document.getElementById(`commThreshold${i}`).value),
                upTo: i < 3 ? parseFloat(document.getElementById(`commThresholdUpto${i}`).value) : Infinity,
                percentage: parseFloat(document.getElementById(`commPercentage${i}`).value)
            });
        }
        
        // Get quarterly bonus thresholds
        const quarterlyThresholds = [];
        for (let i = 1; i <= 5; i++) {
            quarterlyThresholds.push({
                threshold: parseFloat(document.getElementById(`qThreshold${i}`).value),
                upTo: i < 5 ? parseFloat(document.getElementById(`qThresholdUpto${i}`).value) : Infinity,
                bonus: parseFloat(document.getElementById(`qBonus${i}`).value)
            });
        }
        
        // Get continuity bonus thresholds
        const continuityThresholds = [];
        for (let i = 1; i <= 4; i++) {
            continuityThresholds.push({
                threshold: parseFloat(document.getElementById(`cThreshold${i}`).value),
                upTo: i < 4 ? parseFloat(document.getElementById(`cThresholdUpto${i}`).value) : Infinity,
                bonus: parseFloat(document.getElementById(`cBonus${i}`).value)
            });
        }
        
        // Get quarterly weights
        const quarterlyWeights = [
            parseFloat(document.getElementById('q1Weight').value),
            parseFloat(document.getElementById('q2Weight').value),
            parseFloat(document.getElementById('q3Weight').value),
            parseFloat(document.getElementById('q4Weight').value)
        ];
        
        const structure = {
            name,
            useRollingAverage,
            previousMonths,
            commissionThresholds,
            quarterlyThresholds,
            continuityThreshold: parseFloat(document.getElementById('continuityThreshold').value),
            continuityThresholds,
            quarterlyWeights
        };
        
        this.payoutStructures.push(structure);
        localStorage.setItem('payoutStructures', JSON.stringify(this.payoutStructures));
        
        document.getElementById('structureName').value = '';
        this.updateStructureList();
        this.updateSelectors();
        
        // Show comparison tab
        document.querySelector('.tab[data-tab="comparison"]').click();
    },
    
    /**
     * Save current performance profile settings
     */
    savePerformanceProfile: function() {
        const name = document.getElementById('performanceName').value.trim();
        if (!name) {
            alert('Please enter a performance profile name');
            return;
        }
        
        const quarterlyAchievements = [
            parseFloat(document.getElementById('q1Achievement').value),
            parseFloat(document.getElementById('q2Achievement').value),
            parseFloat(document.getElementById('q3Achievement').value),
            parseFloat(document.getElementById('q4Achievement').value)
        ];
        
        const fte = parseFloat(document.getElementById('fte').value);
        
        // Get monthly sales
        const monthlySales = [];
        for (let i = 1; i <= 12; i++) {
            monthlySales.push(parseFloat(document.getElementById(`m${i}Sales`).value));
        }
        
        // Calculate yearly target
        const yearlyTarget = PayoutSimulator.utils.calculations.calculateYearlyRevenue();
        
        const profile = {
            name,
            fte,
            quarterlyAchievements,
            monthlySales,
            yearlyTarget
        };
        
        this.performanceProfiles.push(profile);
        localStorage.setItem('performanceProfiles', JSON.stringify(this.performanceProfiles));
        
        document.getElementById('performanceName').value = '';
        this.updatePerformanceList();
        this.updateSelectors();
        
        // Show comparison tab
        document.querySelector('.tab[data-tab="comparison"]').click();
    },
    
    /**
     * Load a saved payout structure
     */
    loadPayoutStructure: function(index) {
        const structure = this.payoutStructures[index];
        this.applyPayoutStructure(structure);
        
        // Trigger calculation
        document.getElementById('calculateBtn').click();
    },
    
    /**
     * Load a saved performance profile
     */
    loadPerformanceProfile: function(index) {
        const profile = this.performanceProfiles[index];
        this.applyPerformanceProfile(profile);
        
        // Trigger calculation
        document.getElementById('calculateBtn').click();
    },
    
    /**
     * Delete a saved payout structure
     */
    deletePayoutStructure: function(index) {
        if (confirm(`Are you sure you want to delete "${this.payoutStructures[index].name}"?`)) {
            // Remove from selected if it was selected
            const selectedIndex = this.selectedStructures.indexOf(index);
            if (selectedIndex !== -1) {
                this.selectedStructures.splice(selectedIndex, 1);
            }
            
            // Adjust indices of other selections
            for (let i = 0; i < this.selectedStructures.length; i++) {
                if (this.selectedStructures[i] > index) {
                    this.selectedStructures[i]--;
                }
            }
            
            this.payoutStructures.splice(index, 1);
            localStorage.setItem('payoutStructures', JSON.stringify(this.payoutStructures));
            
            this.updateStructureList();
            this.updateSelectors();
        }
    },
    
    /**
     * Delete a saved performance profile
     */
    deletePerformanceProfile: function(index) {
        if (confirm(`Are you sure you want to delete "${this.performanceProfiles[index].name}"?`)) {
            // Remove from selected if it was selected
            const selectedIndex = this.selectedPerformances.indexOf(index);
            if (selectedIndex !== -1) {
                this.selectedPerformances.splice(selectedIndex, 1);
            }
            
            // Adjust indices of other selections
            for (let i = 0; i < this.selectedPerformances.length; i++) {
                if (this.selectedPerformances[i] > index) {
                    this.selectedPerformances[i]--;
                }
            }
            
            this.performanceProfiles.splice(index, 1);
            localStorage.setItem('performanceProfiles', JSON.stringify(this.performanceProfiles));
            
            this.updatePerformanceList();
            this.updateSelectors();
        }
    },
    
    /**
     * Apply payout structure settings from a saved structure
     */
    applyPayoutStructure: function(structure) {
        // Commission settings
        document.getElementById('useRollingAverage').checked = structure.useRollingAverage;
        document.getElementById('previousMonth1').value = structure.previousMonths[0];
        document.getElementById('previousMonth2').value = structure.previousMonths[1];
        
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`commThreshold${i}`).value = structure.commissionThresholds[i-1].threshold;
            if (i < 3) {
                document.getElementById(`commThresholdUpto${i}`).value = structure.commissionThresholds[i-1].upTo;
            }
            document.getElementById(`commPercentage${i}`).value = structure.commissionThresholds[i-1].percentage;
        }
        
        // Quarterly bonus settings
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`qThreshold${i}`).value = structure.quarterlyThresholds[i-1].threshold;
            if (i < 5) {
                document.getElementById(`qThresholdUpto${i}`).value = structure.quarterlyThresholds[i-1].upTo;
            }
            document.getElementById(`qBonus${i}`).value = structure.quarterlyThresholds[i-1].bonus;
        }
        
        // Continuity bonus settings
        document.getElementById('continuityThreshold').value = structure.continuityThreshold;
        
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`cThreshold${i}`).value = structure.continuityThresholds[i-1].threshold;
            if (i < 4) {
                document.getElementById(`cThresholdUpto${i}`).value = structure.continuityThresholds[i-1].upTo;
            }
            document.getElementById(`cBonus${i}`).value = structure.continuityThresholds[i-1].bonus;
        }
        
        // Quarterly weights
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`q${i}Weight`).value = structure.quarterlyWeights[i-1];
        }
        
        // Toggle display of previous months input based on rolling average setting
        if (structure.useRollingAverage) {
            document.getElementById('previousMonthsContainer').style.display = 'block';
        } else {
            document.getElementById('previousMonthsContainer').style.display = 'none';
        }
    },
    
    /**
     * Apply performance profile settings from a saved profile
     */
    applyPerformanceProfile: function(profile) {
        // FTE
        document.getElementById('fte').value = profile.fte;
        
        // Quarterly achievements
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`q${i}Achievement`).value = profile.quarterlyAchievements[i-1];
        }
        
        // Monthly sales
        for (let i = 1; i <= 12; i++) {
            document.getElementById(`m${i}Sales`).value = profile.monthlySales[i-1];
        }
        
        // Update yearly target (hidden)
        document.getElementById('yearlyTarget').value = profile.yearlyTarget;
        document.getElementById('yearlyTargetDisplay').value = profile.yearlyTarget.toLocaleString('de-DE');
    },
    
    /**
     * Save current form state (for restoration after comparison)
     */
    saveCurrentState: function() {
        const state = {
            useRollingAverage: document.getElementById('useRollingAverage').checked,
            previousMonth1: document.getElementById('previousMonth1').value,
            previousMonth2: document.getElementById('previousMonth2').value,
            fte: document.getElementById('fte').value,
            quarterlyAchievements: [],
            monthlySales: [],
            commissionThresholds: [],
            quarterlyThresholds: [],
            continuityThreshold: document.getElementById('continuityThreshold').value,
            continuityThresholds: [],
            quarterlyWeights: []
        };
        
        // Save quarterly achievements
        for (let i = 1; i <= 4; i++) {
            state.quarterlyAchievements.push(document.getElementById(`q${i}Achievement`).value);
            state.quarterlyWeights.push(document.getElementById(`q${i}Weight`).value);
        }
        
        // Save monthly sales
        for (let i = 1; i <= 12; i++) {
            state.monthlySales.push(document.getElementById(`m${i}Sales`).value);
        }
        
        // Save commission thresholds
        for (let i = 1; i <= 3; i++) {
            const threshold = {
                threshold: document.getElementById(`commThreshold${i}`).value
            };
            
            if (i < 3) {
                threshold.upTo = document.getElementById(`commThresholdUpto${i}`).value;
            }
            
            threshold.percentage = document.getElementById(`commPercentage${i}`).value;
            state.commissionThresholds.push(threshold);
        }
        
        // Save quarterly thresholds
        for (let i = 1; i <= 5; i++) {
            const threshold = {
                threshold: document.getElementById(`qThreshold${i}`).value
            };
            
            if (i < 5) {
                threshold.upTo = document.getElementById(`qThresholdUpto${i}`).value;
            }
            
            threshold.bonus = document.getElementById(`qBonus${i}`).value;
            state.quarterlyThresholds.push(threshold);
        }
        
        // Save continuity thresholds
        for (let i = 1; i <= 4; i++) {
            const threshold = {
                threshold: document.getElementById(`cThreshold${i}`).value
            };
            
            if (i < 4) {
                threshold.upTo = document.getElementById(`cThresholdUpto${i}`).value;
            }
            
            threshold.bonus = document.getElementById(`cBonus${i}`).value;
            state.continuityThresholds.push(threshold);
        }
        
        return state;
    },
    
    /**
     * Restore form state from saved state
     */
    restoreState: function(state) {
        document.getElementById('useRollingAverage').checked = state.useRollingAverage;
        document.getElementById('previousMonth1').value = state.previousMonth1;
        document.getElementById('previousMonth2').value = state.previousMonth2;
        document.getElementById('fte').value = state.fte;
        document.getElementById('continuityThreshold').value = state.continuityThreshold;
        
        // Restore quarterly achievements and weights
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`q${i}Achievement`).value = state.quarterlyAchievements[i-1];
            document.getElementById(`q${i}Weight`).value = state.quarterlyWeights[i-1];
        }
        
        // Restore monthly sales
        for (let i = 1; i <= 12; i++) {
            document.getElementById(`m${i}Sales`).value = state.monthlySales[i-1];
        }
        
        // Restore commission thresholds
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`commThreshold${i}`).value = state.commissionThresholds[i-1].threshold;
            if (i < 3) {
                document.getElementById(`commThresholdUpto${i}`).value = state.commissionThresholds[i-1].upTo;
            }
            document.getElementById(`commPercentage${i}`).value = state.commissionThresholds[i-1].percentage;
        }
        
        // Restore quarterly thresholds
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`qThreshold${i}`).value = state.quarterlyThresholds[i-1].threshold;
            if (i < 5) {
                document.getElementById(`qThresholdUpto${i}`).value = state.quarterlyThresholds[i-1].upTo;
            }
            document.getElementById(`qBonus${i}`).value = state.quarterlyThresholds[i-1].bonus;
        }
        
        // Restore continuity thresholds
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`cThreshold${i}`).value = state.continuityThresholds[i-1].threshold;
            if (i < 4) {
                document.getElementById(`cThresholdUpto${i}`).value = state.continuityThresholds[i-1].upTo;
            }
            document.getElementById(`cBonus${i}`).value = state.continuityThresholds[i-1].bonus;
        }
        
        // Update visibility of previous months container
        if (state.useRollingAverage) {
            document.getElementById('previousMonthsContainer').style.display = 'block';
        } else {
            document.getElementById('previousMonthsContainer').style.display = 'none';
        }
        
        // Update yearly target
        PayoutSimulator.core.ui.updateYearlyTarget();
    }
};

// Initialize scenario manager when the module is loaded
PayoutSimulator.features.scenarios.manager.init();