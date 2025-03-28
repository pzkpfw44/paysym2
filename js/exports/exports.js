/**
 * Export functionality for PDF and CSV exports
 * This is a lazy-loaded module
 */

// Register this module with the application
PayoutSimulator.features.exports = {
    /**
     * Initialize export functionality
     */
    init: function() {
        console.log("Initializing export functionality...");
        
        // Check for required libraries
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            console.error("jsPDF is not loaded. PDF exports will not work.");
        }
        
        console.log("Export functionality initialized");
    },
    
    /**
     * Export results as PDF
     */
    exportToPdf: function() {
        console.log("Exporting results as PDF...");
        
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            alert("PDF export library is not loaded. Please try again later.");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        
        // Create new PDF document
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 20;
        
        // Add title
        doc.setFontSize(18);
        doc.text('Payout Elasticity Simulator Results', pageWidth / 2, y, { align: 'center' });
        y += 10;
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Add summary section
        doc.setFontSize(14);
        doc.text('Summary', 14, y);
        y += 8;
        
        // Get current results
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
        
        // Check for rolling average
        const useRollingAverage = document.getElementById('useRollingAverage').checked;
        if (useRollingAverage) {
            doc.setFontSize(10);
            doc.text('* Using 3-month rolling average for commission calculations', 20, y);
            y += 7;
        }
        
        const results = PayoutSimulator.utils.calculations.calculateTotalPayout(quarterlyAchievements, monthlySales, fte);
        
        // Add results data
        doc.setFontSize(10);
        doc.text(`Average Achievement: ${PayoutSimulator.utils.formatters.formatPercent(results.avgAchievement)}`, 20, y);
        y += 7;
        doc.text(`Total Payout: ${PayoutSimulator.utils.formatters.formatCurrency(results.totalPayout)}`, 20, y);
        y += 7;
        doc.text(`Commission: ${PayoutSimulator.utils.formatters.formatCurrency(results.totalCommission)}`, 20, y);
        y += 7;
        doc.text(`Quarterly Bonus: ${PayoutSimulator.utils.formatters.formatCurrency(results.totalQuarterlyBonus)}`, 20, y);
        y += 7;
        doc.text(`Continuity Bonus: ${PayoutSimulator.utils.formatters.formatCurrency(results.totalContinuityBonus)}`, 20, y);
        y += 15;
        
        // Add quarterly breakdown
        doc.setFontSize(14);
        doc.text('Quarterly Breakdown', 14, y);
        y += 10;
        
        // Create table for quarterly data
        doc.setFontSize(8);
        const tableColumns = ['Quarter', 'Achievement', 'Quarterly Bonus', 'Continuity Bonus', 'Total'];
        const tableRows = [];
        
        for (let i = 0; i < 4; i++) {
            // Calculate quarterly commission subtotal (3 months)
            const qCommission = results.commissions.slice(i*3, (i+1)*3).reduce((sum, c) => sum + c, 0);
            const quarterTotal = results.quarterlyBonuses[i] + results.continuityBonuses[i] + qCommission;
            
            tableRows.push([
                `Q${i+1}`,
                PayoutSimulator.utils.formatters.formatPercent(quarterlyAchievements[i]),
                PayoutSimulator.utils.formatters.formatCurrency(results.quarterlyBonuses[i]),
                PayoutSimulator.utils.formatters.formatCurrency(results.continuityBonuses[i]),
                PayoutSimulator.utils.formatters.formatCurrency(quarterTotal)
            ]);
        }
        
        // Draw table
        doc.autoTable({
            head: [tableColumns],
            body: tableRows,
            startY: y,
            theme: 'grid',
            styles: {
                cellPadding: 2,
                fontSize: 8
            },
            headStyles: {
                fillColor: [210, 0, 75]
            }
        });
        
        y = doc.lastAutoTable.finalY + 15;
        
        // Add monthly breakdown
        if (y > pageHeight - 50) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Monthly Breakdown', 14, y);
        y += 10;
        
        // Create table for monthly data
        const monthColumns = ['Month', 'Sales (€)', 'Commission (€)'];
        const monthRows = [];
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
            monthRows.push([
                months[i],
                monthlySales[i].toLocaleString('de-DE', { maximumFractionDigits: 2 }),
                results.commissions[i].toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            ]);
        }
        
        // Draw table
        doc.autoTable({
            head: [monthColumns],
            body: monthRows,
            startY: y,
            theme: 'grid',
            styles: {
                cellPadding: 2,
                fontSize: 8
            },
            headStyles: {
                fillColor: [85, 85, 85]
            }
        });
        
        y = doc.lastAutoTable.finalY + 15;
        
        // Add elasticity insights
        if (y > pageHeight - 50) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Elasticity Analysis', 14, y);
        y += 8;
        
        // Get elasticity data if available
        let elasticityRangeResults = null;
        
        if (PayoutSimulator.features.charts.basic && 
            PayoutSimulator.features.charts.basic.elasticityRangeResults) {
            elasticityRangeResults = PayoutSimulator.features.charts.basic.elasticityRangeResults;
        }
        
        if (elasticityRangeResults) {
            const rangeNames = [
                '0% - 40%',
                '41% - 70%',
                '71% - 89%',
                '90% - 99%',
                '100% - 104%',
                '105% - 114%',
                '115% - 129%',
                '≥130%'
            ];
            
            const elasticityRanges = [
                '0to40',
                '41to70',
                '71to89',
                '90to99',
                '100to104',
                '105to114',
                '115to129',
                '130plus'
            ];
            
            // Create table for elasticity data
            const elasticityColumns = ['Range', 'Payout Increase per 1%', 'Revenue Increase per 1%', 'ROI Ratio'];
            const elasticityRows = [];
            
            for (let i = 0; i < rangeNames.length; i++) {
                const rangeKey = elasticityRanges[i];
                
                elasticityRows.push([
                    rangeNames[i],
                    PayoutSimulator.utils.formatters.formatCurrency(elasticityRangeResults[rangeKey].elasticity),
                    PayoutSimulator.utils.formatters.formatCurrency(elasticityRangeResults[rangeKey].revenuePerPoint),
                    PayoutSimulator.utils.formatters.formatRatio(elasticityRangeResults[rangeKey].roi)
                ]);
            }
            
            // Draw table
            doc.autoTable({
                head: [elasticityColumns],
                body: elasticityRows,
                startY: y,
                theme: 'grid',
                styles: {
                    cellPadding: 2,
                    fontSize: 8
                },
                headStyles: {
                    fillColor: [0, 153, 136]
                }
            });
        }
        
        // Add philosophy analysis section if available
        if (PayoutSimulator.features.philosophy && 
            PayoutSimulator.features.philosophy.analysis &&
            typeof PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics === 'function') {
                
            y = doc.lastAutoTable.finalY + 15;
            
            if (y > pageHeight - 50) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(14);
            doc.text('Compensation Philosophy Analysis', 14, y);
            y += 8;
            
            // Get philosophy metrics
            const elasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
            const riskAssessment = PayoutSimulator.utils.calculations.generateRiskAssessment();
            
            const philosophyMetrics = PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics(
                elasticityData, 
                riskAssessment
            );
            
            // Create table for philosophy metrics
            const philosophyColumns = ['Dimension', 'Score', 'Rating'];
            const philosophyRows = [
                ['Size of Prize', philosophyMetrics.sizeOfPrize.score + '/10', philosophyMetrics.sizeOfPrize.label],
                ['Reward Distribution', philosophyMetrics.distribution.score + '/10', philosophyMetrics.distribution.label],
                ['Psychological Mechanisms', philosophyMetrics.psychology.score + '/10', philosophyMetrics.psychology.label]
            ];
            
            // Draw table
            doc.autoTable({
                head: [philosophyColumns],
                body: philosophyRows,
                startY: y,
                theme: 'grid',
                styles: {
                    cellPadding: 2,
                    fontSize: 8
                },
                headStyles: {
                    fillColor: [153, 102, 204]
                }
            });
        }
        
        // Save PDF
        doc.save('payout-simulator-results.pdf');
        
        console.log("PDF export complete");
    },
    
    /**
     * Export results as CSV
     */
    exportToCsv: function() {
        console.log("Exporting results as CSV...");
        
        // Get current results
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
        
        const results = PayoutSimulator.utils.calculations.calculateTotalPayout(quarterlyAchievements, monthlySales, fte);
        
        // Generate CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Add commission calculation method
        const useRollingAverage = document.getElementById('useRollingAverage').checked;
        csvContent += `Commission Calculation,${useRollingAverage ? '3-Month Rolling Average' : 'Monthly'}\n\n`;
        
        // Summary section
        csvContent += 'Summary\n';
        csvContent += `Average Achievement,${results.avgAchievement.toFixed(1)}%\n`;
        csvContent += `Total Payout,${results.totalPayout.toFixed(2)}\n`;
        csvContent += `Commission,${results.totalCommission.toFixed(2)}\n`;
        csvContent += `Quarterly Bonus,${results.totalQuarterlyBonus.toFixed(2)}\n`;
        csvContent += `Continuity Bonus,${results.totalContinuityBonus.toFixed(2)}\n\n`;
        
        // Quarterly breakdown
        csvContent += 'Quarterly Breakdown\n';
        csvContent += 'Quarter,Achievement,Quarterly Bonus,Continuity Bonus,Total\n';
        
        for (let i = 0; i < 4; i++) {
            // Calculate quarterly commission subtotal (3 months)
            const qCommission = results.commissions.slice(i*3, (i+1)*3).reduce((sum, c) => sum + c, 0);
            const quarterTotal = results.quarterlyBonuses[i] + results.continuityBonuses[i] + qCommission;
            
            csvContent += `Q${i+1},${quarterlyAchievements[i].toFixed(1)}%,${results.quarterlyBonuses[i].toFixed(2)},${results.continuityBonuses[i].toFixed(2)},${quarterTotal.toFixed(2)}\n`;
        }
        
        csvContent += '\nMonthly Breakdown\n';
        csvContent += 'Month,Sales,Commission\n';
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
            csvContent += `${months[i]},${monthlySales[i].toFixed(2)},${results.commissions[i].toFixed(2)}\n`;
        }
        
        // Elasticity data if available
        let elasticityRangeResults = null;
        
        if (PayoutSimulator.features.charts.basic && 
            PayoutSimulator.features.charts.basic.elasticityRangeResults) {
            elasticityRangeResults = PayoutSimulator.features.charts.basic.elasticityRangeResults;
            
            csvContent += '\nElasticity Analysis\n';
            csvContent += 'Range,Payout Increase per 1%,Revenue Increase per 1%,ROI Ratio\n';
            
            const rangeNames = [
                '0% - 40%',
                '41% - 70%',
                '71% - 89%',
                '90% - 99%',
                '100% - 104%',
                '105% - 114%',
                '115% - 129%',
                '≥130%'
            ];
            
            const elasticityRanges = [
                '0to40',
                '41to70',
                '71to89',
                '90to99',
                '100to104',
                '105to114',
                '115to129',
                '130plus'
            ];
            
            for (let i = 0; i < rangeNames.length; i++) {
                const rangeKey = elasticityRanges[i];
                
                csvContent += `${rangeNames[i]},${elasticityRangeResults[rangeKey].elasticity.toFixed(2)},${elasticityRangeResults[rangeKey].revenuePerPoint.toFixed(2)},${elasticityRangeResults[rangeKey].roi.toFixed(1)}:1\n`;
            }
        }
        
        // Philosophy analysis if available
        if (PayoutSimulator.features.philosophy && 
            PayoutSimulator.features.philosophy.analysis &&
            typeof PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics === 'function') {
                
            csvContent += '\nCompensation Philosophy Analysis\n';
            csvContent += 'Dimension,Score,Rating\n';
            
            // Get philosophy metrics
            const elasticityData = PayoutSimulator.utils.calculations.simulateElasticity();
            const riskAssessment = PayoutSimulator.utils.calculations.generateRiskAssessment();
            
            const philosophyMetrics = PayoutSimulator.features.philosophy.analysis.calculatePhilosophyMetrics(
                elasticityData, 
                riskAssessment
            );
            
            csvContent += `Size of Prize,${philosophyMetrics.sizeOfPrize.score},${philosophyMetrics.sizeOfPrize.label}\n`;
            csvContent += `Reward Distribution,${philosophyMetrics.distribution.score},${philosophyMetrics.distribution.label}\n`;
            csvContent += `Psychological Mechanisms,${philosophyMetrics.psychology.score},${philosophyMetrics.psychology.label}\n`;
        }
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'payout-simulator-results.csv');
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        
        console.log("CSV export complete");
    }
};

// Initialize the export functionality when the module is loaded
PayoutSimulator.features.exports.init();