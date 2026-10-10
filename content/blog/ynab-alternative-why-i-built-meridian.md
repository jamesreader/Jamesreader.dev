---
title: "Why I Built a YNAB Alternative"
slug: ynab-alternative-why-i-built-meridian
excerpt: "Envelope budgeting is a solved problem. So why did I spend months building a new app? Because the existing solutions either cost too much or do too little."
category: Product
date: 2026-02-01
published: true
---

YNAB costs $14.99 a month. For a budgeting app. Let that sink in — $180 a year to tell your money where to go. The tool that's supposed to help you save money is itself a recurring expense that compounds forever.

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

But those are future problems. Right now, Meridian does one thing well: envelope budgeting that doesn't cost $180 a year. Sometimes that's enough.
