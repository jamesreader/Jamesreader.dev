---
title: "Running Production LLMs on a DGX Spark"
slug: running-llms-on-dgx-spark
excerpt: "What it actually takes to run large language models locally. Hardware choices, memory architecture, inference optimization, and why 128GB of unified memory changes the game."
category: Infrastructure
date: 2026-03-01
published: true
---

> **Update, October 2026:** The hardware lessons here still stand. The model details are from March 2026 and have been replaced several times since. See [Why I Swapped a 122B Model for a 35B One](/blog/swapping-qwen-122b-for-35b-a3b) for the first swap.

Everyone talks about running AI locally. Most of them are running a 7B model on a MacBook and calling it "production." I wanted something different — real models, real throughput, zero cloud dependency.

## The Hardware Decision

After months of running inference through API calls — Anthropic, OpenAI, the usual suspects — the math stopped making sense. At scale, you're paying per token for compute that depreciates to zero on someone else's balance sheet. I wanted to own the silicon.

The NVIDIA DGX Spark ships with a Grace CPU (ARM aarch64), 128GB of unified memory shared between CPU and GPU, and a GB10 GPU. The unified memory architecture is the killer feature. Most consumer GPUs cap at 24GB VRAM, which means you're quantizing models down to shadows of themselves or spilling to CPU RAM with massive latency penalties. With 128GB unified, you can run Qwen3.5-122B at NVFP4 quantization comfortably — a genuinely capable model, not a toy.

## vLLM Over Ollama

I started with Ollama because everyone does. It's simple, it works, and for single-user inference it's fine. But Ollama is fundamentally single-threaded — one request at a time, queued. When you're serving a portfolio site's AI agent, a consulting demo, and your own development workflow simultaneously, that's a non-starter.

vLLM solves this with continuous batching and PagedAttention. Multiple concurrent requests get batched together efficiently. The throughput difference isn't incremental — it's architectural. On the same hardware, vLLM handles parallel requests that would queue for minutes on Ollama.

The catch: Daedalus runs ARM (aarch64), and most Docker images assume x86. The vLLM nightly with CUDA 13.0 support was the only build that worked. Not `vllm/vllm-openai:latest`, not the Nemotron container, not a pip install with system CUDA 12 — specifically `vllm/vllm-openai:cu130-nightly`. I burned a full evening discovering this. Documenting it here so you don't have to.

## The Inference Stack

The production setup is straightforward once you know what actually works:

- **Model (March 2026)**: Qwen3.5-122B (NVFP4 quantization, ~75GB in memory)
- **Serving**: vLLM with an OpenAI-compatible API
- **Context**: 32,768 tokens max (could push higher, but diminishing returns for my use cases)
- **Orchestration**: Docker container with GPU passthrough

Inference speed lands around 30-45 tokens/second depending on context length and batch size. For comparison, Anthropic's API gives you maybe 80-100 tok/s but at $15/MTok for output. My marginal cost per token after hardware amortization is effectively zero.

## What I'd Do Differently

I'd skip the "try every container" phase and go straight to the nightly builds for bleeding-edge hardware. I'd also set up the monitoring stack (Prometheus + Grafana) from day one instead of retrofitting it. And I'd allocate a dedicated NVMe partition for model storage — swapping models on a shared filesystem gets messy.

## The Bottom Line

Self-hosted inference isn't for everyone. If you're running one model for personal projects, Ollama on a MacBook is fine. But if you're building products that depend on AI inference, owning the hardware changes the economics fundamentally. No rate limits, no per-token billing, no dependency on someone else's uptime. The DGX Spark is the first hardware that makes this practical without a server room.

The site you're reading right now? The AI agent answering your questions? It runs on this same hardware and serving approach. The model has changed, the stack hasn't. That's not a sales pitch — it's a proof point.
