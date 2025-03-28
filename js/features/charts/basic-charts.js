/**
 * Basic chart functionality for the Payout Elasticity Simulator
 */

// Register this module with the application
PayoutSimulator.features.charts.basic = {
    // Chart instances
    targetAchievementGauge: null,
    totalPayoutGauge: null,
    monthlyBreakdownChart: null,
    elasticityChart: null,
    annualPayoutComposition: null,
    quarterlyComparisonChart: null,
    
    /**
     * Initialize charts
     */
    init: function() {
        console.log("Initializing basic charts...");
        
        // Only initialize if the page is loaded and Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded. Charts cannot be initialized.");
            return;
        }
        
        // Target Achievement Gauge
        this.targetAchievementGauge = new Chart(
            document.getElementById('targetAchievementGauge'),
            {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [0, 100],
                        backgroundColor: [
                            '#d2004b',
                            '#eeeeee'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '75%',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            enabled: false
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            }
        );
        
        // Total Payout Gauge
        this.totalPayoutGauge = new Chart(
            document.getElementById('totalPayoutGauge'),
            {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [0, 100],
                        backgroundColor: [
                            '#d2004b',
                            '#eeeeee'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '75%',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            enabled: false
                        },
                        legend: {
                            display: false
                        }
                    }
                }
            }
        );
        
        // Annual Payout Composition
        this.annualPayoutComposition = new Chart(
            document.getElementById('annualPayoutComposition'),
            {
                type: 'doughnut',
                data: {
                    labels: ['Commission', 'Quarterly Bonus', 'Continuity Bonus'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: [
                            '#555555',
                            '#009988',
                            '#d2004b'
                        ],
                        borderWidth: 1,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '50%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    size: 14
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw;
                                    const percentage = context.parsed;
                                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                    const percentageValue = total > 0 ? (percentage / total * 100).toFixed(1) + '%' : '0%';
                                    return `${label}: ${PayoutSimulator.utils.formatters.formatCurrency(value)} (${percentageValue})`;
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Quarterly Performance Comparison
        this.quarterlyComparisonChart = new Chart(
            document.getElementById('quarterlyComparisonChart'),
            {
                type: 'bar',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Achievement',
                            data: [0, 0, 0, 0],
                            backgroundColor: '#009988',
                            borderColor: '#009988',
                            borderWidth: 1,
                            order: 2,
                            yAxisID: 'y'
                        },
                        {
                            type: 'line',
                            label: 'Payout',
                            data: [0, 0, 0, 0],
                            borderColor: '#d2004b',
                            backgroundColor: 'rgba(210, 0, 75, 0.1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1,
                            order: 1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Achievement (%)'
                            },
                            min: 0
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false
                            },
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
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.dataset.yAxisID === 'y1') {
                                        label += PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                    } else {
                                        label += context.raw.toFixed(1) + '%';
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Monthly Breakdown Chart
        this.monthlyBreakdownChart = new Chart(
            document.getElementById('monthlyBreakdownChart'),
            {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                        {
                            label: 'Commission',
                            data: Array(12).fill(0),
                            backgroundColor: '#555555',
                            stack: 'stack1'
                        },
                        {
                            label: 'Quarterly Bonus',
                            data: Array(12).fill(0),
                            backgroundColor: '#009988',
                            stack: 'stack1'
                        },
                        {
                            label: 'Continuity Bonus',
                            data: Array(12).fill(0),
                            backgroundColor: '#d2004b',
                            stack: 'stack1'
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
        
        // Elasticity Chart
        this.elasticityChart = new Chart(
            document.getElementById('elasticityChart'),
            {
                type: 'line',
                data: {
                    labels: Array.from({length: 41}, (_, i) => (i * 5) + '%'),
                    datasets: [
                        {
                            label: 'Total Payout (excl. Continuity)',
                            data: Array(41).fill(0),
                            borderColor: '#d2004b',
                            backgroundColor: 'rgba(210, 0, 75, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1
                        },
                        {
                            label: 'Commission Only',
                            data: Array(41).fill(0),
                            borderColor: '#555555',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1,
                            borderDash: [5, 5]
                        },
                        {
                            label: 'Quarterly Bonus Only',
                            data: Array(41).fill(0),
                            borderColor: '#009988',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1,
                            borderDash: [10, 5]
                        }
                    ]
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
        
        console.log("Basic charts initialization complete");
    },
    
    /**
     * Update UI with calculation results
     * @param {Object} results - Results from calculation
     */
    updateUI: function(results) {
        // Update achievement gauge
        this.targetAchievementGauge.data.datasets[0].data = [results.avgAchievement, 200 - results.avgAchievement];
        this.targetAchievementGauge.update();
        document.getElementById('targetAchievementValue').textContent = PayoutSimulator.utils.formatters.formatPercent(results.avgAchievement);
        
        // Update payout gauge (assume max payout of 40000€)
        const payoutPercentage = Math.min(results.totalPayout / 40000 * 100, 100);
        this.totalPayoutGauge.data.datasets[0].data = [payoutPercentage, 100 - payoutPercentage];
        this.totalPayoutGauge.update();
        document.getElementById('totalPayoutValue').textContent = PayoutSimulator.utils.formatters.formatCurrency(results.totalPayout);
        
        // Update annual payout composition chart
        this.annualPayoutComposition.data.datasets[0].data = [
            results.totalCommission,
            results.totalQuarterlyBonus,
            results.totalContinuityBonus
        ];
        this.annualPayoutComposition.update();
        
        // Update KPI cards
        this.updateKPIMetrics(results);
        
        // Update quarterly performance comparison chart
        const quarterlyAchievements = [
            parseFloat(document.getElementById('q1Achievement').value),
            parseFloat(document.getElementById('q2Achievement').value),
            parseFloat(document.getElementById('q3Achievement').value),
            parseFloat(document.getElementById('q4Achievement').value)
        ];
        
        // Calculate total payout per quarter
        const quarterlyPayouts = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            // Sum of quarterly bonus, continuity bonus, and quarterly commission
            const qCommission = results.commissions.slice(i*3, (i+1)*3).reduce((sum, c) => sum + c, 0);
            quarterlyPayouts[i] = results.quarterlyBonuses[i] + results.continuityBonuses[i] + qCommission;
        }
        
        this.quarterlyComparisonChart.data.datasets[0].data = quarterlyAchievements;
        this.quarterlyComparisonChart.data.datasets[1].data = quarterlyPayouts;
        this.quarterlyComparisonChart.update();
        
        // Update summary cards
        document.getElementById('totalCommission').textContent = PayoutSimulator.utils.formatters.formatCurrency(results.totalCommission);
        document.getElementById('totalQuarterlyBonus').textContent = PayoutSimulator.utils.formatters.formatCurrency(results.totalQuarterlyBonus);
        document.getElementById('totalContinuityBonus').textContent = PayoutSimulator.utils.formatters.formatCurrency(results.totalContinuityBonus);
        document.getElementById('avgMonthlyCommission').textContent = PayoutSimulator.utils.formatters.formatCurrency(results.totalCommission / 12);
        
        // Update quarterly breakdowns
        for (let i = 0; i < 4; i++) {
            const q = i + 1;
            
            document.getElementById(`q${q}AchievementResult`).textContent = PayoutSimulator.utils.formatters.formatPercent(quarterlyAchievements[i]);
            document.getElementById(`q${q}Bonus`).textContent = PayoutSimulator.utils.formatters.formatCurrency(results.quarterlyBonuses[i]);
            document.getElementById(`q${q}Continuity`).textContent = PayoutSimulator.utils.formatters.formatCurrency(results.continuityBonuses[i]);
            
            // Calculate quarterly commission subtotal (3 months)
            const qCommission = results.commissions.slice(i*3, (i+1)*3).reduce((sum, c) => sum + c, 0);
            document.getElementById(`q${q}Total`).textContent = PayoutSimulator.utils.formatters.formatCurrency(results.quarterlyBonuses[i] + results.continuityBonuses[i] + qCommission);
        }
        
        // Update monthly breakdown chart
        // Create arrays for each dataset
        const commissionData = [...results.commissions];
        const quarterlyBonusData = Array(12).fill(0);
        const continuityBonusData = Array(12).fill(0);
        
        // Assign quarterly and continuity bonuses to the 3rd month of each quarter
        quarterlyBonusData[2] = results.quarterlyBonuses[0];  // March (Q1)
        quarterlyBonusData[5] = results.quarterlyBonuses[1];  // June (Q2)
        quarterlyBonusData[8] = results.quarterlyBonuses[2];  // September (Q3)
        quarterlyBonusData[11] = results.quarterlyBonuses[3]; // December (Q4)
        
        continuityBonusData[2] = results.continuityBonuses[0];  // March (Q1)
        continuityBonusData[5] = results.continuityBonuses[1];  // June (Q2)
        continuityBonusData[8] = results.continuityBonuses[2];  // September (Q3)
        continuityBonusData[11] = results.continuityBonuses[3]; // December (Q4)
        
        this.monthlyBreakdownChart.data.datasets[0].data = commissionData;
        this.monthlyBreakdownChart.data.datasets[1].data = quarterlyBonusData;
        this.monthlyBreakdownChart.data.datasets[2].data = continuityBonusData;
        this.monthlyBreakdownChart.update();
    },
    
    /**
     * Update KPI metrics
     * @param {Object} results - Results from calculation
     */
    updateKPIMetrics: function(results) {
        const yearlyTarget = parseFloat(document.getElementById('yearlyTarget').value);
        const yearlyRevenue = results.yearlyRevenue;
        
        // Revenue vs Target
        const revenueVsTarget = (yearlyRevenue / yearlyTarget * 100).toFixed(1) + '%';
        document.getElementById('revenueVsTarget').textContent = revenueVsTarget;
        
        // Payout % of Revenue
        const payoutPercentage = (results.totalPayout / yearlyRevenue * 100).toFixed(2) + '%';
        document.getElementById('payoutPercentage').textContent = payoutPercentage;
        
        // Next Threshold - Find the next quarterly bonus threshold
        const avgAchievement = results.avgAchievement;
        let nextThreshold = "N/A";
        
        // Get quarterly thresholds
        const thresholds = [];
        for (let i = 1; i <= 5; i++) {
            thresholds.push({
                threshold: parseFloat(document.getElementById(`qThreshold${i}`).value)
            });
        }
        
        // Sort thresholds
        thresholds.sort((a, b) => a.threshold - b.threshold);
        
        // Find next threshold
        for (const threshold of thresholds) {
            if (threshold.threshold > avgAchievement) {
                nextThreshold = threshold.threshold + "% (+" + (threshold.threshold - avgAchievement).toFixed(1) + "%)";
                break;
            }
        }
        
        document.getElementById('nextThreshold').textContent = nextThreshold;
        
        // Year-End Projection
        // Simple projection based on current trajectory
        // For a more sophisticated projection, you could use trend analysis
        const currentMonth = new Date().getMonth(); // 0-11
        
        let yearEndProjection = results.totalPayout;
        
        // If we're not at year end, project based on current performance
        if (currentMonth < 11) {
            // Calculate average monthly payout so far
            const monthsPassed = currentMonth + 1;
            const monthsRemaining = 12 - monthsPassed;
            const avgMonthlyPayout = results.totalPayout / 12; // Using simulation for full year
            
            // Project remaining months at current rate
            yearEndProjection = avgMonthlyPayout * 12;
        }
        
        document.getElementById('yearEndProjection').textContent = PayoutSimulator.utils.formatters.formatCurrency(yearEndProjection);
    },
    
    /**
     * Update elasticity chart
     */
    updateElasticityChart: function() {
        const elasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        
        // Check if we have the initialized chart
        if (!this.elasticityChart || !this.elasticityChart.data) {
            console.warn("Elasticity chart not initialized yet");
            return;
        }
        
        // Map data for chart display - using only every 5th point for smoother chart
        const chartData = [];
        for (let i = 0; i <= 200; i += 5) {
            chartData.push(elasticityData[i]);
        }
        
        this.elasticityChart.data.datasets[0].data = chartData.map(d => d.totalExcludingContinuity);
        this.elasticityChart.data.datasets[1].data = chartData.map(d => d.commission);
        this.elasticityChart.data.datasets[2].data = chartData.map(d => d.quarterlyBonus);
        this.elasticityChart.update();
        
        // Update elasticity insight
        document.getElementById('elasticityInsight').innerHTML = PayoutSimulator.utils.formatters.generateElasticityInsight(elasticityData);
        
        // Calculate elasticity per range for the ROI analysis
        this.calculateElasticityPerRange(elasticityData);
    },
    
    /**
     * Calculate elasticity per achievement range
     * @param {Array} elasticityData - Elasticity data from simulation
     */
    calculateElasticityPerRange: function(elasticityData) {
        const rangeResults = {};
        
        // Define ranges
        const ranges = [
            { name: '0to40', start: 0, end: 40 },
            { name: '41to70', start: 41, end: 70 },
            { name: '71to89', start: 71, end: 89 },
            { name: '90to99', start: 90, end: 99 },
            { name: '100to104', start: 100, end: 104 },
            { name: '105to114', start: 105, end: 114 },
            { name: '115to129', start: 115, end: 129 },
            { name: '130plus', start: 130, end: 200 }
        ];
        
        ranges.forEach(range => {
            // Find data points in this range
            const pointsInRange = elasticityData.filter(d => 
                d.achievement >= range.start && d.achievement <= range.end);
            
            if (pointsInRange.length >= 2) {
                const firstPoint = pointsInRange[0];
                const lastPoint = pointsInRange[pointsInRange.length - 1];
                
                const achievementDiff = lastPoint.achievement - firstPoint.achievement;
                const payoutDiff = lastPoint.totalExcludingContinuity - firstPoint.totalExcludingContinuity;
                
                const elasticity = achievementDiff > 0 ? payoutDiff / achievementDiff : 0;
                
                // Calculate revenue impact per percentage point
                const yearlyTarget = parseFloat(document.getElementById('yearlyTarget').value);
                const revenuePerPoint = yearlyTarget / 100;
                
                rangeResults[range.name] = {
                    elasticity: elasticity,
                    revenuePerPoint: revenuePerPoint,
                    roi: revenuePerPoint > 0 ? revenuePerPoint / elasticity : 0
                };
            } else {
                rangeResults[range.name] = {
                    elasticity: 0,
                    revenuePerPoint: 0,
                    roi: 0
                };
            }
        });
        
        // Store the range results for later use
        this.elasticityRangeResults = rangeResults;
        
        // Update the elasticity ranges table if it exists
        if (document.getElementById('elasticity0to40')) {
            this.updateElasticityRangesTable(rangeResults);
        }
    },
    
    /**
     * Update elasticity ranges table
     * @param {Object} rangeResults - Elasticity range results
     */
    updateElasticityRangesTable: function(rangeResults) {
        for (const range in rangeResults) {
            if (rangeResults.hasOwnProperty(range)) {
                document.getElementById(`elasticity${range}`).textContent = 
                    PayoutSimulator.utils.formatters.formatCurrency(rangeResults[range].elasticity);
                document.getElementById(`revenue${range}`).textContent = 
                    PayoutSimulator.utils.formatters.formatCurrency(rangeResults[range].revenuePerPoint);
                document.getElementById(`roi${range}`).textContent = 
                    PayoutSimulator.utils.formatters.formatRatio(rangeResults[range].roi);
            }
        }
    }
};

// Initialize charts when the module is loaded
PayoutSimulator.features.charts.basic.init();