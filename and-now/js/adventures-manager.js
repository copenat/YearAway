/**
 * YearAway Adventures Manager
 * Handles loading and rendering adventures from YAML data
 */

class AdventuresManager {
    constructor() {
        this.adventuresData = null;
        this.authSystem = null;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Starting Adventures Manager initialization...');
            
            // Check if containers exist
            const adventuresContainer = document.getElementById('adventures-timeline');
            const categoriesContainer = document.getElementById('categories-grid');
            
            console.log('📦 Container check:', {
                adventures: !!adventuresContainer,
                categories: !!categoriesContainer
            });
            
            // Check if auth system is already available
            if (window.yearawayAuth) {
                this.authSystem = window.yearawayAuth;
                console.log('🔗 Auth system found during initialization');
                // Load adventures data with auth status
                await this.loadAdventuresData();
                console.log('📄 Adventures data loaded:', this.adventuresData);
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
                
                await this.loadAdventuresData();
                console.log('📄 Adventures data loaded:', this.adventuresData);
            }
            
            this.renderAdventures();
            this.renderCategories();
            
            // Dispatch event to notify auth system that members-only content was created
            console.log('🔔 Dispatching membersContentCreated event after initial render');
            document.dispatchEvent(new CustomEvent('yearaway:membersContentCreated'));
            
            console.log('✅ Adventures Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Adventures Manager:', error);
        }
    }

    /**
     * Load adventures data from YAML files
     */
    async loadAdventuresData() {
        try {
            // Load public adventures first
            const publicResponse = await fetch('content/adventures-data-public.yaml');
            if (!publicResponse.ok) {
                throw new Error(`HTTP error! status: ${publicResponse.status}`);
            }
            
            const publicYamlText = await publicResponse.text();
            console.log('📄 Raw public adventures YAML text length:', publicYamlText.length);
            const publicData = this.parseYAML(publicYamlText);
            console.log('📄 Parsed public adventures data:', publicData);
            
            // Initialize adventures data with public adventures
            this.adventuresData = {
                adventures: publicData.adventures || [],
                categories: publicData.categories || []
            };
            
            // Load members-only adventures if authenticated
            if (this.authSystem && this.authSystem.isMember()) {
                try {
                    const membersResponse = await fetch('content/adventures-data-members.yaml');
                    if (membersResponse.ok) {
                        const membersYamlText = await membersResponse.text();
                        const membersData = this.parseYAML(membersYamlText);
                        console.log('📄 Parsed members adventures data:', membersData);
                        
                        // Merge members-only adventures
                        this.adventuresData.adventures = [...this.adventuresData.adventures, ...(membersData.adventures || [])];
                        
                        // Merge categories (update counts)
                        if (membersData.categories) {
                            membersData.categories.forEach(memberCategory => {
                                const existingCategory = this.adventuresData.categories.find(cat => cat.id === memberCategory.id);
                                if (existingCategory) {
                                    existingCategory.count += memberCategory.count;
                                } else {
                                    this.adventuresData.categories.push(memberCategory);
                                }
                            });
                        }
                        
                        console.log('📄 Combined adventures data:', this.adventuresData);
                    }
                } catch (membersError) {
                    console.warn('⚠️ Could not load members-only adventures:', membersError);
                }
            }
            
            console.log('📄 Adventures data loaded:', this.adventuresData);
        } catch (error) {
            console.error('❌ Error loading adventures data:', error);
            // Fallback to empty data structure
            this.adventuresData = { adventures: [], categories: [] };
        }
    }

    /**
     * Parse YAML content (simplified parser for our structure)
     */
    parseYAML(yamlText) {
        const data = { adventures: [], categories: [] };
        const lines = yamlText.split('\n');
        let currentSection = null;
        let currentItem = null;
        let descriptionLines = [];
        let inDescription = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Section headers
            if (trimmed === 'adventures:') {
                // Save previous item before switching sections
                if (currentItem) {
                    if (descriptionLines.length > 0) {
                        currentItem.description = descriptionLines.join('\n').trim();
                        descriptionLines = [];
                    }
                    data[currentSection].push(currentItem);
                    currentItem = null;
                }
                currentSection = 'adventures';
                continue;
            } else if (trimmed === 'categories:') {
                // Save previous item before switching sections
                if (currentItem) {
                    if (descriptionLines.length > 0) {
                        currentItem.description = descriptionLines.join('\n').trim();
                        descriptionLines = [];
                    }
                    data[currentSection].push(currentItem);
                    currentItem = null;
                }
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
                const id = trimmed.split(': ')[1].replace(/['"]/g, '');
                currentItem = { id };
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
                } else if (key === 'isPublic') {
                    currentItem[key] = value === 'true';
                } else {
                    // Remove quotes from string values (common in YAML)
                    currentItem[key] = value.replace(/^["']|["']$/g, '');
                }
                continue;
            }
            
            // Description lines (multiline)
            if (inDescription && trimmed) {
                descriptionLines.push(trimmed);
                continue;
            }
        }
        
        // Save the last item
        if (currentItem) {
            if (descriptionLines.length > 0) {
                currentItem.description = descriptionLines.join('\n').trim();
            }
            data[currentSection].push(currentItem);
        }
        
        return data;
    }

    /**
     * Render adventures timeline
     */
    renderAdventures() {
        const container = document.getElementById('adventures-timeline');
        if (!container || !this.adventuresData || !this.adventuresData.adventures) return;

        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        console.log('🎯 Rendering adventures - Is member:', isMember);
        console.log('🎯 Total adventures available:', this.adventuresData.adventures.length);

        if (this.adventuresData.adventures.length === 0) {
            container.innerHTML = `
                <div class="no-adventures-message">
                    <h3>No adventures available</h3>
                    <p>Check back later for new adventures and updates.</p>
                </div>
            `;
            return;
        }

        const adventuresHtml = this.adventuresData.adventures.map(adventure => this.renderAdventureItem(adventure)).join('');
        container.innerHTML = adventuresHtml;

        // Dispatch event to notify auth system that members-only content was created
        console.log('🔔 Dispatching membersContentCreated event after adventures render');
        document.dispatchEvent(new CustomEvent('yearaway:membersContentCreated'));
    }

    /**
     * Render individual adventure item
     */
    renderAdventureItem(adventure) {
        // Members-only adventures are those that come from the members file
        // We can identify them by checking if they have certain IDs or by tracking source
        const membersOnlyAdventureIds = ['private-adventure-aug', 'members-only-trip-report'];
        const isMembersOnly = membersOnlyAdventureIds.includes(adventure.id);
        
        const memberOnlyClass = isMembersOnly ? 'members-only' : '';
        const memberIndicator = isMembersOnly ? '<div class="member-indicator">🔒 Members Only</div>' : '';
        
        // Format date
        const date = new Date(adventure.date);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();

        return `
            <div class="adventure-item ${memberOnlyClass}">
                ${memberIndicator}
                <div class="adventure-date">
                    <span class="month">${month}</span>
                    <span class="year">${year}</span>
                </div>
                <div class="adventure-content">
                    <h3>${adventure.title}</h3>
                    <p>${adventure.description}</p>
                    <div class="adventure-tags">
                        ${adventure.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render adventure categories
     */
    renderCategories() {
        const container = document.getElementById('categories-grid');
        if (!container || !this.adventuresData || !this.adventuresData.categories) return;

        const categoriesHtml = this.adventuresData.categories.map(category => `
            <div class="category-card">
                <div class="category-icon">${category.icon}</div>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="category-count">${category.count > 0 ? `${category.count} Adventure${category.count === 1 ? '' : 's'}` : 'Coming Soon'}</div>
            </div>
        `).join('');

        container.innerHTML = categoriesHtml;
    }

    /**
     * Set reference to auth system
     */
    async setAuthSystem(authSystem) {
        this.authSystem = authSystem;
        console.log('🔗 Auth system connected to adventures manager');
        
        // Reload adventures data with new auth status
        try {
            await this.loadAdventuresData();
            console.log('🔄 Adventures data reloaded with auth status');
        } catch (error) {
            console.error('❌ Error reloading adventures data:', error);
        }
        
        // Re-render adventures and categories when auth status changes
        if (this.adventuresData) {
            console.log('🔄 Re-rendering with auth system connected');
            console.log('🔄 Auth status during re-render:', this.authSystem.isMember());
            this.renderAdventures();
            this.renderCategories();
            
            // Dispatch event to notify auth system that members-only content was created
            console.log('🔔 Dispatching membersContentCreated event after auth system connection');
            document.dispatchEvent(new CustomEvent('yearaway:membersContentCreated'));
        } else {
            console.log('⚠️ Cannot re-render - missing data:', {
                adventuresData: !!this.adventuresData
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing AdventuresManager...');
    const initAdventuresManager = () => {
        if (window.yearawayAuth) {
            try {
                window.adventuresManager = new AdventuresManager();
                console.log('📝 YearAway Adventures Manager Initialized');
            } catch (error) {
                console.error('❌ Error initializing AdventuresManager:', error);
            }
        } else {
            setTimeout(initAdventuresManager, 100);
        }
    };
    initAdventuresManager();
});

// Connect authentication system to adventures manager
async function connectAuthToAdventures() {
    if (window.yearawayAuth && window.adventuresManager) {
        await window.adventuresManager.setAuthSystem(window.yearawayAuth);
        console.log('🔗 Auth system connected to adventures manager');
        return true;
    } else {
        console.log('⚠️ Auth system or adventures manager not ready:', {
            authSystem: !!window.yearawayAuth,
            adventuresManager: !!window.adventuresManager
        });
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Try to connect immediately
    if (!connectAuthToAdventures()) {
        // If not ready, try again after a delay
        setTimeout(() => {
            if (!connectAuthToAdventures()) {
                // Try one more time after another delay
                setTimeout(connectAuthToAdventures, 1000);
            }
        }, 500);
    }
});
