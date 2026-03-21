# JamesReader.dev — Agentic Portfolio Experience

> **Status:** SPEC DRAFT — Brainstorming & Design Phase
> **Owner:** James Reader
> **AI Backend:** Daedalus (DGX Spark) — Qwen3.5-122B via vLLM
> **Frontend:** Next.js 14 + Tailwind (existing site, evolving)
> **Hosting:** Coolify on forge (frontend) + Daedalus (AI backend)
> **Goal:** Transform a static portfolio into a guided, AI-driven discovery experience that IS the product demo

---

## 1. Vision & Philosophy

### What This Is NOT
- A portfolio website with a chatbot bolted on
- A static resume site with an "Ask AI" button
- A generic RAG Q&A interface
- Another ChatGPT wrapper

### What This IS
An **intelligent, guided experience** where a visitor doesn't browse — they're *led*. The AI agent is woven into the fabric of the site itself. It's the docent at a museum, the sommelier at a restaurant, the concierge at a hotel. It knows everything about James, reads the visitor's intent, and reshapes the experience in real-time.

**The medium IS the message.** The site itself is the most compelling evidence of James's AI capabilities. Every interaction demonstrates what he can build for clients.

### Core Principles
1. **The agent is the site, the site is the agent.** Not separate experiences — one unified thing.
2. **Intent-driven, not nav-driven.** Visitors don't click through menus — the experience adapts to them.
3. **Show, don't tell.** Instead of saying "I build AI tools," the visitor is USING one right now.
4. **Respect attention.** Be impressive without being annoying. The agent enhances, never interrupts.
5. **Every visit is unique.** Two visitors with different intents see fundamentally different experiences.
6. **Cost-efficient.** Powered by Daedalus (self-hosted), not API bills. This scales to thousands of visitors for pennies.

---

## 2. The Visitor Journey

### 2.1 The Entrance — First Contact

When a visitor lands on the site, they don't see a traditional hero section. They see a **moment of engagement**.

**Visual:** Clean, editorial design (existing Playfair Display + Inter aesthetic). The page is elegant but alive — subtle animations suggest intelligence behind the surface.

**The Opening Move:** The agent introduces itself with a brief, warm greeting and presents 3-4 intent options. NOT a text input. NOT a chatbot. These are beautifully designed, interactive cards or buttons that feel like part of the page design:

- 🏗️ **"I need someone to build something"** → Consulting/hiring path
- 🔍 **"I'm researching AI solutions"** → Technical deep-dive path  
- 👤 **"I want to learn about James"** → Personal/professional story path
- 🧭 **"Just exploring"** → Curiosity-driven free exploration

**Important:** There should ALSO be a way to skip this and browse traditionally (accessible nav). The agent experience is the primary path, but never the only path. Accessibility and user autonomy matter.

**Technical:** Intent selection triggers a state change that determines content prioritization, agent personality tuning, and UI layout for the session.

### 2.2 The Transformation — Dynamic Content Surfacing

After intent selection, the page **transforms** (animated transition, not a page reload). Content sections reorder, emphasize, and de-emphasize based on the visitor's declared intent.

**For "I need someone to build something" (Consulting Path):**
1. Capability overview with concrete outcomes (not buzzwords)
2. Case studies: SMIS AI Tool, Meridian Money, Edgewood municipal AI
3. Engagement models and process
4. Technical stack & infrastructure (credibility signals)
5. Contact/scheduling CTA

**For "I'm researching AI solutions" (Technical Path):**
1. Architecture deep dives
2. Live demos (embedded SMIS search, Meridian preview)
3. Infrastructure showcase (Daedalus, k3s cluster, the stack)
4. Blog posts and technical writing
5. GitHub activity / open source contributions

**For "I want to learn about James" (Personal Path):**
1. Professional narrative (not a resume — a story)
2. Philosophy and approach
3. The journey from IT Director to AI builder
4. Side projects and interests
5. What drives him

**For "Just exploring" (Free Exploration):**
1. A curated "greatest hits" layout
2. The agent offers gentle suggestions as the visitor scrolls
3. Maximum freedom, minimum structure

### 2.3 The Guide Layer — Persistent AI Presence

