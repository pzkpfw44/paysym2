/**
 * Compensation Philosophy Recommendations for Payout Elasticity Simulator
 * This is a lazy-loaded module for recommendation generation
 */

// Register this module with the application
PayoutSimulator.features.philosophy.recommendations = {
    // Chart instance
    recommendationComparisonChart: null,
    
    /**
     * Initialize recommendations functionality
     */
    init: function() {
        console.log("Initializing philosophy recommendations...");
        
        // Initialize recommendation comparison chart
        this.initializeRecommendationChart();
        
        // Add event listeners
        this.setupEventListeners();
        
        console.log("Philosophy recommendations initialized");
    },
    
    /**
     * Initialize recommendation comparison chart
     */
    initializeRecommendationChart: function() {
        // Only initialize if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded. Recommendation chart cannot be initialized.");
            return;
        }
        
        // Recommendation Comparison Chart
        this.recommendationComparisonChart = new Chart(
            document.getElementById('recommendationComparisonChart'),
            {
                type: 'line',
                data: {
                    labels: Array.from({length: 41}, (_, i) => (i * 5) + '%'),
                    datasets: [
                        {
                            label: 'Current Model',
                            data: Array(41).fill(0),
                            borderColor: '#555555',
                            backgroundColor: 'rgba(85, 85, 85, 0.1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1
                        },
                        {
                            label: 'Recommended Model',
                            data: Array(41).fill(0),
                            borderColor: '#d2004b',
                            backgroundColor: 'rgba(210, 0, 75, 0.1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.1
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
                                text: 'Achievement (%)'
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
                                    label += PayoutSimulator.utils.formatters.formatCurrency(context.raw);
                                    return label;
                                }
                            }
                        }
                    }
                }
            }
        );
    },
    
    /**
     * Setup event listeners for recommendations
     */
    setupEventListeners: function() {
        // Apply recommendations button
        const applyRecommendationsBtn = document.getElementById('applyRecommendationsBtn');
        if (applyRecommendationsBtn) {
            applyRecommendationsBtn.addEventListener('click', this.applyRecommendations.bind(this));
        }
        
        // Recommendation goal dropdown
        const recommendationGoal = document.getElementById('recommendationGoal');
        if (recommendationGoal) {
            recommendationGoal.addEventListener('change', () => {
                // Regenerate recommendations with new goal focus
                const elasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
                const riskAssessment = PayoutSimulator.utils.calculations.generateRiskAssessment();
                
                if (PayoutSimulator.features.philosophy.analysis) {
                    const philosophyMetrics = PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics(
                        elasticityData, 
                        riskAssessment
                    );
                    
                    // Generate goal-specific recommendations
                    this.updateRecommendations(philosophyMetrics, elasticityData, recommendationGoal.value);
                }
            });
        }
    },
    
    /**
     * Update recommendations UI and chart
     * @param {Object} metrics - Philosophy metrics
     * @param {Array} elasticityData - Elasticity simulation data
     * @param {string} goalFocus - Goal focus for recommendations
     */
    updateRecommendations: function(metrics, elasticityData, goalFocus = 'overall') {
        // Generate recommendations
        const recommendations = this.generateRecommendations(metrics, elasticityData, goalFocus);
        
        // Update UI with recommendations
        this.updateRecommendationsUI(recommendations);
        
        // Update radar chart to show projected impact
        this.updateRecommendationRadarChart(metrics, goalFocus);
    },
    
    /**
     * Generate recommendations based on philosophy metrics
     * @param {Object} metrics - Philosophy metrics
     * @param {Array} elasticityData - Elasticity simulation data
     * @param {string} goalFocus - Goal focus for recommendations
     * @returns {Array} - Array of recommendation objects
     */
    generateRecommendations: function(metrics, elasticityData, goalFocus = 'overall') {
        const recommendations = [];
        
        // Filter recommendations based on goal focus
        const filterByGoal = (rec) => {
            if (goalFocus === 'overall') return true;
            if (goalFocus === 'target' && (rec.type === 'psychology' || rec.title.includes('Target'))) return true;
            if (goalFocus === 'topPerformers' && (rec.type === 'sizeOfPrize' || (rec.type === 'distribution' && rec.title.includes('Above Target')))) return true;
            if (goalFocus === 'balance' && (rec.type === 'distribution' || rec.type === 'structure')) return true;
            return false;
        };
        
        // Size of Prize recommendations
        if (metrics.sizeOfPrize.score <= 4) {
            // If overall package is too small
            if (metrics.sizeOfPrize.targetMultiple < 1.5) {
                recommendations.push({
                    title: "Increase upside potential",
                    impact: "medium",
                    reasoning: `The current model has limited upside with only a ${metrics.sizeOfPrize.targetMultiple.toFixed(1)}x multiple from target to maximum payout. Increasing the commission rates and/or bonuses for high achievement would create stronger incentives for top performance.`,
                    type: "sizeOfPrize",
                    changes: [
                        {
                            type: "commission",
                            field: "commPercentage3",
                            oldValue: parseFloat(document.getElementById('commPercentage3').value),
                            newValue: Math.min(10, parseFloat(document.getElementById('commPercentage3').value) * 1.33)
                        },
                        {
                            type: "quarterlyBonus",
                            field: "qBonus5",
                            oldValue: parseFloat(document.getElementById('qBonus5').value),
                            newValue: parseFloat(document.getElementById('qBonus5').value) * 1.25
                        }
                    ]
                });
            }
        }
        
        // Add recommendation for strengthening above-target rewards if above-target share is low
        if (metrics.distribution.aboveTargetShare < 30) {
            recommendations.push({
                title: "Enhance above-target incentives",
                impact: "medium",
                reasoning: `Only ${metrics.distribution.aboveTargetShare.toFixed(1)}% of potential compensation is available above target, limiting motivation for exceptional performance. Increasing rewards for achievements above 105% would create stronger incentives for top performers.`,
                type: "distribution",
                changes: [
                    {
                        type: "quarterlyBonus",
                        field: "qBonus4",
                        oldValue: parseFloat(document.getElementById('qBonus4').value),
                        newValue: parseFloat(document.getElementById('qBonus4').value) * 1.2
                    },
                    {
                        type: "quarterlyBonus",
                        field: "qBonus5",
                        oldValue: parseFloat(document.getElementById('qBonus5').value),
                        newValue: parseFloat(document.getElementById('qBonus5').value) * 1.3
                    }
                ]
            });
        }
        
        // Distribution recommendations
        if (metrics.distribution.belowTargetShare < 20) {
            // If too little below target
            recommendations.push({
                title: "Improve below-target support",
                impact: "medium",
                reasoning: `Only ${metrics.distribution.belowTargetShare.toFixed(1)}% of potential compensation is available below target, creating high stress and potentially punitive environment. Adding a lower tier commission and/or quarterly bonus would provide better support for people having difficult periods.`,
                type: "distribution",
                changes: [
                    {
                        type: "quarterlyBonus",
                        field: "qThreshold1",
                        oldValue: parseFloat(document.getElementById('qThreshold1').value),
                        newValue: Math.max(70, parseFloat(document.getElementById('qThreshold1').value) - 15)
                    },
                    {
                        type: "quarterlyBonus",
                        field: "qBonus1",
                        oldValue: parseFloat(document.getElementById('qBonus1').value),
                        newValue: parseFloat(document.getElementById('qBonus1').value) * 0.7
                    }
                ]
            });
        } else if (metrics.distribution.belowTargetShare > 50) {
            // If too much below target
            recommendations.push({
                title: "Strengthen target achievement incentives",
                impact: "high",
                reasoning: `${metrics.distribution.belowTargetShare.toFixed(1)}% of potential compensation is available below target, which may reduce motivation to reach 100%. Shifting some compensation from below-target to at-target would create stronger incentives to reach the full goal.`,
                type: "distribution",
                changes: [
                    {
                        type: "quarterlyBonus",
                        field: "qBonus1",
                        oldValue: parseFloat(document.getElementById('qBonus1').value),
                        newValue: parseFloat(document.getElementById('qBonus1').value) * 0.8
                    },
                    {
                        type: "quarterlyBonus",
                        field: "qBonus2",
                        oldValue: parseFloat(document.getElementById('qBonus2').value),
                        newValue: parseFloat(document.getElementById('qBonus2').value) * 1.3
                    }
                ]
            });
        }
        
        // Psychological recommendations
        if (metrics.psychology.nearMiss.score <= 4) {
            // If near-miss psychology is weak - create proper stepped progression
            recommendations.push({
                title: "Enhance target achievement incentive",
                impact: "high",
                reasoning: `The current payout increase at 100% achievement is only ${metrics.psychology.nearMiss.targetJumpPercentage.toFixed(1)}%, creating weak psychological tension. Creating a significant but graduated increase around 100% would create a stronger psychological incentive to reach target.`,
                type: "psychology",
                changes: [
                    {
                        type: "quarterlyBonus",
                        field: "qThreshold2",
                        oldValue: parseFloat(document.getElementById('qThreshold2').value),
                        newValue: 100
                    },
                    {
                        type: "quarterlyBonus",
                        field: "qThresholdUpto2",
                        oldValue: parseFloat(document.getElementById('qThresholdUpto2').value),
                        newValue: 102 // graduated progression
                    },
                    {
                        type: "quarterlyBonus",
                        field: "qBonus2",
                        oldValue: parseFloat(document.getElementById('qBonus2').value),
                        newValue: parseFloat(document.getElementById('qBonus2').value) * 1.25
                    }
                ]
            });
        }
        
        if (metrics.psychology.psychDistance.score <= 4) {
            // If psychological distance is suboptimal
            const avgGap = metrics.psychology.psychDistance.avgGap;
            
            if (avgGap > 20) {
                // If gaps are too large
                recommendations.push({
                    title: "Optimize threshold spacing",
                    impact: "medium",
                    reasoning: `The current average gap between thresholds (${avgGap.toFixed(1)}%) is too wide, potentially making higher levels feel unattainable. Adding intermediate thresholds would create a more motivating ladder of achievement.`,
                    type: "psychology",
                    changes: [
                        {
                            type: "quarterlyBonus",
                            field: "qThreshold3",
                            oldValue: parseFloat(document.getElementById('qThreshold3').value),
                            newValue: Math.round((parseFloat(document.getElementById('qThreshold2').value) + parseFloat(document.getElementById('qThreshold3').value)) / 2)
                        },
                        {
                            type: "quarterlyBonus",
                            field: "qThresholdUpto3",
                            oldValue: parseFloat(document.getElementById('qThresholdUpto3').value),
                            newValue: parseFloat(document.getElementById('qThreshold4').value) - 1
                        },
                        {
                            type: "quarterlyBonus",
                            field: "qBonus3",
                            oldValue: parseFloat(document.getElementById('qBonus3').value),
                            newValue: Math.round((parseFloat(document.getElementById('qBonus2').value) + parseFloat(document.getElementById('qBonus4').value)) / 2)
                        }
                    ]
                });
            } else if (avgGap < 5) {
                // If gaps are too small
                recommendations.push({
                    title: "Optimize threshold spacing",
                    impact: "low",
                    reasoning: `The current average gap between thresholds (${avgGap.toFixed(1)}%) is too narrow, potentially making threshold achievements feel trivial. Spacing thresholds further apart would create more meaningful achievement milestones.`,
                    type: "psychology",
                    changes: [
                        {
                            type: "quarterlyBonus",
                            field: "qThreshold3",
                            oldValue: parseFloat(document.getElementById('qThreshold3').value),
                            newValue: parseFloat(document.getElementById('qThreshold3').value) + 5
                        },
                        {
                            type: "quarterlyBonus",
                            field: "qThreshold4",
                            oldValue: parseFloat(document.getElementById('qThreshold4').value),
                            newValue: parseFloat(document.getElementById('qThreshold4').value) + 10
                        }
                    ]
                });
            }
        }
        
        // If rolling average is not used
        if (!document.getElementById('useRollingAverage').checked) {
            recommendations.push({
                title: "Implement 3-month rolling average",
                impact: "medium",
                reasoning: "Using monthly sales data without averaging can lead to incentive for end-of-month or end-of-quarter sales manipulation. A 3-month rolling average would smooth out performance and reduce undesirable sales tactics.",
                type: "structure",
                changes: [
                    {
                        type: "rollingAverage",
                        field: "useRollingAverage",
                        oldValue: false,
                        newValue: true
                    }
                ]
            });
        }
        
        // Filter recommendations based on goal focus and return
        return recommendations.filter(filterByGoal);
    },
    
    /**
     * Update the recommendations UI
     * @param {Array} recommendations - Array of recommendation objects
     */
    updateRecommendationsUI: function(recommendations) {
        const container = document.getElementById('recommendationsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Add explanation for the radar chart comparison
        const radarExplanation = document.createElement('div');
        radarExplanation.className = 'recommendation-explanation';
        radarExplanation.innerHTML = `
            <p>The radar chart above shows your current model (gray) compared to the projected impact of applying 
            these recommendations (pink). No compensation model will achieve perfect scores in all dimensions, 
            as optimizing for one goal often requires trade-offs in other areas.</p>
        `;
        container.appendChild(radarExplanation);
        
        // Show the radar comparison
        const modelComparisonContainer = document.getElementById('modelComparisonContainer');
        if (modelComparisonContainer) {
            modelComparisonContainer.style.display = 'block';
        }
        
        if (recommendations.length === 0) {
            container.innerHTML += '<p>No specific recommendations at this time. The current compensation structure appears well-optimized for your selected goal.</p>';
            return;
        }
        
        // Add recommendations
        recommendations.forEach((rec, index) => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.dataset.index = index;
            
            const header = document.createElement('div');
            header.className = 'recommendation-header';
            
            const title = document.createElement('h3');
            title.className = 'recommendation-title';
            title.textContent = rec.title;
            
            const impact = document.createElement('span');
            impact.className = `recommendation-impact impact-${rec.impact}`;
            impact.textContent = rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1) + ' Impact';
            
            header.appendChild(title);
            header.appendChild(impact);
            
            const content = document.createElement('div');
            content.className = 'recommendation-content';
            
            const reasoning = document.createElement('p');
            reasoning.className = 'recommendation-reasoning';
            reasoning.textContent = rec.reasoning;
            
            const details = document.createElement('div');
            details.className = 'recommendation-details';
            
            // Generate details table
            let detailsHTML = '<table><tr><th>Setting</th><th>Current</th><th>Recommended</th></tr>';
            
            rec.changes.forEach(change => {
                let fieldName = '';
                let oldValueDisplay = '';
                let newValueDisplay = '';
                
                // Format based on field type
                if (change.type === 'commission') {
                    const thresholdIndex = change.field.replace('commPercentage', '');
                    fieldName = `Commission Tier ${thresholdIndex}`;
                    oldValueDisplay = change.oldValue + '%';
                    newValueDisplay = change.newValue.toFixed(1) + '%';
                } else if (change.type === 'quarterlyBonus') {
                    const bonusIndex = change.field.replace(/^q/, '').replace(/Threshold|Bonus/g, '');
                    
                    if (change.field.includes('Threshold')) {
                        fieldName = `Q-Bonus Threshold ${bonusIndex}`;
                        oldValueDisplay = change.oldValue + '%';
                        newValueDisplay = change.newValue + '%';
                    } else if (change.field.includes('Upto')) {
                        fieldName = `Q-Bonus Upper Limit ${bonusIndex}`;
                        oldValueDisplay = change.oldValue + '%';
                        newValueDisplay = change.newValue + '%';
                    } else {
                        fieldName = `Q-Bonus Amount ${bonusIndex}`;
                        oldValueDisplay = PayoutSimulator.utils.formatters.formatCurrency(change.oldValue);
                        newValueDisplay = PayoutSimulator.utils.formatters.formatCurrency(change.newValue);
                    }
                } else if (change.type === 'rollingAverage') {
                    fieldName = '3-Month Rolling Average';
                    oldValueDisplay = change.oldValue ? 'Enabled' : 'Disabled';
                    newValueDisplay = change.newValue ? 'Enabled' : 'Disabled';
                }
                
                detailsHTML += `<tr><td>${fieldName}</td><td>${oldValueDisplay}</td><td>${newValueDisplay}</td></tr>`;
            });
            
            detailsHTML += '</table>';
            details.innerHTML = detailsHTML;
            
            const actions = document.createElement('div');
            actions.className = 'recommendation-actions';
            
            const applyButton = document.createElement('button');
            applyButton.textContent = 'Apply This Recommendation';
            applyButton.className = 'button-secondary';
            applyButton.addEventListener('click', () => this.applySingleRecommendation(index, recommendations));
            
            const explanation = document.createElement('p');
            explanation.className = 'recommendation-explanation';
            explanation.textContent = this.getRecommendationExplanation(rec.type);
            
            actions.appendChild(applyButton);
            
            content.appendChild(reasoning);
            content.appendChild(details);
            
            card.appendChild(header);
            card.appendChild(content);
            card.appendChild(actions);
            card.appendChild(explanation);
            
            container.appendChild(card);
        });
    },
    
    /**
     * Update recommendation radar chart
     * @param {Object} metrics - Philosophy metrics
     * @param {string} goalFocus - Goal focus for recommendations
     */
    updateRecommendationRadarChart: function(metrics, goalFocus) {
        // Make sure we have a reference to the philosophy analysis module
        if (!PayoutSimulator.features.philosophy.analysis || !PayoutSimulator.features.philosophy.analysis.philosophyRadarChart) {
            return;
        }
        
        // Get current values
        const currentData = metrics.radarData;
        
        // Create projected values based on goal focus
        let projectedData = [...currentData]; // Start with a copy
        
        // Adjust projections based on goal focus
        switch(goalFocus) {
            case 'target':
                // Improve at-target incentive and near-miss psychology
                projectedData[2] = Math.min(10, currentData[2] * 1.3); // At Target Incentive
                projectedData[4] = Math.min(10, currentData[4] * 1.3); // Near-Miss Psychology
                break;
            
            case 'topPerformers':
                // Improve size of prize and above-target stretch
                projectedData[0] = Math.min(10, currentData[0] * 1.2); // Size of Prize
                projectedData[3] = Math.min(10, currentData[3] * 1.4); // Above Target Stretch
                break;
            
            case 'balance':
                // Improve below-target support and distribution balance
                projectedData[1] = Math.min(10, currentData[1] * 1.3); // Below Target Support
                // Make other dimensions more balanced
                projectedData = projectedData.map(val => {
                    if (val < 4) return Math.min(10, val * 1.2);
                    return val;
                });
                break;
            
            case 'overall':
            default:
                // Improve the lowest dimensions
                const minScore = Math.min(...currentData);
                projectedData = projectedData.map(val => {
                    if (val === minScore) return Math.min(10, val * 1.3);
                    return val;
                });
                break;
        }
        
        // Update radar chart to include both current and projected values
        PayoutSimulator.features.philosophy.analysis.philosophyRadarChart.data.datasets = [
            {
                label: 'Current Model',
                data: currentData,
                fill: true,
                backgroundColor: 'rgba(85, 85, 85, 0.2)',
                borderColor: 'rgb(85, 85, 85)',
                pointBackgroundColor: 'rgb(85, 85, 85)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(85, 85, 85)'
            },
            {
                label: 'Projected with Recommendations',
                data: projectedData,
                fill: true,
                backgroundColor: 'rgba(210, 0, 75, 0.2)',
                borderColor: 'rgb(210, 0, 75)',
                pointBackgroundColor: 'rgb(210, 0, 75)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(210, 0, 75)'
            }
        ];
        
        PayoutSimulator.features.philosophy.analysis.philosophyRadarChart.update();
        
        // Also update the recommendation comparison chart with elasticity data
        this.updateModelComparisonChart();
    },
    
    /**
     * Update model comparison chart
     */
    updateModelComparisonChart: function() {
        // Store current elasticity data
        const currentElasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        
        // Apply recommendations temporarily to get the new elasticity curve
        // We'll save the current state first
        const originalState = this.saveCurrentState();
        
        // Apply all recommendations temporarily
        const goalSelect = document.getElementById('recommendationGoal');
        if (!goalSelect) return;
        
        // Get current metrics for recommendations
        const metrics = PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics(
            currentElasticityData, 
            PayoutSimulator.utils.calculations.generateRiskAssessment()
        );
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(
            metrics,
            currentElasticityData,
            goalSelect.value
        );
        
        // Apply all changes temporarily
        recommendations.forEach(recommendation => {
            recommendation.changes.forEach(change => {
                if (change.field === 'useRollingAverage') {
                    document.getElementById(change.field).checked = change.newValue;
                    if (change.newValue) {
                        document.getElementById('previousMonthsContainer').style.display = 'block';
                    } else {
                        document.getElementById('previousMonthsContainer').style.display = 'none';
                    }
                } else {
                    document.getElementById(change.field).value = change.newValue;
                }
            });
        });
        
        // Get new elasticity data
        const newElasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        
        // Now restore the original state
        this.restoreState(originalState);
        
        // Update the comparison chart
        this.updateComparisonChart(currentElasticityData, newElasticityData);
    },
    
    /**
     * Update comparison chart with current and recommended models
     * @param {Array} currentData - Current elasticity data
     * @param {Array} newData - New elasticity data with recommendations
     */
    updateComparisonChart: function(currentData, newData) {
        // First ensure we have both datasets with the same length and points
        const achievementPoints = Array.from({length: 41}, (_, i) => i * 5);
        
        // Normalize data points to ensure we're comparing the same achievement levels
        const normalizedCurrent = [];
        const normalizedNew = [];
        const differenceData = [];
        
        achievementPoints.forEach(achievement => {
            // Find current model value at this achievement
            const currentPoint = currentData.find(d => d.achievement === achievement)?.totalExcludingContinuity || 0;
            normalizedCurrent.push(currentPoint);
            
            // Find new model value at this achievement
            const newPoint = newData.find(d => d.achievement === achievement)?.totalExcludingContinuity || 0;
            normalizedNew.push(newPoint);
            
            // Calculate difference (for a separate dataset showing the delta)
            differenceData.push(newPoint - currentPoint);
        });
        
        // Update the comparison chart
        this.recommendationComparisonChart.data.labels = achievementPoints.map(a => a + '%');
        
        this.recommendationComparisonChart.data.datasets = [
            {
                label: 'Current Model',
                data: normalizedCurrent,
                borderColor: '#555555',
                backgroundColor: 'rgba(85, 85, 85, 0.1)',
                borderWidth: 2,
                fill: false
            },
            {
                label: 'Recommended Model',
                data: normalizedNew,
                borderColor: '#d2004b',
                backgroundColor: 'rgba(210, 0, 75, 0.1)',
                borderWidth: 2,
                fill: false
            }
        ];
        
        // Add the difference chart if there are meaningful differences
        const maxDiff = Math.max(...differenceData.map(d => Math.abs(d)));
        if (maxDiff > 50) { // Only show if there's a meaningful difference
            this.recommendationComparisonChart.data.datasets.push({
                label: 'Difference',
                data: differenceData,
                borderColor: '#0066cc',
                backgroundColor: 'rgba(0, 102, 204, 0.3)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: true,
                yAxisID: 'y1'
            });
            
            // Update chart options to include second y-axis for difference
            this.recommendationComparisonChart.options.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false
                },
                title: {
                    display: true,
                    text: 'Difference (€)'
                },
                ticks: {
                    callback: function(value) {
                        return (value >= 0 ? '+' : '') + '€' + value.toLocaleString('de-DE');
                    }
                }
            };
        } else {
            // If difference is not significant, ensure we don't have a second y-axis
            if (this.recommendationComparisonChart.options.scales.y1) {
                delete this.recommendationComparisonChart.options.scales.y1;
            }
        }
        
        // Highlight key achievement points
        if (this.recommendationComparisonChart.options.plugins && 
            typeof Chart.Annotation !== 'undefined' && 
            this.recommendationComparisonChart.options.plugins.annotation) {
                
            this.recommendationComparisonChart.options.plugins.annotation = {
                annotations: {
                    target100Line: {
                        type: 'line',
                        xMin: '100%',
                        xMax: '100%',
                        borderColor: 'rgba(210, 0, 75, 0.5)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                            content: 'Target (100%)',
                            enabled: true,
                            position: 'top'
                        }
                    }
                }
            };
        }
        
        this.recommendationComparisonChart.update();
    },
    
    /**
     * Apply a single recommendation
     * @param {number} index - Index of the recommendation to apply
     * @param {Array} recommendations - Array of all recommendations
     */
    applySingleRecommendation: function(index, recommendations) {
        // Store current state for comparison
        const currentElasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        
        // Get the recommendation to apply
        const recommendation = recommendations[index];
        
        // Apply changes
        recommendation.changes.forEach(change => {
            if (change.field === 'useRollingAverage') {
                document.getElementById(change.field).checked = change.newValue;
                if (change.newValue) {
                    document.getElementById('previousMonthsContainer').style.display = 'block';
                } else {
                    document.getElementById('previousMonthsContainer').style.display = 'none';
                }
            } else {
                document.getElementById(change.field).value = change.newValue;
            }
        });
        
        // Recalculate and update UI
        document.getElementById('calculateBtn').click();
        
        // Get new elasticity data
        const newElasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        
        // Update model comparison
        this.updateComparisonChart(currentElasticityData, newElasticityData);
        
        // Show model comparison
        const modelComparisonContainer = document.getElementById('modelComparisonContainer');
        if (modelComparisonContainer) {
            modelComparisonContainer.style.display = 'block';
        }
        
        // Add a summary of what was changed
        const changes = recommendation.changes.map(change => {
            let fieldName = '';
            let oldValueDisplay = '';
            let newValueDisplay = '';
            
            // Format based on field type
            if (change.type === 'commission') {
                const thresholdIndex = change.field.replace('commPercentage', '');
                fieldName = `Commission Tier ${thresholdIndex}`;
                oldValueDisplay = change.oldValue + '%';
                newValueDisplay = change.newValue.toFixed(1) + '%';
            } else if (change.type === 'quarterlyBonus') {
                const bonusIndex = change.field.replace(/^q/, '').replace(/Threshold|Bonus/g, '');
                
                if (change.field.includes('Threshold')) {
                    fieldName = `Q-Bonus Threshold ${bonusIndex}`;
                    oldValueDisplay = change.oldValue + '%';
                    newValueDisplay = change.newValue + '%';
                } else if (change.field.includes('Upto')) {
                    fieldName = `Q-Bonus Upper Limit ${bonusIndex}`;
                    oldValueDisplay = change.oldValue + '%';
                    newValueDisplay = change.newValue + '%';
                } else {
                    fieldName = `Q-Bonus Amount ${bonusIndex}`;
                    oldValueDisplay = PayoutSimulator.utils.formatters.formatCurrency(change.oldValue);
                    newValueDisplay = PayoutSimulator.utils.formatters.formatCurrency(change.newValue);
                }
            } else if (change.type === 'rollingAverage') {
                fieldName = '3-Month Rolling Average';
                oldValueDisplay = change.oldValue ? 'Enabled' : 'Disabled';
                newValueDisplay = change.newValue ? 'Enabled' : 'Disabled';
            }
            
            return `${fieldName}: ${oldValueDisplay} → ${newValueDisplay}`;
        }).join('<br>');
        
        // Create a summary of changes
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'model-comparison-summary';
        summaryContainer.innerHTML = `
            <h3>Applied Changes</h3>
            <p>Successfully applied "${recommendation.title}" recommendation.</p>
            <div class="recommendation-details" style="margin-top: 10px; margin-bottom: 10px;">
                ${changes}
            </div>
            <p>You can apply more recommendations or click "Apply All Recommendations" for a complete solution.</p>
        `;
        
        // Check if there's already a summary and replace it
        if (modelComparisonContainer) {
            const existingContainer = modelComparisonContainer.querySelector('.model-comparison-summary');
            if (existingContainer) {
                existingContainer.replaceWith(summaryContainer);
            } else {
                // Insert before the first child
                modelComparisonContainer.insertBefore(
                    summaryContainer, 
                    modelComparisonContainer.firstChild
                );
            }
        }
        
        // Update philosophy analysis
        if (PayoutSimulator.features.philosophy.analysis && 
            typeof PayoutSimulator.features.philosophy.analysis.updatePhilosophyAnalysis === 'function') {
            PayoutSimulator.features.philosophy.analysis.updatePhilosophyAnalysis();
        }
    },
    
    /**
     * Apply all recommendations
     */
    applyRecommendations: function() {
        const goalSelect = document.getElementById('recommendationGoal');
        if (!goalSelect) return;
        
        // Store current elasticity data
        const currentElasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        
        // Get current metrics for recommendations
        const currentMetrics = PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics(
            currentElasticityData, 
            PayoutSimulator.utils.calculations.generateRiskAssessment()
        );
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(
            currentMetrics,
            currentElasticityData,
            goalSelect.value
        );
        
        // Apply all changes
        recommendations.forEach(recommendation => {
            recommendation.changes.forEach(change => {
                if (change.field === 'useRollingAverage') {
                    document.getElementById(change.field).checked = change.newValue;
                    if (change.newValue) {
                        document.getElementById('previousMonthsContainer').style.display = 'block';
                    } else {
                        document.getElementById('previousMonthsContainer').style.display = 'none';
                    }
                } else {
                    document.getElementById(change.field).value = change.newValue;
                }
            });
        });
        
        // Recalculate and update UI
        document.getElementById('calculateBtn').click();
        
        // Get new elasticity data
        const newElasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
        const newMetrics = PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics(
            newElasticityData, 
            PayoutSimulator.utils.calculations.generateRiskAssessment()
        );
        
        // Update model comparison
        this.updateComparisonChart(currentElasticityData, newElasticityData);
        
        // Show model comparison
        const modelComparisonContainer = document.getElementById('modelComparisonContainer');
        if (modelComparisonContainer) {
            modelComparisonContainer.style.display = 'block';
        }
        
        // Add metrics summary to comparison
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'model-comparison-summary';
        summaryContainer.innerHTML = `<h3>Changes Summary</h3>
            <p>The recommended changes have the following impacts:</p>`;
        
        // Create metrics comparison grid
        const metricsGrid = document.createElement('div');
        metricsGrid.className = 'comparison-metrics';
        
        // Add key metrics
        const targetPayout = {
            title: 'Target Payout (100%)',
            oldValue: currentMetrics.sizeOfPrize.targetPayout,
            newValue: newMetrics.sizeOfPrize.targetPayout,
            format: 'currency'
        };
        
        const maxPayout = {
            title: 'Maximum Payout (200%)',
            oldValue: currentMetrics.sizeOfPrize.maxPotential,
            newValue: newMetrics.sizeOfPrize.maxPotential,
            format: 'currency'
        };
        
        const targetJump = {
            title: 'Jump at 100%',
            oldValue: currentMetrics.psychology.nearMiss.targetJumpPercentage,
            newValue: newMetrics.psychology.nearMiss.targetJumpPercentage,
            format: 'percent'
        };
        
        const metrics = [targetPayout, maxPayout, targetJump];
        
        metrics.forEach(metric => {
            const metricDiv = document.createElement('div');
            metricDiv.className = 'comparison-metric';
            
            const change = metric.newValue - metric.oldValue;
            const changePercent = metric.oldValue ? (change / metric.oldValue) * 100 : 0;
            
            let formattedOld, formattedNew, formattedChange;
            if (metric.format === 'currency') {
                formattedOld = PayoutSimulator.utils.formatters.formatCurrency(metric.oldValue);
                formattedNew = PayoutSimulator.utils.formatters.formatCurrency(metric.newValue);
                formattedChange = (changePercent >= 0 ? '+' : '') + changePercent.toFixed(1) + '%';
            } else {
                formattedOld = metric.oldValue.toFixed(1) + '%';
                formattedNew = metric.newValue.toFixed(1) + '%';
                formattedChange = (change >= 0 ? '+' : '') + change.toFixed(1) + ' pts';
            }
            
            metricDiv.innerHTML = `
                <div class="comparison-metric-title">${metric.title}</div>
                <div class="comparison-metric-value">${formattedNew}</div>
                <div class="comparison-metric-change ${change >= 0 ? 'change-positive' : 'change-negative'}">
                    ${formattedChange} (was ${formattedOld})
                </div>
            `;
            
            metricsGrid.appendChild(metricDiv);
        });
        
        summaryContainer.appendChild(metricsGrid);
        
        // Insert summary before the chart
        if (modelComparisonContainer) {
            // Check if there's already a summary
            const existingContainer = modelComparisonContainer.querySelector('.model-comparison-summary');
            if (existingContainer) {
                existingContainer.replaceWith(summaryContainer);
            } else {
                modelComparisonContainer.insertBefore(summaryContainer, modelComparisonContainer.firstChild);
            }
        }
    },
    
    /**
     * Get recommendation explanation based on type
     * @param {string} type - Recommendation type
     * @returns {string} - Explanation text
     */
    getRecommendationExplanation: function(type) {
        switch(type) {
            case 'sizeOfPrize':
                return 'This recommendation is designed to improve the overall compensation opportunity, creating stronger motivation for high performance.';
            case 'distribution':
                return 'This recommendation helps balance the compensation available across different performance levels to better match your business objectives.';
            case 'psychology':
                return 'This recommendation enhances the psychological mechanisms that drive motivation and target achievement behaviors.';
            case 'structure':
                return 'This recommendation improves the fundamental structure of the compensation model to better align with compensation best practices.';
            default:
                return 'This recommendation is designed to optimize your compensation model.';
        }
    },
    
    /**
     * Save current form state (for restoration after comparison)
     * @returns {Object} - Current form state
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
     * @param {Object} state - Form state to restore
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

// Initialize the recommendations module when loaded
PayoutSimulator.features.philosophy.recommendations.init();