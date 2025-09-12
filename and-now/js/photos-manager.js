/**
 * YearAway Photos Manager
 * Handles loading and linking photos to adventures using tags
 */

class PhotosManager {
    constructor() {
        this.photosData = null;
        this.authSystem = null;
        this.init();
    }

    async init() {
        try {
            console.log('📸 Starting Photos Manager initialization...');
            
            // Check if auth system is available
            if (window.yearawayAuth) {
                this.authSystem = window.yearawayAuth;
                console.log('🔗 Auth system found during photos initialization');
            } else {
                // Check localStorage directly for auth status
                if (window.YearAwayAuthConfig && window.YearAwayAuthConfig.isAuthenticated()) {
                    console.log('🔗 Auth token found in localStorage, loading members photos');
                    this.authSystem = {
                        isMember: () => true
                    };
                } else {
                    console.log('🔗 No auth token found, loading public photos only');
                    this.authSystem = {
                        isMember: () => false
                    };
                }
            }
            
            await this.loadPhotosData();
            console.log('📸 Photos data loaded:', this.photosData);
            
        } catch (error) {
            console.error('❌ Error initializing Photos Manager:', error);
        }
    }

    /**
     * Load photos data from YAML files
     */
    async loadPhotosData() {
        try {
            // Load public photos first
            const publicResponse = await fetch('content/photos-data-public.yaml');
            if (!publicResponse.ok) {
                throw new Error(`HTTP error! status: ${publicResponse.status}`);
            }
            
            const publicYamlText = await publicResponse.text();
            console.log('📸 Raw public photos YAML text length:', publicYamlText.length);
            const publicData = this.parsePhotosYAML(publicYamlText);
            console.log('📸 Parsed public photos data:', publicData);
            
            // Initialize photos data with public photos
            this.photosData = {
                photos: publicData.photos || [],
                categories: publicData.categories || []
            };
            
            // Load members-only photos if authenticated
            if (this.authSystem && this.authSystem.isMember()) {
                try {
                    const membersResponse = await fetch('content/photos-data-members.yaml');
                    if (membersResponse.ok) {
                        const membersYamlText = await membersResponse.text();
                        const membersData = this.parsePhotosYAML(membersYamlText);
                        console.log('📸 Parsed members photos data:', membersData);
                        
                        // Merge members-only photos with deduplication
                        const existingPhotoIds = new Set(this.photosData.photos.map(photo => photo.id));
                        const newMembersPhotos = (membersData.photos || []).filter(photo => !existingPhotoIds.has(photo.id));
                        console.log('📸 Deduplication:', {
                            existingIds: Array.from(existingPhotoIds),
                            newMembersPhotos: newMembersPhotos.map(p => p.id),
                            filteredOut: (membersData.photos || []).filter(photo => existingPhotoIds.has(photo.id)).map(p => p.id)
                        });
                        this.photosData.photos = [...this.photosData.photos, ...newMembersPhotos];
                        
                        // Merge categories (update counts)
                        if (membersData.categories) {
                            membersData.categories.forEach(memberCategory => {
                                const existingCategory = this.photosData.categories.find(cat => cat.id === memberCategory.id);
                                if (existingCategory) {
                                    existingCategory.count += memberCategory.count;
                                } else {
                                    this.photosData.categories.push(memberCategory);
                                }
                            });
                        }
                        
                        console.log('📸 Combined photos data:', this.photosData);
                    }
                } catch (membersError) {
                    console.warn('⚠️ Could not load members-only photos:', membersError);
                }
            }
            
            console.log('📸 Photos data loaded:', this.photosData);
        } catch (error) {
            console.error('❌ Error loading photos data:', error);
            // Fallback to empty data structure
            this.photosData = { photos: [], categories: [] };
        }
    }

