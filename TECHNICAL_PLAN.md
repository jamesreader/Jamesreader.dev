# TECHNICAL_PLAN.md — JamesReader.dev Agentic Portfolio

> **Created:** 2026-03-21
> **Status:** Planning — No code changes yet
> **Goal:** Transform a clean static Next.js portfolio into an AI-guided discovery experience

---

## 1. Current State Assessment

### What Exists Today

**Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS 3.4
**CMS:** TinaCMS (MDX blog posts, configured but lightly used — 1 hello-world post)
**Deployment:** Docker (standalone output) → Coolify on forge (Hetzner VPS, 5.78.144.84)
**Design System:** Playfair Display + Inter, turquoise (#00B4D8) accent on cream/charcoal palette, dark mode with class toggle

**Pages (5):**
| Route | Status | Notes |
|-------|--------|-------|
| `/` (Home) | ✅ Complete | Hero + featured projects (3 cards) + blog placeholder |
| `/work` | ✅ Complete | 3 projects: Meridian, SMIS, Local AI Infra (static data, no CMS) |
| `/about` | ✅ Complete | Photo placeholder, bio, timeline (5 roles), skills grid |
| `/blog` | ⚠️ Placeholder | 3 "Coming Soon" posts, no real content rendering |
| `/blog/[slug]` | ⚠️ Exists | Route exists but content pipeline not wired |
| `/lab` | ⚠️ Partial | Embeds particle sim from `http://daedalus:8899` (won't load externally) |

**Components (3):**
- `Nav.tsx` — Fixed top nav, mobile hamburger, 5 links (Home/Work/Blog/About/Lab)
- `Footer.tsx` — 3-column: brand, nav links, connect (GitHub + email)
- `ThemeToggle.tsx` — Dark/light mode toggle

**Content Files (rich, well-structured — great RAG source):**
- `content/projects/` — 4 markdown files: meridian-money, smis-ai-tool, edgewood-ai, jamesreader-dev (meta/self-referential)
- `content/experience/` — bio.md (comprehensive), consulting.md (engagement models + pricing)
- `content/philosophy/` — approach.md (building philosophy)
- `content/blog/` — 1 hello-world.mdx

**What's Good:**
- Clean, editorial design language — well-executed, worth preserving
- Content markdown files are rich and well-tagged with `audience_tags` — perfect for RAG chunking
- Tailwind config has a solid custom color system and animation keyframes
- Standalone Docker build works
- Dark mode fully implemented

**What's Missing (everything the SPEC calls for):**
- Zero AI/agent integration
- No streaming, no SSE, no WebSocket support
- No dynamic content rendering based on visitor intent
- No conversation UI
- No connection to Daedalus/vLLM
- No pgvector, no RAG pipeline
- No voice integration
- No session/state management beyond theme toggle
- No Framer Motion or animation library
- No API routes (beyond TinaCMS rewrites)
- Lab page points to internal Tailscale URL (broken for public visitors)

---

## 2. Architecture Decisions

### 2.1 High-Level Architecture

```
Visitor Browser
    │
    ▼
Next.js Frontend (Coolify/forge) ──HTTPS──▶ FastAPI Agent Backend (Daedalus)
    │                                              │
    │  - SSE streaming responses                   ├─▶ Qwen3.5-122B (vLLM, localhost:8000)
    │  - UI directives (JSON)                      ├─▶ PostgreSQL + pgvector (localhost:5432)
    │  - Voice audio chunks                        ├─▶ Embedding model (localhost or Ollama)
    │                                              └─▶ External APIs (GitHub, etc.)
    │
    ▼
localStorage (session memory, no PII)
```

### 2.2 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Agent backend | **FastAPI on Daedalus** | Zero-hop to vLLM. Python ecosystem for RAG. Same box as model = lowest latency. |
| Frontend ↔ Backend transport | **SSE (Server-Sent Events)** | Simpler than WebSocket for streaming text. Native `EventSource` API. Proxy-friendly. |
| Vector store | **pgvector in PostgreSQL** | Already need Postgres for sessions. One database. pgvector is battle-tested. |
| Embedding model | **nomic-embed-text on Daedalus** (via Ollama or direct) | Keep pipeline self-contained on Daedalus. 768-dim, good quality. |
| Animation library | **Framer Motion** | Layout animations for content reordering. Mature, React-native. Used by spec. |
| State management | **React Context + localStorage** | No Redux needed. AgentProvider context for session state. localStorage for cross-visit memory. |
| Voice TTS | **ElevenLabs API** (clone ID: ENSTXH7dr6VPsFwk0P9r) | James's cloned voice. Pre-render intros, stream for conversation. |
| Frontend-to-Daedalus routing | **Next.js API route proxy** | Frontend calls `/api/agent/*`, Next.js proxies to `http://daedalus:<port>`. Avoids CORS, hides backend URL. |
| Upgrade Next.js? | **Stay on Next.js 14** | Working, deployed, no compelling reason to upgrade mid-project. |
| TinaCMS | **Keep for blog, don't use for agent content** | Blog posts flow through Tina. Agent knowledge base is separate (markdown → embedding pipeline). |

### 2.3 What Needs to Be Built

**On Daedalus (Agent Backend):**
1. FastAPI service with SSE streaming
2. PostgreSQL + pgvector database
3. RAG pipeline: ingest markdown → chunk → embed → store → retrieve
4. Agent orchestrator: intent router + content curator + response generator
5. System prompts per intent path
6. Tool integrations (GitHub API, etc.)
7. Rate limiting (token bucket per IP)
8. Health check endpoint

**On Coolify (Frontend):**
1. `AgentProvider` — React context for session state
2. `IntentSelector` — Entrance experience (4 intent cards)
3. `ConversationThread` — Side panel with streaming + rich content
4. `GuideLayer` — Contextual annotations + proactive suggestions
5. `DynamicLayout` — Content reordering with Framer Motion
6. API proxy routes (`/api/agent/*`)
7. Voice playback component
8. Session memory (localStorage)
9. Scroll/engagement tracking hooks
10. Updated project pages to support agent annotations

---

## 3. Build Order — Phases & Dependencies

### Phase 0: Infrastructure Setup (Day 1-2)
**Goal:** Database, embedding model, and FastAPI skeleton running on Daedalus.
**Depends on:** Daedalus SSH access, vLLM already running.

```
[ ] Install PostgreSQL + pgvector extension on Daedalus
[ ] Create database: jamesreader_agent
[ ] Install/configure embedding model (nomic-embed-text via Ollama on Daedalus)
[ ] Scaffold FastAPI project: reader-agent/
[ ] Basic health endpoint: GET /health → { status: ok, model: connected }
[ ] Verify vLLM reachability from FastAPI (localhost:8000/v1/chat/completions)
[ ] Set up systemd service or Docker for FastAPI persistence
```

### Phase 1: Knowledge Base & RAG Pipeline (Day 2-4)
**Goal:** All content ingested, chunked, embedded, and retrievable.
**Depends on:** Phase 0 (database + embedding model).

```
[ ] Design pgvector schema (documents + chunks tables)
[ ] Build ingestion script: read content/*.md → parse frontmatter + body
[ ] Implement semantic chunking (by section headers, ~300-500 tokens per chunk)
[ ] Generate embeddings (nomic-embed-text, 768-dim)
[ ] Store chunks + embeddings in pgvector
[ ] Build retrieval function: query → embed → similarity search → rank → return
[ ] Add metadata filtering (audience_tags, project, category)
[ ] Add hybrid search (vector similarity + pg_trgm keyword matching)
[ ] Test: "Tell me about the SMIS project" → returns relevant chunks
[ ] Ingest all content:
    - content/projects/*.md (4 files)
    - content/experience/*.md (2 files)
    - content/philosophy/*.md (1 file)
    - content/blog/*.mdx (1 file, will grow)
```

### Phase 2: Agent Core (Day 4-7)
**Goal:** Working chat endpoint that answers questions about James using RAG.
**Depends on:** Phase 1 (RAG pipeline).

```
[ ] Design system prompt for "Reader" agent personality
[ ] Create intent-specific prompt variants (consulting, technical, personal, exploring)
[ ] Build /api/chat endpoint (POST, SSE streaming)
    - Accept: { message, session_id, intent, conversation_history }
    - Stream: text chunks + UI directives (JSON)
[ ] Implement intent detection from first message (or explicit selection)
[ ] Build content curator: intent-weighted retrieval, seen-content filtering
[ ] Implement conversation memory (server-side, keyed by session_id, in-memory or Redis)
[ ] Add structured output for UI directives (highlight section, suggest navigation, etc.)
[ ] Rate limiting middleware (token bucket, ~20 req/min per IP)
[ ] Test end-to-end: message → RAG retrieval → Qwen generation → streaming response
```

### Phase 3: Frontend — Agent Foundation (Day 7-10)
**Goal:** Working conversation UI connected to the backend.
**Depends on:** Phase 2 (chat endpoint).

```
[ ] npm install framer-motion
[ ] Create AgentProvider (React context):
    - State: intent, sessionId, conversationHistory, contentSeen, isOpen
    - Hooks: useAgent(), useIntent(), useConversation()
[ ] Create /api/agent/chat proxy route (Next.js → Daedalus FastAPI)
[ ] Create /api/agent/health proxy route
[ ] Build ConversationThread component:
    - Side panel (40% width desktop, full-screen mobile)
    - SSE streaming with incremental text rendering
    - Rich content: markdown, code blocks, images
    - Message bubbles with typing indicator
    - Expand/collapse with animation
[ ] Build ConversationTrigger:
    - Elegant floating button (not a generic chat bubble)
    - Turquoise accent, subtle pulse when agent has suggestions
[ ] Add to layout.tsx: wrap children in AgentProvider
[ ] Test: open conversation → type question → get streaming response
```

### Phase 4: The Entrance — Intent Selector (Day 10-12)
**Goal:** The "moment of engagement" landing experience.
**Depends on:** Phase 3 (AgentProvider, basic conversation).

```
[ ] Build IntentSelector component:
    - 4 cards: Consulting, Technical, Personal, Exploring
    - Icons, brief descriptions, hover animations
    - Full-viewport on first visit, elegant transition on selection
    - "Or just browse" link for traditional nav bypass
[ ] Implement intent-based session initialization:
    - Selection → POST /api/agent/init → session created with intent
    - Reader's opening message tailored to intent
[ ] Build DynamicLayout wrapper:
    - Reorder home page sections based on intent (Framer Motion layout)
    - Animate transitions smoothly (stagger children)
[ ] Modify page.tsx (Home):
    - Show IntentSelector on first visit (no intent in session)
    - After selection: animated transition to intent-optimized layout
    - Return visitors: skip selector, show optimized layout + welcome back
[ ] localStorage session memory:
    - Save: intent, contentSeen, lastVisit, sessionSummary
    - On return: hydrate AgentProvider from localStorage
```

### Phase 5: The Guide Layer (Day 12-15)
**Goal:** Agent annotations and proactive suggestions woven into content.
**Depends on:** Phase 4 (intent system, dynamic layout).

```
[ ] Build GuideAnnotation component:
    - Positioned adjacent to content sections
    - Slide-in animation, dismissible
    - Turquoise left border, slight glassmorphism
    - Max 2 visible simultaneously
[ ] Build ProactiveSuggestion component:
    - Bottom-right slide-in (desktop), toast (mobile)
    - Auto-dismiss after 10s
    - Triggered by scroll depth + dwell time
[ ] Build useScrollEngagement hook:
    - Track: scroll position, sections in view, dwell time per section
    - Emit events to AgentProvider for suggestion triggering
[ ] Build annotation content system:
    - Agent backend returns annotations keyed to content sections
    - Frontend renders them at appropriate positions
[ ] Build TransitionPrompt component:
    - Appears at end of content sections
    - "What would you like to explore next?" with 2-3 contextual options
    - Styled as content, not chrome
[ ] Wire guide layer into all content pages (Home, Work, About, Blog)
```

### Phase 6: Voice Integration (Day 15-17)
**Goal:** Visitors can hear Reader speak in James's voice.
**Depends on:** Phase 3 (conversation thread).

```
[ ] Build /api/agent/voice endpoint on Daedalus:
    - POST { text, style: 'narrative' | 'question' }
    - Returns audio stream (mp3)
    - ElevenLabs API with tuned settings:
      - Body: stability 0.6, similarity_boost 0.78
      - Questions: stability 0.65, similarity_boost 0.8, style 0.15
[ ] Pre-render welcome audio for each intent path (cache as static files)
[ ] Build VoicePlayer component:
    - Play/pause button in conversation thread
    - Audio waveform visualization (subtle)
    - Auto-play option for welcome message (with user gesture)
[ ] Build voice toggle in ConversationThread:
    - "Listen" button per response
    - Global voice mode toggle (auto-read responses)
[ ] Create /api/agent/voice proxy route on frontend
```

### Phase 7: Interactive Project Showcases (Day 17-20)
**Goal:** Projects become mini-experiences, not cards.
**Depends on:** Phase 5 (guide layer), Phase 2 (agent core).

```
[ ] Redesign /work page with per-project deep-dive sections:
    - Hero moment (stat/visual)
    - Story section (from content/*.md, agent-narrated option)
    - Architecture diagram (Mermaid or custom SVG, agent-annotatable)
    - Live stats (GitHub commits, etc.)
[ ] Build GitHubStats component:
    - Fetch from GitHub API via agent backend
    - Display: recent commits, languages, contribution activity
    - Cache aggressively (refresh daily)
[ ] Build ProjectDemo component (per project):
    - Meridian: screenshot carousel or embedded preview
    - SMIS: mini search demo (query SAM.gov through agent)
    - This site: "You're using it" meta-section
    - Edgewood: architecture diagram with annotations
[ ] Agent walkthrough mode:
    - Button: "Let Reader walk you through this project"
    - Streams a narrated explanation with scroll synchronization
[ ] Fix Lab page:
    - Replace daedalus:8899 with either a proxy or static fallback
    - Add more lab experiments or link to demos
```

### Phase 8: Polish & Production (Day 20-24)
**Goal:** Production-ready, performant, tested.
**Depends on:** All previous phases.

```
[ ] Performance:
    - Lazy-load ConversationThread, GuideLayer, VoicePlayer
    - Prefetch agent health on page load
    - Cache RAG results for repeated queries
    - Image optimization for project screenshots
[ ] Error handling:
    - Agent backend unreachable → graceful fallback to static site
    - vLLM overloaded → queue or fallback message
    - Rate limit hit → friendly message
    - Network errors in SSE → auto-reconnect
[ ] SEO:
    - Static content remains crawlable (SSR/SSG for core pages)
    - Agent layer is progressive enhancement (no JS = static portfolio)
    - OpenGraph tags, structured data for projects
[ ] Analytics:
    - Anonymous conversation logging (questions asked, intents selected)
    - Session duration, depth metrics
    - No PII, lightweight privacy notice
[ ] Testing:
    - Agent backend: pytest for RAG, API endpoints
    - Frontend: manual testing across breakpoints
    - E2E: visitor flow from intent selection through conversation
[ ] Documentation:
    - README update with architecture overview
    - Environment variables documented
    - Deployment guide (Coolify + Daedalus systemd)
[ ] Security:
    - CORS locked to jamesreader.dev
    - Rate limiting enforced
    - No sensitive data in frontend bundle
    - Agent can't be prompt-injected into revealing system prompts
```

---

## 4. File-by-File Plan

### 4.1 New Files — Daedalus Agent Backend

All under `/root/projects/Jamesreader.dev/agent/` (or separate repo: `reader-agent/`)

```
agent/
├── main.py                      # FastAPI app, CORS, middleware, lifespan
├── config.py                    # Settings: vLLM URL, DB URL, ElevenLabs key, etc.
├── requirements.txt             # fastapi, uvicorn, asyncpg, pgvector, httpx, etc.
├── Dockerfile                   # For deployment on Daedalus
├── .env.example                 # All required env vars documented
│
├── routers/
│   ├── chat.py                  # POST /api/chat — SSE streaming chat endpoint
│   ├── init.py                  # POST /api/init — Session initialization with intent
│   ├── voice.py                 # POST /api/voice — ElevenLabs TTS proxy
│   ├── health.py                # GET /health — Backend + model health
│   └── stats.py                 # GET /api/stats — GitHub stats, cached
│
├── core/
│   ├── agent.py                 # Agent orchestrator: intent routing → RAG → generation
│   ├── intent.py                # Intent detection and routing logic
│   ├── rag.py                   # RAG pipeline: embed query → search → rank → return
│   ├── prompts.py               # System prompts per intent (consulting, technical, etc.)
│   ├── streaming.py             # SSE response formatting + UI directive injection
│   └── tools.py                 # Tool executor: GitHub API, project stats, etc.
│
├── db/
│   ├── database.py              # Async Postgres connection pool (asyncpg)
│   ├── models.py                # SQL table definitions (documents, chunks, sessions)
│   └── migrations/
│       └── 001_initial.sql      # CREATE TABLE documents, chunks (pgvector), sessions
│
├── ingestion/
│   ├── ingest.py                # Main ingestion script: markdown → chunks → embeddings → DB
│   ├── chunker.py               # Semantic chunking by section headers
│   ├── embedder.py              # Generate embeddings via nomic-embed-text
│   └── parser.py                # Parse markdown frontmatter + body
│
└── tests/
    ├── test_rag.py              # RAG retrieval accuracy tests
    ├── test_chat.py             # Chat endpoint integration tests
    └── test_ingestion.py        # Ingestion pipeline tests
```

### 4.2 New Files — Frontend

```
src/
├── context/
│   └── AgentProvider.tsx         # NEW — React context: session state, intent, conversation
│
├── hooks/
│   ├── useAgent.ts               # NEW — Hook into AgentProvider
│   ├── useConversation.ts        # NEW — Send messages, receive SSE stream
│   ├── useScrollEngagement.ts    # NEW — Track scroll position, dwell time, sections in view
│   └── useSessionMemory.ts       # NEW — localStorage read/write for cross-visit memory
│
├── components/
│   ├── Nav.tsx                   # MOD — Add agent status indicator, possibly "Talk to Reader" CTA
│   ├── Footer.tsx                # NO CHANGE
│   ├── ThemeToggle.tsx           # NO CHANGE
│   ├── agent/
│   │   ├── IntentSelector.tsx    # NEW — 4-card entrance experience
│   │   ├── ConversationThread.tsx # NEW — Side panel chat with SSE streaming
│   │   ├── ConversationTrigger.tsx # NEW — Floating button to open/close conversation
│   │   ├── GuideAnnotation.tsx   # NEW — Contextual annotation component
│   │   ├── ProactiveSuggestion.tsx # NEW — Bottom-right suggestion toast
│   │   ├── TransitionPrompt.tsx  # NEW — End-of-section "what's next" prompts
│   │   ├── VoicePlayer.tsx       # NEW — Audio playback with waveform
│   │   ├── MessageBubble.tsx     # NEW — Single message with rich content rendering
│   │   ├── StreamingText.tsx     # NEW — Incremental text rendering for SSE
│   │   └── DynamicLayout.tsx     # NEW — Framer Motion layout wrapper for content reordering
│   └── projects/
│       ├── ProjectShowcase.tsx   # NEW — Rich per-project experience component
│       ├── GitHubStats.tsx       # NEW — Live GitHub activity display
│       └── ArchitectureDiagram.tsx # NEW — Interactive/annotatable diagrams
│
├── lib/
│   ├── agent-client.ts           # NEW — Fetch wrapper for agent API (SSE handling)
│   └── session.ts                # NEW — localStorage session helpers
│
├── app/
│   ├── layout.tsx                # MOD — Wrap in AgentProvider, add ConversationTrigger
│   ├── page.tsx                  # MOD — Add IntentSelector, DynamicLayout, guide annotations
│   ├── work/page.tsx             # MOD — Add project showcases, agent walkthrough triggers
│   ├── about/page.tsx            # MOD — Add guide annotations for consulting path
│   ├── blog/page.tsx             # MOD — Minor: agent can suggest relevant posts
│   ├── lab/page.tsx              # MOD — Fix external URL issue, add experiments
│   └── api/
│       └── agent/
│           ├── chat/route.ts     # NEW — Proxy to Daedalus /api/chat (SSE passthrough)
│           ├── init/route.ts     # NEW — Proxy to Daedalus /api/init
│           ├── voice/route.ts    # NEW — Proxy to Daedalus /api/voice
│           ├── health/route.ts   # NEW — Proxy to Daedalus /health
│           └── stats/route.ts    # NEW — Proxy to Daedalus /api/stats
```

### 4.3 Modified Files Summary

| File | Change |
|------|--------|
| `package.json` | Add: framer-motion, react-markdown, remark-gfm, rehype-highlight |
| `tailwind.config.js` | Add: glassmorphism utilities, guide-layer z-index, new animation keyframes |
| `next.config.js` | Add: agent API proxy rewrites or env var for backend URL |
| `src/app/layout.tsx` | Wrap in AgentProvider, add ConversationTrigger + GuideLayer to layout |
| `src/app/page.tsx` | Major rewrite: IntentSelector + DynamicLayout + annotations |
| `src/app/work/page.tsx` | Add ProjectShowcase components, agent walkthrough buttons |
| `src/app/about/page.tsx` | Add guide annotations (consulting-focused) |
| `src/components/Nav.tsx` | Optional: agent status dot, "Talk to Reader" link |
| `Dockerfile` | May need multi-stage adjustment if new deps are heavy |

### 4.4 Configuration Files

```
# Frontend .env additions:
NEXT_PUBLIC_AGENT_ENABLED=true
AGENT_BACKEND_URL=http://daedalus:8100   # Internal Tailscale URL
NEXT_PUBLIC_ELEVENLABS_ENABLED=true

# Agent backend .env:
VLLM_BASE_URL=http://localhost:8000/v1
DATABASE_URL=postgresql://reader:password@localhost:5432/jamesreader_agent
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_URL=http://localhost:11434     # If using Ollama on Daedalus
ELEVENLABS_API_KEY=sk_xxxxx
ELEVENLABS_VOICE_ID=ENSTXH7dr6VPsFwk0P9r
GITHUB_TOKEN=ghp_xxxxx                   # For stats API (higher rate limit)
CORS_ORIGINS=https://jamesreader.dev
RATE_LIMIT_RPM=20
RATE_LIMIT_RPH=100
```

---

## 5. Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Daedalus unreachable from Coolify** | Agent completely broken | Next.js API routes return graceful fallback. Site works as static portfolio. Progressive enhancement — never hard-depend on agent. |
| **Qwen3.5-122B response quality** | Agent gives bad/hallucinated answers about James | Extensive system prompt engineering + RAG grounds responses in real content. Confidence scoring — agent says "I don't know" rather than fabricate. Test with real questions before launch. |
| **vLLM latency under load** | Slow first-token time (>3s) | SSE streaming masks latency. Pre-generate welcome messages. Consider vLLM `--max-num-seqs` tuning. Qwen 122B MoE should be faster than dense 122B. |
| **Prompt injection** | Visitor tricks agent into leaking system prompt or saying inappropriate things | System prompt hardening. Input sanitization. Output filtering. Test with adversarial prompts. Agent personality guardrails in system prompt. |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **SSE through Coolify proxy** | Streaming broken by reverse proxy buffering | Test early. Coolify (Traefik) may need `X-Accel-Buffering: no` header. Next.js API routes support streaming natively. |
| **Content reordering feels janky** | Poor UX, motion sickness | Framer Motion `layout` prop handles this well. Subtle, not dramatic. Reduce motion media query support. Test on real devices. |
| **ElevenLabs voice latency** | Voice feels disconnected from conversation | Pre-render common intros. Use streaming TTS endpoint for conversational voice. Segment long responses. |
| **Knowledge base gaps** | Agent can't answer reasonable questions | Content preparation checklist in SPEC is thorough. Ingest all existing markdown. Identify gaps during testing and write additional content. |
| **localStorage session corruption** | Return visit detection breaks | Version the session schema. Try/catch all localStorage ops. Graceful fallback to fresh session. |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Mobile performance** | Heavy animations lag on low-end phones | Lazy-load agent components. Reduce animations on mobile. `prefers-reduced-motion` support. |
| **TinaCMS conflict** | New components interfere with CMS | TinaCMS only touches blog content. Agent system is completely separate. No conflict expected. |
| **pgvector scaling** | Slow queries with many chunks | We'll have <1000 chunks. pgvector handles millions. HNSW index for fast ANN. Non-issue. |
| **Next.js 14 → 15 pressure** | Peer dep conflicts with new packages | Pin versions. framer-motion and react-markdown work fine on Next 14. Upgrade later if needed. |

### Dependency Risks

| Dependency | Risk | Fallback |
|------------|------|----------|
| Daedalus uptime | Single point of failure for AI | Static site still works. Consider health-check polling + "Reader is offline" indicator. |
| vLLM process | Can crash, OOM, hang | systemd watchdog + auto-restart. Health check endpoint. |
| ElevenLabs API | Rate limits, outage, cost | Voice is enhancement, not critical path. Disable gracefully. Pre-rendered audio cached locally. |
| GitHub API | Rate limits (60/hr unauthenticated) | Use PAT for 5000/hr. Cache aggressively (daily refresh). |
| Tailscale connectivity | Coolify ↔ Daedalus link drops | Monitor with health checks. Fallback indicator in UI. Consider Cloudflare Tunnel as backup. |

---

## 6. Open Implementation Questions

These need decisions before/during build:

1. **Agent backend: monorepo or separate repo?**
   - Recommendation: **Subdirectory** (`/agent`) in the same repo. Simpler deployment coordination. Daedalus pulls just that directory.

2. **PostgreSQL on Daedalus: Docker or native?**
   - Recommendation: **Docker** (`postgres:16` with pgvector image). Isolated, easy backup, doesn't pollute DGX OS.

3. **Embedding model deployment on Daedalus:**
   - Option A: Install Ollama on Daedalus ARM (nomic-embed-text)
   - Option B: Use a Python embedding library directly (sentence-transformers)
   - Option C: Hit futureisnow's Ollama over Tailscale
   - Recommendation: **Option A** if Ollama ARM works cleanly. **Option B** as fallback. Avoid Option C (network dependency defeats the point).

4. **FastAPI port on Daedalus:**
   - Recommendation: **8100** (avoids conflict with vLLM on 8000, Open WebUI on 8080).

5. **Agent conversation memory: in-memory dict vs Redis vs Postgres?**
   - Recommendation: **In-memory dict with TTL** for Phase 1 (simple, fast). Migrate to Redis if memory pressure becomes an issue. Conversations are ephemeral — we don't need durable storage.

6. **Content update pipeline:**
   - Phase 1: Manual re-run of ingestion script after content changes
   - Phase 2: Git webhook triggers re-ingestion
   - Phase 3: TinaCMS webhook for blog posts

---

## 7. Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Infrastructure | 1-2 days | Day 2 |
| Phase 1: Knowledge Base & RAG | 2-3 days | Day 5 |
| Phase 2: Agent Core | 3 days | Day 8 |
| Phase 3: Frontend Agent Foundation | 3 days | Day 11 |
| Phase 4: Intent Selector & Dynamic Layout | 2-3 days | Day 14 |
| Phase 5: Guide Layer | 3 days | Day 17 |
| Phase 6: Voice Integration | 2 days | Day 19 |
| Phase 7: Interactive Showcases | 3 days | Day 22 |
| Phase 8: Polish & Production | 3-4 days | Day 25 |

**Realistic total: 3.5-4 weeks** for a solo builder with AI assistance.

**MVP milestone (Phases 0-3): ~11 days** — Working conversation with RAG, streaming responses, basic UI. This is the "show it to someone" checkpoint.

---

## 8. Environment & Deployment Notes

### Daedalus Setup Checklist
```bash
# PostgreSQL + pgvector (Docker)
docker run -d --name reader-db \
  -e POSTGRES_USER=reader \
  -e POSTGRES_PASSWORD=<secure> \
  -e POSTGRES_DB=jamesreader_agent \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# Embedding model (if using Ollama)
# Ollama may already be installed — check
ollama pull nomic-embed-text

# FastAPI service
cd /root/projects/Jamesreader.dev/agent
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8100

# Systemd service for persistence
# /etc/systemd/system/reader-agent.service
```

### Coolify Deployment
- Existing Docker build works
- Add `AGENT_BACKEND_URL` env var pointing to `http://daedalus:8100`
- SSE proxy: ensure Traefik doesn't buffer (may need custom header middleware)

---

*This plan is ready for execution. Phase 0 can start immediately.*
