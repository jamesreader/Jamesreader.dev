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
`jamesreader.dev` is proxied through Cloudflare (orange cloud). The origin A record points at the Coolify host on forge (`5.78.144.84`). Coolify's internal Traefik handles the SSL termination and routes the hostname to the jamesreader-dev container. To move the site to a different origin, update the Cloudflare A record to the new IP and let Traefik pick up the hostname from the Coolify app config.

## Project Structure
```
jamesreader-dev/
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── page.tsx     # Home page with animated background
│   │   ├── about/       # About page with timeline
│   │   ├── work/        # Work / projects showcase
│   │   ├── blog/        # Blog, sourced from src/lib/blog-posts.ts
│   │   ├── changelog/   # Changelog, sourced from content/changelog/*.mdx
│   │   ├── lab/         # Lab / experiments
│   │   └── api/         # Route handlers (agent proxy, annotate, evaluate, etc.)
│   ├── components/      # Reusable components
│   ├── lib/             # Data and helpers (blog-posts.ts, changelog.ts)
│   └── context/         # React providers (AgentProvider, etc.)
├── content/             # TinaCMS-managed content
│   ├── projects/        # Project case studies (MDX)
│   ├── experience/      # Bio, consulting copy (MD)
│   ├── philosophy/      # Philosophy / principles (MD)
│   └── changelog/       # Changelog entries (MDX)
├── tina/                # TinaCMS config
├── scripts/             # Build / ops helpers (generate-changelog-drafts.ts)
├── Dockerfile           # Production container setup
└── tailwind.config.js   # Custom color scheme
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
- **TinaCMS** for `content/` (projects, experience, philosophy, changelog)
- **react-markdown + remark-gfm** for MDX body rendering
- **Standalone build** for Docker deployment

## Content Sources
- **Blog**: hardcoded array in `src/lib/blog-posts.ts`. Add new entries there; the `/blog` route reads from it directly.
- **Changelog**: `content/changelog/*.mdx` with frontmatter (`date`, `title`, `summary`, `categories`, `published`). Drafts (`published: false`) are hidden from the public list; flip to `true` when ready to publish. Use `npx tsx scripts/generate-changelog-drafts.ts` to auto-ingest recent git commits as draft entries for curation.
- **Projects / Experience / Philosophy**: `content/<collection>/*.md(x)` edited through the TinaCMS admin at `/admin`.

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