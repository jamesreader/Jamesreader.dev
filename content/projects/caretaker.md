---
name: "Caretaker"
slug: caretaker
status: production
category: infrastructure
stack: [Python, Claude, Self-hosted LLM, Tailscale, Windows Task Scheduler]
hero_stat: { label: "Patrol interval", value: "Every 15 minutes" }
audience_tags: [technical, consulting]
order: 6
---

## The Short Version

Caretaker is James's standing maintenance agent. It watches his servers, AI hardware, public sites and code repositories, fixes known problems on its own, keeps systems patched, and proposes improvements, but it asks before deploying anything it isn't already trusted to do. It has run in production since November 2026.

## The Shape

- **The patrol has no AI in it.** Every 15 minutes, a plain Python patrol probes everything: services, disk and memory, certificates, site uptime, pending security updates, even whether API keys still work. That part is deterministic, cheap and predictable.
- **Fixes come from a playbook, not improvisation.** Caretaker only applies fixes already written down as the known cure for that failure, such as restarting a stuck media service or a reverse proxy that's returning 504s. It gets one attempt per incident, then it escalates to James.
- **AI does the thinking half.** Every few hours, Claude triages the patrol's queue, and once a week it runs a security and improvement pass. A local model on the DGX Spark handles small text tasks, but only when the engine is idle, so it never makes James wait.

## Trust That Grows

Anything Caretaker builds is a proposal. Each one is scored against a ledger of approvals James has already given. It goes ahead on its own only when it matches an approved kind of change in the same area, scores high enough, and has a rollback. Some categories always need a human regardless of score: money, anything outbound, the AI serving layer, reboots, public exposure, deleting data, schema migrations, credentials, major upgrades, and anything touching the town's systems. Every approval James gives joins the ledger, which is how Caretaker's standing authority grows. It earns trust one decision at a time instead of being handed it.

## Reaching James

Caretaker works out where James is without any phone app. If he's at his desk, it shows a desktop notification. If he's away but his phone is online, it sends a push notification and an email. Otherwise it sends email. An approval only counts if it's a reply in the same email thread, from his address, and carries the proposal's six-character code.

## What This Demonstrates

Useful autonomy doesn't come from one big grant of permission. It comes from a narrow, auditable path where the agent's authority expands only as fast as its track record does.
