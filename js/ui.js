/**
 * UI management for the Payout Elasticity Simulator
 */

// Register this module with the application
PayoutSimulator.core.ui = {
    /**
     * Initialize UI components
     */
    init: function() {
        console.log("Initializing UI components...");
        
        // Initialize collapsible sections
        this.initializeCollapsibles();
        
        // Initialize tabs
        this.initializeTabs();
        
        // Initialize preset scenarios
        this.initializePresets();
        
        // Update yearly target from monthly sales
        this.updateYearlyTarget();
        
        // Fix collapsible arrows
        this.fixCollapsibleArrows();
        
        console.log("UI components initialized");
    },
    
    /**
     * Initialize collapsible sections
     */
    initializeCollapsibles: function() {
        document.querySelectorAll('.collapsible').forEach(collapsible => {
            collapsible.addEventListener('click', function() {
                this.classList.toggle('collapsed');
                const content = document.getElementById(this.id.replace('Toggle', 'Content'));
                content.classList.toggle('expanded');
            });
        });
    },
    
    /**
     * Initialize tabs
     */
    initializeTabs: function() {
        document.querySelectorAll('.tabs:not(.scenario-tabs):not(.philosophy-tabs) .tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Get the parent tabs container
                const tabsContainer = this.closest('.tabs');
                
                // Remove active class from all tabs in the same container
                tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Get the tab content container
                const contentContainer = tabsContainer.nextElementSibling.parentElement;
                
                // Hide all tab content in the same container
                contentContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Show selected tab content
                document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
                
                // Load lazy-loaded content if necessary
                if (this.dataset.tab === "effectiveness") {
                    PayoutSimulator.loadPhilosophyAnalysis();
                } else if (this.dataset.tab === "comparison") {
                    PayoutSimulator.loadScenarioComparison();
                } else if (this.dataset.tab === "roi" || this.dataset.tab === "risk") {
                    PayoutSimulator.loadAdvancedCharts();
                }
            });
        });
        
        // Special handling for scenario tabs
        document.querySelectorAll('.scenario-tabs .tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs in scenario tabs
                document.querySelectorAll('.scenario-tabs .tab').forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all scenario tab contents
                document.querySelectorAll('.scenario-manager .tab-content').forEach(content => content.classList.remove('active'));
                
                // Show selected tab content
                document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
            });
        });
    },
    
    /**
     * Initialize preset scenarios
     */
    initializePresets: function() {
        // Payout structure presets
        document.getElementById('presetConservative').addEventListener('click', function() {
            // Conservative commission settings
            document.getElementById('useRollingAverage').checked = true;
            document.getElementById('previousMonthsContainer').style.display = 'block';
            
            // Conservative thresholds - lower percentages, higher thresholds
            document.getElementById('commThreshold1').value = 15000;
            document.getElementById('commThresholdUpto1').value = 30000;
            document.getElementById('commPercentage1').value = 1.5;
            
            document.getElementById('commThreshold2').value = 30000;
            document.getElementById('commThresholdUpto2').value = 45000;
            document.getElementById('commPercentage2').value = 3;
            
            document.getElementById('commThreshold3').value = 45000;
            document.getElementById('commPercentage3').value = 4.5;
            
            // Conservative quarterly bonus settings
            document.getElementById('qThreshold1').value = 95;
            document.getElementById('qThresholdUpto1').value = 99;
            document.getElementById('qBonus1').value = 1000;
            
            document.getElementById('qThreshold2').value = 100;
            document.getElementById('qThresholdUpto2').value = 109;
            document.getElementById('qBonus2').value = 1200;
            
            document.getElementById('qThreshold3').value = 110;
            document.getElementById('qThresholdUpto3').value = 119;
            document.getElementById('qBonus3').value = 1500;
            
            document.getElementById('qThreshold4').value = 120;
            document.getElementById('qThresholdUpto4').value = 129;
            document.getElementById('qBonus4').value = 1800;
            
            document.getElementById('qThreshold5').value = 130;
            document.getElementById('qBonus5').value = 2000;
            
            // Conservative continuity bonus settings
            document.getElementById('continuityThreshold').value = 100;
            
            document.getElementById('cThreshold1').value = 100;
            document.getElementById('cThresholdUpto1').value = 109;
            document.getElementById('cBonus1').value = 300;
            
            document.getElementById('cThreshold2').value = 110;
            document.getElementById('cThresholdUpto2').value = 119;
            document.getElementById('cBonus2').value = 350;
            
            document.getElementById('cThreshold3').value = 120;
            document.getElementById('cThresholdUpto3').value = 129;
            document.getElementById('cBonus3').value = 400;
            
            document.getElementById('cThreshold4').value = 130;
            document.getElementById('cBonus4').value = 500;
            
            document.getElementById('structureName').value = 'Conservative Model';
            document.getElementById('calculateBtn').click();
        });
        
        document.getElementById('presetBalanced').addEventListener('click', function() {
            // Balanced commission settings - default settings
            document.getElementById('useRollingAverage').checked = true;
            document.getElementById('previousMonthsContainer').style.display = 'block';
            
            document.getElementById('commThreshold1').value = 10000;
            document.getElementById('commThresholdUpto1').value = 25000;
            document.getElementById('commPercentage1').value = 2;
            
            document.getElementById('commThreshold2').value = 25000;
            document.getElementById('commThresholdUpto2').value = 40000;
            document.getElementById('commPercentage2').value = 4;
            
            document.getElementById('commThreshold3').value = 40000;
            document.getElementById('commPercentage3').value = 6;
            
            // Default quarterly bonus settings
            document.getElementById('qThreshold1').value = 90;
            document.getElementById('qThresholdUpto1').value = 99;
            document.getElementById('qBonus1').value = 1200;
            
            document.getElementById('qThreshold2').value = 100;
            document.getElementById('qThresholdUpto2').value = 104;
            document.getElementById('qBonus2').value = 1600;
            
            document.getElementById('qThreshold3').value = 105;
            document.getElementById('qThresholdUpto3').value = 114;
            document.getElementById('qBonus3').value = 2000;
            
            document.getElementById('qThreshold4').value = 115;
            document.getElementById('qThresholdUpto4').value = 129;
            document.getElementById('qBonus4').value = 2400;
            
            document.getElementById('qThreshold5').value = 130;
            document.getElementById('qBonus5').value = 2800;
            
            // Default continuity bonus settings
            document.getElementById('continuityThreshold').value = 100;
            
            document.getElementById('cThreshold1').value = 100;
            document.getElementById('cThresholdUpto1').value = 104;
            document.getElementById('cBonus1').value = 400;
            
            document.getElementById('cThreshold2').value = 105;
            document.getElementById('cThresholdUpto2').value = 114;
            document.getElementById('cBonus2').value = 500;
            
            document.getElementById('cThreshold3').value = 115;
            document.getElementById('cThresholdUpto3').value = 129;
            document.getElementById('cBonus3').value = 600;
            
            document.getElementById('cThreshold4').value = 130;
            document.getElementById('cBonus4').value = 750;
            
            document.getElementById('structureName').value = 'Balanced Model';
            document.getElementById('calculateBtn').click();
        });
        
        document.getElementById('presetAggressive').addEventListener('click', function() {
            // Aggressive commission settings - higher percentages, lower thresholds
            document.getElementById('useRollingAverage').checked = false;
            document.getElementById('previousMonthsContainer').style.display = 'none';
            
            document.getElementById('commThreshold1').value = 8000;
            document.getElementById('commThresholdUpto1').value = 20000;
            document.getElementById('commPercentage1').value = 3;
            
            document.getElementById('commThreshold2').value = 20000;
            document.getElementById('commThresholdUpto2').value = 35000;
            document.getElementById('commPercentage2').value = 5;
            
            document.getElementById('commThreshold3').value = 35000;
            document.getElementById('commPercentage3').value = 8;
            
            // Aggressive quarterly bonus settings
            document.getElementById('qThreshold1').value = 90;
            document.getElementById('qThresholdUpto1').value = 99;
            document.getElementById('qBonus1').value = 1500;
            
            document.getElementById('qThreshold2').value = 100;
            document.getElementById('qThresholdUpto2').value = 104;
            document.getElementById('qBonus2').value = 2000;
            
            document.getElementById('qThreshold3').value = 105;
            document.getElementById('qThresholdUpto3').value = 114;
            document.getElementById('qBonus3').value = 2500;
            
            document.getElementById('qThreshold4').value = 115;
            document.getElementById('qThresholdUpto4').value = 129;
            document.getElementById('qBonus4').value = 3000;
            
            document.getElementById('qThreshold5').value = 130;
            document.getElementById('qBonus5').value = 3500;
            
            // Aggressive continuity bonus settings
            document.getElementById('continuityThreshold').value = 100;
            
            document.getElementById('cThreshold1').value = 100;
            document.getElementById('cThresholdUpto1').value = 104;
            document.getElementById('cBonus1').value = 500;
            
            document.getElementById('cThreshold2').value = 105;
            document.getElementById('cThresholdUpto2').value = 114;
            document.getElementById('cBonus2').value = 700;
            
            document.getElementById('cThreshold3').value = 115;
            document.getElementById('cThresholdUpto3').value = 129;
            document.getElementById('cBonus3').value = 900;
            
            document.getElementById('cThreshold4').value = 130;
            document.getElementById('cBonus4').value = 1200;
            
            document.getElementById('structureName').value = 'Aggressive Model';
            document.getElementById('calculateBtn').click();
        });
        
        // Performance profile presets
        document.getElementById('presetLow').addEventListener('click', function() {
            document.getElementById('q1Achievement').value = 75;
            document.getElementById('q2Achievement').value = 80;
            document.getElementById('q3Achievement').value = 82;
            document.getElementById('q4Achievement').value = 85;
            
            // Adjust monthly sales for low performer (70-80% of default)
            for (let i = 1; i <= 12; i++) {
                const defaultValue = parseFloat(document.getElementById(`m${i}Sales`).getAttribute('data-default') || document.getElementById(`m${i}Sales`).value);
                document.getElementById(`m${i}Sales`).value = Math.round(defaultValue * 0.75);
            }
            
            document.getElementById('performanceName').value = 'Low Performer';
            PayoutSimulator.core.ui.updateYearlyTarget();
            document.getElementById('calculateBtn').click();
        });
        
        document.getElementById('presetMedium').addEventListener('click', function() {
            document.getElementById('q1Achievement').value = 90;
            document.getElementById('q2Achievement').value = 98;
            document.getElementById('q3Achievement').value = 102;
            document.getElementById('q4Achievement').value = 105;
            
            // Reset monthly sales to default for medium performer
            const defaultSales = [20000, 22000, 25000, 28000, 30000, 32000, 35000, 28000, 30000, 32000, 35000, 40000];
            for (let i = 1; i <= 12; i++) {
                document.getElementById(`m${i}Sales`).value = defaultSales[i-1];
                if (!document.getElementById(`m${i}Sales`).hasAttribute('data-default')) {
                    document.getElementById(`m${i}Sales`).setAttribute('data-default', defaultSales[i-1]);
                }
            }
            
            document.getElementById('performanceName').value = 'Average Performer';
            PayoutSimulator.core.ui.updateYearlyTarget();
            document.getElementById('calculateBtn').click();
        });
        
        document.getElementById('presetHigh').addEventListener('click', function() {
            document.getElementById('q1Achievement').value = 120;
            document.getElementById('q2Achievement').value = 125;
            document.getElementById('q3Achievement').value = 130;
            document.getElementById('q4Achievement').value = 140;
            
            // Adjust monthly sales for high performer (120-140% of default)
            for (let i = 1; i <= 12; i++) {
                const defaultValue = parseFloat(document.getElementById(`m${i}Sales`).getAttribute('data-default') || document.getElementById(`m${i}Sales`).value);
                document.getElementById(`m${i}Sales`).value = Math.round(defaultValue * 1.3);
            }
            
            document.getElementById('performanceName').value = 'Top Performer';
            PayoutSimulator.core.ui.updateYearlyTarget();
            document.getElementById('calculateBtn').click();
        });
    },
    
    /**
     * Update the yearly target based on sum of monthly sales
     */
    updateYearlyTarget: function() {
        const yearlyTotal = PayoutSimulator.utils.calculations.calculateYearlyRevenue();
        
        // Update hidden input
        document.getElementById('yearlyTarget').value = yearlyTotal;
        
        // Update display input with formatted value
        document.getElementById('yearlyTargetDisplay').value = yearlyTotal.toLocaleString('de-DE');
    },
    
    /**
     * Fix the collapsible sections to properly show state
     */
    fixCollapsibleArrows: function() {
        document.querySelectorAll('.collapsible').forEach(collapsible => {
            const content = document.getElementById(collapsible.id.replace('Toggle', 'Content'));
            
            // If content is not expanded, mark as collapsed
            if (!content.classList.contains('expanded')) {
                collapsible.classList.add('collapsed');
            } else {
                collapsible.classList.remove('collapsed');
            }
        });
    },
    
    /**
     * Update UI with calculation results
     */
    updateUI: function(results) {
        // This function is a placeholder that will be fully implemented in features/charts/basic-charts.js
        console.log("Results calculated:", results);
    }
};