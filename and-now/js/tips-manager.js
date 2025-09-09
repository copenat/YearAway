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
            
            await this.loadCategoryCounts();
            console.log('📊 Category counts loaded:', this.categoryCounts);
            this.setupEventListeners();
            
            // Check if auth system is already available
            if (window.yearawayAuth) {
                this.authSystem = window.yearawayAuth;
                console.log('🔗 Auth system found during initialization');
                // Load tips data with auth status
                await this.loadTipsData();
                console.log('📄 Tips data loaded:', this.tipsData);
            } else {
                // Check localStorage directly for auth status using centralized config
                if (window.YearAwayAuthConfig && window.YearAwayAuthConfig.isAuthenticated()) {
                    console.log('🔗 Auth token found in localStorage, loading members content');
                    // Create a temporary auth object for loading
                    this.authSystem = {
                        isMember: () => true
                    };
                } else {
                    console.log('🔗 No auth token found, loading public content only');
                    this.authSystem = {
                        isMember: () => false
                    };
                }
                
                await this.loadTipsData();
                console.log('📄 Tips data loaded:', this.tipsData);
            }
            
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
     * Load tips data from separate public and members files
     */
    async loadTipsData() {
        try {
            // Always load public tips
            const publicResponse = await fetch('content/tips-data-public.yaml');
            if (!publicResponse.ok) {
                throw new Error(`Failed to load public tips data: ${publicResponse.status}`);
            }
            const publicYamlText = await publicResponse.text();
            console.log('📄 Raw public YAML text length:', publicYamlText.length);
            const publicData = this.parseYAML(publicYamlText);
            console.log('📄 Parsed public tips data:', publicData);
            
            // Initialize tips data with public tips
            this.tipsData = {
                tips: publicData.tips || [],
                products: publicData.products || [],
                categories: publicData.categories || []
            };
            
            // Load members-only tips if authenticated
            if (this.authSystem && this.authSystem.isMember()) {
                try {
                    const membersResponse = await fetch('content/tips-data-members.yaml');
                    if (membersResponse.ok) {
                        const membersYamlText = await membersResponse.text();
                        console.log('📄 Raw members YAML text length:', membersYamlText.length);
                        const membersData = this.parseYAML(membersYamlText);
                        console.log('📄 Parsed members tips data:', membersData);
                        
                        // Merge members-only tips
                        this.tipsData.tips = [...this.tipsData.tips, ...(membersData.tips || [])];
                        console.log('📄 Combined tips data:', this.tipsData);
                    }
                } catch (membersError) {
                    console.warn('⚠️ Could not load members-only tips:', membersError);
                }
            }
            
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
                    console.log(`🔢 Category ${currentItem.id} - ${key}: "${value}" -> ${parsedValue}`);
                    currentItem[key] = parsedValue;
                } else {
                    currentItem[key] = value;
                }
                continue;
            }
            
            // Top-level properties (like lastUpdated, totalStats)
            if (trimmed.includes('lastUpdated') || trimmed.includes('totalStats')) {
                // Save the last item before processing top-level properties
                if (currentItem) {
                    data.categories.push(currentItem);
                    currentItem = null;
                }
            }
            
            if (!currentItem && trimmed.includes(': ')) {
                const [key, ...valueParts] = trimmed.split(': ');
                const value = valueParts.join(': ');
                
                if (key === 'totalStats') {
                    inTotalStats = true;
                    continue;
                } else if (key === 'lastUpdated') {
                    data[key] = value.replace(/'/g, ''); // Remove quotes
                } else if (key === 'publicTips' || key === 'membersOnlyTips' || key === 'totalTips') {
                    // These should only be in totalStats, not at top level
                    if (!data.totalStats) data.totalStats = {};
                    data.totalStats[key] = parseInt(value);
                    console.log(`🔢 TotalStats - ${key}: "${value}" -> ${parseInt(value)}`);
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
            if (trimmed.includes('totalStats') || trimmed === 'products:') {
                // Save the last item before processing totalStats or switching to products
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
        const container = document.getElementById('tips-categories-container');
        if (!container || !this.categoryCounts || !this.categoryCounts.categories) {
            console.warn('⚠️ Cannot render categories - missing container or category data');
            return;
        }

        const categoriesHtml = this.categoryCounts.categories.map(category => {
            const publicTips = category.publicTips || 0;
            const membersOnlyTips = category.membersOnlyTips || 0;
            
            // Create tip count display
            let tipCountHtml = `<div class="tip-count">${publicTips} Tips</div>`;
            if (membersOnlyTips > 0) {
                tipCountHtml += `<div class="members-only-count">+${membersOnlyTips} Members Only</div>`;
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

        const categoriesContainerHtml = `
            <div class="categories-grid">
                ${categoriesHtml}
            </div>
        `;
        console.log('🎯 Categories HTML length:', categoriesContainerHtml.length);
        console.log('🎯 Categories container before:', container.innerHTML.length, 'characters');
        container.innerHTML = categoriesContainerHtml;
        console.log('🎯 Categories container after:', container.innerHTML.length, 'characters');
        console.log('🎯 Categories container visible:', container.offsetHeight > 0 ? 'YES' : 'NO');
    }

    /**
     * Render all tips organized by category
     */
    renderAllTipsByCategory() {
        const container = document.getElementById('all-tips-container');
        if (!container || !this.tipsData || !this.categoryCounts) return;

        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        console.log('🎯 Rendering tips - Auth system:', !!this.authSystem, 'Is member:', isMember);
        console.log('🎯 Total tips available:', this.tipsData.tips.length);
        console.log('🎯 Tips data:', this.tipsData.tips.map(tip => ({id: tip.id, title: tip.title, category: tip.category})));

        let allTipsHtml = '';

        // Group tips by category using category counts
        this.categoryCounts.categories.forEach(category => {
            const categoryTips = this.tipsData.tips.filter(tip => tip.category === category.name);
            
            // All tips are visible based on which file they came from
            const visibleTips = categoryTips;
            
            console.log(`🎯 Category ${category.name}:`, {
                categoryTips: categoryTips.length,
                visibleTips: visibleTips.length,
                tips: categoryTips.map(tip => ({id: tip.id, title: tip.title}))
            });
            
            // Extra debugging for Budget category
            if (category.name === 'Budget') {
                console.log('🎯 Budget category detailed:', {
                    categoryTips: categoryTips,
                    allTips: this.tipsData.tips.filter(tip => tip.category === 'Budget'),
                    totalTips: this.tipsData.tips.length,
                    allTipIds: this.tipsData.tips.map(tip => ({id: tip.id, category: tip.category}))
                });
            }
            
            if (visibleTips.length > 0) {
                const tipsHtml = visibleTips.map(tip => this.renderTipCard(tip)).join('');
                
                // Debug logging for transportation category
                if (category.id === 'transportation') {
                    console.log('🚗 Transportation category tips:', {
                        categoryTips: categoryTips.length,
                        visibleTips: visibleTips.length,
                        isMember: isMember,
                        authSystem: !!this.authSystem
                    });
                }
                
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

        console.log('🎯 Final HTML length:', allTipsHtml.length);
        console.log('🎯 Container before:', container.innerHTML.length, 'characters');
        container.innerHTML = allTipsHtml;
        console.log('🎯 Container after:', container.innerHTML.length, 'characters');
        console.log('🎯 Container visible:', container.offsetHeight > 0 ? 'YES' : 'NO');
    }


    /**
     * Render individual tip card
     */
    renderTipCard(tip) {
        // Members-only tips are: hotel-secret, airline-upgrades, hidden-restaurants
        const membersOnlyTipIds = ['hotel-secret', 'airline-upgrades', 'hidden-restaurants'];
        const isMembersOnly = membersOnlyTipIds.includes(tip.id);
        
        const memberOnlyClass = isMembersOnly ? 'members-only' : '';
        const memberIndicator = isMembersOnly ? '<div class="member-indicator">🔒 Members Only</div>' : '';
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
    async setAuthSystem(authSystem) {
        this.authSystem = authSystem;
        console.log('🔗 Auth system connected to tips manager');
        
        // Reload tips data with new auth status
        try {
            await this.loadTipsData();
            console.log('🔄 Tips data reloaded with auth status');
        } catch (error) {
            console.error('❌ Error reloading tips data:', error);
        }
        
        // Re-render both categories and tips when auth status changes
        if (this.tipsData && this.categoryCounts) {
            console.log('🔄 Re-rendering with auth system connected');
            console.log('🔄 Auth status during re-render:', this.authSystem.isMember());
            this.renderCategories();
            this.renderAllTipsByCategory();
            
            // IMPORTANT: Call showMemberContent after rendering to ensure
            // members-only elements get the member-visible class
            if (this.authSystem.isMember()) {
                console.log('🔓 Showing member content after re-render');
                this.authSystem.showMemberContent();
            } else {
                console.log('🔒 Hiding member content after re-render');
                this.authSystem.hideMemberContent();
            }
        } else {
            console.log('⚠️ Cannot re-render - missing data:', {
                tipsData: !!this.tipsData,
                categoryCounts: !!this.categoryCounts
            });
        }
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
    
    // Wait for authentication system to be ready
    const initTipsManager = () => {
        if (window.yearawayAuth) {
            try {
                window.tipsManager = new TipsManager();
                console.log('📝 YearAway Tips Manager Initialized');
            } catch (error) {
                console.error('❌ Error initializing TipsManager:', error);
            }
        } else {
            // Try again after a short delay
            setTimeout(initTipsManager, 100);
        }
    };
    
    initTipsManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TipsManager;
}
