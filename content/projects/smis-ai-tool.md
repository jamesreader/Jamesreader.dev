---
name: "SMIS AI Bid Intelligence"
slug: smis-ai-tool
status: active
category: consulting
stack: [Next.js, PostgreSQL, OpenAI, SAM.gov API, ElevenLabs, Deepgram]
demo_url: https://smis.personafi.app
hero_stat: { label: "Opportunity Discovery", value: "Automated daily" }
audience_tags: [consulting, technical]
order: 2
---

## The Problem

Small government contractors — especially in specialized fields like forestry, vegetation management, and demolition — leave money on the table every day. SAM.gov publishes thousands of federal contract opportunities daily, but manually searching, filtering, and evaluating them is a full-time job nobody has time for. Bid packets take 8-16 hours to build. Deadlines slip. Opportunities expire before the team can respond.

SMIS is a forestry and construction firm with woman-owned and Hispanic-owned certifications, a GB98 contractor's license, and deep expertise in mastication, clearing/grubbing, invasive species treatment, and prescribed burn support. They had the qualifications to win contracts but no system to find and pursue them efficiently.

## The Solution

An AI-powered federal contract bid intelligence platform that monitors SAM.gov, scores opportunities against SMIS's capabilities and certifications, drafts bid components, and manages the entire pipeline from discovery to submission.

The system runs a multi-tier scraping and matching engine:
- **Tier 1:** SAM.gov API with 35+ active keywords and NAICS codes (forestry as Tier 1, construction as Tier 2)
- **Tier 2:** Enhanced matching with AI relevance scoring against SMIS's capability profile
- **Tier 3:** Deep analysis of solicitation documents with AI summarization

## Key Features

- **Automated opportunity discovery** — Daily scrapes across 35 keyword/NAICS combinations, deduplication, deadline tracking
- **AI relevance scoring** — Each opportunity scored against SMIS's certifications, past performance, and capability areas
- **Documents Hub** — Upload, AI-classify, and organize company documents (certifications, past performance, insurance) with expiration tracking
- **Voice interface** — Six ElevenLabs voices with per-voice speed tuning for hands-free operation
- **Magic link invitations** — Frictionless team onboarding via Resend email
- **Structured AI outputs** — Phase 1 AI enhancement with prompt caching on all AI routes for cost efficiency

## Architecture

Next.js full-stack application hosted on Coolify (Hetzner VPS). PostgreSQL database. SAM.gov API integration for opportunity data. AI layer uses structured outputs with prompt caching for consistent, cost-efficient analysis. Document storage with AI classification. Real-time voice interface using ElevenLabs TTS and Deepgram STT.

## The AI Enhancement Roadmap

A five-phase plan to progressively increase AI capability:
1. **Structured Outputs + Prompt Caching** (complete) — Consistent AI responses, reduced costs
2. **Embeddings + Vector Search** — Semantic document matching with pgvector
3. **Evals Framework** — Automated AI quality testing
4. **Agentic Loops** — Autonomous daily digest pipeline
5. **Feedback Loop** — Win/loss signals for self-improving relevance scoring

## Business Model

$5,000 initial build + $500/month recurring for AI bid intelligence. The tool pays for itself if it helps win even one additional contract per year — most federal contracts in SMIS's space are $50K-$500K+.

## What This Demonstrates

This project showcases the full AI consulting engagement model: understanding a domain-specific problem, building a tailored solution (not a generic chatbot), delivering measurable business value, and creating a recurring revenue relationship. The same pattern applies to any industry with complex information workflows.
