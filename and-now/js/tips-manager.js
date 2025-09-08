/**
 * YearAway Tips Manager
 * Handles dynamic filtering and display of tips based on categories and tags
 */

class TipsManager {
    constructor() {
        this.tipsData = null;
        this.currentFilter = 'all';
        this.authSystem = null;
        this.init();
    }

    async init() {
        try {
            await this.loadTipsData();
            this.setupEventListeners();
            this.renderCategories();
            this.renderTips();
            this.renderProducts();
            console.log('✅ Tips Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Tips Manager:', error);
        }
    }

    /**
     * Load tips data from JSON file
     */
    async loadTipsData() {
        try {
            const response = await fetch('content/tips-data.json');
            if (!response.ok) {
                throw new Error(`Failed to load tips data: ${response.status}`);
            }
            this.tipsData = await response.json();
            console.log('📄 Tips data loaded:', this.tipsData.tips.length, 'tips');
        } catch (error) {
            console.error('Error loading tips data:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners for filtering
     */
    setupEventListeners() {
        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-filter')) {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            }
        });

        // Tag filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter')) {
                const tag = e.target.dataset.tag;
                this.filterByTag(tag);
            }
        });

        // Show all button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('show-all-tips')) {
                this.showAllTips();
            }
        });
    }

    /**
     * Render category cards
     */
    renderCategories() {
        const container = document.getElementById('tips-categories-container');
        if (!container || !this.tipsData) return;

        const categoriesHtml = this.tipsData.categories.map(category => `
            <div class="category-card category-filter" data-category="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="tip-count">${category.tipCount} Tips</div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="categories-grid">
                ${categoriesHtml}
            </div>
        `;
    }

    /**
     * Render tips based on current filter
     */
    renderTips() {
        const container = document.getElementById('featured-tips-container');
        if (!container || !this.tipsData) return;

        const filteredTips = this.getFilteredTips();
        const tipsHtml = filteredTips.map(tip => this.renderTipCard(tip)).join('');

        container.innerHTML = `
            <div class="filter-controls">
                <button class="btn btn-secondary show-all-tips">Show All Tips</button>
                <span class="filter-info">Showing ${filteredTips.length} of ${this.tipsData.tips.length} tips</span>
            </div>
            <div class="tips-grid">
                ${tipsHtml}
            </div>
        `;
    }

    /**
     * Get filtered tips based on current filter
     */
    getFilteredTips() {
        if (!this.tipsData) return [];

        let filtered = this.tipsData.tips;

        // Filter by category
        if (this.currentFilter !== 'all') {
            const category = this.tipsData.categories.find(cat => cat.id === this.currentFilter);
            if (category) {
                filtered = filtered.filter(tip => 
                    tip.category.toLowerCase().replace(' & ', '-').replace(' ', '-') === category.id
                );
            }
        }

        // Filter by authentication status
        if (this.authSystem && !this.authSystem.isMember()) {
            filtered = filtered.filter(tip => tip.isPublic);
        }

        return filtered;
    }

    /**
     * Render individual tip card
     */
    renderTipCard(tip) {
        const memberOnlyClass = !tip.isPublic ? 'members-only' : '';
        const memberIndicator = !tip.isPublic ? '<div class="member-indicator">🔒 Members Only</div>' : '';
        const testNote = tip.testNote ? ` <strong>${tip.testNote}</strong>` : '';

        return `
            <div class="tip-card ${memberOnlyClass}">
                ${memberIndicator}
                <div class="tip-header">
                    <div class="tip-category">${tip.categoryIcon} ${tip.category}</div>
                    <div class="tip-rating">${'⭐'.repeat(tip.rating)}</div>
                </div>
                <h3>${tip.title}</h3>
                <p>${tip.description}${testNote}</p>
                <div class="tip-tags">
                    ${tip.tags.map(tag => `<span class="tag tag-filter" data-tag="${tag}">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Filter tips by category
     */
    filterByCategory(categoryId) {
        this.currentFilter = categoryId;
        this.renderTips();
        
        // Update active state
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${categoryId}"]`).classList.add('active');
    }

    /**
     * Filter tips by tag
     */
    filterByTag(tag) {
        // For now, just highlight the tag - could implement tag filtering later
        console.log('Tag clicked:', tag);
    }

    /**
     * Show all tips
     */
    showAllTips() {
        this.currentFilter = 'all';
        this.renderTips();
        
        // Remove active state from category buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    /**
     * Set reference to auth system
     */
    setAuthSystem(authSystem) {
        this.authSystem = authSystem;
        // Re-render tips when auth status changes
        this.renderTips();
    }

    /**
     * Render products section
     */
    renderProducts() {
        const container = document.getElementById('travel-products-container');
        if (!container || !this.tipsData || !this.tipsData.products) return;

        const productsHtml = this.tipsData.products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <div class="product-placeholder">${product.icon}</div>
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-rating">${'⭐'.repeat(product.rating)}</div>
                    <div class="product-price">${product.price}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="products-grid">
                ${productsHtml}
            </div>
        `;
    }

    /**
     * Add new tip (for future use)
     */
    addTip(tipData) {
        if (!this.tipsData) return;
        
        this.tipsData.tips.push({
            id: `tip-${Date.now()}`,
            ...tipData
        });
        
        this.renderTips();
        this.renderCategories();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tipsManager = new TipsManager();
    console.log('📝 YearAway Tips Manager Initialized');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TipsManager;
}
