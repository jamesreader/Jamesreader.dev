# James Reader Portfolio - Deployment Guide

## Project Status
✅ **Built and Ready** - Site compiles successfully with Next.js 14

## Manual Deployment to Coolify

### 1. Create GitHub Repository
First, push this code to a GitHub repository:

```bash
git remote add origin https://github.com/jamesreader/jamesreader.dev.git
git branch -M main  
git push -u origin main
```

### 2. Deploy via Coolify Web Interface

1. **Login to Coolify**: https://coolify.personafi.app
2. **Create New Application**:
   - Click "New Resource" → "Application" 
   - Choose "Public Repository"
   - Repository URL: `https://github.com/jamesreader/jamesreader.dev.git`
   - Branch: `main`
   - Build Pack: `nixpacks` (auto-detects Next.js)
   
3. **Configure Domain**:
   - Domain: `jamesreader.dev`
   - Enable "Generate SSL Certificate" (Let's Encrypt)
   
4. **Environment Variables** (if needed):
   - `NODE_ENV=production`
   - `PORT=3000`

5. **Deploy**:
   - Click "Deploy" button
   - Monitor build logs

### 3. DNS Configuration
Point `jamesreader.dev` A record to Coolify server IP: `5.78.144.84`

## Project Structure
```
jamesreader-dev/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── page.tsx   # Home page with animated background
│   │   ├── about/     # About page with timeline
│   │   ├── projects/  # Projects showcase  
│   │   ├── blog/      # Blog (ready for Sanity CMS)
│   │   └── contact/   # Contact page
│   └── components/    # Reusable components
├── Dockerfile         # Production container setup
└── tailwind.config.js # Custom color scheme
```

## Design Features
- **Dark atmospheric theme** - No generic gradients or cookie-cutter look
- **Terminal-inspired navigation** - Reflects builder personality  
- **Animated typing effect** - Shows multiple roles
- **Custom color palette** - Ember orange, signal teal, ghost gray
- **Mobile responsive** - Samsung S24 Ultra tested
- **Performance optimized** - Static generation, fast loading

## Tech Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom colors
- **React Icons** for consistent iconography
- **Standalone build** for Docker deployment

## Blog Integration (Next Phase)
The blog section is ready for Sanity CMS integration:
1. Create new Sanity project: `npx sanity@latest init`
2. Configure blog schema (title, slug, body, categories)  
3. Add environment variables for Sanity project ID and API token
4. Replace placeholder posts with live Sanity data

## Content Notes
- **No em dashes** anywhere in copy (per James's preference)
- **Direct, sharp tone** - matches personality
- **Real project details** - Meridian Money, SMIS AI, DGX infrastructure
- **Authentic experience** - government IT, MSP background

## Post-Deployment
After successful deployment:
1. Test all pages and navigation
2. Verify SSL certificate installation  
3. Check mobile responsiveness
4. Validate contact form (currently email link)
5. Set up analytics if needed

**Expected Result**: Portfolio site live at https://jamesreader.dev showcasing James's AI/infrastructure work with a unique, non-generic design that stands out from typical developer portfolios.