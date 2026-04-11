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

Meridian Money is envelope budgeting done right — automatic bank sync via Stripe Financial Connections, future bill projection, debt payoff tools, and an optional AI financial coach called Plutus. Starting at $5/month for budgeting, it's positioned as the affordable, privacy-respecting alternative to YNAB.

The key differentiator isn't just price — it's philosophy. Meridian treats your financial data with respect. No selling to third parties, no data mining. Bank-level encryption. And Meridian is **AI-optional, not AI-first**: the core budgeting experience works completely without AI. If you want AI in the loop, Plutus is an add-on, and power users can connect their own tools via MCP. The budgeting is the product; AI is a layer you can turn on or off.

## What Makes It Different

- **Envelope budgeting with bank sync** — The proven method, modernized. Transactions flow in automatically, you assign them to envelopes.
- **$5/month vs $15/month** — Same core features as YNAB at a third of the price. YNAB import tool for easy switching.
- **Plutus AI Coach ($10/month add-on)** — A real AI financial assistant that knows your budget, your goals, and your spending patterns. Not a chatbot with canned responses — Plutus understands your actual financial context and gives personalized guidance. Completely optional; the base product is fully usable without it.
- **MCP Server (Bring Your Own AI)** — For power users and AI enthusiasts, Meridian exposes an MCP (Model Context Protocol) server so you can connect your own AI tools — Claude, ChatGPT, or any MCP-compatible client — directly to your financial data. No lock-in, no captive AI requirement.
- **Partner budgeting** — "Yours, Mine, Ours" approach for couples. Link budgets without merging them. Three-tier visibility so each partner controls what's shared.
- **Velocity banking module (planned)** — For advanced users doing margin-based cash flow optimization. No other budgeting tool handles this.
- **Arsenal debt payoff** — Snowball and avalanche strategies with visual progress tracking.

## Pricing

- **Core budgeting** — $5/month (envelopes, bank sync, bill projection, debt tools)
- **Plutus AI Coach** — $10/month add-on (AI-powered financial guidance with full budget context)
- **MCP Server** — Included for all users (connect your own AI tools to your financial data)

## Architecture

Full-stack Next.js application with a React SPA frontend and API backend. Prisma ORM with PostgreSQL for data. Stripe Financial Connections for bank sync (not Plaid — better terms, integrated payments). Hosted on DigitalOcean App Platform with auto-deploy from the production branch.

The MCP server exposes Meridian's financial data through the Model Context Protocol standard, allowing any compatible AI client to query budgets, transactions, envelopes, and goals.

## Current Status

Live in production with real users. Plutus AI coach is live. MCP server is live. Active development on partner budgeting and velocity banking modules. Social media automation pipeline running for organic growth.

## The Business Case

The personal finance app market is dominated by tools that are either free (and sell your data) or expensive (and justify it with features most people don't use). Meridian sits in the sweet spot: affordable, privacy-respecting, and genuinely useful — with AI-optional positioning that doesn't force the feature on users who don't want it. Plutus and the MCP server are the upgrade path for users who *do* want AI in the loop, without ever making AI a requirement to get value from the product.
