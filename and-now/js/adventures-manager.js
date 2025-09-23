/**
 * YearAway Adventures Manager
 * Handles loading and rendering adventures from YAML data
 */

class AdventuresManager {
    constructor() {
        this.adventuresData = null;
        this.tipsData = null;
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
            
            // Load tips data for tag integration
            await this.loadTipsData();
            console.log('💡 Tips data loaded:', this.tipsData);
            
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
        // Prevent multiple simultaneous calls
        if (this._loadingAdventures) {
            return;
        }
        this._loadingAdventures = true;
        
        try {
            // Reset adventures data to prevent contamination
            this.adventuresData = { adventures: [], categories: [] };
            
            // Load public adventures first
            const publicResponse = await fetch(`content/adventures-data-public.yaml?t=${Date.now()}`);
            if (!publicResponse.ok) {
                throw new Error(`HTTP error! status: ${publicResponse.status}`);
            }
            
            const publicYamlText = await publicResponse.text();
            console.log('📄 Raw public adventures YAML text length:', publicYamlText.length);
            const publicData = this.parseYAML(publicYamlText);
            console.log('📄 Parsed public adventures data:', publicData);
            
            // Initialize adventures data with public adventures
            const publicAdventures = (publicData.adventures || []).map(adv => ({ ...adv, isPublic: true }));
            this.adventuresData = {
                adventures: publicAdventures,
                categories: [...(publicData.categories || [])] // Create a fresh copy
            };
            
            // Load members-only adventures if authenticated
            if (this.authSystem && this.authSystem.isMember()) {
                try {
                    const membersResponse = await fetch(`content/adventures-data-members.yaml?t=${Date.now()}`);
                    if (membersResponse.ok) {
                        const membersYamlText = await membersResponse.text();
                        const membersData = this.parseYAML(membersYamlText);
                        console.log('📄 Parsed members adventures data:', membersData);
                        
                        // Merge members-only adventures (avoid duplicates)
                        const existingIds = new Set(this.adventuresData.adventures.map(adv => adv.id));
                        const newMembersAdventures = (membersData.adventures || []).filter(adv => !existingIds.has(adv.id));
                        // Mark members-only adventures as not public
                        const markedMembersAdventures = newMembersAdventures.map(adv => ({ ...adv, isPublic: false }));
                        this.adventuresData.adventures = [...this.adventuresData.adventures, ...markedMembersAdventures];
                        
                        // Merge categories (update counts)
                        if (membersData.categories) {
                            console.log('📊 Members categories before merge:', membersData.categories.map(cat => `${cat.name}: ${cat.count}`));
                            console.log('📊 Public categories before merge:', this.adventuresData.categories.map(cat => `${cat.name}: ${cat.count}`));
                            
                            membersData.categories.forEach(memberCategory => {
                                const existingCategory = this.adventuresData.categories.find(cat => cat.id === memberCategory.id);
                                if (existingCategory) {
                                    console.log(`📊 Merging ${memberCategory.name}: ${existingCategory.count} + ${memberCategory.count} = ${existingCategory.count + memberCategory.count}`);
                                    existingCategory.count += memberCategory.count;
                                } else {
                                    console.log(`📊 Adding new category: ${memberCategory.name}: ${memberCategory.count}`);
                                    this.adventuresData.categories.push(memberCategory);
                                }
                            });
                        }
                        
                        console.log('📄 Combined adventures data:', this.adventuresData);
                        console.log('📊 Category counts after merge:', this.adventuresData.categories.map(cat => `${cat.name}: ${cat.count}`));
                        console.log('🔍 DEBUGGING: Full Travel category object:', this.adventuresData.categories.find(cat => cat.name === 'Travel'));
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
        } finally {
            this._loadingAdventures = false;
        }
    }

    /**
     * Load tips data for tag integration
     */
    async loadTipsData() {
        try {
            console.log('💡 Loading tips data for tag integration...');
            
            // Load public tips
            const publicResponse = await fetch(`content/tips-data-public.yaml?t=${Date.now()}`);
            const publicYamlText = await publicResponse.text();
            const publicTipsData = this.parseTipsYAML(publicYamlText);
            
            // Load members tips if user is authenticated
            let membersTipsData = { tips: [] };
            if (this.authSystem && this.authSystem.isMember()) {
                try {
                    const membersResponse = await fetch(`content/tips-data-members.yaml?t=${Date.now()}`);
                    const membersYamlText = await membersResponse.text();
                    membersTipsData = this.parseTipsYAML(membersYamlText);
                } catch (error) {
                    console.log('💡 Members tips not available or user not authenticated');
                }
            }
            
            // Merge tips data
            this.tipsData = {
                tips: [...publicTipsData.tips, ...membersTipsData.tips]
            };
            
            console.log('💡 Tips data loaded:', this.tipsData);
            
            // Load category counts for icons
            await this.loadCategoryCounts();
        } catch (error) {
            console.error('❌ Error loading tips data:', error);
            this.tipsData = { tips: [] };
        }
    }

    /**
     * Load category counts from YAML file
     */
    async loadCategoryCounts() {
        try {
            const response = await fetch(`content/tips-category-counts.yaml?t=${Date.now()}`);
            if (!response.ok) {
                console.warn('⚠️ Category counts file not found, using fallback counts');
                this.categoryCounts = null;
                return;
            }
            const yamlText = await response.text();
            this.categoryCounts = this.parseCategoryCountsYAML(yamlText);
            console.log('📊 Category counts loaded:', this.categoryCounts);
        } catch (error) {
            console.error('❌ Error loading category counts:', error);
            this.categoryCounts = null;
        }
    }

    /**
     * Parse category counts YAML content
     */
    parseCategoryCountsYAML(yamlText) {
        const data = { categories: [] };
        const lines = yamlText.split('\n');
        let currentCategory = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('- id:')) {
                if (currentCategory) {
                    data.categories.push(currentCategory);
                }
                currentCategory = { id: line.split(':')[1].trim() };
            } else if (line.startsWith('name:') && currentCategory) {
                currentCategory.name = line.split(':')[1].trim();
            } else if (line.startsWith('icon:') && currentCategory) {
                currentCategory.icon = line.split(':')[1].trim();
            } else if (line.startsWith('description:') && currentCategory) {
                currentCategory.description = line.split(':')[1].trim();
            }
        }
        
        if (currentCategory) {
            data.categories.push(currentCategory);
        }
        
        return data;
    }

    /**
     * Parse tips YAML content (simplified parser)
     */
    parseTipsYAML(yamlText) {
        console.log('🔍 Starting parseTipsYAML with YAML text length:', yamlText.length);
        const data = { tips: [] };
        const lines = yamlText.split('\n');
        let currentItem = null;
        let descriptionLines = [];
        let inDescription = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Section headers
            if (trimmed === 'tips:') {
                // Save previous item before switching sections
                if (currentItem) {
                    if (descriptionLines.length > 0) {
                        currentItem.description = descriptionLines.join('\n').trim();
                    }
                    data.tips.push(currentItem);
                }
                currentItem = null;
                descriptionLines = [];
                inDescription = false;
                continue;
            }
            
            // Skip empty lines
            if (!trimmed) {
                continue;
            }
            
            // New item
            if (trimmed.startsWith('- id:')) {
                // Save previous item
                if (currentItem) {
                    if (descriptionLines.length > 0) {
                        currentItem.description = descriptionLines.join('\n').trim();
                    }
                    data.tips.push(currentItem);
                }
                
                // Start new item
                currentItem = { id: trimmed.replace('- id:', '').trim() };
                descriptionLines = [];
                inDescription = false;
                continue;
            }
            
            // Item properties
            if (currentItem && trimmed.includes(':')) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                
                if (key === 'description') {
                    inDescription = true;
                    // Handle YAML literal block syntax (description: |)
                    if (value === '|') {
                        // This is a literal block, content will be on following indented lines
                        descriptionLines = [];
                    } else if (value) {
                        descriptionLines.push(value);
                    }
                } else if (key === 'tags') {
                    // Parse tags array
                    const tagsText = value.replace(/[\[\]]/g, '');
                    currentItem.tags = tagsText.split(',').map(tag => tag.trim());
                } else {
                    // Remove quotes from string values
                    currentItem[key] = value.replace(/^["']|["']$/g, '');
                }
                continue;
            }
            
            // Description lines (multiline) - preserve original line content for HTML
            if (inDescription && line.trim()) {
                // Use original line content to preserve HTML formatting
                // Remove only the YAML indentation (6 spaces) but preserve HTML content
                const content = line.replace(/^\s{6}/, '');
                console.log('📝 Processing description line:', JSON.stringify(line), '-> processed:', JSON.stringify(content));
                descriptionLines.push(content);
                continue;
            }
        }
        
        // Save the last item
        if (currentItem) {
            if (descriptionLines.length > 0) {
                let description = descriptionLines.join('\n').trim();
                // Remove any leading "|" character that might have been incorrectly parsed
                if (description.startsWith('|')) {
                    description = description.substring(1).trim();
                }
                currentItem.description = description;
                console.log('📝 Final description for', currentItem.id, ':', JSON.stringify(currentItem.description));
            }
            data.tips.push(currentItem);
        }
        
        return data;
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
            if (currentItem && trimmed.includes(': ') && !inDescription) {
                const [key, ...valueParts] = trimmed.split(': ');
                const value = valueParts.join(': ');
                
                if (key === 'description' && value === '|') {
                    inDescription = true;
                    // Initialize description array for this item
                    descriptionLines = [];
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
            
            // Description lines (multiline) - preserve HTML content
            if (inDescription) {
                // Check if this line starts a new property (less indented than description content)
                if (trimmed && !line.startsWith('      ') && trimmed.includes(': ')) {
                    // This is a new property, end description parsing
                    inDescription = false;
                    // Process this line as a property
                    const [key, ...valueParts] = trimmed.split(': ');
                    const value = valueParts.join(': ');
                    
                    if (key === 'tags') {
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
                
                if (line.trim()) {
                    // For HTML content, we need to be more careful about whitespace
                    // The YAML multiline format uses 6 spaces for indentation
                    // We want to preserve the content but remove the YAML indentation
                    let content = line;
                    
                    // Remove YAML indentation (6 spaces) but preserve HTML formatting
                    if (content.startsWith('      ')) {
                        content = content.substring(6);
                    }
                    
                    console.log('📝 Processing description line:', JSON.stringify(line), '-> processed:', JSON.stringify(content));
                    descriptionLines.push(content);
                }
                continue;
            }
        }
        
        // Save the last item
        if (currentItem) {
            if (descriptionLines.length > 0) {
                let description = descriptionLines.join('\n').trim();
                // Remove any leading "|" character that might have been incorrectly parsed
                if (description.startsWith('|')) {
                    description = description.substring(1).trim();
                }
                currentItem.description = description;
                console.log('📝 Final description for', currentItem.id, ':', JSON.stringify(currentItem.description));
            }
            data[currentSection].push(currentItem);
        }
        
        console.log('🔍 Finished parseTipsYAML, found', data.tips ? data.tips.length : 0, 'tips');
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
        const membersOnlyAdventureIds = ['private-adventure-aug', 'members-only-trip-report', 'planning-a-trip-to-asia'];
        const isMembersOnly = membersOnlyAdventureIds.includes(adventure.id);
        
        const memberOnlyClass = isMembersOnly ? 'members-only' : '';
        const memberIndicator = isMembersOnly ? '<div class="member-indicator">🔒 Members Only</div>' : '';
        
        // Format date
        const date = new Date(adventure.date);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();

        // Find connected tips based on shared tags
        const connectedTips = this.getConnectedTips(adventure.tags);
        const connectedTipsHtml = this.renderConnectedTips(connectedTips);

        // Get connected photos
        const connectedPhotos = this.getConnectedPhotos(adventure);
        const connectedPhotosHtml = this.renderConnectedPhotos(connectedPhotos, adventure.id);

        // Truncate description if it's too long (limit to ~20 lines or 1500 characters)
        const maxDescriptionLength = 1500;
        let descriptionHtml = adventure.description;
        let showReadMore = false;
        
        if (adventure.description.length > maxDescriptionLength) {
            descriptionHtml = adventure.description.substring(0, maxDescriptionLength) + '...';
            showReadMore = true;
        }

        return `
            <div class="adventure-item ${memberOnlyClass}" onclick="window.location.href='adventure-detail.html?id=${adventure.id}'" style="cursor: pointer;">
                <div class="adventure-date-container">
                    <div class="adventure-date">
                        <span class="month">${month}</span>
                        <span class="year">${year}</span>
                    </div>
                    ${memberIndicator}
                </div>
                <div class="adventure-content">
                    <h3>${adventure.title}</h3>
                    <div class="adventure-description">${descriptionHtml}</div>
                    ${showReadMore ? '<div class="adventure-read-more"><span class="read-more-text">Click here to read more →</span></div>' : ''}
                    <div class="adventure-tags">
                        ${adventure.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    ${connectedPhotosHtml}
                    ${connectedTipsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Get photos connected to an adventure
     */
    getConnectedPhotos(adventure) {
        if (!window.photosManager || !window.photosManager.photosData || !window.photosManager.photosData.photos) {
            console.log('📸 No photos manager or data available');
            console.log('📸 Photos manager exists:', !!window.photosManager);
            console.log('📸 Photos data exists:', !!(window.photosManager && window.photosManager.photosData));
            console.log('📸 Photos array exists:', !!(window.photosManager && window.photosManager.photosData && window.photosManager.photosData.photos));
            return [];
        }
        
        console.log('📸 PhotosManager data:', window.photosManager.photosData);
        console.log('📸 All photos in PhotosManager:', window.photosManager.photosData.photos);
        console.log('📸 Auth system status:', this.authSystem ? this.authSystem.isMember() : 'No auth system');
        
        // First try to get photos by adventure ID
        let photos = window.photosManager.getPhotosForAdventure(adventure.id);
        console.log('📸 Photos for adventure', adventure.id, ':', photos.map(p => p.id));
        
        // If no photos found by ID, try to get photos by shared tags
        if (photos.length === 0 && adventure.tags) {
            photos = window.photosManager.getPhotosByTags(adventure.tags);
            console.log('📸 Photos by tags for adventure', adventure.id, ':', photos.map(p => p.id));
        }
        
        return photos;
    }

    /**
     * Get tips that share tags with the adventure
     */
    getConnectedTips(adventureTags) {
        if (!this.tipsData || !this.tipsData.tips) return [];
        
        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        
        // Ensure adventureTags is an array
        const tags = Array.isArray(adventureTags) ? adventureTags : [];
        if (tags.length === 0) return []; // No tags to match
        
        // List of members-only tip IDs (from tips-data-members.yaml)
        const membersOnlyTipIds = ['hotel-secret', 'airline-upgrades', 'hidden-restaurants'];
        
        return this.tipsData.tips.filter(tip => {
            if (!tip.tags || !Array.isArray(tip.tags)) return false;
            
            // Check if tip shares tags with adventure
            const hasMatchingTag = tip.tags.some(tag => tags.includes(tag));
            if (!hasMatchingTag) return false;
            
            // Filter based on authentication status
            const isMembersOnlyTip = membersOnlyTipIds.includes(tip.id);
            if (isMembersOnlyTip && !isMember) {
                return false; // Hide members-only tips for non-members
            }
            
            return true;
        });
    }

    /**
     * Render connected photos section
     */
    renderConnectedPhotos(connectedPhotos, adventureId) {
        if (!connectedPhotos || connectedPhotos.length === 0) return '';
        
        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        
        // Limit to first 3 photos for summary view
        const maxPhotos = 3;
        const photosToShow = connectedPhotos.slice(0, maxPhotos);
        const hasMorePhotos = connectedPhotos.length > maxPhotos;
        
        const photosHtml = photosToShow.map(photo => {
            // Don't show member indicator on adventure detail page since the page itself is member-only
            const memberOnlyClass = '';
            const memberIndicator = '';
            
            return `
                <div class="connected-photo ${memberOnlyClass}">
                    ${memberIndicator}
                    <div class="photo-container">
                        <img src="${photo.path}${photo.filename}" alt="${photo.caption}" loading="lazy">
                        <div class="photo-overlay">
                            <div class="photo-info">
                                <p class="photo-caption">${photo.caption}</p>
                                <div class="photo-tags">
                                    ${photo.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add "View more photos" link if there are more than 3 photos
        const morePhotosLink = hasMorePhotos ? 
            `<div class="more-photos-link">
                <a href="adventure-detail.html?id=${adventureId}" class="view-more-photos">View all ${connectedPhotos.length} photos →</a>
            </div>` : '';
        
        return `
            <div class="connected-photos">
                <h4>📸 Photos</h4>
                <div class="connected-photos-grid">
                    ${photosHtml}
                </div>
                ${morePhotosLink}
            </div>
        `;
    }

    /**
     * Render connected tips section
     */
    renderConnectedTips(connectedTips) {
        if (!connectedTips || connectedTips.length === 0) return '';
        
        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        const membersOnlyTipIds = ['hotel-secret', 'airline-upgrades', 'hidden-restaurants'];
        
        const tipsHtml = connectedTips.map(tip => {
            const isMembersOnlyTip = membersOnlyTipIds.includes(tip.id);
            const memberOnlyClass = isMembersOnlyTip ? 'members-only' : '';
            const memberIndicator = isMembersOnlyTip ? '<div class="member-indicator">🔒 Members Only</div>' : '';
            
            // Get category icon from category counts
            const category = this.tipsData && this.categoryCounts ? 
                this.categoryCounts.categories.find(cat => cat.name === tip.category) : null;
            const categoryIcon = category ? category.icon : '📝';
            
            // Check if this is a product (has price and icon properties)
            const isProduct = tip.price && tip.icon;
            
            if (isProduct) {
                // Render as product card
                return `
                    <div class="tip-card product-card ${memberOnlyClass}">
                        ${memberIndicator}
                        <div class="product-image">
                            <div class="product-placeholder">${tip.icon}</div>
                        </div>
                        <div class="product-content">
                            <div class="tip-header">
                                <div class="tip-category"></div>
                            </div>
                            <h3>${tip.title}</h3>
                            <div class="tip-description">${tip.description}</div>
                            <div class="product-price">${tip.price}</div>
                            <div class="tip-tags">
                                ${tip.tags.map(tag => `<span class="tag tag-filter" data-tag="${tag}">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Render as regular tip card
                return `
                    <div class="tip-card ${memberOnlyClass}">
                        ${memberIndicator}
                        <div class="tip-header">
                            <div class="tip-category"></div>
                        </div>
                        <h3>${tip.title}</h3>
                        <div class="tip-description">${tip.description}</div>
                        <div class="tip-tags">
                            ${tip.tags.map(tag => `<span class="tag tag-filter" data-tag="${tag}">${tag}</span>`).join('')}
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        return `
            <div class="connected-tips">
                <h4>Related Hints & Tips</h4>
                <div class="tips-grid">
                    ${tipsHtml}
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
        
        // Reload tips data with new auth status
        try {
            await this.loadTipsData();
            console.log('🔄 Tips data reloaded with auth status');
        } catch (error) {
            console.error('❌ Error reloading tips data:', error);
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
