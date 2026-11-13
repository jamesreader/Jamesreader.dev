---
title: "A Second Agent Stream Added Nothing: Admission Control in Front of One GPU"
slug: one-agent-at-a-time-dgate
excerpt: "My coding agents fan out into parallel subagents, and on one DGX Spark that made everything slower. I measured why, then put a small cache-aware gate in front of the engine that decides when each request goes in."
category: Infrastructure
date: 2026-11-13
published: true
---

One DGX Spark serves everything I run: this site's AI guide, my personal assistant, and my coding agents. The coding agents are the heavy users. A single task can fan out into seven subagents, each carrying a prompt of around 105,000 tokens. Parallelism sounds like it should help, but on this box it didn't, and I wanted to know exactly why before I changed anything.

## What I measured

I ran the same seven-subagent task and watched the engine's metrics while varying how many requests it was handling at once.

- **One request at a time:** about 30.5 tokens per second of total output, with 78% of prompt tokens served from the prefix cache.
- **Two at once:** the cache held up fine (82% hits), but total output *fell* to about 25 tokens per second.
- **Three or more:** total output dropped to 9–17 tokens per second, cache hits collapsed to 8–22%, and all 18 preemptions in the run happened there.

So a second agent stream added no output at all. Each agent turn brings roughly 40,000 new prompt tokens that have to be processed before it can generate anything, and that prefill work stalls the other stream's generation. A third stream does worse than stall: the agents' combined context no longer fits in the cache, so they start evicting each other.

Then I paced the same task with a crude limiter. Paced, it finished in 17 minutes with 70% cache hits and 1,538 generated tokens a minute. Unpaced, I stopped it unfinished at 45 minutes, with 12% hits and 784 tokens a minute.

## Why the engine can't fix this itself

vLLM already has a queue, but it orders *requests*, not *conversations*. It holds queued requests inside the engine, where they're already competing for memory. And its least-recently-used cache eviction is exactly wrong for agents. Agents cycle through a working set bigger than the cache, so LRU evicts the conversation that's about to come back next. The setting that caps concurrency also needs a full engine restart (about four minutes) every time you change it.

## dgate

So I built **dgate**, a small, transparent proxy that sits in front of the engine and decides *when* each request is allowed in. Clients don't change. They talk to the same address they always did.

- **One agent at a time.** Agent work gets one engine slot, which is the knee in the measurements above. Interactive requests, like this site's guide or me typing to my assistant, can use any free slot, and tiny requests skip the queue entirely. I never wait behind my agents, and neither do you.
- **A warm set.** At most two agent conversations are active at once, and their combined context has to fit in 80% of the cache, so they stop evicting each other.
- **Finish-first.** When an agent's turn finishes, its conversation keeps the slot for a few seconds so its next turn goes first, while its context is still cached. Without that, any fair queue round-robins the agents turn by turn and every turn starts cold.
- **No client changes.** dgate recognizes a subagent from the delegation notice my harness already puts in its context. It looks only in system and short user messages, never in tool output, so a web page can't promote itself.
- **Guards.** Nothing is held longer than the client's own timeout, and a stuck detector releases the queue if nothing has run for a while.

It ran first in shadow mode, forwarding everything immediately and logging what it *would* have held. Then it went live in gate mode. All of its limits can be changed live, with no engine restart.

## The bug I found afterward

A few days in, I went through the decision logs and found that about two thirds of agent turns were logged as "cancelled." My harness hangs up the moment the last byte arrives, and the running build counted that as an abort instead of a normal finish. That mattered beyond the logs, because finish-first only granted its grace period after a normal finish. So most agent turns were getting exactly the turn-by-turn round robin the gate was built to prevent. The fix is one line of logic and it's already written. The lesson is older than this project: check your own success signal against what the client actually does.

## The engine got faster too

The admission gate came after a month of work on the engine itself. Three changes shipped together, and each one had to produce bit-identical output against saved reference generations before it was allowed to stay:

- An embedding-table lookup that was the only point in each step where the GPU waited on the CPU now prefetches the pages it needs in one burst. That's about 7% faster end to end.
- Follow-up turns stopped recomputing a block of the prompt they already had, so the first token arrives about half a second sooner on every follow-up.
- The small draft model that proposes tokens for speculative decoding now runs its output layer in 8-bit, which makes generation 4–9% faster. The output stays the same because the main model still verifies every drafted token.

None of these is dramatic alone. Together with the gate, they're the difference between agents that fight over one box and agents that take turns on it.
