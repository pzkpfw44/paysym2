/**
 * Formatting utilities for the Payout Elasticity Simulator
 */

// Register this module with the application
PayoutSimulator.utils.formatters = {
    /**
     * Format a number as currency (Euro format)
     * @param {number} amount - The amount to format
     * @returns {string} - Formatted currency string
     */
    formatCurrency: function(amount) {
        return '€' + amount.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    
    /**
     * Format a number as percentage
     * @param {number} value - The value to format
     * @returns {string} - Formatted percentage string
     */
    formatPercent: function(value) {
        return value.toLocaleString('de-DE', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + '%';
    },
    
    /**
     * Format a number as ratio
     * @param {number} value - The value to format
     * @returns {string} - Formatted ratio string
     */
    formatRatio: function(value) {
        return value.toLocaleString('de-DE', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + ':1';
    },
    
    /**
     * Get typicality indicator for a value
     * @param {number} value - The value to check
     * @param {number} lowerBound - Lower bound of typical range
     * @param {number} upperBound - Upper bound of typical range
     * @returns {string} - 'below', 'typical', or 'above'
     */
    getTypicalityIndicator: function(value, lowerBound, upperBound) {
        if (value < lowerBound) return 'below';
        if (value > upperBound) return 'above';
        return 'typical';
    },
    
    /**
     * Return typicality text
     * @param {string} typicality - Typicality indicator ('below', 'typical', or 'above')
     * @returns {string} - Human-readable typicality description
     */
    getTypicalityText: function(typicality) {
        switch(typicality) {
            case 'below': return '(below typical range)';
            case 'above': return '(above typical range)';
            default: return '(within typical range)';
        }
    },
    
    /**
     * Generate elasticity insight text based on data analysis
     * @param {Array} elasticityData - Elasticity data from simulation
     * @returns {string} - HTML-formatted insight text
     */
    generateElasticityInsight: function(elasticityData) {
        // Find key inflection points
        const thresholds = [40, 70, 90, 100, 105, 115, 130];
        const inflectionPoints = thresholds.map(threshold => {
            return elasticityData.find(d => d.achievement >= threshold);
        }).filter(Boolean);
        
        // Calculate slopes at different regions
        const slopes = [];
        const ranges = [
            { name: '0-40%', start: 0, end: 40 },
            { name: '41-70%', start: 41, end: 70 },
            { name: '71-89%', start: 71, end: 89 },
            { name: '90-99%', start: 90, end: 99 },
            { name: '100-104%', start: 100, end: 104 },
            { name: '105-114%', start: 105, end: 114 },
            { name: '115-129%', start: 115, end: 129 },
            { name: '≥130%', start: 130, end: 200 }
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
                
                const slope = achievementDiff > 0 ? payoutDiff / achievementDiff : 0;
                
                slopes.push({
                    range: range.name,
                    start: range.start,
                    end: range.end,
                    slope: slope
                });
            }
        });
        
        // Find steepest slope
        let steepestSlope = slopes.reduce((prev, current) => 
            (prev.slope > current.slope) ? prev : current, { slope: 0 });
            
        // Find optimal achievement point (highest payout per percentage point)
        const payoutPerPoint = elasticityData.map(d => ({
            achievement: d.achievement,
            ratio: d.achievement > 0 ? d.totalExcludingContinuity / d.achievement : 0
        }));
        
        const optimalPoint = payoutPerPoint.reduce((prev, current) => 
            (current.ratio > prev.ratio) ? current : prev, { ratio: 0 });
        
        // Generate insight text
        let insightHtml = `
            <h3>Payout Elasticity Analysis</h3>
            <p>The payout model shows <span class="insight-highlight">different elasticity levels</span> at various achievement thresholds:</p>
            <ul>
        `;
        
        // Add insights about each threshold change
        slopes.forEach(slope => {
            insightHtml += `<li>Achievement ${slope.range}: Payout increases by <span class="insight-highlight">~${Math.round(slope.slope)} €</span> per percentage point</li>`;
        });
        
        insightHtml += `</ul>`;
        
        // Add commission method info
        const useRollingAverage = document.getElementById('useRollingAverage').checked;
        if (useRollingAverage) {
            insightHtml += `
                <p><span class="insight-highlight">Commission calculation:</span> Using 3-month rolling average method, which stabilizes monthly commissions and helps prevent sales manipulation.</p>
            `;
        }
        
        // Add recommendation
        insightHtml += `
            <p><span class="insight-highlight">Key observation:</span> The steepest increase in payout occurs in the ${steepestSlope.range} range, where each additional percentage point of achievement yields approximately ${Math.round(steepestSlope.slope)} € in additional payout.</p>
            <p><span class="insight-highlight">Recommendation:</span> For maximum payout efficiency, target achievement should be at least ${Math.max(90, optimalPoint.achievement)}%, as this provides the best return on performance. Achieving continuity bonuses by maintaining performance above ${document.getElementById('continuityThreshold').value}% for consecutive quarters further enhances payout.</p>
        `;
        
        return insightHtml;
    }
};