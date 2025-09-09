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
            console.log('🚀 Starting Tips Manager initialization...');
            
            // Check if containers exist
            const categoriesContainer = document.getElementById('tips-categories-container');
            const tipsContainer = document.getElementById('all-tips-container');
            const productsContainer = document.getElementById('travel-products-container');
            
            console.log('📦 Container check:', {
                categories: !!categoriesContainer,
                tips: !!tipsContainer,
                products: !!productsContainer
            });
            
            await this.loadTipsData();
            console.log('📄 Tips data loaded:', this.tipsData);
            await this.loadCategoryCounts();
            console.log('📊 Category counts loaded:', this.categoryCounts);
            this.setupEventListeners();
            this.renderCategories();
            this.renderAllTipsByCategory();
            this.renderProducts();
            console.log('✅ Tips Manager initialized successfully');
            console.log('📊 Category counts available:', !!this.categoryCounts);
            console.log('📄 Tips data available:', !!this.tipsData);
        } catch (error) {
            console.error('❌ Error initializing Tips Manager:', error);
        }
    }

    /**
     * Load tips data from YAML file
     */
    async loadTipsData() {
        try {
            const response = await fetch('content/tips-data.yaml');
            if (!response.ok) {
                throw new Error(`Failed to load tips data: ${response.status}`);
            }
            const yamlText = await response.text();
            console.log('📄 Raw YAML text length:', yamlText.length);
            this.tipsData = this.parseYAML(yamlText);
            console.log('📄 Parsed tips data:', this.tipsData);
            console.log('📄 Tips data loaded:', this.tipsData.tips.length, 'tips');
        } catch (error) {
            console.error('Error loading tips data:', error);
            throw error;
        }
    }

    /**
     * Parse category counts YAML (different structure from tips data)
     */
    parseCategoryCountsYAML(yamlText) {
        const data = { categories: [], totalStats: {}, lastUpdated: null };
        const lines = yamlText.split('\n');
        let currentItem = null;
        let inTotalStats = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) continue;
            
            // New category item
            if (trimmed.startsWith('- id:')) {
                // Save previous item
                if (currentItem) {
                    data.categories.push(currentItem);
                }
                
                // Start new item
                currentItem = { id: trimmed.split(': ')[1] };
                continue;
            }
            
            // Category item properties
            if (currentItem && trimmed.includes(': ')) {
                const [key, ...valueParts] = trimmed.split(': ');
                const value = valueParts.join(': ');
                
                if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                    const parsedValue = parseInt(value);
                    console.log(`🔢 Parsing ${key}: "${value}" -> ${parsedValue} (type: ${typeof parsedValue})`);
                    currentItem[key] = parsedValue;
                } else {
                    currentItem[key] = value;
                }
                continue;
            }
            
            // Top-level properties
            if (!currentItem && trimmed.includes(': ')) {
                const [key, ...valueParts] = trimmed.split(': ');
                const value = valueParts.join(': ');
                
                if (key === 'totalStats') {
                    inTotalStats = true;
                    continue;
                } else if (key === 'lastUpdated') {
                    data[key] = value.replace(/'/g, ''); // Remove quotes
                }
                continue;
            }
            
            // Handle indented properties under totalStats
            if (inTotalStats && line.startsWith('  ') && trimmed.includes(': ')) {
                const [key, ...valueParts] = trimmed.split(': ');
                const value = valueParts.join(': ');
                
                if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                    data.totalStats[key] = parseInt(value);
                }
                continue;
            }
        }
        
        // Save last item
        if (currentItem) {
            data.categories.push(currentItem);
        }
        
        return data;
    }

    /**
     * Simple YAML parser for our specific format
     */
    parseYAML(yamlText) {
        // This is a simplified YAML parser for our specific structure
        // In production, you'd want to use a proper YAML library like js-yaml
        
        const data = { tips: [], products: [], categories: [] };
        const lines = yamlText.split('\n');
        let currentSection = null;
        let currentItem = null;
        let descriptionLines = [];
        let inDescription = false;
        let inTotalStats = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Section headers
            if (trimmed === 'tips:') {
                currentSection = 'tips';
                continue;
            } else if (trimmed === 'products:') {
                currentSection = 'products';
                continue;
            } else if (trimmed === 'categories:') {
                currentSection = 'categories';
                continue;
            }
            
                // New item (for all sections)
                if (trimmed.startsWith('- id:')) {
                    // Save previous item
                    if (currentItem) {
                        if (descriptionLines.length > 0) {
                            currentItem.description = descriptionLines.join('\n').trim();
                            descriptionLines = [];
                        }
                        data[currentSection].push(currentItem);
                    }
                    
                    // Start new item
                    currentItem = { id: trimmed.split(': ')[1] };
                    inDescription = false;
                    continue;
                }
            
            // Item properties
            if (currentItem && trimmed.includes(': ')) {
                const [key, ...valueParts] = trimmed.split(': ');
                const value = valueParts.join(': ');
                
                if (key === 'description' && value === '|') {
                    inDescription = true;
                    continue;
                } else if (key === 'description') {
                    currentItem[key] = value;
                    continue;
                } else if (key === 'tags') {
                    // Parse array format [item1, item2, item3]
                    currentItem[key] = value.slice(1, -1).split(', ').map(tag => tag.trim());
                } else if (key === 'rating' || key === 'isPublic') {
                    currentItem[key] = key === 'isPublic' ? value === 'true' : parseInt(value);
                } else if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                    currentItem[key] = parseInt(value);
                } else {
                    currentItem[key] = value;
                }
                continue;
            }
            
        // Top-level properties (like lastUpdated, totalStats)
        if (trimmed.includes('totalStats')) {
            // Save the last item before processing totalStats
            if (currentItem) {
                if (descriptionLines.length > 0) {
                    currentItem.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                data[currentSection].push(currentItem);
                currentItem = null;
            }
        }
        if (!currentItem && trimmed.includes(': ')) {
            const [key, ...valueParts] = trimmed.split(': ');
            const value = valueParts.join(': ');
            
            if (key === 'totalStats') {
                // Initialize totalStats object
                data.totalStats = {};
                inTotalStats = true;
                continue;
            } else if (key === 'lastUpdated') {
                data[key] = value.replace(/'/g, ''); // Remove quotes
            } else if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                if (!data.totalStats) data.totalStats = {};
                data.totalStats[key] = parseInt(value);
            }
            continue;
        }
        
        // Handle indented properties under totalStats
        if (inTotalStats && line.startsWith('  ') && trimmed.includes(': ')) {
            const [key, ...valueParts] = trimmed.split(': ');
            const value = valueParts.join(': ');
            
            if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                if (!data.totalStats) data.totalStats = {};
                data.totalStats[key] = parseInt(value);
            }
            continue;
        }
            
            // Description content (indented lines after description: |)
            if (inDescription && trimmed) {
                descriptionLines.push(trimmed);
            }
        }
        
        // Save last item
        if (currentItem) {
            if (descriptionLines.length > 0) {
                currentItem.description = descriptionLines.join('\n').trim();
            }
            data[currentSection].push(currentItem);
        }
        
        return data;
    }

    /**
     * Load category counts from YAML file
     */
    async loadCategoryCounts() {
        try {
            const response = await fetch('content/category-counts.yaml');
            if (!response.ok) {
                console.warn('⚠️ Category counts file not found, using fallback counts');
                this.categoryCounts = null;
                return;
            }
            const yamlText = await response.text();
            console.log('📊 Raw category YAML text length:', yamlText.length);
            this.categoryCounts = this.parseCategoryCountsYAML(yamlText);
            console.log('📊 Parsed category counts:', this.categoryCounts);
            console.log('📊 Category counts structure:', {
                hasCategories: !!this.categoryCounts.categories,
                categoriesLength: this.categoryCounts.categories ? this.categoryCounts.categories.length : 'undefined',
                totalStats: this.categoryCounts.totalStats
            });
            console.log('📊 Category counts loaded:', this.categoryCounts.categories ? this.categoryCounts.categories.length : 0, 'categories');
        } catch (error) {
            console.warn('⚠️ Error loading category counts:', error);
            this.categoryCounts = null;
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

        // Members-only count click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('members-only-count')) {
                this.showMembershipPrompt();
            }
        });
    }

    /**
     * Render category cards
     */
    renderCategories() {
        console.log('🚨 RENDER CATEGORIES START - NEW VERSION');
        try {
            const container = document.getElementById('tips-categories-container');
            console.log('🎯 renderCategories called - Container:', !!container, 'CategoryCounts:', !!this.categoryCounts);
            console.log('🎯 Full categoryCounts object:', this.categoryCounts);
            
            if (!container || !this.categoryCounts) {
                console.warn('⚠️ Cannot render categories - Container:', !!container, 'CategoryCounts:', !!this.categoryCounts);
                return;
            }
        } catch (error) {
            console.error('❌ Error in renderCategories:', error);
            return;
        }

        console.log('🎯 Checking categories array...');
        console.log('🎯 this.categoryCounts.categories:', this.categoryCounts.categories);
        console.log('🎯 Is array?', Array.isArray(this.categoryCounts.categories));
        
        if (!this.categoryCounts.categories || !Array.isArray(this.categoryCounts.categories)) {
            console.error('❌ Category counts categories is not an array:', this.categoryCounts.categories);
            return;
        }

        console.log('🔍 About to map categories:', this.categoryCounts.categories.length, 'categories');
        console.log('🔍 First category:', this.categoryCounts.categories[0]);

        const categoriesHtml = this.categoryCounts.categories.map(category => {
            // Use pre-calculated counts from category-counts.yaml
            const publicTips = category.publicTips;
            const membersOnlyTips = category.membersOnlyTips;
            const totalTips = category.totalTips;
            
            // Debug logging for accommodation category
            if (category.id === 'accommodation') {
                console.log('🏨 Accommodation category data:', {
                    publicTips,
                    membersOnlyTips,
                    totalTips,
                    category,
                    membersOnlyTipsType: typeof membersOnlyTips,
                    membersOnlyTipsValue: membersOnlyTips,
                    membersOnlyTipsGreaterThanZero: membersOnlyTips > 0,
                    membersOnlyTipsStrictGreaterThanZero: membersOnlyTips > 0
                });
            }
            
            // Create tip count display - always show public tips + members-only indicator
            let tipCountHtml = `<div class="tip-count">${publicTips} Tips</div>`;
            
            // Debug all categories with members-only tips
            if (membersOnlyTips > 0) {
                console.log(`🔒 Category ${category.id} has ${membersOnlyTips} members-only tips`);
                tipCountHtml += `<div class="members-only-count">+${membersOnlyTips} Members Only</div>`;
            } else {
                console.log(`📝 Category ${category.id} has no members-only tips (${membersOnlyTips})`);
            }
            
            // Debug logging for accommodation category HTML
            if (category.id === 'accommodation') {
                console.log('🏨 Accommodation HTML:', tipCountHtml);
            }
            
            return `
                <div class="category-card category-filter" data-category="${category.id}">
                    <div class="category-icon">${category.icon}</div>
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                    ${tipCountHtml}
                </div>
            `;
        }).join('');

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
        if (!container || !this.tipsData || !this.categoryCounts) return;

        let allTipsHtml = '';

        // Group tips by category using category counts
        this.categoryCounts.categories.forEach(category => {
            const categoryTips = this.tipsData.tips.filter(tip => tip.category === category.name);
            
            // Filter tips based on authentication status
            const visibleTips = categoryTips.filter(tip => {
                if (this.authSystem && !this.authSystem.isMember() && !tip.isPublic) {
                    return false;
                }
                return true;
            });
            
            if (visibleTips.length > 0) {
                const tipsHtml = visibleTips.map(tip => this.renderTipCard(tip)).join('');
                
                allTipsHtml += `
                    <div class="category-section" id="category-${category.id}">
                        <div class="category-header">
                            <h3>${category.icon} ${category.name}</h3>
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
        
        // Get category icon from category counts
        const category = this.categoryCounts ? 
            this.categoryCounts.categories.find(cat => cat.name === tip.category) : null;
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
     * Show membership prompt
     */
    showMembershipPrompt() {
        if (this.authSystem && this.authSystem.isMember()) {
            return; // Already a member
        }

        // Create a simple prompt (you could replace this with a modal or redirect)
        const message = "🔒 Unlock exclusive travel tips! Become a member to access premium content including insider secrets, exclusive deals, and personal recommendations.";
        
        if (window.yearawayApp && window.yearawayApp.showNotification) {
            window.yearawayApp.showNotification(message, 'info', 5000);
        } else {
            alert(message);
        }
        
        // You could also redirect to a membership page or show a login modal
        // window.location.href = 'request-access.html';
    }

    /**
     * Set reference to auth system
     */
    setAuthSystem(authSystem) {
        this.authSystem = authSystem;
        // Re-render both categories and tips when auth status changes
        this.renderCategories();
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
        
        this.renderCategories();
        this.renderAllTipsByCategory();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing TipsManager...');
    try {
        window.tipsManager = new TipsManager();
        console.log('📝 YearAway Tips Manager Initialized');
    } catch (error) {
        console.error('❌ Error initializing TipsManager:', error);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TipsManager;
}
