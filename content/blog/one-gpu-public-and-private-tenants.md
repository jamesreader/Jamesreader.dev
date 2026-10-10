---
title: "One GPU, a Public Chatbot, and My Private Agents: Closing the Prefix-Cache Side Channel"
slug: one-gpu-public-and-private-tenants
excerpt: "The AI on this site shares an inference engine with my private agents. Batching doesn't mix conversations, but the prefix cache leaks timing. Here's how I measured it and closed it with one server-side setting."
category: Infrastructure
date: 2026-10-10
published: false
---

The AI guide on this site, Reader, runs on the same inference engine as my private agents. One DGX Spark and one vLLM process serve the public portfolio chatbot, my personal assistant, and a handful of internal tools. That's the whole economic argument for local AI: one box, many tenants, near-zero marginal cost.

It's also a security question I eventually had to answer properly. What can a stranger on the internet learn about my private traffic just by talking to the chatbot?

## Batching isn't the problem

The first worry people have is batching. vLLM runs many requests through the GPU together, so do conversations bleed into each other? They don't. Batching shares the *compute*, not the *context*. Each request keeps its own sequence, its own attention, and its own output.

The real issue is quieter.

## The prefix cache is a timing oracle

vLLM keeps a **prefix cache**. If a new request starts with the same tokens as a recent one, the engine reuses the already-computed attention state instead of processing that prefix again. That's a large speedup for agents that send the same long system prompt over and over.

It's also a side channel. A cached prefix comes back much faster than an uncached one, and the difference isn't subtle. I measured it on my own box: a roughly 23,000-token prompt took about **12 seconds** cold and about **1.3 seconds** when its prefix was cached.

So a tenant who can time responses can ask: *has anyone else recently sent a prompt that starts with this text?* Fast answer, yes. Slow answer, no. For a public chatbot sharing an engine with private agents, that means a visitor could, in principle, confirm guesses about what my internal tools are sending. It's a narrow attack, but it's real and documented, and "narrow" isn't the same as "closed."

## The fix: salt the cache per tenant

vLLM supports a per-request **cache salt**. Requests with different salts never share cached prefixes. The same prompt under a different salt is a guaranteed cold miss, and I verified that directly rather than trusting the docs.

The important part is *where* the salt gets set. If the client sets it, a client can remove it. So the salt is injected server-side by the router that sits in front of vLLM:

- The public site talks to its own model alias, and that alias always carries the public salt.
- Internal tools use a different alias with a different salt.
- Neither client can see or change the salt. The router adds it to every request before it reaches the engine.

The rule that falls out of this is simple: **never point an internal tool at the public alias, and never point the public site at the internal one.** Same engine, separate caches.

## What's still shared

Salting closes the timing channel. It doesn't make the tenants fully independent:

- **Engine bugs.** The tenants still share one process on a nightly build. A cross-request bug in the engine itself is low probability, but it isn't zero.
- **Contention.** A burst of public traffic can slow down private work. Rate limits on the public side are the throttle.

I've staged a fully separate small engine for the public site, ready to switch on with one command. For a site that serves a public bio, the salt is the proportionate fix. If the public side ever carries more than that, the second engine goes live.

## The performance footnote

Salting has a side benefit, which is that it makes you think about what you put at the *top* of your prompts. Anything that changes per request, like a timestamp, invalidates the cache for everything after it. I learned that one the slow way on another project: a clock at the top of a system prompt meant every single request reprocessed the entire prompt. Put the static material first and the per-request material last, and the cache does its job for the tenants it's meant for.

## The takeaway

Multi-tenant local AI is a great deal, but "it's my box" isn't a threat model. Know which shared components can leak, measure the leak instead of guessing, and enforce isolation at the layer clients can't touch.
