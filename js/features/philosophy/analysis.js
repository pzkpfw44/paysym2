/**
 * Compensation Philosophy Analysis for Payout Elasticity Simulator
 * This is a lazy-loaded module for advanced analysis of compensation models
 */

// Register this module with the application
PayoutSimulator.features.philosophy.analysis = {
    // Chart instances
    philosophyRadarChart: null,
    prizeLadderChart: null,
    distributionChart: null,
    psychologyChart: null,
    
    /**
     * Initialize philosophy analysis
     */
    init: function() {
        console.log("Initializing philosophy analysis...");
        
        // Initialize philosophy tabs event listeners
        this.initializePhilosophyEvents();
        
        // Initialize charts
        this.initializePhilosophyCharts();
        
        // Perform initial analysis
        this.updatePhilosophyAnalysis();
        
        console.log("Philosophy analysis initialized");
    },
    
    /**
     * Initialize philosophy tab event listeners
     */
    initializePhilosophyEvents: function() {
        // Philosophy tab navigation
        document.querySelectorAll('.philosophy-tabs .tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.philosophy-tabs .tab').forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all tab content
                document.querySelectorAll('.philosophy-analysis-section .tab-content').forEach(content => content.classList.remove('active'));
                
                // Show selected tab content
                document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
            });
        });
        
        // Check if recommendations module is loaded, and if not, load it
        if (!PayoutSimulator.features.philosophy.recommendations) {
            PayoutSimulator.loadModule('features/philosophy/recommendations');
        }
        
        // Add "Experimental" badge to psychology tab
        setTimeout(function() {
            const psychologyTab = document.querySelector('.philosophy-tabs .tab[data-tab="psychologyAnalysis"]');
            if (psychologyTab && !psychologyTab.querySelector('.experimental-badge')) {
                const badge = document.createElement('span');
                badge.className = 'experimental-badge';
                badge.textContent = 'EXPERIMENTAL';
                psychologyTab.appendChild(badge);
            }
        }, 100);
        
        // Add tooltips to the radar chart legend items
        // This adds interactive explanation for each dimension
        document.querySelectorAll('#radarChartLegend li').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'rgba(210, 0, 75, 0.1)';
            });
            item.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'transparent';
            });
        });
    },
    
    /**
     * Initialize philosophy charts
     */
    initializePhilosophyCharts: function() {
        // Only initialize if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded. Philosophy charts cannot be initialized.");
            return;
        }
        
        // Philosophy Radar Chart
        this.philosophyRadarChart = new Chart(
            document.getElementById('philosophyRadarChart'),
            {
                type: 'radar',
                data: {
                    labels: ['Size of Prize', 'Below Target Support', 'At Target Incentive', 'Above Target Stretch', 'Near-Miss Psychology', 'Psychological Distance'],
                    datasets: [{
                        label: 'Current Model',
                        data: [0, 0, 0, 0, 0, 0],
                        fill: true,
                        backgroundColor: 'rgba(85, 85, 85, 0.2)',
                        borderColor: 'rgb(85, 85, 85)',
                        pointBackgroundColor: 'rgb(85, 85, 85)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(85, 85, 85)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 10,
                            ticks: {
                                stepSize: 2
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
                                    const dimension = context.chart.data.labels[context.dataIndex];
                                    let description = '';
                                    
                                    switch (dimension) {
                                        case 'Size of Prize':
                                            description = 'Overall magnitude of potential variable compensation';
                                            break;
                                        case 'Below Target Support':
                                            description = 'Incentives available for underperforming periods';
                                            break;
                                        case 'At Target Incentive':
                                            description = 'Strength of motivation to hit 100% exactly';
                                            break;
                                        case 'Above Target Stretch':
                                            description = 'Reward for exceeding target expectations';
                                            break;
                                        case 'Near-Miss Psychology':
                                            description = 'Psychological tension when approaching target';
                                            break;
                                        case 'Psychological Distance':
                                            description = 'Optimal spacing between achievement thresholds';
                                            break;
                                    }
                                    
                                    return [
                                        context.dataset.label + ': ' + context.raw + '/10',
                                        description
                                    ];
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Prize Ladder Chart
        this.prizeLadderChart = new Chart(
            document.getElementById('prizeLadderChart'),
            {
                type: 'bar',
                data: {
                    labels: ['≤70%', '71-89%', '90-99%', '100%', '101-104%', '105-114%', '115-129%', '≥130%'],
                    datasets: [
                        {
                            label: 'Payout at Level',
                            data: Array(8).fill(0),
                            backgroundColor: [
                                '#ffcccc',
                                '#ffdddd',
                                '#ffeeee',
                                '#d2004b',
                                '#ffeecc',
                                '#ffddaa',
                                '#ffcc88',
                                '#ffbb66'
                            ],
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Achievement Level'
                            }
                        },
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
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Distribution Chart
        this.distributionChart = new Chart(
            document.getElementById('distributionChart'),
            {
                type: 'pie',
                data: {
                    labels: ['Below Target (<100%)', 'At Target (100%)', 'Above Target (>100%)'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: [
                            '#ffaaaa',
                            '#d2004b',
                            '#ff9900'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round(value / total * 100) : 0;
                                    return `${label}: ${percentage}%`;
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // Psychology Chart
        this.psychologyChart = new Chart(
            document.getElementById('psychologyChart'),
            {
                type: 'bar',
                data: {
                    labels: ['90%', '91%', '92%', '93%', '94%', '95%', '96%', '97%', '98%', '99%', '100%', '101%', '102%', '103%', '104%', '105%'],
                    datasets: [{
                        label: 'Incremental Payout',
                        data: Array(16).fill(0),
                        backgroundColor: function(context) {
                            const index = context.dataIndex;
                            // Highlight key thresholds
                            if (index === 10) return '#d2004b'; // 100%
                            if (index === 5) return '#ff8866';  // 95%
                            if (index === 15) return '#ff8866'; // 105%
                            return '#9966cc';
                        },
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Achievement Level'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Incremental Payout (€)'
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
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    return context[0].label + ' Achievement';
                                },
                                label: function(context) {
                                    return 'Additional payout: ' + PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                },
                                afterLabel: function(context) {
                                    const index = context.dataIndex;
                                    if (index === 10) { // 100%
                                        return 'Key target threshold';
                                    }
                                    if (index === 5 || index === 15) { // 95% or 105%
                                        return 'Quarterly bonus threshold';
                                    }
                                    return '';
                                }
                            }
                        }
                    }
                }
            }
        );
    },
    
    /**
     * Perform deep analysis of the compensation model
     */
    performDeepAnalysis: function() {
        // This function would be called from the deep analysis button
        console.log("Performing deep analysis...");
        
        // First switch to philosophy tab
        document.querySelector('.tabs:not(.philosophy-tabs):not(.scenario-tabs) .tab[data-tab="effectiveness"]').click();
        
        // Update philosophy analysis
        this.updatePhilosophyAnalysis();
        
        // If recommendations are available, load them
        if (PayoutSimulator.features.philosophy.recommendations) {
            // Switch to the recommendations tab
            document.querySelector('.philosophy-tabs .tab[data-tab="recommendations"]').click();
            
            // Generate recommendations
            if (typeof PayoutSimulator.features.philosophy.recommendations.updateRecommendations === 'function') {
                PayoutSimulator.features.philosophy.recommendations.updateRecommendations();
            }
        }
    },
    
    /**
     * Update philosophy analysis based on current model
     */
    updatePhilosophyAnalysis: function() {
        // Get elasticity data
        const elasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        
        // Get risk assessment data
        const riskAssessment = PayoutSimulator.utils.calculations.generateRiskAssessment();
        
        // Calculate philosophy metrics
        const philosophyMetrics = this.calculatePhilosophyMetrics(elasticityData, riskAssessment);
        
        // Update UI with metrics
        this.updatePhilosophyUI(philosophyMetrics, elasticityData);
        
        // Generate executive summary
        const executiveSummary = this.generateExecutiveSummary(philosophyMetrics, elasticityData);
        document.getElementById('executiveSummary').innerHTML = executiveSummary;
    },
    
    /**
     * Calculate philosophy metrics with proper understanding of thresholds
     */
    calculatePhilosophyMetrics: function(elasticityData, riskAssessment) {
        // Get base salary
        const baseSalary = parseFloat(document.getElementById('baseSalary').value) || 0;
        
        // Find payouts at key achievement levels - from elasticity data
        const payoutAt70 = elasticityData.find(d => d.achievement === 70)?.totalExcludingContinuity || 0;
        const payoutAt90 = elasticityData.find(d => d.achievement === 90)?.totalExcludingContinuity || 0;
        const payoutAt95 = elasticityData.find(d => d.achievement === 95)?.totalExcludingContinuity || 0;
        const payoutAt99 = elasticityData.find(d => d.achievement === 99)?.totalExcludingContinuity || 0;
        const payoutAt100 = elasticityData.find(d => d.achievement === 100)?.totalExcludingContinuity || 0;
        const payoutAt105 = elasticityData.find(d => d.achievement === 105)?.totalExcludingContinuity || 0;
        const payoutAt115 = elasticityData.find(d => d.achievement === 115)?.totalExcludingContinuity || 0;
        const payoutAt130 = elasticityData.find(d => d.achievement === 130)?.totalExcludingContinuity || 0;
        const maxPayout = elasticityData[elasticityData.length - 1].totalExcludingContinuity;
        
        // Get quarterly thresholds from settings
        const qThresholds = [];
        for (let i = 1; i <= 5; i++) {
            qThresholds.push(parseFloat(document.getElementById(`qThreshold${i}`).value));
        }
        qThresholds.sort((a, b) => a - b);
        
        // Calculate size of prize metrics
        const targetPayout = payoutAt100;
        const targetMultiple = targetPayout > 0 ? maxPayout / targetPayout : 0;
        
        // Calculate threshold spacing and psychological metrics
        // Analyze actual threshold effect based on elasticity data, not just settings
        const jumps = [
            { from: 95, to: 100, change: payoutAt100 - payoutAt95 },
            { from: 99, to: 100, change: payoutAt100 - payoutAt99 },
            { from: 100, to: 105, change: payoutAt105 - payoutAt100 },
            { from: 105, to: 115, change: payoutAt115 - payoutAt105 }
        ];
        
        // Find the most significant jumps
        jumps.sort((a, b) => b.change - a.change);
        const primaryJump = jumps[0];
        
        // If target jump is the primary jump, that's good for psych impact
        const isTargetJumpPrimary = primaryJump.from === 99 && primaryJump.to === 100;
        
        // Calculate the actual jump percentages (relative increases)
        const jumpPercentages = {};
        jumps.forEach(jump => {
            const fromValue = elasticityData.find(d => d.achievement === jump.from)?.totalExcludingContinuity || 0;
            if (fromValue > 0) {
                jumpPercentages[`${jump.from}_${jump.to}`] = (jump.change / fromValue) * 100;
            } else {
                jumpPercentages[`${jump.from}_${jump.to}`] = 0;
            }
        });
        
        // The target jump is the 99% to 100% jump
        const targetJump = payoutAt100 - payoutAt99;
        const targetJumpPercentage = payoutAt99 > 0 ? (targetJump / payoutAt99) * 100 : 0;
        
        // Calculate threshold gaps based on actual payouts, not just settings
        const thresholdPoints = [90, 100, 105, 115, 130];
        const actualGaps = [];
        
        for (let i = 1; i < thresholdPoints.length; i++) {
            const prevPoint = thresholdPoints[i-1];
            const currPoint = thresholdPoints[i];
            actualGaps.push(currPoint - prevPoint);
        }
        
        const avgGap = actualGaps.length > 0 ? 
            actualGaps.reduce((sum, gap) => sum + gap, 0) / actualGaps.length : 0;
        
        // Calculate distribution metrics
        // We want to analyze what percentage of "potential" is available at each range
        const belowTargetPotential = payoutAt90;
        const atTargetPotential = payoutAt100 - payoutAt90;
        const aboveTargetPotential = maxPayout - payoutAt100;
        const totalPotential = maxPayout;
        
        // Calculate percentages
        const belowTargetShare = totalPotential > 0 ? (belowTargetPotential / totalPotential) * 100 : 0;
        const atTargetShare = totalPotential > 0 ? (atTargetPotential / totalPotential) * 100 : 0;
        const aboveTargetShare = totalPotential > 0 ? (aboveTargetPotential / totalPotential) * 100 : 0;
        
        // Calculate pay mix ratios
        const targetTotalCompensation = baseSalary + targetPayout;
        const payMixRatio = baseSalary > 0 ? (targetPayout / baseSalary) * 100 : 0;
        
        // Calculate yearly target revenue percentage
        const yearlyTarget = parseFloat(document.getElementById('yearlyTarget').value);
        const targetPayoutPercentage = yearlyTarget > 0 ? (targetPayout / yearlyTarget) * 100 : 0;
        
        // SCORE CALCULATION - More balanced approach
        
        // Size of Prize score (1-10)
        let sizeOfPrizeScore = 5; // Default
        
        // If target multiple is very low, penalize
        if (targetMultiple < 1.5) sizeOfPrizeScore -= 2;
        else if (targetMultiple < 2) sizeOfPrizeScore -= 1;
        
        // If target multiple is in good range, bonus
        if (targetMultiple >= 2 && targetMultiple <= 3) sizeOfPrizeScore += 2;
        else if (targetMultiple > 3) sizeOfPrizeScore += 1;
        
        // Consider payout as percentage of revenue
        if (targetPayoutPercentage > 5) sizeOfPrizeScore -= 1;
        else if (targetPayoutPercentage < 1) sizeOfPrizeScore -= 1;
        else if (targetPayoutPercentage >= 1.5 && targetPayoutPercentage <= 3) sizeOfPrizeScore += 1;
        
        // Distribution score (1-10)
        let distributionScore = 5; // Default
        
        // Balance between below/at/above target
        if (belowTargetShare < 15) distributionScore -= 2;
        else if (belowTargetShare < 25) distributionScore -= 1;
        else if (belowTargetShare > 50) distributionScore -= 2;
        else if (belowTargetShare >= 25 && belowTargetShare <= 40) distributionScore += 1;
        
        if (atTargetShare < 10) distributionScore -= 1;
        else if (atTargetShare >= 15 && atTargetShare <= 25) distributionScore += 1;
        
        if (aboveTargetShare < 30) distributionScore -= 2;
        else if (aboveTargetShare < 40) distributionScore -= 1;
        else if (aboveTargetShare >= 40 && aboveTargetShare <= 60) distributionScore += 2;
        
        // Near-miss incentive score (1-10)
        let nearMissScore = 5; // Default
        
        // If target jump is significant, increase score
        if (targetJumpPercentage >= 15) nearMissScore += 2;
        else if (targetJumpPercentage >= 10) nearMissScore += 1;
        else if (targetJumpPercentage < 5) nearMissScore -= 2;
        else if (targetJumpPercentage < 10) nearMissScore -= 1;
        
        // If target jump is primary, that's good
        if (isTargetJumpPrimary) nearMissScore += 1;
        
        // Psychological distance score (1-10)
        let psychDistanceScore = 5; // Default
        
        // Optimal threshold spacing is 10-15%
        if (avgGap >= 10 && avgGap <= 15) psychDistanceScore += 2;
        else if (avgGap < 5) psychDistanceScore -= 2;
        else if (avgGap < 10) psychDistanceScore -= 1;
        else if (avgGap > 25) psychDistanceScore -= 2;
        else if (avgGap > 15) psychDistanceScore -= 1;
        
        // Cap scores between 1-10
        sizeOfPrizeScore = Math.max(1, Math.min(10, sizeOfPrizeScore));
        distributionScore = Math.max(1, Math.min(10, distributionScore));
        nearMissScore = Math.max(1, Math.min(10, nearMissScore));
        psychDistanceScore = Math.max(1, Math.min(10, psychDistanceScore));
        
        // Overall psychological mechanisms score
        const psychMechanismsScore = Math.round((nearMissScore + psychDistanceScore) / 2);
        
        // Evaluate typicality indicators
        const targetMultipleTypicality = PayoutSimulator.utils.formatters.getTypicalityIndicator(targetMultiple, 2, 3);
        const relativeSizeTypicality = PayoutSimulator.utils.formatters.getTypicalityIndicator(targetPayoutPercentage, 1, 3);
        const payMixTypicality = PayoutSimulator.utils.formatters.getTypicalityIndicator(payMixRatio, 15, 35);
        const belowTargetTypicality = PayoutSimulator.utils.formatters.getTypicalityIndicator(belowTargetShare, 20, 40);
        const atTargetTypicality = PayoutSimulator.utils.formatters.getTypicalityIndicator(atTargetShare, 10, 25);
        const aboveTargetTypicality = PayoutSimulator.utils.formatters.getTypicalityIndicator(aboveTargetShare, 40, 60);
        const targetJumpTypicality = PayoutSimulator.utils.formatters.getTypicalityIndicator(targetJumpPercentage, 10, 20);
        
        return {
            // Size of Prize metrics
            sizeOfPrize: {
                score: sizeOfPrizeScore,
                label: this.getSizeOfPrizeLabel(sizeOfPrizeScore),
                maxPotential: maxPayout,
                targetPayout: targetPayout,
                targetMultiple: targetMultiple,
                relativeSizePercentage: targetPayoutPercentage,
                targetMultipleTypicality: targetMultipleTypicality,
                relativeSizeTypicality: relativeSizeTypicality
            },
            
            // Pay Mix metrics
            payMix: {
                baseSalary: baseSalary,
                targetVariable: targetPayout,
                targetTotal: targetTotalCompensation,
                ratio: payMixRatio,
                typicality: payMixTypicality
            },
            
            // Distribution metrics
            distribution: {
                score: distributionScore,
                label: this.getDistributionLabel(distributionScore),
                belowTargetShare: belowTargetShare,
                atTargetShare: atTargetShare,
                aboveTargetShare: aboveTargetShare,
                belowTargetTypicality: belowTargetTypicality,
                atTargetTypicality: atTargetTypicality,
                aboveTargetTypicality: aboveTargetTypicality
            },
            
            // Psychological metrics
            psychology: {
                score: psychMechanismsScore,
                label: this.getPsychologyLabel(psychMechanismsScore),
                nearMiss: {
                    score: nearMissScore,
                    label: this.getNearMissLabel(nearMissScore),
                    targetJump: targetJump,
                    targetJumpPercentage: targetJumpPercentage,
                    targetJumpTypicality: targetJumpTypicality,
                    isTargetJumpPrimary: isTargetJumpPrimary,
                    primaryJump: primaryJump
                },
                psychDistance: {
                    score: psychDistanceScore,
                    label: this.getPsychDistanceLabel(psychDistanceScore),
                    avgGap: avgGap,
                    thresholdGaps: actualGaps
                }
            },
            
            // Radar chart data
            radarData: [
                sizeOfPrizeScore,
                Math.min(10, belowTargetShare / 5), // Scale to 0-10
                Math.min(10, atTargetShare / 3),    // Scale to 0-10
                Math.min(10, aboveTargetShare / 6), // Scale to 0-10
                nearMissScore,
                psychDistanceScore
            ]
        };
    },
    
    /**
     * Update the UI with philosophy metrics
     */
    updatePhilosophyUI: function(metrics, elasticityData) {
        // Size of Prize
        document.getElementById('sizeOfPrizeScore').textContent = metrics.sizeOfPrize.score;
        document.getElementById('sizeOfPrizeLabel').textContent = metrics.sizeOfPrize.label;
        document.getElementById('sizeOfPrizeDescription').textContent = this.getSizeOfPrizeDescription(metrics.sizeOfPrize.score);
        
        document.getElementById('maxPotentialValue').textContent = PayoutSimulator.utils.formatters.formatCurrency(metrics.sizeOfPrize.maxPotential);
        document.getElementById('targetMultipleValue').textContent = metrics.sizeOfPrize.targetMultiple.toFixed(1) + 'x';
        document.getElementById('relativeSizeValue').textContent = metrics.sizeOfPrize.relativeSizePercentage.toFixed(1) + '%';
        
        // Update typicality indicators
        document.getElementById('targetMultipleTypicality').textContent = PayoutSimulator.utils.formatters.getTypicalityText(metrics.sizeOfPrize.targetMultipleTypicality);
        document.getElementById('targetMultipleTypicality').className = 'typicality-indicator typicality-' + metrics.sizeOfPrize.targetMultipleTypicality;
        
        document.getElementById('relativeSizeTypicality').textContent = PayoutSimulator.utils.formatters.getTypicalityText(metrics.sizeOfPrize.relativeSizeTypicality);
        document.getElementById('relativeSizeTypicality').className = 'typicality-indicator typicality-' + metrics.sizeOfPrize.relativeSizeTypicality;
        
        // Pay Mix section
        document.getElementById('baseSalaryValue').textContent = PayoutSimulator.utils.formatters.formatCurrency(metrics.payMix.baseSalary);
        document.getElementById('targetVariableValue').textContent = PayoutSimulator.utils.formatters.formatCurrency(metrics.payMix.targetVariable);
        document.getElementById('targetTotalCompValue').textContent = PayoutSimulator.utils.formatters.formatCurrency(metrics.payMix.targetTotal);
        document.getElementById('payMixRatioValue').textContent = metrics.payMix.ratio.toFixed(1) + '%';
        
        document.getElementById('payMixTypicality').textContent = PayoutSimulator.utils.formatters.getTypicalityText(metrics.payMix.typicality);
        document.getElementById('payMixTypicality').className = 'typicality-indicator typicality-' + metrics.payMix.typicality;
        
        // Generate prize ladder analysis
        const prizeLadderText = this.generatePrizeLadderAnalysis(metrics, elasticityData);
        document.getElementById('prizeLadderAnalysis').innerHTML = prizeLadderText;
        
        // Prize Ladder Chart
        const prizeLabels = ['≤70%', '71-89%', '90-99%', '100%', '101-104%', '105-114%', '115-129%', '≥130%'];
        
        // Extract payout at each level with improved granularity
        const prizeLadderData = [
            elasticityData.find(d => d.achievement === 70)?.totalExcludingContinuity || 0,
            elasticityData.find(d => d.achievement === 85)?.totalExcludingContinuity || 0,
            elasticityData.find(d => d.achievement === 95)?.totalExcludingContinuity || 0,
            elasticityData.find(d => d.achievement === 100)?.totalExcludingContinuity || 0,
            elasticityData.find(d => d.achievement === 102)?.totalExcludingContinuity || 0, // 101-104% range
            elasticityData.find(d => d.achievement === 110)?.totalExcludingContinuity || 0,
            elasticityData.find(d => d.achievement === 120)?.totalExcludingContinuity || 0,
            elasticityData.find(d => d.achievement === 150)?.totalExcludingContinuity || 0
        ];
        
        this.prizeLadderChart.data.labels = prizeLabels;
        this.prizeLadderChart.data.datasets[0].data = prizeLadderData;
        this.prizeLadderChart.update();
        
        // Distribution metrics
        document.getElementById('rewardDistributionScore').textContent = metrics.distribution.score;
        document.getElementById('rewardDistributionLabel').textContent = metrics.distribution.label;
        document.getElementById('rewardDistributionDescription').textContent = this.getDistributionDescription(metrics.distribution.score);
        
        document.getElementById('belowTargetShare').textContent = metrics.distribution.belowTargetShare.toFixed(1) + '%';
        document.getElementById('atTargetShare').textContent = metrics.distribution.atTargetShare.toFixed(1) + '%';
        document.getElementById('aboveTargetShare').textContent = metrics.distribution.aboveTargetShare.toFixed(1) + '%';
        
        // Update typicality indicators for distribution
        document.getElementById('belowTargetTypicality').textContent = PayoutSimulator.utils.formatters.getTypicalityText(metrics.distribution.belowTargetTypicality);
        document.getElementById('belowTargetTypicality').className = 'typicality-indicator typicality-' + metrics.distribution.belowTargetTypicality;
        
        document.getElementById('atTargetTypicality').textContent = PayoutSimulator.utils.formatters.getTypicalityText(metrics.distribution.atTargetTypicality);
        document.getElementById('atTargetTypicality').className = 'typicality-indicator typicality-' + metrics.distribution.atTargetTypicality;
        
        document.getElementById('aboveTargetTypicality').textContent = PayoutSimulator.utils.formatters.getTypicalityText(metrics.distribution.aboveTargetTypicality);
        document.getElementById('aboveTargetTypicality').className = 'typicality-indicator typicality-' + metrics.distribution.aboveTargetTypicality;
        
        // Distribution Chart
        this.distributionChart.data.datasets[0].data = [
            metrics.distribution.belowTargetShare,
            metrics.distribution.atTargetShare,
            metrics.distribution.aboveTargetShare
        ];
        this.distributionChart.update();
        
        // Generate distribution insight
        const distributionInsight = this.generateDistributionInsight(metrics);
        document.getElementById('distributionInsight').innerHTML = distributionInsight;
        
        // Psychological metrics
        document.getElementById('psychMechanismsScore').textContent = metrics.psychology.score;
        document.getElementById('psychMechanismsLabel').textContent = metrics.psychology.label;
        document.getElementById('psychMechanismsDescription').textContent = this.getPsychologyDescription(metrics.psychology.score);
        
        document.getElementById('nearMissValue').textContent = metrics.psychology.nearMiss.label;
        document.getElementById('targetJumpValue').textContent = PayoutSimulator.utils.formatters.formatCurrency(metrics.psychology.nearMiss.targetJump);
        document.getElementById('psychDistanceValue').textContent = metrics.psychology.psychDistance.label;
        
        // Update target jump typicality
        document.getElementById('targetJumpTypicality').textContent = PayoutSimulator.utils.formatters.getTypicalityText(metrics.psychology.nearMiss.targetJumpTypicality);
        document.getElementById('targetJumpTypicality').className = 'typicality-indicator typicality-' + metrics.psychology.nearMiss.targetJumpTypicality;
        
        // Prepare complete psychology chart data - explicitly calculate ALL incremental payouts
        this.updatePsychologyChartData(elasticityData);
        
        // Generate psychology insight
        const psychologyInsight = this.generatePsychologyInsight(metrics);
        document.getElementById('psychologyInsight').innerHTML = psychologyInsight;
        
        // Update radar chart with just the current model data (recommendations will add projected data)
        this.philosophyRadarChart.data.datasets = [{
            label: 'Current Model',
            data: metrics.radarData,
            fill: true,
            backgroundColor: 'rgba(85, 85, 85, 0.2)',
            borderColor: 'rgb(85, 85, 85)',
            pointBackgroundColor: 'rgb(85, 85, 85)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(85, 85, 85)'
        }];
        this.philosophyRadarChart.update();
        
        // Update prize insight
        const prizeInsight = this.generatePrizeInsight(metrics);
        document.getElementById('prizeInsightText').innerHTML = prizeInsight;
        
        // Initialize recommendations based on current goal selection if recommendations module is available
        if (PayoutSimulator.features.philosophy.recommendations) {
            const goalSelect = document.getElementById('recommendationGoal');
            if (goalSelect) {
                PayoutSimulator.features.philosophy.recommendations.updateRecommendations(metrics, elasticityData, goalSelect.value);
            }
        }
    },
    
    /**
     * Update psychology chart with accurate incremental payout data
     */
    updatePsychologyChartData: function(elasticityData) {
        if (!this.psychologyChart) return;
        
        // We need to analyze the payout jumps more precisely
        // For each percentage point from 90% to 105%, calculate the incremental payout
        const psychLabels = Array.from({length: 16}, (_, i) => (i + 90) + '%');
        const psychData = [];
        
        // Ensure we have complete elasticity data
        for (let i = 0; i < 16; i++) {
            const achievement = i + 90;
            
            // Find the current point and previous point
            const currentPoint = elasticityData.find(d => d.achievement === achievement);
            const prevPoint = elasticityData.find(d => d.achievement === (achievement - 1));
            
            if (currentPoint && prevPoint) {
                // Calculate the incremental increase
                psychData.push(currentPoint.totalExcludingContinuity - prevPoint.totalExcludingContinuity);
            } else {
                // If we don't have exact data, interpolate or use a placeholder
                // This shouldn't happen with our complete elasticity data, but just in case
                psychData.push(0);
            }
        }
        
        // Update the psychology chart
        this.psychologyChart.data.datasets[0].data = psychData;
        
        // Update chart colors to highlight key thresholds
        this.psychologyChart.data.datasets[0].backgroundColor = function(context) {
            const index = context.dataIndex;
            const achievement = index + 90;
            
            // Check if this is a key threshold from settings
            const isKeyThreshold = [90, 100, 105, 115].includes(achievement);
            
            // Special coloring for 100% achievement (10th index, which is 100%)
            if (achievement === 100) {
                return '#d2004b'; // Primary color for the 100% mark
            } else if (isKeyThreshold) {
                return '#ff8866'; // Highlight other key thresholds
            }
            
            return '#9966cc'; // Default color
        };
        
        this.psychologyChart.update();
    },
    
    /**
     * Generate executive summary with improved phrasing
     */
    generateExecutiveSummary: function(metrics, elasticityData) {
        // Calculate yearly target
        const yearlyTarget = parseFloat(document.getElementById('yearlyTarget').value);
        
        let summary = '<p>The current compensation model has the following key characteristics:</p><ul>';
        
        // Size of Prize summary
        summary += `<li><strong>Overall Incentive: ${metrics.sizeOfPrize.label}</strong> - `;
        if (metrics.sizeOfPrize.score >= 7) {
            summary += `With a maximum potential of ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x target, the model provides strong incentives for high achievement. At target (100%), the variable compensation represents ${metrics.sizeOfPrize.relativeSizePercentage.toFixed(1)}% of revenue.`;
        } else if (metrics.sizeOfPrize.score <= 3) {
            summary += `With only ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x target as maximum potential, the model may not sufficiently motivate exceptional performance. At target, variable compensation is ${metrics.sizeOfPrize.relativeSizePercentage.toFixed(1)}% of revenue.`;
        } else {
            summary += `The model offers a moderate ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x multiple from target to maximum payout. At target, variable compensation is ${metrics.sizeOfPrize.relativeSizePercentage.toFixed(1)}% of revenue.`;
        }
        summary += '</li>';
        
        // Distribution summary
        summary += `<li><strong>Reward Distribution: ${metrics.distribution.label}</strong> - `;
        if (metrics.distribution.belowTargetShare < 20) {
            summary += `With only ${metrics.distribution.belowTargetShare.toFixed(1)}% of potential below target, the model creates high tension around achieving 100%.`;
        } else if (metrics.distribution.belowTargetShare > 50) {
            summary += `With ${metrics.distribution.belowTargetShare.toFixed(1)}% of potential below target, the model provides strong support for underperformance periods.`;
        } else {
            summary += `The model balances risk and reward with ${metrics.distribution.belowTargetShare.toFixed(1)}% of potential below target and ${metrics.distribution.aboveTargetShare.toFixed(1)}% above.`;
        }
        summary += '</li>';
        
        // Psychological mechanisms summary
        summary += `<li><strong>Psychological Mechanisms: ${metrics.psychology.label}</strong> - `;
        if (metrics.psychology.nearMiss.score <= 3) {
            summary += `The jump at target is relatively small (${metrics.psychology.nearMiss.targetJumpPercentage.toFixed(1)}% increase), creating insufficient tension to reach exactly 100%.`;
        } else if (metrics.psychology.nearMiss.score >= 7) {
            summary += `The substantial jump at target (${metrics.psychology.nearMiss.targetJumpPercentage.toFixed(1)}% increase) creates effective psychological tension to reach 100%.`;
        } else {
            summary += `The moderate jump at target (${metrics.psychology.nearMiss.targetJumpPercentage.toFixed(1)}% increase) provides reasonable motivation to achieve exactly 100%.`;
        }
        
        // Add note about threshold spacing
        const avgGap = metrics.psychology.psychDistance.avgGap;
        if (avgGap < 8) {
            summary += ` Threshold spacing is quite narrow (${avgGap.toFixed(1)}% apart on average).`;
        } else if (avgGap > 20) {
            summary += ` Threshold spacing is quite wide (${avgGap.toFixed(1)}% apart on average).`;
        } else {
            summary += ` Threshold spacing is reasonable (${avgGap.toFixed(1)}% apart on average).`;
        }
        summary += '</li>';
        
        // Primary improvement area
        summary += '<li><strong>Primary Improvement Area:</strong> ';
        const lowestScore = Math.min(
            metrics.sizeOfPrize.score, 
            metrics.distribution.score, 
            metrics.psychology.score
        );
        
        if (lowestScore === metrics.sizeOfPrize.score) {
            summary += 'Enhancing the overall incentive potential would provide the greatest improvement.';
        } else if (lowestScore === metrics.distribution.score) {
            summary += 'Rebalancing the distribution of rewards across achievement levels would optimize the model.';
        } else {
            summary += 'Strengthening the psychological mechanisms, especially around target achievement, would make the model more effective.';
        }
        summary += '</li>';
        
        // Financial impact
        summary += `<li><strong>Financial Perspective:</strong> `;
        if (metrics.sizeOfPrize.relativeSizePercentage > 5) {
            summary += `At ${metrics.sizeOfPrize.relativeSizePercentage.toFixed(1)}% of revenue, this model allocates a relatively high portion of revenue to variable compensation (typical range is 1-3%).`;
        } else if (metrics.sizeOfPrize.relativeSizePercentage < 1) {
            summary += `At ${metrics.sizeOfPrize.relativeSizePercentage.toFixed(1)}% of revenue, this model allocates a relatively low portion of revenue to variable compensation (typical range is 1-3%).`;
        } else {
            summary += `At ${metrics.sizeOfPrize.relativeSizePercentage.toFixed(1)}% of revenue, this model falls within typical industry ranges for variable compensation (1-3% of revenue).`;
        }
        summary += '</li>';
        
        summary += '</ul>';
        
        return summary;
    },
    
    /**
     * Generate the prize ladder analysis text
     */
    generatePrizeLadderAnalysis: function(metrics, elasticityData) {
        // Find key percentage point jumps
        const jump90to100 = (elasticityData.find(d => d.achievement === 100)?.totalExcludingContinuity || 0) - 
                            (elasticityData.find(d => d.achievement === 90)?.totalExcludingContinuity || 0);
        
        const jump100to130 = (elasticityData.find(d => d.achievement === 130)?.totalExcludingContinuity || 0) - 
                             (elasticityData.find(d => d.achievement === 100)?.totalExcludingContinuity || 0);
        
        const largestJump = Math.max(jump90to100, jump100to130);
        const targetPayout = elasticityData.find(d => d.achievement === 100)?.totalExcludingContinuity || 0;
        const maxPayout = elasticityData[elasticityData.length - 1].totalExcludingContinuity;
        
        // Get yearly target from input
        const yearlyTarget = parseFloat(document.getElementById('yearlyTarget').value);
        
        let analysis = '<p>This visualization shows the total payout at different achievement levels.</p>';
        
        // Size of prize analysis
        if (metrics.sizeOfPrize.score >= 7) {
            analysis += `<p>The model provides a <strong>strong overall incentive</strong> with a maximum potential payout of ${PayoutSimulator.utils.formatters.formatCurrency(maxPayout)} 
            at 200% achievement, which is ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x the target payout.</p>`;
        } else if (metrics.sizeOfPrize.score <= 3) {
            analysis += `<p>The model provides a <strong>limited overall incentive</strong> with a maximum potential of only ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x 
            the target payout.</p>`;
        } else {
            analysis += `<p>The model provides a <strong>moderate overall incentive</strong> with a maximum potential of ${PayoutSimulator.utils.formatters.formatCurrency(maxPayout)}, 
            which is ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x the target payout.</p>`;
        }
        
        // Financial analysis
        analysis += `<p>At target performance (100%), the variable compensation represents approximately ${(targetPayout / yearlyTarget * 100).toFixed(1)}% 
        of revenue. Industry benchmarks typically range from 1% to 3% for most sales roles.</p>`;
        
        // Comment on the largest jump
        if (jump90to100 > jump100to130) {
            analysis += `<p>The largest payout increase (${PayoutSimulator.utils.formatters.formatCurrency(jump90to100)}) occurs when moving from 90% to 100% achievement, 
            creating a strong incentive to reach target exactly.</p>`;
        } else {
            analysis += `<p>The largest payout increase (${PayoutSimulator.utils.formatters.formatCurrency(jump100to130)}) occurs when moving from 100% to 130% achievement, 
            creating a stronger incentive for above-target performance.</p>`;
        }
        
        // Pay mix analysis
        const baseSalary = parseFloat(document.getElementById('baseSalary').value) || 0;
        if (baseSalary > 0) {
            const targetTotalComp = baseSalary + targetPayout;
            const variablePercentage = (targetPayout / targetTotalComp * 100).toFixed(1);
            
            analysis += `<p>The pay mix shows variable compensation representing ${variablePercentage}% of target total compensation. `;
            
            if (parseFloat(variablePercentage) < 20) {
                analysis += `This is relatively low for a sales role, where variable typically represents 25-40% of total compensation.</p>`;
            } else if (parseFloat(variablePercentage) > 40) {
                analysis += `This is relatively high for a sales role, creating a high-risk, high-reward environment.</p>`;
            } else {
                analysis += `This is within the typical range for sales roles (25-40% variable).</p>`;
            }
        }
        
        return analysis;
    },
    
    /**
     * Generate the prize insight text
     */
    generatePrizeInsight: function(metrics) {
        let insight = '';
        
        // Overall size of prize assessment
        if (metrics.sizeOfPrize.score >= 7) {
            insight += `The compensation model offers <strong>substantial incentive potential</strong> with a ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x multiple from target to maximum payout. `;
            insight += `This creates strong motivation for exceptional performance and helps attract and retain top talent.`;
        } else if (metrics.sizeOfPrize.score <= 3) {
            insight += `The compensation model offers <strong>limited incentive potential</strong> with only a ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x multiple from target to maximum payout. `;
            insight += `This may not create sufficient motivation for exceptional performance or help attract top talent.`;
        } else {
            insight += `The compensation model offers <strong>moderate incentive potential</strong> with a ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x multiple from target to maximum payout. `;
            insight += `This creates reasonable motivation for above-target performance, though there may be room for enhancement.`;
        }
        
        // Pay mix assessment
        if (metrics.payMix.baseSalary > 0) {
            insight += `<br><br>The pay mix shows variable compensation at ${metrics.payMix.ratio.toFixed(1)}% of base salary. `;
            
            if (metrics.payMix.typicality === 'below') {
                insight += `This is below the typical range (15-35%) for most sales roles, potentially limiting motivation for target achievement.`;
            } else if (metrics.payMix.typicality === 'above') {
                insight += `This is above the typical range (15-35%) for most sales roles, creating a higher-risk, higher-reward environment.`;
            } else {
                insight += `This falls within the typical range (15-35%) for most sales roles, balancing security and motivation.`;
            }
        }
        
        return insight;
    },
    
    /**
     * Generate the distribution insight text
     */
    generateDistributionInsight: function(metrics) {
        let insight = '<h4>Reward Distribution Insights</h4>';
        
        if (metrics.distribution.belowTargetShare < 20) {
            insight += `<p>The current model provides <strong>minimal incentives below target</strong>, with only ${metrics.distribution.belowTargetShare.toFixed(1)}% 
            of potential compensation available below 100% achievement. This creates a high-risk environment where underperformance is severely penalized.</p>`;
        } else if (metrics.distribution.belowTargetShare > 50) {
            insight += `<p>The current model provides <strong>substantial compensation below target</strong>, with ${metrics.distribution.belowTargetShare.toFixed(1)}% 
            of potential compensation available below 100% achievement. This creates a low-risk environment but may reduce motivation to achieve 100%.</p>`;
        } else {
            insight += `<p>The current model has a <strong>balanced distribution</strong> with ${metrics.distribution.belowTargetShare.toFixed(1)}% of potential 
            available below target, providing reasonable support for underperformers while still incentivizing target achievement.</p>`;
        }
        
        if (metrics.distribution.atTargetShare < 10) {
            insight += `<p>The <strong>small jump at target</strong> (only ${metrics.distribution.atTargetShare.toFixed(1)}% of potential) may weaken the psychological 
            impact of reaching 100% achievement.</p>`;
        } else if (metrics.distribution.atTargetShare > 25) {
            insight += `<p>The <strong>substantial jump at target</strong> (${metrics.distribution.atTargetShare.toFixed(1)}% of potential) creates a powerful 
            psychological incentive to reach exactly 100% achievement.</p>`;
        }
        
        if (metrics.distribution.aboveTargetShare < 30) {
            insight += `<p>With only ${metrics.distribution.aboveTargetShare.toFixed(1)}% of potential available above target, the model provides <strong>limited 
            upside potential</strong> for top performers.</p>`;
        } else if (metrics.distribution.aboveTargetShare > 60) {
            insight += `<p>With ${metrics.distribution.aboveTargetShare.toFixed(1)}% of potential available above target, the model provides <strong>substantial 
            upside potential</strong> for top performers, which may drive exceptional achievement.</p>`;
        }
        
        // Add industry benchmark comparison
        insight += `<p><strong>Industry benchmark comparison:</strong><br>
        Typical models allocate 25-40% below target, 15-25% at target, and 40-60% above target. 
        This model's distribution is ${this.getDistributionComparisonText(metrics)}.</p>`;
        
        return insight;
    },
    
    /**
     * Get distribution comparison text
     */
    getDistributionComparisonText: function(metrics) {
        const belowStatus = metrics.distribution.belowTargetTypicality;
        const atStatus = metrics.distribution.atTargetTypicality;
        const aboveStatus = metrics.distribution.aboveTargetTypicality;
        
        if (belowStatus === 'typical' && atStatus === 'typical' && aboveStatus === 'typical') {
            return 'well aligned with industry benchmarks';
        }
        
        let issues = [];
        
        if (belowStatus === 'below') {
            issues.push('less support below target');
        } else if (belowStatus === 'above') {
            issues.push('more support below target');
        }
        
        if (atStatus === 'below') {
            issues.push('weaker target incentive');
        } else if (atStatus === 'above') {
            issues.push('stronger target incentive');
        }
        
        if (aboveStatus === 'below') {
            issues.push('less upside potential');
        } else if (aboveStatus === 'above') {
            issues.push('more upside potential');
        }
        
        if (issues.length === 0) {
            return 'generally aligned with industry benchmarks';
        }
        
        return 'notable for ' + issues.join(' and ') + ' compared to typical models';
    },
    
    /**
     * Generate the psychology insight text
     */
    generatePsychologyInsight: function(metrics) {
        let insight = '<h4>Psychological Mechanism Insights</h4>';
        
        // Near-miss psychology - focus on accurate payout mechanics
        const targetJumpPercentage = metrics.psychology.nearMiss.targetJumpPercentage;
        
        insight += `<p>When transitioning from 99% to 100% achievement, the payout increases by ${targetJumpPercentage.toFixed(1)}%. `;
        
        if (metrics.psychology.nearMiss.score <= 3) {
            insight += `This <strong>relatively small jump</strong> may not create sufficient psychological tension to drive exact target attainment. Research in behavioral economics suggests that meaningful threshold jumps (10-20%) create stronger motivation to reach key milestones.</p>`;
        } else if (metrics.psychology.nearMiss.score >= 7) {
            insight += `This <strong>substantial jump</strong> creates effective psychological tension to reach exactly 100%. Behavioral economics research shows that meaningful threshold jumps (10-20%) create strong motivation to reach key milestones.</p>`;
        } else {
            insight += `This <strong>moderate jump</strong> creates reasonable tension to reach exactly 100%. Behavioral research suggests that threshold jumps of 10-20% are most effective at motivating target achievement.</p>`;
        }
        
        // Is target jump the primary jump?
        const primaryJump = metrics.psychology.nearMiss.primaryJump;
        if (!metrics.psychology.nearMiss.isTargetJumpPrimary) {
            insight += `<p>Note that the <strong>largest payout increase</strong> actually occurs between ${primaryJump.from}% and ${primaryJump.to}% achievement, potentially shifting focus away from the 100% target.</p>`;
        } else {
            insight += `<p>The jump at 100% achievement is the <strong>largest single increase</strong> in the model, which helps focus attention on reaching exactly 100%.</p>`;
        }
        
        // Psychological distance
        const avgGap = metrics.psychology.psychDistance.avgGap;
        insight += `<p>The threshold spacing (average gap: ${avgGap.toFixed(1)}%) `;
        
        if (metrics.psychology.psychDistance.score <= 3) {
            insight += `creates <strong>sub-optimal psychological distances</strong> between achievement levels. `;
            
            if (avgGap < 7) {
                insight += `The thresholds are too close together, potentially making each level feel like an insufficient achievement step.`;
            } else if (avgGap > 20) {
                insight += `The thresholds are too far apart, potentially making higher levels feel unattainable.`;
            }
        } else if (metrics.psychology.psychDistance.score >= 7) {
            insight += `creates <strong>optimal psychological distances</strong> between achievement levels, making each next threshold feel attainable yet meaningful.`;
        } else {
            insight += `creates <strong>reasonable psychological distances</strong> between achievement levels, though there may be room for optimization.`;
        }
        insight += `</p>`;
        
        // Threshold understanding note
        insight += `<p><strong>Important note:</strong> In this model, bonuses are applied based on which threshold is reached, not stacked. This means that at each achievement level, the person receives only the bonus for that specific level, not cumulative bonuses from all lower levels. This structure creates clear "steps" in the compensation curve.</p>`;
        
        // Industry benchmarks for psychology
        insight += `<p><strong>Industry benchmarks:</strong><br>
        Effective models typically show a 10-20% payout increase at the 100% threshold, creating clear psychological tension. 
        Optimal threshold spacing is typically 10-15%, which creates the right balance between achievability and meaningful progress.</p>`;
        
        // The power of continuity bonuses
        const continuityThreshold = parseFloat(document.getElementById('continuityThreshold').value);
        insight += `<p>The continuity bonus mechanism that rewards sustained performance above ${continuityThreshold}% leverages the <strong>psychological principle of consistency</strong>, 
        encouraging persistent high performance rather than inconsistent peaks.</p>`;
        
        return insight;
    },
    
    // Helper functions for labels and descriptions
    
    getSizeOfPrizeLabel: function(score) {
        if (score <= 3) return 'Limited';
        if (score <= 5) return 'Moderate';
        if (score <= 7) return 'Substantial';
        return 'Exceptional';
    },
    
    getDistributionLabel: function(score) {
        if (score <= 3) return 'Imbalanced';
        if (score <= 5) return 'Somewhat Balanced';
        if (score <= 7) return 'Well Balanced';
        return 'Optimally Balanced';
    },
    
    getPsychologyLabel: function(score) {
        if (score <= 3) return 'Weak';
        if (score <= 5) return 'Moderate';
        if (score <= 7) return 'Effective';
        return 'Highly Effective';
    },
    
    getNearMissLabel: function(score) {
        if (score <= 3) return 'Weak';
        if (score <= 5) return 'Moderate';
        if (score <= 7) return 'Strong';
        return 'Very Strong';
    },
    
    getPsychDistanceLabel: function(score) {
        if (score <= 3) return 'Poor';
        if (score <= 5) return 'Moderate';
        if (score <= 7) return 'Good';
        return 'Optimal';
    },
    
    getSizeOfPrizeDescription: function(score) {
        if (score <= 3) return 'Limited overall compensation potential that may not strongly motivate exceptional performance';
        if (score <= 5) return 'Moderate compensation package that provides reasonable incentives for achievement';
        if (score <= 7) return 'Substantial compensation package with strong incentives for high performance';
        return 'Exceptional compensation potential that creates powerful incentives for outstanding performance';
    },
    
    getDistributionDescription: function(score) {
        if (score <= 3) return 'Imbalanced allocation between below-target, at-target, and above-target performance';
        if (score <= 5) return 'Somewhat balanced reward distribution across performance levels';
        if (score <= 7) return 'Well-balanced reward distribution that supports multiple performance scenarios';
        return 'Optimally balanced distribution that creates the perfect tension between support and stretch';
    },
    
    getPsychologyDescription: function(score) {
        if (score <= 3) return 'Limited use of psychological motivators to drive desired behaviors';
        if (score <= 5) return 'Moderate implementation of behavioral psychology principles';
        if (score <= 7) return 'Effective use of psychological mechanisms to drive target achievement';
        return 'Sophisticated implementation of behavioral psychology principles for maximum motivation';
    }
};

// Initialize the philosophy analysis when the module is loaded
PayoutSimulator.features.philosophy.analysis.init();