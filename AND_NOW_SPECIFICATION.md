# YearAway "And Now" Site - Technical Specification

## 📋 Project Overview

Create a modern, interactive website accessible from the "And Now" button that represents the current/future state of YearAway, complementing the "Then" button which shows the historical travel archive (2001-2011).

**Current Status**: Planning Phase  
**Target Launch**: TBD  
**Project Owner**: Nathan  
**Last Updated**: September 1, 2025  

---

## 🎯 Site Structure & Navigation

### Main Pages
- **Home** (`index.html`) - Landing page with overview
- **Current Adventures** (`adventures.html`) - Ongoing or recent travels
- **Future Plans** (`plans.html`) - Upcoming trips and dreams
- **Life Updates** (`updates.html`) - Personal/professional developments
- **Photo Gallery** (`gallery.html`) - Current photos and memories
- **Contact** (`contact.html`) - Get in touch

### Navigation Structure
```
YearAway (Main Site)
├── Then (that_was_then/) ← Historical archive (2001-2011)
└── And Now (new-site/) ← Current/future adventures
    ├── Home
    ├── Current Adventures
    ├── Future Plans
    ├── Life Updates
    ├── Photo Gallery
    └── Contact
```

---

## 🎨 Design & User Experience

### Visual Identity
- **Color Scheme**: Modern evolution of the current brown theme
  - Primary: `#8B4513` (current brown)
  - Secondary: `#D2691E` (lighter brown)
  - Accent: `#CD853F` (warm tan)
  - Background: Clean whites and subtle gradients
- **Typography**: Modern, readable fonts with hierarchy
- **Layout**: Responsive design optimized for all devices

### Key Features
- **Interactive Elements**: Hover effects, smooth transitions, animations
- **Modern UI Components**: Cards, modals, carousels, progress bars
- **Responsive Design**: Mobile-first approach with tablet/desktop optimization
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

## 📝 Content Strategy

### Home Page
- Hero section with current status/location
- Quick overview of recent adventures
- Call-to-action buttons for key sections
- Integration with social media feeds (if applicable)

### Current Adventures
- Real-time or recent travel updates
- Interactive maps showing current location
- Photo galleries of recent trips
- Travel tips and recommendations

### Future Plans
- Upcoming trip itineraries
- Dream destinations bucket list
- Planning resources and tools
- Countdown timers for major trips

### Life Updates
- Personal and professional developments
- Milestone celebrations
- Life changes and transitions
- Reflection pieces

---

## 🛠️ Technical Implementation

### File Structure
```
new-site/
├── index.html
├── adventures.html
├── plans.html
├── updates.html
├── gallery.html
├── contact.html
├── css/
│   ├── style.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── gallery.js
│   └── maps.js
├── images/
├── assets/
└── manifest.json
```

### Technologies
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Interactivity**: ES6+ JavaScript, Intersection Observer API
- **Performance**: Lazy loading, image optimization, service worker
- **Responsiveness**: CSS Media Queries, mobile-first design
- **Hosting**: Cloudflare Pages (static site hosting)
- **Deployment**: GitHub integration with automatic builds

---

## 📊 Content Management

### Static Content
- HTML files for each page
- CSS for styling and responsive design
- JavaScript for interactivity and dynamic features

### Static Site Approach
- **Static HTML**: Pre-built HTML files for all content
- **Markdown Files**: Easy content updates via markdown
- **JSON Data**: Structured content management
- **Build Process**: Python scripts for content generation and updates
- **Git-based Workflow**: Version control for content with GitHub
- **Cloudflare Pages**: Automatic builds and deployments from GitHub

---

## 🔗 Integration Points

### With Existing Site
- **Navigation**: Seamless transition between "Then" and "And Now"
- **Styling**: Consistent visual language while being distinct
- **Content**: References to historical adventures when relevant
- **Assets**: Shared resources where appropriate

### External Services
- **Maps**: Google Maps or OpenStreetMap integration
- **Social Media**: Instagram, Twitter, Facebook feeds
- **Analytics**: Google Analytics or privacy-focused alternatives
- **Hosting**: Cloudflare Pages (static site hosting)
- **Deployment**: GitHub integration with automatic builds
- **CDN**: Cloudflare's global CDN for fast global delivery

