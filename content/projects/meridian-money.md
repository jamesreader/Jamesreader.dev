---
name: "Meridian Money"
slug: meridian-money
status: active
category: product
stack: [Next.js, React, Prisma, PostgreSQL, Stripe, ElevenLabs]
demo_url: https://meridianmoney.app
repo: jamesreader/meridian
hero_stat: { label: "vs YNAB", value: "$5/mo vs $15/mo" }
audience_tags: [consulting, technical, personal]
order: 1
---

## The Problem

Most budgeting apps are either too simple (glorified spreadsheets) or too expensive and bloated (YNAB at $14.99/month for envelope budgeting). People living paycheck to paycheck — the ones who need budgeting most — can't justify $180/year for a budgeting tool. And existing tools treat AI as a gimmick, not a genuine capability.

## The Solution

Meridian Money is envelope budgeting done right — automatic bank sync via Stripe Financial Connections, future bill projection, debt payoff tools, and an optional AI financial coach. Starting at $5/month, it's positioned as the affordable, privacy-respecting alternative to YNAB.

The key differentiator isn't just price — it's philosophy. Meridian treats your financial data with respect. No selling to third parties, no data mining. Bank-level encryption. And the AI coach (coming soon as a voice-first experience) actually understands your financial context, not just generic advice.

## What Makes It Different

- **Envelope budgeting with bank sync** — The proven method, modernized. Transactions flow in automatically, you assign them to envelopes.
- **$5/month vs $15/month** — Same core features as YNAB at a third of the price. YNAB import tool for easy switching.
- **AI coach (in development)** — Voice-first financial coaching powered by local AI. Not a chatbot — a real-time conversational coach that knows your budget, your goals, and your patterns.
- **Partner budgeting** — "Yours, Mine, Ours" approach for couples. Link budgets without merging them. Three-tier visibility so each partner controls what's shared.
- **Velocity banking module (planned)** — For advanced users doing margin-based cash flow optimization. No other budgeting tool handles this.
- **Arsenal debt payoff** — Snowball and avalanche strategies with visual progress tracking.

## Architecture

Full-stack Next.js application with a React SPA frontend and API backend. Prisma ORM with PostgreSQL for data. Stripe Financial Connections for bank sync (not Plaid — better terms, integrated payments). Hosted on DigitalOcean App Platform with auto-deploy from the production branch.

The AI coaching layer will use Deepgram Nova-3 for speech-to-text, ElevenLabs for text-to-speech, and a local LLM on James's DGX Spark for inference — keeping costs near zero per user while delivering a premium experience.

## Current Status

Live in production with real users. Active development on partner budgeting, voice coach, and velocity banking modules. Social media automation pipeline running for organic growth. Blog content published regularly for SEO.

## The Business Case

The personal finance app market is dominated by tools that are either free (and sell your data) or expensive (and justify it with features most people don't use). Meridian sits in the sweet spot: affordable, privacy-respecting, and genuinely useful. The AI voice coach — when it launches — will be a category-defining feature that justifies premium tiers ($9.99-$19.99/month) while the base product stays accessible.