    /**
     * Parse photos YAML content (simplified parser)
     */
    parsePhotosYAML(yamlText) {
        const data = { photos: [], categories: [] };
        const lines = yamlText.split('\n');
        let currentSection = null;
        let currentItem = null;
        let descriptionLines = [];
        let inDescription = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Section headers
            if (trimmed === 'photos:') {
                // Save previous item before switching sections
                if (currentItem) {
                    if (descriptionLines.length > 0) {
                        currentItem.description = descriptionLines.join('\n').trim();
                        descriptionLines = [];
                    }
                    data[currentSection].push(currentItem);
                    currentItem = null;
                }
                currentSection = 'photos';
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
                } else if (key === 'tags' || key === 'adventure_ids') {
                    // Initialize array if it doesn't exist
                    if (!currentItem[key]) {
                        currentItem[key] = [];
                    }
                    // Parse array format [item1, item2, item3] or single item
                    if (value.startsWith('[') && value.endsWith(']')) {
                        currentItem[key] = value.slice(1, -1).split(', ').map(item => item.trim());
                    } else if (value.trim()) {
                        // Single item, add to array
                        currentItem[key].push(value.trim());
                    }
                } else if (key === 'isPublic' || key === 'featured') {
                    currentItem[key] = value === 'true';
                } else {
                    // Remove quotes from string values (common in YAML)
                    currentItem[key] = value.replace(/^["']|["']$/g, '');
                }
                continue;
            }
            
            // Handle YAML array items (lines starting with -)
            if (currentItem && trimmed.startsWith('- ')) {
                const arrayValue = trimmed.substring(2).trim();
                // Check if we're in a tags or adventure_ids context
                if (currentItem.tags && !currentItem.tags.length) {
                    currentItem.tags = [];
                }
                if (currentItem.adventure_ids && !currentItem.adventure_ids.length) {
                    currentItem.adventure_ids = [];
                }
                
                // Look at the previous line to determine which array this belongs to
                if (i > 0) {
                    const prevLine = lines[i - 1].trim();
                    if (prevLine === 'tags:') {
                        if (!currentItem.tags) currentItem.tags = [];
                        currentItem.tags.push(arrayValue);
                    } else if (prevLine === 'adventure_ids:') {
                        if (!currentItem.adventure_ids) currentItem.adventure_ids = [];
                        currentItem.adventure_ids.push(arrayValue);
                    }
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
     * Get photos linked to a specific adventure by adventure ID
     */
    getPhotosForAdventure(adventureId) {
        if (!this.photosData || !this.photosData.photos) return [];
        
        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        console.log('🔍 getPhotosForAdventure called with adventureId:', adventureId);
        console.log('🔍 Total photos available:', this.photosData.photos.length);
        console.log('🔍 Is member:', isMember);
        
        const result = this.photosData.photos.filter(photo => {
            console.log('🔍 Checking photo:', photo.id, 'adventure_ids:', photo.adventure_ids, 'isPublic:', photo.isPublic);
            
            // Check if photo is linked to this adventure
            if (!photo.adventure_ids || !photo.adventure_ids.includes(adventureId)) {
                console.log('🔍 Photo', photo.id, 'not linked to adventure', adventureId);
                return false;
            }
            
            // Filter based on authentication status
            if (!photo.isPublic && !isMember) {
                console.log('🔍 Photo', photo.id, 'is private and user not member');
                return false; // Hide private photos for non-members
            }
            
            console.log('🔍 Photo', photo.id, 'matches criteria');
            return true;
        });
        
        console.log('🔍 Found', result.length, 'photos for adventure', adventureId);
        return result;
    }

    /**
     * Get photos by tags (for more flexible linking)
     */
    getPhotosByTags(tags) {
        if (!this.photosData || !this.photosData.photos || !tags) return [];
        
        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        
        return this.photosData.photos.filter(photo => {
            // Check if photo has any matching tags
            if (!photo.tags) return false;
            
            const hasMatchingTag = photo.tags.some(tag => tags.includes(tag));
            if (!hasMatchingTag) return false;
            
            // Filter based on authentication status
            if (!photo.isPublic && !isMember) {
                return false; // Hide private photos for non-members
            }
            
            return true;
        });
    }

    /**
     * Get featured photos
     */
    getFeaturedPhotos(limit = 5) {
        if (!this.photosData || !this.photosData.photos) return [];
        
        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        
        return this.photosData.photos
            .filter(photo => {
                if (!photo.featured) return false;
                
                // Filter based on authentication status
                if (!photo.isPublic && !isMember) {
                    return false; // Hide private photos for non-members
                }
                
                return true;
            })
            .slice(0, limit);
    }

    /**
     * Render photos for an adventure
     */
    renderPhotosForAdventure(adventureId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const photos = this.getPhotosForAdventure(adventureId);
        if (photos.length === 0) return;

        const isMember = this.authSystem ? this.authSystem.isMember() : false;
        
        const photosHtml = photos.map(photo => {
            const memberOnlyClass = !photo.isPublic ? 'members-only' : '';
            const memberIndicator = !photo.isPublic ? '<div class="member-indicator">🔒 Members Only</div>' : '';
            
            return `
                <div class="adventure-photo ${memberOnlyClass}">
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

        container.innerHTML = `
            <div class="adventure-photos">
                <h4>📸 Photos</h4>
                <div class="photos-grid">
                    ${photosHtml}
                </div>
            </div>
        `;
    }

    /**
     * Set reference to auth system
     */
    async setAuthSystem(authSystem) {
        this.authSystem = authSystem;
        console.log('🔗 Auth system connected to photos manager');
        
        // Reload photos data with new auth status
        try {
            await this.loadPhotosData();
            console.log('🔄 Photos data reloaded with auth status');
        } catch (error) {
            console.error('❌ Error reloading photos data:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📸 DOM loaded, initializing PhotosManager...');
    const initPhotosManager = () => {
        if (window.yearawayAuth) {
            try {
                window.photosManager = new PhotosManager();
                console.log('📸 YearAway Photos Manager Initialized');
            } catch (error) {
                console.error('❌ Error initializing PhotosManager:', error);
            }
        } else {
            setTimeout(initPhotosManager, 100);
        }
    };
    initPhotosManager();
});

// Connect authentication system to photos manager
async function connectAuthToPhotos() {
    if (window.yearawayAuth && window.photosManager) {
        await window.photosManager.setAuthSystem(window.yearawayAuth);
        console.log('🔗 Auth system connected to photos manager');
        return true;
    } else {
        console.log('⚠️ Auth system or photos manager not ready:', {
            authSystem: !!window.yearawayAuth,
            photosManager: !!window.photosManager
        });
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Try to connect immediately
    if (!connectAuthToPhotos()) {
        // If not ready, try again after a delay
        setTimeout(() => {
            if (!connectAuthToPhotos()) {
                // Try one more time after another delay
                setTimeout(connectAuthToPhotos, 1000);
            }
        }, 500);
    }
});
