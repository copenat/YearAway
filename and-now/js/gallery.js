/**
 * YearAway Gallery - JavaScript
 * Handles photo gallery filtering and interactions
 */

class GalleryManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupPhotoInteractions();
    }

    /**
     * Setup gallery filters
     */
    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const photoItems = document.querySelectorAll('.photo-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Get filter value
                const filter = button.dataset.filter;

                // Filter photos
                photoItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else {
                        const category = item.dataset.category;
                        if (category === filter) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });

                // Animate filtered items
                this.animateFilteredItems();
            });
        });
    }

    /**
     * Animate filtered items
     */
    animateFilteredItems() {
        const visibleItems = document.querySelectorAll('.photo-item[style*="block"], .photo-item:not([style*="none"])');
        
        visibleItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    /**
     * Setup photo interactions
     */
    setupPhotoInteractions() {
        const photoContainers = document.querySelectorAll('.photo-container');

        photoContainers.forEach(container => {
            // Add hover effects
            container.addEventListener('mouseenter', () => {
                const overlay = container.querySelector('.photo-overlay');
                if (overlay) {
                    overlay.style.opacity = '1';
                }
            });

            container.addEventListener('mouseleave', () => {
                const overlay = container.querySelector('.photo-overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                }
            });

            // Add click handler for photo modal (future enhancement)
            container.addEventListener('click', () => {
                this.openPhotoModal(container);
            });
        });
    }

    /**
     * Open photo modal (placeholder for future enhancement)
     */
    openPhotoModal(container) {
        const img = container.querySelector('img');
        const title = container.querySelector('h3')?.textContent || 'Photo';
        const description = container.querySelector('p')?.textContent || '';

        // For now, just show an alert
        // In the future, this could open a full-screen modal
        console.log('Opening photo modal:', { title, description, src: img.src });
        
        // You could implement a modal here:
        // this.showModal(img.src, title, description);
    }

    /**
     * Show modal (placeholder for future implementation)
     */
    showModal(imageSrc, title, description) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <img src="${imageSrc}" alt="${title}">
                    <div class="modal-info">
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Add to page
        document.body.appendChild(modal);

        // Close modal handlers
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(modal);
            }
        });

        // ESC key to close
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    /**
     * Lazy load images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.galleryManager = new GalleryManager();
    console.log('📸 YearAway Gallery Manager Loaded');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryManager;
}
