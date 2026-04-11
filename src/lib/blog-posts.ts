export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string; // markdown-ish content with paragraphs
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'swapping-qwen-122b-for-35b-a3b',
    title: 'Why I Swapped a 122B Model for a 35B One — and Got Faster',
    excerpt: 'Counterintuitive move: trading a dense 122-billion-parameter model for a 35-billion-parameter mixture-of-experts, and having the site feel noticeably snappier afterward. Active parameters matter more than total parameters.',
    category: 'Infrastructure',
    date: 'April 2026',
    readTime: '6 min read',
    content: `When I first set this infrastructure up, I picked the biggest model that would fit in 128GB of unified memory: Qwen3.5-122B at NVFP4 quantization. My reasoning was the obvious reasoning. Bigger model means smarter answers. I'd rather be a little slower and a lot better than fast and mediocre.

That logic held up for a few weeks. Then it didn't.

## What 122B Actually Felt Like

Running a dense 122B model means every single token you stream back to the user touches all 122 billion parameters. Even with NVFP4 quantization shrinking the memory footprint to something the Spark could hold, the compute cost per token stayed proportional to the full parameter count. On this hardware that landed around 30–45 tokens per second, which sounds fine until you watch it in a chat UI. There's a visible lag between the user pressing enter and the first character landing. Short questions felt slower than they should. Long answers felt like they were being typed by someone thinking too hard.

Worse, the model had a habit of emitting a visible "Thinking Process" preamble before every substantive response — numbered lists of "Analyze the request... Draft the output... Final selection..." — which I had to filter out of the stream on its way to the client. That filter was fragile and occasionally ate the beginning of real answers.

None of this was a dealbreaker. The model was capable. But the experience didn't feel like an AI the way I wanted it to feel.

## The A3B Realization

Qwen's sparse mixture-of-experts variants started landing more seriously a few months back. The key naming convention: 35B-**A3B** means 35 billion total parameters with roughly **3 billion active per token**. The router picks a handful of experts for each token and the rest of the model stays idle. From the user's perspective, each token costs roughly what a 3B dense model costs to generate.

I'd been dismissive of this architecture earlier on the grounds that "small active count means small capability." I was wrong. The sparse-experts setup preserves most of the model's knowledge (it's still 35B worth of trained parameters), but only pays the compute cost of a tiny model at inference time.

So I pulled down **Qwen3.5-35B-A3B-AWQ** — 35B MoE, AWQ quantized, the whole thing fitting comfortably on the Spark with room to spare — and pointed vLLM at it.

The difference was immediate. Not incremental. Chat responses start streaming within a fraction of a second and flow smoothly. Subjectively it felt faster than the cloud Anthropic calls I'd been routing certain tasks through, which was a surprise. Not sharper than Opus — I'll happily admit Opus wins on genuinely hard reasoning — but for the kind of questions visitors actually ask a portfolio site, 35B-A3B is enough, and it's *fast enough to feel alive*.

## Bonus Round: LiteLLM in Front

I also stopped letting the agent code speak to vLLM directly. Instead I put a thin **LiteLLM** proxy in between, configured with the single local model as "default" and a cloud fallback ready to take over if the vLLM process ever dies. The LiteLLM config is also where I set \`enable_thinking: false\` at the chat-template layer, which means the model stops emitting the "Thinking Process" preamble at the *source* — no more client-side filter gymnastics.

That change killed a bug I hadn't realized I had: the client-side filter for "Thinking Process" patterns was also matching legitimate markdown responses that happened to start with a heading, a numbered list, or a bolded phrase. Reader had been silently dropping structured answers for weeks. Once I disabled thinking at the model level and removed the filter, Reader could finally respond with actual markdown — lists, headings, bold terms — and have them render properly.

## The Lesson

Parameter count is a vanity metric. What matters is **active parameters per token** — the compute you actually pay for when generating output. For user-facing AI where latency defines the experience, a well-trained MoE with a small active count can beat a dense model several times its size. The "bigger is better" reflex from dense-model days doesn't transfer cleanly to sparse architectures.

The other lesson is more boring and more important: **put a router in front of your model**. Even when there's only one model behind it. The day you need to swap, A/B test, fall back to a cloud provider, or reconfigure chat templates, you want that one config file as the single source of truth — not code changes across three services.

## What It Means For This Site

You are, right now, talking to a Qwen3.5-35B-A3B MoE model running on a DGX Spark in my home office, proxied through LiteLLM, served to you via vLLM, rendered in a Next.js frontend on cloud infrastructure. Total operational cost for your entire visit: roughly the cost of the electricity to generate a few hundred tokens.

The site is faster than it was yesterday, and it's running on smaller hardware than a hyperscaler would tell you is required. That's the pitch, and now I don't even have to make it — you're experiencing it.`,
  },
  {
    slug: 'running-llms-on-dgx-spark',
    title: 'Running Production LLMs on a DGX Spark',
    excerpt: 'What it actually takes to run large language models locally. Hardware choices, memory architecture, inference optimization, and why 128GB of unified memory changes the game.',
    category: 'Infrastructure',
    date: 'March 2026',
    readTime: '8 min read',
    content: `Everyone talks about running AI locally. Most of them are running a 7B model on a MacBook and calling it "production." I wanted something different — real models, real throughput, zero cloud dependency.

## The Hardware Decision

After months of running inference through API calls — Anthropic, OpenAI, the usual suspects — the math stopped making sense. At scale, you're paying per token for compute that depreciates to zero on someone else's balance sheet. I wanted to own the silicon.

The NVIDIA DGX Spark ships with a Grace CPU (ARM aarch64), 128GB of unified memory shared between CPU and GPU, and a GB10 GPU. The unified memory architecture is the killer feature. Most consumer GPUs cap at 24GB VRAM, which means you're quantizing models down to shadows of themselves or spilling to CPU RAM with massive latency penalties. With 128GB unified, you can run Qwen3.5-122B at NVFP4 quantization comfortably — a genuinely capable model, not a toy.

## vLLM Over Ollama

I started with Ollama because everyone does. It's simple, it works, and for single-user inference it's fine. But Ollama is fundamentally single-threaded — one request at a time, queued. When you're serving a portfolio site's AI agent, a consulting demo, and your own development workflow simultaneously, that's a non-starter.

vLLM solves this with continuous batching and PagedAttention. Multiple concurrent requests get batched together efficiently. The throughput difference isn't incremental — it's architectural. On the same hardware, vLLM handles parallel requests that would queue for minutes on Ollama.

The catch: Daedalus runs ARM (aarch64), and most Docker images assume x86. The vLLM nightly with CUDA 13.0 support was the only build that worked. Not \`vllm/vllm-openai:latest\`, not the Nemotron container, not a pip install with system CUDA 12 — specifically \`vllm/vllm-openai:cu130-nightly\`. I burned a full evening discovering this. Documenting it here so you don't have to.

## The Inference Stack

The production setup is straightforward once you know what actually works:

- **Model**: Qwen3.5-122B (NVFP4 quantization, ~75GB in memory)
- **Serving**: vLLM with OpenAI-compatible API on port 8000
- **Context**: 32,768 tokens max (could push higher, but diminishing returns for my use cases)
- **Orchestration**: Docker container with GPU passthrough

Inference speed lands around 30-45 tokens/second depending on context length and batch size. For comparison, Anthropic's API gives you maybe 80-100 tok/s but at $15/MTok for output. My marginal cost per token after hardware amortization is effectively zero.

## What I'd Do Differently

I'd skip the "try every container" phase and go straight to the nightly builds for bleeding-edge hardware. I'd also set up the monitoring stack (Prometheus + Grafana) from day one instead of retrofitting it. And I'd allocate a dedicated NVMe partition for model storage — swapping models on a shared filesystem gets messy.

## The Bottom Line

Self-hosted inference isn't for everyone. If you're running one model for personal projects, Ollama on a MacBook is fine. But if you're building products that depend on AI inference, owning the hardware changes the economics fundamentally. No rate limits, no per-token billing, no dependency on someone else's uptime. The DGX Spark is the first hardware that makes this practical without a server room.

The site you're reading right now? The AI agent answering your questions? It's running on this exact stack. That's not a sales pitch — it's a proof point.`,
  },
  {
    slug: 'ynab-alternative-why-i-built-meridian',
    title: 'Why I Built a YNAB Alternative',
    excerpt: 'Envelope budgeting is a solved problem. So why did I spend months building a new app? Because the existing solutions either cost too much or do too little.',
    category: 'Product',
    date: 'February 2026',
    readTime: '6 min read',
    content: `YNAB costs $14.99 a month. For a budgeting app. Let that sink in — $180 a year to tell your money where to go. The tool that's supposed to help you save money is itself a recurring expense that compounds forever.

I'm not anti-YNAB. The envelope budgeting methodology works. Give every dollar a job, age your money, roll with the punches — it's sound financial thinking. But the implementation? Bloated. The price? Climbing every year. And the moment you stop paying, you lose access to your own financial data. That's not a tool — that's a subscription trap.

## What Meridian Actually Does

Meridian Money is envelope budgeting at $5/month. Not a stripped-down version of YNAB — a rethinking of what the app should be.

The core workflow: connect your bank accounts via Stripe Financial Connections (not Plaid — Stripe's pricing is more sustainable at scale), categorize your transactions into envelopes, and watch your spending in real time. AI-powered categorization handles the tedious part. You teach it your patterns and it learns.

The architecture is Next.js with React on the frontend, Prisma and PostgreSQL on the backend, deployed to a managed platform. Nothing exotic — boring technology choices that let me focus on the product instead of fighting the stack.

## The $5 Price Point

Here's the math most indie developers don't do before launching: bank data aggregation costs money. Every account connection, every transaction sync has a per-user cost. At $5/month, the margins are thin but sustainable. At $14.99, YNAB is printing money on a commodity feature set.

My thesis: budgeting apps should cost less than a sandwich. If you're charging premium prices, you'd better be delivering premium value. YNAB's value proposition hasn't meaningfully changed in years. They raised prices and added features nobody asked for.

## What I Learned Building It

Building a fintech product as a side project while working full-time as an IT Director teaches you a few things:

**Ship the core, skip the features.** Version 1 had envelope budgeting, bank sync, and transaction categorization. No reports, no goals, no debt payoff calculators. The people who need those features aren't your first users — the people frustrated with YNAB's pricing are.

**Real users find real bugs.** The first active user found an MFA issue with their bank connection that never showed up in testing. You can't simulate the diversity of real-world bank integrations. Ship early, fix fast.

**Don't fake social proof.** I've seen too many indie apps launch with fabricated testimonials. Every blurb on Meridian's site is from a real person who actually uses the app. There are only a few of them right now, and that's fine. Authenticity compounds.

## Where It's Going

The roadmap has two major additions: velocity banking tools (because I use this strategy myself and no budgeting app handles it) and an AI financial coach that actually understands your spending patterns. Not a chatbot that regurgitates Dave Ramsey — a system that knows your envelopes, your goals, and your habits.

But those are future problems. Right now, Meridian does one thing well: envelope budgeting that doesn't cost $180 a year. Sometimes that's enough.`,
  },
  {
    slug: 'rag-pipelines-that-actually-work',
    title: 'RAG Pipelines That Actually Work',
    excerpt: 'Everyone is building RAG. Most of it is bad. Here is what I learned building a retrieval pipeline that handles real-world government data.',
    category: 'AI',
    date: 'March 2026',
    readTime: '10 min read',
    content: `Retrieval-Augmented Generation is the most oversold and under-delivered pattern in AI right now. Every tutorial shows you how to chunk a PDF, embed it, and ask questions. None of them show you what happens when your documents are messy, your queries are vague, and your users expect real answers.

I've built two production RAG systems — one for SMIS (a federal contract intelligence platform) and one for this site's AI agent. Here's what actually matters.

## Chunking Is Where Most Pipelines Die

The default approach: split your documents into 512-token chunks with 50-token overlap. It's in every tutorial. It's also terrible for anything beyond simple Q&A.

The problem is that meaning doesn't respect token boundaries. A paragraph about contract requirements might reference a clause defined three pages earlier. A project specification might span multiple sections with critical context in the headers. Naive chunking destroys these relationships.

What works better: semantic chunking that respects document structure. Split on section headers, paragraph boundaries, and logical units. Keep metadata about where each chunk came from — document title, section title, page number. That metadata becomes critical when you need to rank results.

For SMIS, we process federal contract documents that follow specific formatting conventions. SAM.gov solicitations have predictable section structures — scope of work, evaluation criteria, submission requirements. Chunking along those boundaries preserves the semantic units that matter for bid analysis.

## Hybrid Search Beats Pure Vector

Vector similarity search is elegant. It's also insufficient for production use. Pure embedding similarity misses keyword matches that a human would consider obvious, and it hallucinates relevance for semantically similar but factually irrelevant content.

The pattern that works: vector search for semantic relevance, combined with keyword/BM25 scoring for precision. Rank the results using a weighted combination. In practice, this means PostgreSQL with pgvector for embeddings alongside full-text search indexes.

For the Reader agent on this site, I use a hybrid approach with audience tag boosting. Each document chunk has audience tags (consulting, technical, personal) that get a 1.2x score boost when they match the visitor's stated intent. A technical visitor asking about infrastructure gets architecture-focused chunks ranked higher than business-focused ones for the same query. Simple, effective, and no ML wizardry required.

## The Seen-Chunk Problem

Here's something nobody talks about in RAG tutorials: conversation memory and result deduplication. If a user asks three questions about the same topic, naive RAG returns the same chunks every time. The conversation feels repetitive because the model keeps getting the same context.

The fix: track which chunks each session has already seen. On subsequent queries, filter out or deprioritize previously retrieved chunks. This forces the system to surface new information as the conversation progresses. In Redis, it's a simple set per session:

Store the chunk IDs after each retrieval. On the next query, exclude them from results. The conversation naturally deepens instead of circling.

## Embedding Model Selection

I use \`nomic-embed-text-v1.5\` running locally on the DGX Spark. It's not the highest-performing embedding model on benchmarks, but it has three properties that matter in production:

1. **It runs locally.** No API calls, no rate limits, no per-request costs.
2. **It's fast enough.** Embedding a query takes milliseconds, not seconds.
3. **It's good enough.** For domain-specific content with hybrid search backing it up, marginal embedding quality improvements don't move the needle.

The temptation is always to use the latest, greatest embedding model from OpenAI or Cohere. If your entire retrieval quality depends on embedding precision, your pipeline has bigger problems.

## Prompting the Generator

The final piece most people get wrong: how you present retrieved context to the LLM. Dumping raw chunks into the system prompt with "use this context" produces mediocre results.

What works: structured context with source attribution. Each chunk gets a label — document title, section, source type. The system prompt explicitly instructs the model on how to use context, what to do when context is insufficient, and how to handle conflicting information across chunks.

For Reader, the system prompt includes intent-specific instructions. A consulting-focused visitor gets a prompt that emphasizes business outcomes and ROI. A technical visitor gets peer-to-peer language and architecture details. Same RAG pipeline, different generation behavior.

## The Honest Truth

RAG is plumbing. It's not glamorous, it's not novel, and the difference between a bad RAG system and a good one is boring engineering work: proper chunking, hybrid search, session management, thoughtful prompting. No magic, just care.

The systems that work in production aren't the ones with the fanciest embeddings or the most sophisticated re-ranking. They're the ones where someone paid attention to the details.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return blogPosts;
}