The agent doesn't live in a chat bubble. It's **woven into the page**. Think of it as a layer that exists between the content and the visitor.

**Manifestations:**

#### Contextual Annotations
As the visitor scrolls through content, the agent can surface contextual notes — short, relevant insights that appear alongside content blocks. Examples:
- Next to the SMIS project card: *"This started as a $5K engagement and is growing into a full AI platform. Want to hear how?"*
- Next to a technical architecture diagram: *"This runs on the same hardware powering the AI you're talking to right now."*

These are NOT tooltips. They're intelligent, contextual, and different for every visitor based on their intent path.

#### Proactive Suggestions
The agent monitors scroll behavior and engagement signals to offer next steps:
- *"You've been reading about the municipal AI work for a while. Want me to walk you through the architecture?"*
- *"Based on what you're looking at, the SMIS case study might be exactly what you need."*

These appear as subtle, dismissible UI elements — not popups, not modals. Think of a gentle slide-in from the edge.

#### Transition Narration
Instead of (or in addition to) a traditional nav bar, the agent provides narrative transitions:
- *"Now that you've seen what I build, want to see how I build it?"*
- *"Ready to go deeper on any of these, or shall I show you something else?"*

#### The Conversation Thread
At any point, the visitor can "open" a deeper conversation. This isn't a separate chat page — it's an **expansion** of the current context. The page content shifts to make room for a conversational interface that references and renders content inline.

The conversation thread has access to:
- All site content (projects, blog posts, resume data)
- Live data (GitHub stats, project status)
- Technical details (architecture, stack decisions)
- James's consulting availability and engagement models

### 2.4 Interactive Project Showcases

Each project isn't a card with a description. It's a **mini-experience**.

**Structure per project:**
1. **Hero moment** — One compelling visual/stat/headline
2. **The Story** — How it started, what problem it solves, where it's going
3. **The Architecture** — Interactive diagram (not a static image) that the agent can annotate
4. **Live Demo** — Where possible, embedded functionality:
   - SMIS: Live SAM.gov search demo
   - Meridian: Interactive budget demo
   - This site itself: "You're using it right now"
5. **The Numbers** — Live stats pulled from APIs (commits, users, uptime)
6. **Agent Walkthrough** — The agent can narrate through the project as if giving a demo to a client

### 2.5 Session Memory

With visitor consent (cookie/localStorage), the agent remembers across sessions:
- What they've seen
- What they were interested in
- Where they left off
- Their declared intent

**Return visit:** *"Welcome back. Last time you were digging into the RAG architecture. Want to pick up there, or explore something new?"*

This is stored client-side (localStorage) or with a lightweight server-side session. No PII collection — just intent and engagement state.

---

## 3. The Dataset — James as Knowledge Base

### 3.1 Content Sources

Everything the agent knows comes from curated, structured data:

#### Professional Identity
- Full resume/CV (multiple versions optimized for different audiences)
- Professional narrative / bio (conversational, not corporate)
- Skills inventory with proficiency levels and context
- Certifications: CISSP, etc.
- Work history with rich context (not just titles and dates)

#### Projects (Deep Documentation)
Each project needs a structured knowledge document:

**Meridian Money:**
- Problem statement, market positioning (YNAB alternative)
- Technical stack (Next.js, Prisma, PostgreSQL, Stripe bank sync)
- Architecture decisions and trade-offs
- Current status, user metrics, roadmap
- Business model ($5/mo, credit counseling B2B angle)
- Differentiators (privacy, AI coach vision, velocity banking)

**SMIS AI Tool:**
- Client context (forestry/construction, SAM.gov procurement)
- Technical implementation (structured outputs, prompt caching, embedding pipeline)
- Business impact and ROI for client
- AI enhancement roadmap (5 phases)
- Lessons learned

**Edgewood Municipal AI:**
- Multimodal RAG initiative
- DMS digitization project
- Police AI tool concept
- Government IT challenges and how AI addresses them

**JamesReader.dev (This Site):**
- Meta-documentation: the site documents itself
- Architecture of the agentic experience
- How Daedalus powers it
- Cost analysis vs. API-based alternatives

**Infrastructure / Homelab:**
- Daedalus (DGX Spark) — specs, what it runs, why it matters
- k3s cluster, search stack, automation
- The philosophy: own your infrastructure, own your AI

