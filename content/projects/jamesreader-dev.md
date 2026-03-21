---
name: "This Site — Reader"
slug: jamesreader-dev
status: active
category: product
stack: [Next.js, FastAPI, Qwen3.5-122B, pgvector, ElevenLabs, Tailwind]
demo_url: https://jamesreader.dev
hero_stat: { label: "Powered by", value: "Self-hosted AI" }
audience_tags: [consulting, technical, personal]
order: 4
meta: true
---

## The Problem

Portfolio websites are static, one-size-fits-all experiences. A hiring manager, a consulting prospect, and a curious developer all see the same content in the same order. There's no intelligence, no adaptation, no conversation. It's a digital brochure in a world where every interaction should be intelligent.

## The Solution

An AI-powered portfolio that doesn't just display information — it guides visitors through a personalized experience based on their intent. The AI agent "Reader" speaks in James's own voice, knows everything about his work and capabilities, and reshapes the site in real-time for each visitor.

This isn't a chatbot bolted onto a website. The AI is woven into the fabric of the site itself — contextual annotations, proactive suggestions, dynamic content reordering, and voice interaction. The medium is the message: the most compelling evidence of James's AI capabilities is that visitors are using one right now.

## How It Works

When you land on the site, Reader asks what brought you here. Your answer reshapes the entire experience:
- **Consulting prospects** see case studies, engagement models, and business outcomes first
- **Technical explorers** get architecture deep-dives, live demos, and infrastructure details
- **People learning about James** experience a narrative journey through his career and philosophy

The agent provides contextual guidance as you explore — not as a chat bubble, but as intelligent annotations, suggested paths, and smooth transitions between content.

## Architecture

- **Frontend:** Next.js with dynamic rendering, Framer Motion animations, streaming responses
- **Agent Backend:** FastAPI on NVIDIA DGX Spark, co-located with the LLM for zero-hop inference
- **LLM:** Qwen3.5-122B (122 billion parameters, MoE architecture) via vLLM
- **RAG:** pgvector for semantic search across all knowledge base content
- **Voice:** ElevenLabs with James's cloned voice for spoken interactions
- **Cost:** Near-zero per visitor — all inference runs on self-hosted hardware

## What This Demonstrates

Full-stack AI product development: from concept to architecture to deployment. Self-hosted inference that scales without API bills. Voice cloning integration. RAG pipeline design. Frontend-AI integration patterns. And the taste to make it feel elegant, not gimmicky.

The site runs on the same DGX Spark that powers the consulting demonstrations. One piece of hardware, multiple production workloads. That's the efficiency story that matters to organizations evaluating AI infrastructure investments.
