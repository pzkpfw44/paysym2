/**
 * Main application entry point for Payout Elasticity Simulator
 * This script initializes all modules and configures chart.js
 */

// Configure global chart options
function configureChartGlobals() {
    if (typeof Chart !== 'undefined') {
        // Set global defaults for all charts
        Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.color = '#555555';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(51, 51, 51, 0.9)';
        Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
        Chart.defaults.plugins.tooltip.bodyColor = '#ffffff';
        Chart.defaults.plugins.legend.position = 'bottom';
        
        console.log("Chart.js global settings configured");
    } else {
        console.warn("Chart.js not loaded yet");
    }
}

// Handle collapsible sections
function initializeCollapsibles() {
    document.querySelectorAll('.collapsible').forEach(collapsible => {
        collapsible.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            
            // Find the corresponding content element
            const targetId = this.id.replace('Toggle', 'Content');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                targetContent.classList.toggle('expanded');
            }
        });
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Payout Elasticity Simulator...");
    
    // Configure global chart settings
    configureChartGlobals();
    
    // Initialize collapsibles (in case they're not handled by ui.js)
    initializeCollapsibles();
    
    // The rest of the initialization is handled by the loader.js module
});

// Helper function for exporting charts as images
window.exportChartAsImage = function(chartId, filename) {
    const canvas = document.getElementById(chartId);
    
    if (!canvas) {
        console.error(`Canvas with ID ${chartId} not found`);
        return;
    }
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename || 'chart-export.png';
    
    // Append to document, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Global error handler for asynchronous operations
window.handleAsyncError = function(error, context) {
    console.error(`Error in ${context || 'async operation'}:`, error);
    
    // Check if we should display a user-friendly error message
    if (error.userMessage) {
        alert(error.userMessage);
    } else {
        alert(`An error occurred: ${error.message || 'Unknown error'}`);
    }
};