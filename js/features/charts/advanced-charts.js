/**
 * Advanced chart functionality for the Payout Elasticity Simulator
 * This is a lazy-loaded module for ROI and risk analysis charts
 */

// Register this module with the application
PayoutSimulator.features.charts.advanced = {
    // Chart instances
    roiChart: null,
    riskChart: null,
    
    /**
     * Initialize advanced charts
     */
    init: function() {
        console.log("Initializing advanced charts...");
        
        // Only initialize if the page is loaded and Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded. Charts cannot be initialized.");
            return;
        }
        
        // ROI Chart
        this.roiChart = new Chart(
            document.getElementById('roiChart'),
            {
                type: 'line',
                data: {
                    labels: Array.from({length: 21}, (_, i) => (i * 10) + '%'),
                    datasets: [
                        {
                            label: 'Revenue',
                            data: Array(21).fill(0),
                            borderColor: '#0066cc',
                            backgroundColor: 'rgba(0, 102, 204, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Payout',
                            data: Array(21).fill(0),
                            borderColor: '#d2004b',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'ROI Ratio',
                            data: Array(21).fill(0),
                            borderColor: '#00b347',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount (€)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '€' + value.toLocaleString('de-DE');
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'ROI Ratio'
                            },
                            grid: {
                                drawOnChartArea: false
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
                                    if (context.dataset.yAxisID === 'y1') {
                                        label += context.raw.toFixed(1) + ':1';
                                    } else {
                                        label += PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Risk Chart
        this.riskChart = new Chart(
            document.getElementById('riskChart'),
            {
                type: 'bar',
                data: {
                    labels: ['Low (80%)', 'Below Target (90%)', 'Target (100%)', 'Above Target (110%)', 'High (120%)', 'Maximum (150%)'],
                    datasets: [
                        {
                            label: 'Payout',
                            data: Array(6).fill(0),
                            backgroundColor: [
                                '#00b347',
                                '#83ca9d',
                                '#ffaa00',
                                '#ffcc66',
                                '#ff8866',
                                '#d2004b'
                            ],
                            borderWidth: 0
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
                                text: 'Performance Scenario'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = 'Payout: ';
                                    label += PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                    return label;
                                }
                            }
                        }
                    }
                }
            }
        );
        
        console.log("Advanced charts initialization complete");
    },
    
    /**
     * Update ROI analysis
     */
    updateROIAnalysis: function() {
        this.simulateROI();
    },
    
    /**
     * Simulate ROI across achievement levels
     */
    simulateROI: function() {
        const yearlyTarget = parseFloat(document.getElementById('yearlyTarget').value);
        const fte = parseFloat(document.getElementById('fte').value);
        const results = [];
        
        // Get quarterly achievements for normalization
        const quarterlyAchievements = [
            parseFloat(document.getElementById('q1Achievement').value),
            parseFloat(document.getElementById('q2Achievement').value),
            parseFloat(document.getElementById('q3Achievement').value),
            parseFloat(document.getElementById('q4Achievement').value)
        ];
        
        // Get base monthly sales
        const actualMonthlySales = [];
        for (let j = 1; j <= 12; j++) {
            const salesInput = document.getElementById(`m${j}Sales`);
            actualMonthlySales.push(parseFloat(salesInput.value));
        }
        
        // Normalize monthly sales to 100% achievement
        const normalizedMonthlySales = [];
        
        // Apply quarterly normalization - each month gets normalized by its quarter's achievement
        for (let q = 0; q < 4; q++) {
            const quarterAchievement = quarterlyAchievements[q] / 100; // Convert to decimal
            for (let m = 0; m < 3; m++) {
                const monthIndex = q * 3 + m;
                if (quarterAchievement > 0) {
                    normalizedMonthlySales[monthIndex] = actualMonthlySales[monthIndex] / quarterAchievement;
                } else {
                    normalizedMonthlySales[monthIndex] = actualMonthlySales[monthIndex];
                }
            }
        }
        
        // Get rolling average option
        const useRollingAverage = document.getElementById('useRollingAverage').checked;
        
        // Get previous months data
        const previousMonths = [
            parseFloat(document.getElementById('previousMonth1').value),
            parseFloat(document.getElementById('previousMonth2').value)
        ];
        
        // Simulate from 0% to 200% in 10% increments
        for (let i = 0; i <= 20; i++) {
            const achievement = i * 10;
            
            // Calculate revenue based on achievement
            const revenue = yearlyTarget * (achievement / 100);
            
            // Calculate payout for this achievement level
            const quarterlyBonus = PayoutSimulator.utils.calculations.calculateQuarterlyBonus(achievement, fte) * 4; // For 4 quarters
            
            // Scale normalized monthly sales by achievement percentage
            const scaledMonthlySales = normalizedMonthlySales.map(sales => sales * achievement / 100);
            
            // Calculate commission for the scaled sales - pass full scaledMonthlySales array
            const commissionsForElasticity = scaledMonthlySales.map((m, index) => 
                PayoutSimulator.utils.calculations.calculateCommission(m, fte, useRollingAverage, index, previousMonths, scaledMonthlySales));
                
            const totalCommission = commissionsForElasticity.reduce((sum, c) => sum + c, 0);
            
            // Total excluding continuity bonus
            const totalPayout = quarterlyBonus + totalCommission;
            
            // Calculate ROI
            const roi = totalPayout > 0 ? revenue / totalPayout : 0;
            
            results.push({
                achievement,
                revenue,
                payout: totalPayout,
                roi
            });
        }
        
        // Update ROI chart
        this.roiChart.data.datasets[0].data = results.map(d => d.revenue);
        this.roiChart.data.datasets[1].data = results.map(d => d.payout);
        this.roiChart.data.datasets[2].data = results.map(d => d.roi);
        this.roiChart.update();
        
        // Update ROI metrics
        const targetData = results.find(d => d.achievement === 100) || { revenue: 0, payout: 0, roi: 0 };
        
        document.getElementById('revenuePerEuro').textContent = PayoutSimulator.utils.formatters.formatCurrency(targetData.roi);
        
        // Calculate marginal values
        const targetIndex = results.findIndex(d => d.achievement === 100);
        if (targetIndex > 0 && targetIndex < results.length - 1) {
            const prevPoint = results[targetIndex - 1];
            const nextPoint = results[targetIndex + 1];
            
            const marginalRevenue = (nextPoint.revenue - prevPoint.revenue) / 20; // 20% difference
            const marginalCompensation = (nextPoint.payout - prevPoint.payout) / 20;
            
            document.getElementById('marginalRevenue').textContent = PayoutSimulator.utils.formatters.formatCurrency(marginalRevenue);
            document.getElementById('marginalCompensation').textContent = PayoutSimulator.utils.formatters.formatCurrency(marginalCompensation);
        }
        
        // If elasticity ranges are available from the basic charts module, update table
        if (PayoutSimulator.features.charts.basic && 
            PayoutSimulator.features.charts.basic.elasticityRangeResults) {
            
            this.updateElasticityRangesTable(PayoutSimulator.features.charts.basic.elasticityRangeResults);
        }
        
        return results;
    },
    
    /**
     * Update elasticity ranges table
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
    },
    
    /**
     * Update risk analysis
     */
    updateRiskAnalysis: function() {
        const riskAssessment = PayoutSimulator.utils.calculations.generateRiskAssessment();
        
        // Update risk cards
        document.getElementById('lowRiskPayout').textContent = PayoutSimulator.utils.formatters.formatCurrency(riskAssessment.lowRiskPayout);
        document.getElementById('targetRiskPayout').textContent = PayoutSimulator.utils.formatters.formatCurrency(riskAssessment.targetPayout);
        document.getElementById('highRiskPayout').textContent = PayoutSimulator.utils.formatters.formatCurrency(riskAssessment.highRiskPayout);
        
        // Update risk assessment text
        document.getElementById('riskAssessment').innerHTML = `
            <p><strong>Risk Rating: ${riskAssessment.riskRating}</strong></p>
            <p>At target performance (100%), compensation represents ${riskAssessment.payoutPercentages.target.toFixed(1)}% of estimated profit.</p>
            <p>At high performance (150%), this increases to ${riskAssessment.payoutPercentages.highRisk.toFixed(1)}% of estimated profit.</p>
            <p><strong>Recommendation:</strong> ${riskAssessment.recommendation}</p>
        `;
        
        // Update risk chart
        const fte = parseFloat(document.getElementById('fte').value);
        const scenarioLevels = [80, 90, 100, 110, 120, 150];
        
        const riskPayouts = scenarioLevels.map(level => {
            const results = PayoutSimulator.utils.calculations.calculateTotalPayout(
                Array(4).fill(level),
                Array(12).fill(20000 * level / 100),
                fte
            );
            return results.totalPayout;
        });
        
        this.riskChart.data.datasets[0].data = riskPayouts;
        this.riskChart.update();
    }
};

// Initialize advanced charts when the module is loaded
PayoutSimulator.features.charts.advanced.init();