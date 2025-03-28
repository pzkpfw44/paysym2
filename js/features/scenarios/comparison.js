/**
 * Scenario comparison functionality for Payout Elasticity Simulator
 * This is a lazy-loaded module for advanced scenario comparison
 */

// Register this module with the application
PayoutSimulator.features.scenarios.comparison = {
    // Chart instances
    comparisonChart: null,
    elasticityComparisonChart: null,
    
    /**
     * Initialize scenario comparison functionality
     */
    init: function() {
        console.log("Initializing scenario comparison...");
        
        // Initialize comparison chart if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded. Charts cannot be initialized.");
            return;
        }
        
        // Comparison Chart
        this.comparisonChart = new Chart(
            document.getElementById('comparisonChart'),
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Commission',
                            data: [],
                            backgroundColor: '#555555'
                        },
                        {
                            label: 'Quarterly Bonus',
                            data: [],
                            backgroundColor: '#009988'
                        },
                        {
                            label: 'Continuity Bonus',
                            data: [],
                            backgroundColor: '#d2004b'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Payout (€)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '€' + value.toLocaleString('de-DE');
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                    return label;
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Elasticity Comparison Chart
        this.elasticityComparisonChart = new Chart(
            document.getElementById('elasticityComparisonChart'),
            {
                type: 'line',
                data: {
                    labels: Array.from({length: 41}, (_, i) => (i * 5) + '%'),
                    datasets: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Payout (€)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '€' + value.toLocaleString('de-DE');
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Target Achievement (%)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                    return label;
                                }
                            }
                        }
                    }
                }
            }
        );
        
        console.log("Scenario comparison initialized");
    },
    
    /**
     * Run scenario comparison with selected structures and performances
     */
    runScenarioComparison: function() {
        const scenarioManager = PayoutSimulator.features.scenarios.manager;
        
        // Get selected structures and performances
        const selectedStructures = scenarioManager.selectedStructures;
        const selectedPerformances = scenarioManager.selectedPerformances;
        
        if (selectedStructures.length === 0 || selectedPerformances.length === 0) {
            alert('Please select at least one payout structure and one performance profile to compare');
            return;
        }
        
        console.log("Running comparison with", selectedStructures.length, "structures and", 
                    selectedPerformances.length, "performance profiles");
        
        // Get selected structures and performances
        const structures = selectedStructures.map(index => scenarioManager.payoutStructures[index]);
        const performances = selectedPerformances.map(index => scenarioManager.performanceProfiles[index]);
        
        // Run comparison
        const results = this.runComparison(structures, performances);
        
        // Show comparison results
        document.getElementById('scenarioComparison').style.display = 'block';
        
        // Update comparison chart
        this.updateComparisonChart(results);
        
        // Update comparison table
        this.updateComparisonTable(results);
        
        // If more than one structure is selected, show elasticity comparison
        if (structures.length > 1) {
            // Compare elasticity
            const elasticityComparison = this.compareElasticity(structures, performances[0]);
            
            // Update elasticity comparison chart
            this.updateElasticityComparisonChart(elasticityComparison);
        } else {
            // Hide elasticity comparison container
            document.getElementById('elasticityComparisonContainer').style.display = 'none';
        }
        
        // Store original form state to restore after comparison
        const originalState = scenarioManager.saveCurrentState();
        
        // Restore original state after comparison
        scenarioManager.restoreState(originalState);
    },
    
    /**
     * Run a comparison between payout structures and performance profiles
     */
    runComparison: function(structures, performances) {
        const results = [];
        const scenarioManager = PayoutSimulator.features.scenarios.manager;
        
        // For each payout structure
        structures.forEach(structure => {
            // Apply the payout structure settings
            scenarioManager.applyPayoutStructure(structure);
            
            // For each performance profile
            performances.forEach(performance => {
                // Apply the performance profile settings
                scenarioManager.applyPerformanceProfile(performance);
                
                // Calculate the results
                const quarterlies = [
                    parseFloat(document.getElementById('q1Achievement').value),
                    parseFloat(document.getElementById('q2Achievement').value),
                    parseFloat(document.getElementById('q3Achievement').value),
                    parseFloat(document.getElementById('q4Achievement').value)
                ];
                
                const monthlySales = [];
                for (let i = 1; i <= 12; i++) {
                    monthlySales.push(parseFloat(document.getElementById(`m${i}Sales`).value));
                }
                
                const fte = parseFloat(document.getElementById('fte').value);
                
                // Calculate the results
                const calculationResults = PayoutSimulator.utils.calculations.calculateTotalPayout(quarterlies, monthlySales, fte);
                
                // Calculate elasticity metrics
                const elasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
                
                // Store the results with structure and performance names
                results.push({
                    structureName: structure.name,
                    performanceName: performance.name,
                    results: calculationResults,
                    elasticity: elasticityData,
                    structureData: structure,
                    performanceData: performance
                });
            });
        });
        
        return results;
    },
    
    /**
     * Update comparison chart with results
     */
    updateComparisonChart: function(results) {
        // Create labels combining structure and performance names
        const labels = results.map(r => `${r.structureName} / ${r.performanceName}`);
        
        // Extract commission, quarterly bonus, and continuity bonus data
        const commissionData = results.map(r => r.results.totalCommission);
        const quarterlyBonusData = results.map(r => r.results.totalQuarterlyBonus);
        const continuityBonusData = results.map(r => r.results.totalContinuityBonus);
        
        // Update chart data
        this.comparisonChart.data.labels = labels;
        this.comparisonChart.data.datasets[0].data = commissionData;
        this.comparisonChart.data.datasets[1].data = quarterlyBonusData;
        this.comparisonChart.data.datasets[2].data = continuityBonusData;
        this.comparisonChart.update();
    },
    
    /**
     * Update comparison table with results
     */
    updateComparisonTable: function(results) {
        const tableBody = document.getElementById('comparisonTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        results.forEach(result => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${result.structureName}</td>
                <td>${result.performanceName}</td>
                <td>${PayoutSimulator.utils.formatters.formatPercent(result.results.avgAchievement)}</td>
                <td>${PayoutSimulator.utils.formatters.formatCurrency(result.results.totalPayout)}</td>
                <td>${PayoutSimulator.utils.formatters.formatCurrency(result.results.totalCommission)}</td>
                <td>${PayoutSimulator.utils.formatters.formatCurrency(result.results.totalQuarterlyBonus)}</td>
                <td>${PayoutSimulator.utils.formatters.formatCurrency(result.results.totalContinuityBonus)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    },
    
    /**
     * Compare the elasticity of different payout structures
     */
    compareElasticity: function(structures, performances) {
        // For simplicity, we'll use just one performance profile to compare structures
        const performance = performances;
        const scenarioManager = PayoutSimulator.features.scenarios.manager;
        const results = [];
        
        // For each payout structure
        structures.forEach(structure => {
            // Apply the payout structure settings
            scenarioManager.applyPayoutStructure(structure);
            
            // Apply the performance profile settings
            scenarioManager.applyPerformanceProfile(performance);
            
            // Get elasticity data
            const elasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
            
            results.push({
                structureName: structure.name,
                elasticity: elasticityData
            });
        });
        
        return results;
    },
    
    /**
     * Update elasticity comparison chart
     */
    updateElasticityComparisonChart: function(elasticityComparison) {
        // Clear existing datasets
        this.elasticityComparisonChart.data.datasets = [];
        
        // Define colors with better contrast
        const colors = [
            { color: '#d2004b', light: 'rgba(210, 0, 75, 0.1)' },
            { color: '#009988', light: 'rgba(0, 153, 136, 0.1)' },
            { color: '#0066cc', light: 'rgba(0, 102, 204, 0.1)' }
        ];
        
        // Add datasets with improved visualization
        elasticityComparison.forEach((data, index) => {
            const colorSet = colors[index % colors.length];
            
            // Ensure we have data points at standard intervals for better comparison
            const standardizedData = [];
            for (let achievement = 0; achievement <= 200; achievement += 5) {
                // Find closest match in the data
                const point = data.elasticity.find(d => d.achievement === achievement);
                if (point) {
                    standardizedData.push(point.totalExcludingContinuity);
                } else {
                    // Interpolate between points
                    const lowerPoints = data.elasticity.filter(d => d.achievement < achievement);
                    const upperPoints = data.elasticity.filter(d => d.achievement > achievement);
                    
                    if (lowerPoints.length > 0 && upperPoints.length > 0) {
                        const lowerPoint = lowerPoints.reduce((a, b) => a.achievement > b.achievement ? a : b);
                        const upperPoint = upperPoints.reduce((a, b) => a.achievement < b.achievement ? a : b);
                        
                        const range = upperPoint.achievement - lowerPoint.achievement;
                        const position = (achievement - lowerPoint.achievement) / range;
                        
                        const interpolatedValue = lowerPoint.totalExcludingContinuity + 
                            (upperPoint.totalExcludingContinuity - lowerPoint.totalExcludingContinuity) * position;
                        
                        standardizedData.push(interpolatedValue);
                    } else if (lowerPoints.length > 0) {
                        // Use the highest available point
                        standardizedData.push(lowerPoints.reduce((a, b) => a.achievement > b.achievement ? a : b).totalExcludingContinuity);
                    } else if (upperPoints.length > 0) {
                        // Use the lowest available point
                        standardizedData.push(upperPoints.reduce((a, b) => a.achievement < b.achievement ? a : b).totalExcludingContinuity);
                    } else {
                        standardizedData.push(0); // Fallback
                    }
                }
            }
            
            this.elasticityComparisonChart.data.datasets.push({
                label: data.structureName,
                data: standardizedData,
                borderColor: colorSet.color,
                backgroundColor: colorSet.light,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                tension: 0.1
            });
        });
        
        // Add annotations for key targets
        if (this.elasticityComparisonChart.options.plugins && 
            typeof Chart.Annotation !== 'undefined' && 
            this.elasticityComparisonChart.options.plugins.annotation) {
                
            this.elasticityComparisonChart.options.plugins.annotation = {
                annotations: {
                    target100Line: {
                        type: 'line',
                        xMin: 20, // 100% achievement will be the 20th data point (0, 5, 10, ..., 100)
                        xMax: 20,
                        borderColor: 'rgba(0, 0, 0, 0.3)',
                        borderWidth: 1,
                        borderDash: [6, 6]
                    }
                }
            };
        }
        
        // Update chart
        this.elasticityComparisonChart.update();
        
        // Show the container
        document.getElementById('elasticityComparisonContainer').style.display = 'block';
        
        // Add a comparison summary if we have multiple structures
        if (elasticityComparison.length > 1) {
            // Get key metrics for comparison
            const comparisons = elasticityComparison.map(data => {
                const payoutAt100 = data.elasticity.find(d => d.achievement === 100)?.totalExcludingContinuity || 0;
                const payoutAt150 = data.elasticity.find(d => d.achievement === 150)?.totalExcludingContinuity || 0;
                const maxPayout = data.elasticity[data.elasticity.length - 1].totalExcludingContinuity;
                
                return {
                    name: data.structureName,
                    payoutAt100,
                    payoutAt150,
                    maxPayout,
                    ratioMax: payoutAt100 > 0 ? maxPayout / payoutAt100 : 0
                };
            });
            
            // Create comparison table
            const comparisonTable = document.createElement('table');
            comparisonTable.className = 'comparison-table';
            comparisonTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Structure</th>
                        <th>Target Payout (100%)</th>
                        <th>High Payout (150%)</th>
                        <th>Max Multiple</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparisons.map(c => `
                        <tr>
                            <td>${c.name}</td>
                            <td>${PayoutSimulator.utils.formatters.formatCurrency(c.payoutAt100)}</td>
                            <td>${PayoutSimulator.utils.formatters.formatCurrency(c.payoutAt150)}</td>
                            <td>${c.ratioMax.toFixed(1)}x</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            // Add table to the container
            const container = document.getElementById('elasticityComparisonContainer');
            
            // Remove existing table if present
            const existingTable = container.querySelector('table');
            if (existingTable) {
                container.removeChild(existingTable);
            }
            
            container.appendChild(comparisonTable);
        }
    }
};

// Initialize comparison functionality when the module is loaded
PayoutSimulator.features.scenarios.comparison.init();