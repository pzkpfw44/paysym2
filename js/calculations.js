/**
 * Core calculation utilities for the Payout Elasticity Simulator
 */

// Register this module with the application
PayoutSimulator.utils.calculations = {
    /**
     * Calculate commission based on monthly sales and FTE
     * @param {number} monthlySales - Monthly sales amount
     * @param {number} fte - FTE value (0.7-1.0)
     * @param {boolean} useRollingAverage - Whether to use 3-month rolling average
     * @param {number} month - Month index (0-11)
     * @param {Array} previousMonths - Sales for previous months before January
     * @param {Array} allMonthlySales - All monthly sales values
     * @returns {number} - Commission amount
     */
    calculateCommission: function(monthlySales, fte, useRollingAverage, month, previousMonths, allMonthlySales) {
        if (fte <= 0.7) return 0;
        
        let salesValue = monthlySales;
        
        // Apply 3-month rolling average if enabled
        if (useRollingAverage) {
            if (month === 0) {
                // January: Average with previous Nov and Dec
                salesValue = (monthlySales + previousMonths[0] + previousMonths[1]) / 3;
            } else if (month === 1) {
                // February: Average with previous Dec and current Jan
                salesValue = (monthlySales + previousMonths[1] + allMonthlySales[0]) / 3;
            } else {
                // All other months: Average with previous 2 months
                salesValue = (monthlySales + allMonthlySales[month-1] + allMonthlySales[month-2]) / 3;
            }
        }
        
        // Get commission thresholds from inputs
        const thresholds = [];
        for (let i = 1; i <= 3; i++) {
            thresholds.push({
                threshold: parseFloat(document.getElementById(`commThreshold${i}`).value),
                upTo: i < 3 ? parseFloat(document.getElementById(`commThresholdUpto${i}`).value) : Infinity,
                percentage: parseFloat(document.getElementById(`commPercentage${i}`).value) / 100
            });
        }
        
        // Sort thresholds by threshold value
        thresholds.sort((a, b) => a.threshold - b.threshold);
        
        let commission = 0;
        
        // Calculate commission based on thresholds
        for (let i = 0; i < thresholds.length; i++) {
            const tier = thresholds[i];
            
            if (salesValue > tier.threshold) {
                const tierAmount = Math.min(salesValue, tier.upTo) - tier.threshold;
                commission += tierAmount * tier.percentage;
            }
        }
        
        return commission;
    },
    
    /**
     * Calculate quarterly bonus based on achievement percentage and FTE
     * @param {number} achievementPercentage - Quarterly achievement percentage
     * @param {number} fte - FTE value (0.7-1.0)
     * @returns {number} - Quarterly bonus amount
     */
    calculateQuarterlyBonus: function(achievementPercentage, fte) {
        // Get thresholds from inputs
        const thresholds = [];
        for (let i = 1; i <= 5; i++) {
            thresholds.push({
                threshold: parseFloat(document.getElementById(`qThreshold${i}`).value),
                upTo: i < 5 ? parseFloat(document.getElementById(`qThresholdUpto${i}`).value) : Infinity,
                bonus: parseFloat(document.getElementById(`qBonus${i}`).value)
            });
        }
        
        // Sort thresholds by threshold value
        thresholds.sort((a, b) => a.threshold - b.threshold);
        
        // Find applicable bonus
        let bonus = 0;
        for (const tier of thresholds) {
            if (achievementPercentage >= tier.threshold && achievementPercentage <= tier.upTo) {
                bonus = tier.bonus;
                break;
            }
        }
        
        return bonus * fte;
    },
    
    /**
     * Calculate continuity bonus when target is achieved for two consecutive quarters
     * @param {number} prevAchievement - Previous quarter achievement
     * @param {number} currentAchievement - Current quarter achievement
     * @param {number} fte - FTE value (0.7-1.0)
     * @returns {number} - Continuity bonus amount
     */
    calculateContinuityBonus: function(prevAchievement, currentAchievement, fte) {
        const continuityThreshold = parseFloat(document.getElementById('continuityThreshold').value);
        
        if (prevAchievement < continuityThreshold || currentAchievement < continuityThreshold) return 0;
        
        // Get thresholds from inputs
        const thresholds = [];
        for (let i = 1; i <= 4; i++) {
            thresholds.push({
                threshold: parseFloat(document.getElementById(`cThreshold${i}`).value),
                upTo: i < 4 ? parseFloat(document.getElementById(`cThresholdUpto${i}`).value) : Infinity,
                bonus: parseFloat(document.getElementById(`cBonus${i}`).value)
            });
        }
        
        // Sort thresholds by threshold value
        thresholds.sort((a, b) => a.threshold - b.threshold);
        
        // Find applicable bonus
        let bonus = 0;
        for (const tier of thresholds) {
            if (currentAchievement >= tier.threshold && currentAchievement <= tier.upTo) {
                bonus = tier.bonus;
                break;
            }
        }
        
        return bonus * fte;
    },
    
    /**
     * Calculate total payout with all components
     * @param {Array} quarterlies - Array of quarterly achievement percentages
     * @param {Array} monthlySales - Array of monthly sales values
     * @param {number} fte - FTE value (0.7-1.0)
     * @returns {Object} - Object containing all payout components
     */
    calculateTotalPayout: function(quarterlies, monthlySales, fte) {
        // Get rolling average option
        const useRollingAverage = document.getElementById('useRollingAverage').checked;
        
        // Get previous months data
        const previousMonths = [
            parseFloat(document.getElementById('previousMonth1').value),
            parseFloat(document.getElementById('previousMonth2').value)
        ];
        
        // Calculate quarterly bonuses
        const quarterlyBonuses = quarterlies.map(q => this.calculateQuarterlyBonus(q, fte));
        
        // Calculate continuity bonuses
        const continuityBonuses = [0];
        for (let i = 1; i < quarterlies.length; i++) {
            continuityBonuses.push(this.calculateContinuityBonus(quarterlies[i-1], quarterlies[i], fte));
        }
        
        // Calculate monthly commissions - pass full monthlySales array
        const commissions = monthlySales.map((m, index) => 
            this.calculateCommission(m, fte, useRollingAverage, index, previousMonths, monthlySales));
        
        // Total quarterly bonuses
        const totalQuarterlyBonus = quarterlyBonuses.reduce((sum, q) => sum + q, 0);
        
        // Total continuity bonuses
        const totalContinuityBonus = continuityBonuses.reduce((sum, c) => sum + c, 0);
        
        // Total commissions
        const totalCommission = commissions.reduce((sum, c) => sum + c, 0);
        
        // Grand total
        const totalPayout = totalQuarterlyBonus + totalContinuityBonus + totalCommission;
        
        // Average yearly achievement
        const avgAchievement = quarterlies.reduce((sum, q) => sum + q, 0) / quarterlies.length;
        
        // Calculate yearly revenue (sum of monthly sales)
        const yearlyRevenue = monthlySales.reduce((sum, m) => sum + m, 0);
        
        return {
            quarterlyBonuses,
            continuityBonuses,
            commissions,
            totalQuarterlyBonus,
            totalContinuityBonus,
            totalCommission,
            totalPayout,
            avgAchievement,
            yearlyRevenue
        };
    },
    
    /**
     * Calculate yearly revenue from monthly sales inputs
     * @returns {number} - Total yearly revenue
     */
    calculateYearlyRevenue: function() {
        let total = 0;
        for (let i = 1; i <= 12; i++) {
            const sales = parseFloat(document.getElementById(`m${i}Sales`).value) || 0;
            total += sales;
        }
        return total;
    },
    
    /**
     * Simulate elasticity across achievement levels
     * @returns {Array} - Array of objects with elasticity data at different achievement levels
     */
    simulateElasticity: function() {
        const fte = parseFloat(document.getElementById('fte').value);
        let results = [];
        
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
        
        // Simulate from 0% to 200% in 1% increments for more precision
        for (let i = 0; i <= 200; i++) {
            const achievement = i;
            
            // Scale normalized monthly sales by achievement percentage
            const scaledMonthlySales = normalizedMonthlySales.map(sales => sales * achievement / 100);
            
            // Calculate quarterly bonus for this achievement level
            const quarterlyBonus = this.calculateQuarterlyBonus(achievement, fte) * 4; // For 4 quarters
            
            // Calculate commission for the scaled sales - pass full scaledMonthlySales array
            const commissionsForElasticity = scaledMonthlySales.map((m, index) => 
                this.calculateCommission(m, fte, useRollingAverage, index, previousMonths, scaledMonthlySales));
                
            const totalCommission = commissionsForElasticity.reduce((sum, c) => sum + c, 0);
            
            // Total excluding continuity bonus
            const totalExcludingContinuity = quarterlyBonus + totalCommission;
            
            results.push({
                achievement,
                commission: totalCommission,
                quarterlyBonus: quarterlyBonus,
                totalExcludingContinuity
            });
        }
        
        return results;
    },
    
    /**
     * Generate risk assessment based on different performance scenarios
     * @returns {Object} - Risk assessment data
     */
    generateRiskAssessment: function() {
        const yearlyTarget = parseFloat(document.getElementById('yearlyTarget').value);
        const fte = parseFloat(document.getElementById('fte').value);
        
        // Calculate payouts at different risk levels
        const lowRiskScenario = this.calculateTotalPayout([80, 80, 80, 80], Array(12).fill(20000 * 0.8), fte);
        const targetScenario = this.calculateTotalPayout([100, 100, 100, 100], Array(12).fill(20000), fte);
        const highRiskScenario = this.calculateTotalPayout([150, 150, 150, 150], Array(12).fill(20000 * 1.5), fte);
        
        // Calculate revenue at different levels
        const lowRiskRevenue = yearlyTarget * 0.8;
        const targetRevenue = yearlyTarget;
        const highRiskRevenue = yearlyTarget * 1.5;
        
        // Calculate profit margins (assuming 30% margin)
        const profitMargin = 0.3;
        const lowRiskProfit = lowRiskRevenue * profitMargin;
        const targetProfit = targetRevenue * profitMargin;
        const highRiskProfit = highRiskRevenue * profitMargin;
        
        // Calculate compensation as percentage of profit
        const lowRiskCompRatio = lowRiskScenario.totalPayout / lowRiskProfit * 100;
        const targetCompRatio = targetScenario.totalPayout / targetProfit * 100;
        const highRiskCompRatio = highRiskScenario.totalPayout / highRiskProfit * 100;
        
        let riskRating;
        let recommendation;
        
        if (highRiskCompRatio > 30) {
            riskRating = "High";
            recommendation = "The current compensation structure presents significant financial risk at high achievement levels. Consider capping bonuses or implementing a declining rate structure for achievements above 130%.";
        } else if (targetCompRatio > 20) {
            riskRating = "Medium";
            recommendation = "The compensation structure is moderately risky at target achievement. Consider optimizing the threshold levels to better align with business margins.";
        } else {
            riskRating = "Low";
            recommendation = "The compensation structure is well balanced with good alignment between performance and payout. The risk to company profitability is minimal even at high achievement levels.";
        }
        
        return {
            lowRiskPayout: lowRiskScenario.totalPayout,
            targetPayout: targetScenario.totalPayout,
            highRiskPayout: highRiskScenario.totalPayout,
            riskRating,
            recommendation,
            payoutPercentages: {
                lowRisk: lowRiskCompRatio,
                target: targetCompRatio,
                highRisk: highRiskCompRatio
            }
        };
    }
};