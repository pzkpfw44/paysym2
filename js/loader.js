/**
 * Module Loader System for Payout Elasticity Simulator
 * Handles dynamic loading of JavaScript modules
 */

// Track loaded modules to prevent duplicate loading
const PayoutSimulator = {
    loadedModules: {},
    loadingPromises: {},
    
    // Core components that must be loaded first
    core: {
        ui: null,
        events: null
    },
    
    // Feature modules
    features: {
        charts: {
            basic: null,
            advanced: null
        },
        scenarios: {
            manager: null,
            comparison: null
        },
        philosophy: {
            analysis: null,
            recommendations: null
        },
        exports: null
    },
    
    // Utility modules
    utils: {
        calculations: null,
        formatters: null
    },
    
    /**
     * Initialize the application with core modules
     */
    init: async function() {
        console.log("Initializing Payout Simulator...");
        
        // Load essential modules
        await this.loadModule('utils/calculations');
        await this.loadModule('utils/formatters');
        await this.loadModule('core/ui');
        await this.loadModule('core/events');
        
        // Load basic chart functionality
        await this.loadModule('features/charts/basic-charts');
        
        // Load scenario manager
        await this.loadModule('features/scenarios/manager');
        
        console.log("Core initialization complete");
        
        // Initialize the application
        if (typeof this.core.ui.init === 'function') {
            this.core.ui.init();
        }
        
        if (typeof this.core.events.init === 'function') {
            this.core.events.init();
        }
    },
    
    /**
     * Load a module dynamically
     * @param {string} modulePath - Path to the module without .js extension
     * @returns {Promise} - Promise that resolves when the module is loaded
     */
    loadModule: function(modulePath) {
        if (this.loadedModules[modulePath]) {
            return Promise.resolve();
        }
        
        if (this.loadingPromises[modulePath]) {
            return this.loadingPromises[modulePath];
        }
        
        console.log(`Loading module: ${modulePath}`);
        
        this.loadingPromises[modulePath] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/${modulePath}.js`;
            script.onload = () => {
                console.log(`Module loaded: ${modulePath}`);
                this.loadedModules[modulePath] = true;
                delete this.loadingPromises[modulePath];
                resolve();
            };
            script.onerror = (error) => {
                console.error(`Failed to load module: ${modulePath}`, error);
                delete this.loadingPromises[modulePath];
                reject(error);
            };
            document.head.appendChild(script);
        });
        
        return this.loadingPromises[modulePath];
    },
    
    /**
     * Load philosophy analysis functionality (lazy-loaded)
     */
    loadPhilosophyAnalysis: async function() {
        if (!this.features.philosophy.analysis) {
            await this.loadModule('features/philosophy/analysis');
            await this.loadModule('features/philosophy/recommendations');
            
            // Initialize philosophy components if needed
            if (typeof this.features.philosophy.analysis.init === 'function') {
                this.features.philosophy.analysis.init();
            }
        }
        return this.features.philosophy.analysis;
    },
    
    /**
     * Load advanced chart functionality (lazy-loaded)
     */
    loadAdvancedCharts: async function() {
        if (!this.features.charts.advanced) {
            await this.loadModule('features/charts/advanced-charts');
        }
        return this.features.charts.advanced;
    },
    
    /**
     * Load scenario comparison functionality (lazy-loaded)
     */
    loadScenarioComparison: async function() {
        if (!this.features.scenarios.comparison) {
            await this.loadModule('features/scenarios/comparison');
        }
        return this.features.scenarios.comparison;
    },
    
    /**
     * Load export functionality (lazy-loaded)
     */
    loadExports: async function() {
        if (!this.features.exports) {
            await this.loadModule('features/exports/exports');
        }
        return this.features.exports;
    }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    PayoutSimulator.init();
});