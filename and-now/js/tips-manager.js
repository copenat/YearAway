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
            this.renderAllTipsByCategory();
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

        // Back to categories button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('back-to-categories')) {
                this.backToCategories();
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
     * Render all tips organized by category
     */
    renderAllTipsByCategory() {
        const container = document.getElementById('all-tips-container');
        if (!container || !this.tipsData) return;

        let allTipsHtml = '';

        // Group tips by category
        this.tipsData.categories.forEach(category => {
            const categoryTips = this.tipsData.tips.filter(tip => tip.category === category.name);
            
            if (categoryTips.length > 0) {
                const tipsHtml = categoryTips.map(tip => this.renderTipCard(tip)).join('');
                
                allTipsHtml += `
                    <div class="category-section" id="category-${category.id}">
                        <div class="category-header">
                            <h3>${category.icon} ${category.name}</h3>
                            <span class="category-tip-count">${categoryTips.length} tips</span>
                        </div>
                        <div class="tips-grid">
                            ${tipsHtml}
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = allTipsHtml;
    }


    /**
     * Render individual tip card
     */
    renderTipCard(tip) {
        // Filter out members-only content for non-members
        if (this.authSystem && !this.authSystem.isMember() && !tip.isPublic) {
            return '';
        }

        const memberOnlyClass = !tip.isPublic ? 'members-only' : '';
        const memberIndicator = !tip.isPublic ? '<div class="member-indicator">🔒 Members Only</div>' : '';
        const testNote = tip.testNote ? ` <strong>${tip.testNote}</strong>` : '';
        
        // Get category icon from categories section
        const category = this.tipsData.categories.find(cat => cat.name === tip.category);
        const categoryIcon = category ? category.icon : '📝';

        return `
            <div class="tip-card ${memberOnlyClass}">
                ${memberIndicator}
                <div class="tip-header">
                    <div class="tip-category">${categoryIcon} ${tip.category}</div>
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
     * Scroll to category section
     */
    filterByCategory(categoryId) {
        // Update active state
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${categoryId}"]`).classList.add('active');
        
        // Scroll to the category section
        const targetSection = document.getElementById(`category-${categoryId}`);
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Filter tips by tag
     */
    filterByTag(tag) {
        // For now, just highlight the tag - could implement tag filtering later
        console.log('Tag clicked:', tag);
    }

    /**
     * Show all tips (scroll to top)
     */
    showAllTips() {
        // Remove active state from category buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Scroll to the top of the tips section
        const tipsSection = document.querySelector('.all-tips');
        if (tipsSection) {
            tipsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Back to categories (scroll to categories section)
     */
    backToCategories() {
        // Remove active state from category buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Scroll to the categories section
        const categoriesSection = document.querySelector('.tips-categories');
        if (categoriesSection) {
            categoriesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Set reference to auth system
     */
    setAuthSystem(authSystem) {
        this.authSystem = authSystem;
        // Re-render tips when auth status changes
        this.renderAllTipsByCategory();
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
        
        this.renderAllTipsByCategory();
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