#### Blog Posts & Writing
- All existing Tina CMS / Sanity blog content
- Technical write-ups
- The "instrumentalization" essay (IT frustration → AI opportunity)
- Future posts as they're published

#### Philosophy & Approach
- Security-first development philosophy
- Government IT perspective on AI adoption
- ADHD as a systems design constraint (turned advantage)
- "Done beats perfect" shipping mentality
- Self-hosted AI conviction (privacy, cost, control)

### 3.2 Data Preparation

Each content source needs to be:
1. **Chunked** appropriately (semantic chunking, not naive splitting)
2. **Embedded** (nomic-embed-text or better)
3. **Metadata-tagged** (source, category, project, audience-relevance, freshness)
4. **Stored** in pgvector with rich metadata for filtered retrieval

**Chunk strategy:**
- Project overviews: 1 chunk per section (~500 tokens)
- Technical deep dives: smaller chunks (~300 tokens) for precision
- Blog posts: per-paragraph with post-level metadata
- Resume: per-role with skills cross-referenced
- Philosophy/narrative: larger chunks (~800 tokens) to preserve voice

### 3.3 Knowledge Refresh

Content pipeline for keeping the knowledge base current:
- **Tina CMS webhook** → Re-index on blog post publish
- **GitHub webhook** → Update project stats and activity
- **Manual refresh** → For resume updates, new projects
- **Scheduled** → Daily GitHub stats refresh, project status checks

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────┐
│                   VISITOR                         │
│              (Browser / Mobile)                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           NEXT.JS FRONTEND (Coolify/Forge)        │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Dynamic Page │  │ Agent UI     │  │ Project │ │
│  │ Renderer     │  │ Components   │  │ Demos   │ │
│  └──────┬──────┘  └──────┬───────┘  └────┬────┘ │
│         │                │               │       │
│         └────────────────┼───────────────┘       │
│                          │                        │
│                    API Routes                      │
│              /api/agent/*                          │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS (Tailscale Funnel or
                   │ Cloudflare Tunnel to Daedalus)
                   ▼
┌─────────────────────────────────────────────────┐
│           AGENT BACKEND (Daedalus)                │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │         Agent Orchestrator                │    │
│  │     (FastAPI or Next.js API routes)       │    │
│  │                                           │    │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │    │
│  │  │ Intent  │  │ Content  │  │ Tool    │ │    │
│  │  │ Router  │  │ Curator  │  │ Executor│ │    │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘ │    │
│  └───────┼────────────┼─────────────┼───────┘    │
│          │            │             │             │
│          ▼            ▼             ▼             │
│  ┌────────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Qwen3.5    │ │ pgvector │ │ External     │   │
│  │ 122B vLLM  │ │ (RAG)    │ │ APIs         │   │
│  │ Port 8000  │ │          │ │ (GitHub etc) │   │
│  └────────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────┘
```

### 4.2 Frontend Architecture

**Framework:** Next.js 14 (existing) with App Router

**Key Components:**

#### AgentProvider (React Context)
- Manages agent session state across the app
- Tracks: visitor intent, conversation history, content preferences, scroll engagement
- Provides hooks: `useAgent()`, `useIntent()`, `useGuide()`

#### DynamicLayout
- Receives content prioritization from the agent
- Animates layout transitions when intent changes or agent suggests new content
- Responsive: works on desktop (full experience) and mobile (adapted experience)

#### GuideLayer
- Renders contextual annotations alongside content
- Manages proactive suggestion UI (slide-ins)
- Handles transition narration between sections

#### ConversationThread
- Expandable inline conversation interface
- Renders rich content (images, diagrams, code blocks, embedded demos) within the conversation
- Streams responses (SSE from agent backend)

#### ProjectShowcase
- Per-project interactive component
- Supports embedded demos, live stats, agent-narrated walkthroughs
- Lazy-loads heavy content (demos, diagrams)

#### IntentSelector
- The entrance experience
- Beautiful, animated cards for intent selection
- Fallback: traditional nav for skip/accessibility

### 4.3 Agent Backend

**Option A: FastAPI on Daedalus (Recommended)**
- Python service running on Daedalus alongside vLLM
- Direct localhost access to vLLM (no network hop for inference)
- pgvector in PostgreSQL on Daedalus
- FastAPI handles: intent routing, RAG retrieval, response streaming, tool execution

**Option B: Next.js API Routes on Coolify**
- Agent logic in TypeScript alongside the frontend
- Calls vLLM over Tailscale/tunnel
- Adds network latency for every inference call
- Simpler deployment (one codebase) but worse performance

**Recommendation:** Option A. Keep inference close to the model. The frontend calls the Daedalus agent API, which has local access to both the LLM and the vector store.

### 4.4 Agent Orchestration

The agent isn't a single prompt → response. It's an **orchestrated system**:

#### Intent Router
- Takes visitor's declared intent + behavioral signals
- Determines content prioritization strategy
- Selects appropriate system prompt variant
- Adjusts response style (consultative vs. technical vs. narrative)

#### Content Curator
- Queries pgvector with intent-weighted retrieval
- Applies metadata filters (project, audience, freshness)
- Ranks and selects content chunks for context window
- Manages what the visitor has already seen (avoid repetition)

#### Response Generator
- Qwen3.5-122B with intent-specific system prompts
- Streaming responses via SSE
- Structured output for UI directives (show project X, highlight section Y, suggest navigation Z)
- Natural language for conversational responses

#### Tool Executor
- GitHub API: live repo stats, recent commits, contribution graphs
- Project status checks: uptime, user counts (where available)
- Content search: deep search across all knowledge base content
- Calendar/availability: consulting availability check (optional, phase 2)

### 4.5 RAG Pipeline

#### Embedding Model
- **nomic-embed-text** (already on futureisnow via Ollama)
- OR run embedding model directly on Daedalus for self-contained pipeline
- 768-dim embeddings, good quality for the cost

#### Vector Store
- **PostgreSQL + pgvector** on Daedalus
- Tables:
  - `documents` (id, source, title, category, project, audience_tags, created_at, updated_at)
  - `chunks` (id, document_id, content, embedding vector(768), chunk_index, metadata jsonb)
- Indexes: IVFFlat or HNSW on embedding column

#### Retrieval Strategy
- **Hybrid search:** vector similarity + keyword matching (pg_trgm)
- **Intent-weighted:** boost scores for chunks matching visitor intent
- **Diversity:** ensure results span multiple sources, not just one document
- **Recency bias:** slight boost for newer content
- **Already-seen filter:** reduce score for content the visitor has already engaged with

#### Chunking Pipeline
```
Source Document
    → Markdown parsing
    → Semantic chunking (by section/paragraph)
    → Metadata extraction (project, category, audience)
    → Embedding generation
    → pgvector insert
```

### 4.6 Connectivity: Coolify ↔ Daedalus

The frontend (Coolify/forge) needs to reach the agent backend (Daedalus). Options:

1. **Tailscale Funnel** — Expose Daedalus agent API port via Tailscale funnel. Simple, secure, already have Tailscale on both machines.
2. **Cloudflare Tunnel** — If Tailscale funnel has latency issues. Zero-trust tunnel from Daedalus to Cloudflare edge.
3. **Direct Tailscale** — If frontend is also on Tailscale network. Lowest latency but requires both machines on tailnet.

**Recommended:** Tailscale direct (both machines are already on the tailnet). Frontend API routes proxy to `http://daedalus:<agent-port>/api/*`.

---

## 5. Voice Configuration

### ElevenLabs Voice Clone
- **Clone ID:** `ENSTXH7dr6VPsFwk0P9r` (James's actual voice)
- **Model:** `eleven_multilingual_v2`

### Tuned Settings (from testing session 2026-03-21)
- **Body/narrative text:** stability 0.6, similarity_boost 0.78, no style param
- **Questions/closing lines:** stability 0.65, similarity_boost 0.8, style 0.15
- **Speed:** Needs slight tuning on questions — try `speed: 1.05-1.1` for closing questions to avoid dragging
- For longer responses, consider segment-and-stitch approach: generate body and closing with different settings, concatenate with ~0.4s pause

### Implementation Notes
- API: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- For real-time voice mode: use ElevenLabs streaming endpoint for low latency
- For pre-rendered audio (welcome message, project intros): can pre-generate and cache
- The voice IS James — this is a major differentiator. Visitors hear the actual person, not a stock voice.

---

## 6. The Agent's Personality

### System Prompt Framework

The agent represents James but is NOT James. It's a knowledgeable guide who knows James's work intimately.

**Base personality:**
- Professional but warm
- Technically credible — can go deep when asked
- Conversational, not corporate
- Confident without being arrogant
- Occasionally witty (reflects James's style)
- Direct — doesn't waste the visitor's time

**Intent-specific tuning:**

| Intent | Tone | Focus | Depth |
|--------|------|-------|-------|
| Consulting | Consultative, outcome-focused | Business value, ROI, capabilities | Medium, goes deep on request |
| Technical | Peer-to-peer, precise | Architecture, implementation, trade-offs | High, assumes technical audience |
| Personal | Narrative, engaging | Story, philosophy, journey | Medium, human-focused |
| Exploring | Friendly, suggestive | Breadth, highlights, hooks | Light, broadens then deepens |

### Guardrails
- Never makes up capabilities James doesn't have
- Doesn't share personal information beyond what's in the knowledge base
- Redirects competitor comparisons to James's strengths (doesn't trash-talk)
- Can gracefully say "I don't know that about James" rather than hallucinate
- Doesn't pretend to be James — it's an AI guide powered by James's knowledge

---

## 7. UI/UX Design Details

### 6.1 Design Language

**Existing (keep):**
- Playfair Display (serif) for headers
- Inter (sans) for body
- Turquoise accent on stone/cream/charcoal palette
- Dark/light mode toggle

**Evolving:**
- Add subtle animation language for agent interactions
- Glassmorphism or soft shadows for agent UI elements (guide annotations, suggestions)
- Smooth transitions for content reordering (Framer Motion or similar)
- The agent's "voice" in the UI should feel like a distinct but integrated layer — perhaps a slightly different background opacity or a thin accent border

### 7.2 Animation Language

**Core principle:** Smooth, elegant, never gaudy. Apple keynote energy, not Times Square.

**Enter transitions:**
- Fade from transparent to opaque
- Zoom from ~90% to 100% scale
- Duration: 300-500ms, ease-out curve

**Exit transitions:**
- Fade to transparent
- Shrink to ~90% scale
- Duration: 200-400ms, ease-in curve

**Section transitions (intent-driven reflow):**
- Smooth reorder with Framer Motion's `layout` animation
- Elements slide to new positions rather than jump
- Stagger children for cascading effect (50-80ms per item)

**The Guide Layer:**
- Annotations slide in from the edge (right on desktop, bottom on mobile)
- Proactive suggestions: subtle rise + fade in from bottom
- All dismissible with fade + shrink out

**Never:**
- Bouncing, shaking, or pulsing animations
- Neon/glow effects
- Anything that feels like a notification begging for attention
- Simultaneous competing animations

### 7.3 Agent UI Elements

#### Intent Selector (Entrance)
- Full-viewport experience on first visit
- 3-4 large, interactive cards with icons and brief descriptions
- Subtle animation on hover/tap
- "Or just browse" link below for traditional nav
- On mobile: stacked cards, tap to select

#### Contextual Annotations
- Appear to the right of content on desktop, below on mobile
- Slide in with a subtle animation
- Dismissible (X button, or swipe on mobile)
- Accent-colored left border to distinguish from regular content
- Max 2 visible at a time to avoid clutter

#### Proactive Suggestions
- Slide in from the bottom-right on desktop
- Toast-like on mobile
- Auto-dismiss after 10 seconds if not engaged
- Max 1 at a time
- Triggered by scroll depth + dwell time + content relevance

#### Conversation Thread
- Expands from a minimal floating trigger (not a chat bubble — something more elegant)
- When open: takes 40% of viewport width on desktop (side panel), full viewport on mobile
- Content area shifts/resizes to accommodate
- Messages render rich content: markdown, code blocks, images, embedded components
- Streaming indicator during response generation
- Close to return to browse mode (conversation persists in state)

#### Transition Prompts
- Appear at the end of content sections
- Styled as part of the content flow, not as UI chrome
- "What would you like to explore next?" with 2-3 contextual options
- Alternative to scrolling past into the next section

### 7.4 Responsive Behavior

**Desktop (>1024px):**
- Full guide layer with annotations, side-panel conversation
- Rich project demos and interactive diagrams
- Multi-column content reflow

**Tablet (768-1024px):**
- Reduced annotations (fewer, larger)
- Conversation thread as overlay
- Single-column content

**Mobile (<768px):**
- Agent primarily through conversation thread (full-screen when open)
- Simplified annotations (bottom sheet or expandable)
- Intent selector as full-screen stacked cards
- Proactive suggestions as toasts

---

## 8. Data Schema

### 7.1 Visitor Session
```typescript
interface VisitorSession {
  id: string;                    // UUID
  intent: 'consulting' | 'technical' | 'personal' | 'exploring';
  conversationHistory: Message[];
  contentSeen: string[];         // chunk/section IDs
  currentSection: string;
  scrollDepth: number;
  createdAt: Date;
  lastActiveAt: Date;
  isReturning: boolean;
  previousIntents?: string[];    // from localStorage
}
```

### 7.2 Agent Response
```typescript
interface AgentResponse {
  // The conversational text response
  message: string;
  
  // UI directives for the frontend
  directives?: {
    highlightSection?: string;     // Scroll to / emphasize a section
    showProject?: string;          // Open a project showcase
    suggestNavigation?: {          // Offer navigation options
      options: Array<{
        label: string;
        target: string;
        reason: string;
      }>;
    };
    showAnnotation?: {             // Display a contextual annotation
      content: string;
      nearElement: string;         // CSS selector or section ID
    };
    updateLayout?: {               // Reorder content sections
      priority: string[];          // Section IDs in priority order
    };
  };
  
  // Rich content to render inline
  richContent?: {
    images?: string[];
    codeBlocks?: Array<{ language: string; code: string }>;
    diagrams?: string[];           // Mermaid or similar
    embeds?: Array<{ type: string; url: string }>;
    stats?: Array<{ label: string; value: string; source: string }>;
  };
  
  // Metadata
  sources: string[];               // Which knowledge base chunks were used
  confidence: number;              // 0-1, for potential "I'm not sure about that" responses
}
```

### 7.3 Knowledge Base Document
```typescript
interface KnowledgeDocument {
  id: string;
  source: 'resume' | 'project' | 'blog' | 'philosophy' | 'technical';
  title: string;
  project?: string;               // Which project this relates to
  audienceTags: string[];          // ['consulting', 'technical', 'personal']
  content: string;                 // Full text
  chunks: KnowledgeChunk[];
  createdAt: Date;
  updatedAt: Date;
}

interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];            // 768-dim vector
  chunkIndex: number;
  metadata: {
    section?: string;
    keywords?: string[];
    audienceRelevance: Record<string, number>;  // intent → relevance score
  };
}
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up agent backend on Daedalus (FastAPI + pgvector)
- [ ] Build knowledge base: curate and chunk all content about James
- [ ] Implement basic RAG pipeline (embed → store → retrieve → generate)
- [ ] Create API endpoint: `/api/agent/chat` (streaming SSE)
- [ ] Basic intent detection from first message
- [ ] Test end-to-end: question in → intelligent answer out

### Phase 2: Frontend Integration (Week 2-3)
- [ ] Build AgentProvider context and hooks
- [ ] Implement IntentSelector entrance experience
- [ ] Build ConversationThread component (side panel)
- [ ] Wire up streaming responses from agent backend
- [ ] Basic content reordering based on intent
- [ ] Mobile responsive layout

### Phase 3: The Guide Layer (Week 3-4)
- [ ] Implement contextual annotations system
- [ ] Build proactive suggestion engine (scroll + dwell tracking)
- [ ] Transition narration between sections
- [ ] Agent-narrated project walkthroughs
- [ ] Rich content rendering in conversation (code, diagrams, stats)

### Phase 4: Interactive Showcases (Week 4-5)
- [ ] SMIS live demo embed
- [ ] Meridian interactive preview
- [ ] GitHub live stats integration
- [ ] Architecture diagram interactivity
- [ ] "This site" meta-showcase

### Phase 5: Polish & Intelligence (Week 5-6)
- [ ] Session memory (localStorage + return visit detection)
- [ ] Response quality tuning (prompt engineering, retrieval optimization)
- [ ] Animation and transition polish
- [ ] Performance optimization (lazy loading, caching, edge CDN)
- [ ] Analytics: what are visitors asking? What content converts?
- [ ] A/B: traditional nav vs. agent-guided (measure engagement)

### Phase 6: Advanced Features (Future)
- [ ] Voice interaction (Deepgram STT + ElevenLabs TTS, like Meridian voice coach)
- [ ] Calendar integration for consulting scheduling
- [ ] Multi-language support (Qwen handles this well)
- [ ] Visitor analytics dashboard for James
- [ ] Auto-updating knowledge base from new blog posts / GitHub activity

---

## 10. Content Preparation Checklist

Before the agent can be intelligent, it needs data. Each item needs to be written/curated:

### Must Have (Phase 1)
- [ ] Professional bio (conversational, 500-800 words)
- [ ] Full resume with rich context per role
- [ ] Skills inventory with proficiency context
- [ ] Meridian Money project deep-dive (1500+ words)
- [ ] SMIS AI Tool project deep-dive (1500+ words)
- [ ] Edgewood AI initiatives overview (1000+ words)
- [ ] Consulting capabilities & engagement models
- [ ] Technical philosophy / approach document
- [ ] Infrastructure overview (Daedalus, homelab, stack)

### Should Have (Phase 2-3)
- [ ] Blog posts (already exist in Tina CMS — need indexing)
- [ ] "The IT Instrumentalization Problem" essay
- [ ] Case studies with measurable outcomes
- [ ] Homelab / infrastructure journey narrative
- [ ] FAQ: common consulting questions pre-answered
- [ ] JamesReader.dev self-documentation (meta)

### Nice to Have (Phase 4+)
- [ ] Video/demo transcripts
- [ ] Conference talk content (if any)
- [ ] Technical tutorials / how-to content
- [ ] Industry analysis pieces

---

## 11. Success Metrics

How do we know this is working?

- **Engagement:** Average session duration (target: 3x a static portfolio)
- **Depth:** Pages/sections viewed per session
- **Conversation:** % of visitors who engage the agent beyond intent selection
- **Conversion:** Consulting inquiries generated
- **Retention:** Return visitor rate
- **Technical:** Response latency < 2s for first token, full response < 10s
- **Wow factor:** "How did you build this?" as a literal response from visitors

---

## 12. Open Questions

- [x] **Agent name/identity:** "Reader" — James's last name recontextualized. It reads the knowledge base, visitors read about James through it. Triple meaning on JamesReader.dev.
- [x] **Design approach:** Evolve existing design language, don't restart.
- [x] **Analytics:** Yes — track anonymized conversation data (questions asked, topics explored). No PII, no IP logging. Use to identify knowledge base gaps.
- [x] **Lead capture:** Yes — agent can offer "Want me to have James reach out?" with simple name + email capture in conversation flow. No forms.
- [x] **Voice:** Phase 1. James's voice clone.
- [x] **Graceful degradation:** Yes — site always works without agent. Traditional nav, static content. Agent is the enhanced experience, not the only experience. Progressive enhancement.
- [x] **Rate limiting:** Token bucket per IP. ~20 requests/min, ~100/hour. Protects Daedalus from abuse.
- [x] **Conversation capture:** Same as analytics — yes, anonymized, with light privacy notice. Feeds knowledge base improvement.

---

## 13. Technical Dependencies

### On Daedalus
- Qwen3.5-122B via vLLM (already running, port 8000)
- PostgreSQL + pgvector (needs setup)
- Embedding model (nomic-embed-text or run locally)
- FastAPI agent service (needs build)
- Tailscale (already configured)

### On Coolify/Forge
- Next.js 14 frontend (existing, needs evolution)
- Tailwind CSS (existing)
- Tina CMS (existing, content source)

### External
- GitHub API (for live stats)
- Cloudflare (DNS, existing)
- Optional: Deepgram/ElevenLabs (voice, future phase)

---

*This spec is a living document. Update as design decisions are made.*
