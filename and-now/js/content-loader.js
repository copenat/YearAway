/**
 * YearAway Content Loader
 * Loads content from separate HTML files into the main page
 */

class ContentLoader {
    constructor() {
        this.init();
    }

    init() {
        this.loadContent();
    }

    /**
     * Load all content files
     */
    async loadContent() {
        try {
            // Load tips categories
            await this.loadContentFile('tips-categories', 'tips-categories-container');
            
            // Load featured tips
            await this.loadContentFile('featured-tips', 'featured-tips-container');
            
            // Load travel products
            await this.loadContentFile('travel-products', 'travel-products-container');
            
            console.log('✅ All content loaded successfully');
        } catch (error) {
            console.error('❌ Error loading content:', error);
        }
    }

    /**
     * Load a specific content file
     */
    async loadContentFile(filename, containerId) {
        try {
            const response = await fetch(`content/${filename}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}.html: ${response.status}`);
            }
            
            const content = await response.text();
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = content;
            } else {
                console.warn(`Container ${containerId} not found`);
            }
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
        }
    }

    /**
     * Reload a specific content section
     */
    async reloadSection(sectionName) {
        const containerMap = {
            'categories': 'tips-categories-container',
            'tips': 'featured-tips-container',
            'products': 'travel-products-container'
        };

        const containerId = containerMap[sectionName];
        if (containerId) {
            await this.loadContentFile(sectionName === 'categories' ? 'tips-categories' : 
                                     sectionName === 'tips' ? 'featured-tips' : 'travel-products', 
                                     containerId);
        }
    }
}

// Initialize content loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    console.log('📄 YearAway Content Loader Initialized');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
}