---

## 🚀 Development Phases

### Phase 1: Foundation
- [ ] Basic HTML structure for all pages
- [ ] Core CSS styling and responsive design
- [ ] Basic navigation and layout
- [ ] File structure setup
- [ ] GitHub repository setup
- [ ] Cloudflare Pages configuration

### Phase 2: Content & Features
- [ ] Populate pages with initial content
- [ ] Implement interactive features
- [ ] Photo gallery and media handling
- [ ] Basic functionality testing
- [ ] Build process automation
- [ ] GitHub Actions for automated deployment

### Phase 3: Enhancement
- [ ] Advanced animations and transitions
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Comprehensive testing and refinement
- [ ] Cloudflare Pages optimization
- [ ] Performance monitoring and analytics

---

## 📈 Success Metrics

### User Experience
- Fast loading times (<3 seconds)
- Mobile-friendly design
- Intuitive navigation
- Engaging content presentation

### Technical Performance
- Lighthouse score >90
- Mobile responsiveness score >95
- Accessibility compliance
- Cross-browser compatibility

---

## 🔮 Future Considerations

### Scalability
- **Static Site Generation**: Jekyll, Hugo, or custom Python build system
- **Content Management**: Markdown-based content with automated builds
- **Blog Functionality**: Static blog generation for regular updates
- **User Interaction**: Client-side features (no server required)
- **Multi-language Support**: Static translations and language switching

### Advanced Features
- **Client-side Location**: Browser-based location services
- **Travel Planning Tools**: Static travel planning resources
- **Community Features**: Client-side interaction capabilities
- **API Integration**: Client-side API calls to external services
- **Offline Support**: Service worker for offline functionality

---

## 📝 Notes & Ideas

### Content Ideas
- Current location updates
- Recent travel photos
- Future trip planning
- Life milestone updates
- Travel tips and recommendations

### Technical Ideas
- Interactive world map
- Travel timeline visualization
- Photo carousels
- Responsive image galleries
- Smooth page transitions

---

## 🎯 Next Steps

### Immediate Actions
1. **Finalize specification** based on feedback
2. **Create detailed content plan** for each page
3. **Set up development environment** and file structure
4. **Configure GitHub repository** and Cloudflare Pages
5. **Begin Phase 1 development**

### Questions to Resolve
- What specific content should go on each page?
- Are there any particular features that are priorities?
- What's the timeline for launch?
- Any specific design preferences or inspirations?
- Should we use a static site generator (Jekyll/Hugo) or custom Python build system?
- What's the preferred deployment workflow (GitHub Actions vs Cloudflare Pages auto-build)?

---

## 🌐 Static Site Hosting & Deployment

### Cloudflare Pages Setup
- **Static Site Hosting**: Cloudflare Pages for fast, global hosting
- **Automatic Builds**: GitHub integration triggers automatic deployments
- **Global CDN**: Cloudflare's edge network for worldwide performance
- **Custom Domain**: yearaway.com/and-now or subdomain configuration
- **SSL/HTTPS**: Automatic SSL certificate management

### GitHub Integration
- **Repository Structure**: Organized file structure for easy content management
- **Branch Strategy**: Main branch for production, develop for staging
- **Automated Workflows**: GitHub Actions for build and deployment
- **Content Updates**: Markdown files with automated HTML generation
- **Version Control**: Full history of all content and design changes

### Build Process
- **Content Sources**: Markdown files, JSON data, image assets
- **Build Scripts**: Python scripts for content processing and HTML generation
- **Asset Optimization**: Image compression, CSS/JS minification
- **Deployment**: Automatic deployment to Cloudflare Pages on push to main
- **Rollback**: Easy rollback to previous versions via Git

---

## 📞 Contact & Updates

**Project Lead**: Nathan  
**Last Review**: September 1, 2025  
**Next Review**: TBD  
**Status**: Planning Phase  

---

*This document will be updated as the project progresses. All changes should be committed to the repository.*
