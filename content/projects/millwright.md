---
name: "Millwright"
slug: millwright
status: in-development
category: product
stack: [TypeScript, Node.js, React, React Flow, PostgreSQL, QuickJS (WebAssembly), Self-hosted LLM]
hero_stat: { label: "Adversarial review passes", value: "5, until clean" }
audience_tags: [consulting, technical]
order: 5
---

## The Short Version

Millwright is a self-hostable platform where you describe an internal app in plain language and an AI agent builds it for you. It doesn't write free-form code. It assembles prebuilt, security-reviewed components, and a live canvas shows the app's architecture and the data moving through it. James built the first working version in November 2026. It's early, and whether it becomes a product or an open-source project is still undecided. The code is licensed AGPL-3.0.

## The Problem

Every organization runs on internal tools: intake forms, approval queues, trackers, the spreadsheet three people are afraid to touch. Low-code platforms make those tools easier to build, but someone still has to learn the platform. AI coding agents can build them from a prompt, but the result is a pile of generated code, and nobody can say for sure where the data goes. For a town, a small business, or anyone holding personnel or customer records, that second question is the one that matters.

## How It Works

- **You prompt, the agent builds.** The agent works from a fixed library of building blocks (entities, forms, approvals, schedules, connectors, published APIs). In testing on James's own locally hosted model, it built apps it had never seen in one to one and a half minutes from a single prompt, and it recovered from its own mistakes by reading the tool errors.
- **A data-flow gate the agent can't talk its way past.** Fields carry a sensitivity label. Before anything deploys, a deterministic gate traces where every restricted value could flow, including through renamed fields, custom code outputs, and later versions of the app. When the model tried to send an internal field to Slack, the gate blocked it, and the agent rerouted without being told.
- **The agent never holds the keys.** Outbound calls go through a separate broker. The app engine has no route to the internet or the model host. Where an email or webhook can go is set by the human builder in the credential itself, so the agent can choose what to send but never where it goes.
- **Custom code, sandboxed and reviewed.** When a block doesn't fit, the agent can write a small function. It runs in a WebAssembly sandbox with a one-second budget, sees only the fields it declared, and every version needs an independent model review plus the builder's confirmation.
- **Nothing is ever dropped.** Removing a field renames it, so rollback restores data instead of losing it.

## How It Was Hardened

The build ran through five rounds of independent adversarial review. Each finding was reproduced as a failing test before it was fixed. The first round found 10 serious holes. The worst were restricted data laundered through a same-named field in another entity, and approvals that carried restricted data past a later deploy. The next rounds found 2, 7, 4, then 2 issues, and the project stopped when a round found only low-severity ones. The main lesson: each step was secure on its own, but the holes appeared across versions and across apps. So lineage and history became part of the security model, and anywhere a restricted value could change runtime behavior (error messages, length limits, event shapes), that behavior was made value-independent.

## What This Demonstrates

Agentic building can be safe when the safety lives in the harness rather than the model's judgment. The model is free to be creative inside a box whose walls are code, tests, and a human who sets the destinations.
