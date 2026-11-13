---
name: "Agent-Operated Web Hosting"
slug: agent-hosting
status: in-development
category: infrastructure
stack: [nginx, PHP-FPM, Redis, Cloudflare, Stripe, ClamAV/YARA, Hermes agent]
hero_stat: { label: "Hosting bill", value: "~$1,200/yr retired" }
audience_tags: [consulting, technical]
order: 7
---

## The Short Version

James hosts about a dozen websites, most of them for paying clients, plus a family WooCommerce store. He's replacing the reseller stack (cPanel, WHM and WHMCS) with his own hosting, operated by his AI agent, Iris. It runs on a server he already pays for, with Cloudflare at the edge and Stripe for billing. Leaving the old hosts retires about $1,200 a year in bills. The build started in late October 2026, and the store is the pilot. It has to match the current host's speed and checkout before the old host is cancelled.

## Why

James wanted to drop WHMCS because it's awful software, not because of the price. The bar was to keep or improve site performance (no oversold budget hosting) and to save money only if speed didn't suffer. The old host's speed came mostly from Cloudflare edge caching plus a tight origin server, so the replacement matches that with nginx FastCGI caching, Redis object caching and OPcache behind Cloudflare. Cart, checkout and admin pages always reach PHP.

## How the Agent Is Fenced

Every protection lives in harness and API code, never in the model's judgment.

- **Trust runs one way.** Iris acts on sites only through a narrow control API with a fixed list of actions: update, scan, snapshot, restore, quarantine, and read logs. No site has any route back to Iris.
- **Healing means restoring, not hand-patching.** If a site is compromised, the fix is to quarantine it, restore the last clean snapshot (which the sites can't touch), re-apply updates, then investigate.
- **Site content is treated as hostile input.** Deterministic tools come first: malware scanners, file hashes compared against the snapshot, and WordPress core checksum checks. Iris reads their reports, not the files. When content must be read, a separate quarantined model call handles it, with no tools and no memory, and only its schema-checked output reaches Iris. Any text in a site that's aimed at an AI is itself treated as evidence of compromise.
- **Containment doesn't wait for the AI.** When a sensor raises a red alarm, it puts the site behind a maintenance page, makes the files read-only and blocks outbound traffic in seconds, with no model involved. Then Iris restores it.
- **Iris can't edit the audit log.** Closing a hole Iris finds follows a proposal and approval path until there's a track record.

## What This Demonstrates

An AI operator is safest when its job is narrowed to deciding which pre-built, reversible action to take, and the dangerous parts (containment, restoration and the audit trail) are handled by plain code it can't override.
