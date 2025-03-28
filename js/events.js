/**
 * Event handlers for the Payout Elasticity Simulator
 */

// Register this module with the application
PayoutSimulator.core.events = {
    /**
     * Initialize event listeners
     */
    init: function() {
        console.log("Setting up event handlers...");
        
        // Setup core event listeners
        this.setupEventListeners();
        
        // Initial calculation
        document.getElementById('calculateBtn').click();
        
        console.log("Event handlers initialized");
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', this.onCalculateClick);
        
        // Rolling average checkbox
        document.getElementById('useRollingAverage').addEventListener('change', this.onRollingAverageChange);
        
        // Monthly sales inputs
        document.querySelectorAll('.monthly-sales').forEach(input => {
            input.addEventListener('change', PayoutSimulator.core.ui.updateYearlyTarget);
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', this.onResetClick);
        
        // Save structure button
        document.getElementById('saveStructureBtn').addEventListener('click', () => {
            // Lazy load the scenario manager if needed
            if (!PayoutSimulator.features.scenarios.manager) {
                PayoutSimulator.loadModule('features/scenarios/manager').then(() => {
                    PayoutSimulator.features.scenarios.manager.savePayoutStructure();
                });
            } else {
                PayoutSimulator.features.scenarios.manager.savePayoutStructure();
            }
        });
        
        // Save performance button
        document.getElementById('savePerformanceBtn').addEventListener('click', () => {
            // Lazy load the scenario manager if needed
            if (!PayoutSimulator.features.scenarios.manager) {
                PayoutSimulator.loadModule('features/scenarios/manager').then(() => {
                    PayoutSimulator.features.scenarios.manager.savePerformanceProfile();
                });
            } else {
                PayoutSimulator.features.scenarios.manager.savePerformanceProfile();
            }
        });
        
        // Run comparison button
        document.getElementById('runComparisonBtn').addEventListener('click', () => {
            PayoutSimulator.loadScenarioComparison().then((module) => {
                if (module && typeof module.runScenarioComparison === 'function') {
                    module.runScenarioComparison();
                }
            });
        });
        
        // Export buttons
        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            PayoutSimulator.loadExports().then((module) => {
                if (module && typeof module.exportToPdf === 'function') {
                    module.exportToPdf();
                }
            });
        });
        
        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            PayoutSimulator.loadExports().then((module) => {
                if (module && typeof module.exportToCsv === 'function') {
                    module.exportToCsv();
                }
            });
        });
        
        // Deep Analysis button
        document.getElementById('deepAnalysisBtn').addEventListener('click', () => {
            // First switch to philosophy tab
            document.querySelector('.tabs:not(.philosophy-tabs):not(.scenario-tabs) .tab[data-tab="effectiveness"]').click();
            
            // Then load philosophy analysis
            PayoutSimulator.loadPhilosophyAnalysis().then((module) => {
                if (module && typeof module.performDeepAnalysis === 'function') {
                    module.performDeepAnalysis();
                }
            });
        });
        
        // Quarterly weights validation
        document.querySelectorAll('#q1Weight, #q2Weight, #q3Weight, #q4Weight').forEach(input => {
            input.addEventListener('change', this.validateQuarterlyWeights);
        });
    },
    
    /**
     * Handle Calculate button click
     */
    onCalculateClick: function() {
        // Get quarterly achievements
        const quarterlies = [
            parseFloat(document.getElementById('q1Achievement').value),
            parseFloat(document.getElementById('q2Achievement').value),
            parseFloat(document.getElementById('q3Achievement').value),
            parseFloat(document.getElementById('q4Achievement').value)
        ];
        
        // Get monthly sales values
        const monthlySales = [];
        for (let i = 1; i <= 12; i++) {
            const salesInput = document.getElementById(`m${i}Sales`);
            monthlySales.push(parseFloat(salesInput.value));
        }
        
        const fte = parseFloat(document.getElementById('fte').value);
        
        // Calculate results
        const results = PayoutSimulator.utils.calculations.calculateTotalPayout(quarterlies, monthlySales, fte);
        
        // Update UI - will call the UI update function from the appropriate module
        if (PayoutSimulator.features.charts && PayoutSimulator.features.charts.basic) {
            PayoutSimulator.features.charts.basic.updateUI(results);
        } else {
            // This is a placeholder until the chart module is loaded
            PayoutSimulator.core.ui.updateUI(results);
        }
        
        // Update elasticity chart if available
        if (PayoutSimulator.features.charts && PayoutSimulator.features.charts.basic && 
            typeof PayoutSimulator.features.charts.basic.updateElasticityChart === 'function') {
            PayoutSimulator.features.charts.basic.updateElasticityChart();
        }
        
        // Update ROI analysis if available
        if (PayoutSimulator.features.charts && PayoutSimulator.features.charts.advanced && 
            typeof PayoutSimulator.features.charts.advanced.updateROIAnalysis === 'function') {
            PayoutSimulator.features.charts.advanced.updateROIAnalysis();
        }
        
        // Update risk analysis if available
        if (PayoutSimulator.features.charts && PayoutSimulator.features.charts.advanced && 
            typeof PayoutSimulator.features.charts.advanced.updateRiskAnalysis === 'function') {
            PayoutSimulator.features.charts.advanced.updateRiskAnalysis();
        }
        
        // Update philosophy analysis if available
        if (PayoutSimulator.features.philosophy && PayoutSimulator.features.philosophy.analysis && 
            typeof PayoutSimulator.features.philosophy.analysis.updatePhilosophyAnalysis === 'function') {
            PayoutSimulator.features.philosophy.analysis.updatePhilosophyAnalysis();
        }
    },
    
    /**
     * Handle Rolling Average checkbox change
     */
    onRollingAverageChange: function() {
        if (this.checked) {
            document.getElementById('previousMonthsContainer').style.display = 'block';
        } else {
            document.getElementById('previousMonthsContainer').style.display = 'none';
        }
        
        // Recalculate
        document.getElementById('calculateBtn').click();
    },
    
    /**
     * Handle Reset button click
     */
    onResetClick: function() {
        // Reset form values to defaults
        document.getElementById('fte').value = 1.0;
        document.getElementById('q1Achievement').value = 95;
        document.getElementById('q2Achievement').value = 105;
        document.getElementById('q3Achievement').value = 110;
        document.getElementById('q4Achievement').value = 120;
        
        // Reset previous months
        document.getElementById('previousMonth1').value = 18000;
        document.getElementById('previousMonth2').value = 19000;
        
        // Reset commission settings
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
        
        // Reset quarterly weights
        document.getElementById('q1Weight').value = 25;
        document.getElementById('q2Weight').value = 25;
        document.getElementById('q3Weight').value = 25;
        document.getElementById('q4Weight').value = 25;
        
        // Reset continuity settings
        document.getElementById('continuityThreshold').value = 100;
        document.getElementById('cBonus1').value = 400;
        document.getElementById('cBonus2').value = 500;
        document.getElementById('cBonus3').value = 600;
        document.getElementById('cBonus4').value = 750;
        
        // Reset quarterly bonus thresholds
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
        
        // Reset monthly sales
        const defaultSales = [20000, 22000, 25000, 28000, 30000, 32000, 35000, 28000, 30000, 32000, 35000, 40000];
        for (let i = 1; i <= 12; i++) {
            document.getElementById(`m${i}Sales`).value = defaultSales[i-1];
            if (!document.getElementById(`m${i}Sales`).hasAttribute('data-default')) {
                document.getElementById(`m${i}Sales`).setAttribute('data-default', defaultSales[i-1]);
            }
        }
        
        // Update yearly target
        PayoutSimulator.core.ui.updateYearlyTarget();
        
        // Trigger calculation
        document.getElementById('calculateBtn').click();
    },
    
    /**
     * Validate quarterly weights (should sum to 100%)
     */
    validateQuarterlyWeights: function() {
        const weights = [
            parseFloat(document.getElementById('q1Weight').value),
            parseFloat(document.getElementById('q2Weight').value),
            parseFloat(document.getElementById('q3Weight').value),
            parseFloat(document.getElementById('q4Weight').value)
        ];
        
        const sum = weights.reduce((total, weight) => total + weight, 0);
        
        const warningElement = document.getElementById('weightWarning');
        
        if (Math.abs(sum - 100) > 0.01) {
            warningElement.style.display = 'block';
        } else {
            warningElement.style.display = 'none';
        }
    }
};