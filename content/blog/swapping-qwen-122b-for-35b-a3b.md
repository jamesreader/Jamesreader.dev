---
title: "Why I Swapped a 122B Model for a 35B One — and Got Faster"
slug: swapping-qwen-122b-for-35b-a3b
excerpt: "Counterintuitive move: trading a dense 122-billion-parameter model for a 35-billion-parameter mixture-of-experts, and having the site feel noticeably snappier afterward. Active parameters matter more than total parameters."
category: Infrastructure
date: 2026-04-10
published: true
---

> **Update, October 2026:** This post is a snapshot from April. The site has moved through several models since, and the A3B described here was retired in September. Reader now runs on a larger Qwen-family mixture-of-experts model. The lesson below about active parameters held up. The specific model didn't, which is the point of the router section.

When I first set this infrastructure up, I picked the biggest model that would fit in 128GB of unified memory: Qwen3.5-122B at NVFP4 quantization. My reasoning was the obvious reasoning. Bigger model means smarter answers. I'd rather be a little slower and a lot better than fast and mediocre.

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

I also stopped letting the agent code speak to vLLM directly. Instead I put a thin **LiteLLM** proxy in between, configured with the single local model as "default" and a cloud fallback ready to take over if the vLLM process ever dies. The LiteLLM config is also where I set `enable_thinking: false` at the chat-template layer, which means the model stops emitting the "Thinking Process" preamble at the *source* — no more client-side filter gymnastics.

That change killed a bug I hadn't realized I had: the client-side filter for "Thinking Process" patterns was also matching legitimate markdown responses that happened to start with a heading, a numbered list, or a bolded phrase. Reader had been silently dropping structured answers for weeks. Once I disabled thinking at the model level and removed the filter, Reader could finally respond with actual markdown — lists, headings, bold terms — and have them render properly.

## The Lesson

Parameter count is a vanity metric. What matters is **active parameters per token** — the compute you actually pay for when generating output. For user-facing AI where latency defines the experience, a well-trained MoE with a small active count can beat a dense model several times its size. The "bigger is better" reflex from dense-model days doesn't transfer cleanly to sparse architectures.

The other lesson is more boring and more important: **put a router in front of your model**. Even when there's only one model behind it. The day you need to swap, A/B test, fall back to a cloud provider, or reconfigure chat templates, you want that one config file as the single source of truth — not code changes across three services.

## What It Means For This Site

When I wrote this, you'd have been talking to a Qwen3.5-35B-A3B MoE model running on a DGX Spark in my home office, proxied through LiteLLM, served to you via vLLM, rendered in a Next.js frontend on cloud infrastructure. Total operational cost for your entire visit: roughly the cost of the electricity to generate a few hundred tokens.

The site got faster overnight, and it was running on smaller hardware than a hyperscaler would tell you is required. That was the pitch, and it still is. Only the model behind the router has changed.
