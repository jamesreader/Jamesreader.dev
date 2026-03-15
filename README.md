# James Reader Portfolio

A dark, atmospheric portfolio site that doesn't look like every other AI-generated developer portfolio.

## 🎯 Design Philosophy
- **Authentic builder vibe** - Terminal-inspired, not corporate
- **Dark atmospheric theme** - Ember orange accents, no generic gradients  
- **Performance focused** - Static generation, optimized builds
- **Mobile-first** - Designed for Samsung S24 Ultra

## 🚀 Features Built

### ✅ Core Pages
- **Home**: Animated typing roles, terminal prompt styling
- **About**: Professional timeline, skills grid, experience narrative
- **Projects**: Showcase of Meridian Money, SMIS AI, DGX infrastructure
- **Blog**: Ready for Sanity CMS integration (placeholder content)
- **Contact**: Service offerings, availability status, contact methods

### ✅ Technical Implementation
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** with custom color system
- **Standalone Docker build** ready for deployment
- **Mobile responsive** design
- **SEO optimized** with proper meta tags

### ✅ Custom Styling
- **Color palette**: Void black, ember orange, signal teal, ghost gray
- **Typography**: JetBrains Mono + Inter fonts
- **Animations**: Fade-in sequences, typing effects, hover transitions
- **Layout**: Terminal-inspired navigation, clean content hierarchy

## 📁 Project Structure
```
src/
├── app/
│   ├── layout.tsx         # Root layout with nav/footer
│   ├── page.tsx          # Home page with typing animation
│   ├── about/page.tsx    # Professional timeline & skills
│   ├── projects/page.tsx # Project showcase
│   ├── blog/page.tsx     # Blog listing (ready for CMS)
│   ├── blog/[slug]/      # Individual blog posts
│   └── contact/page.tsx  # Contact info & services
├── components/
│   ├── Nav.tsx           # Terminal-style navigation
│   └── Footer.tsx        # Simple footer with links
└── globals.css           # Custom animations & effects
```

## 🎨 Design Elements
- **Terminal prompts**: `~/james-reader $` style navigation
- **Monospace accents**: Code-style elements throughout
- **Subtle animations**: Fade-ins, hover effects, typing simulation
- **Status indicators**: Availability, project status, tech stack
- **Grid backgrounds**: Subtle pattern overlays

## 🔧 Deployment Ready
- **Dockerfile**: Multi-stage build for production
- **Build verified**: Compiles successfully with optimizations
- **Environment**: Configured for standalone deployment
- **Domain ready**: jamesreader.dev DNS configuration

## 📝 Content Strategy
All copy reflects James's personality:
- **Direct and sharp** - no corporate fluff
- **Builder-focused** - emphasizes hands-on experience
- **Problem-solver narrative** - 20+ years fixing things
- **AI expertise** - DGX infrastructure, local LLMs
- **Government sector** - municipal IT modernization

## 🚀 Next Steps
1. **Deploy to Coolify** - Follow DEPLOYMENT.md instructions
2. **DNS configuration** - Point jamesreader.dev to server
3. **Sanity CMS setup** - Blog content management
4. **Content creation** - Write actual blog posts
5. **Performance monitoring** - Analytics and optimization

## 🎯 Goals Achieved
✅ **Non-generic design** - Unique atmospheric theme  
✅ **Builder personality** - Terminal-inspired, authentic feel
✅ **Mobile optimized** - Samsung S24 Ultra compatible
✅ **Performance focused** - Static generation, fast loading
✅ **Professional showcase** - Real projects, authentic experience
✅ **Deployment ready** - Docker containerized, build verified

**Result**: A portfolio site that actually represents a builder who builds things.