---
name: "Municipal AI Infrastructure"
slug: edgewood-ai
status: in-development
category: government
stack: [NVIDIA DGX Spark, Kubernetes, Elasticsearch, RAG, Python]
hero_stat: { label: "Sector", value: "Local Government" }
audience_tags: [consulting, technical, personal]
order: 3
---

## The Problem

Local government offices drown in paper. Decades of ordinances, policies, meeting minutes, permits, budget documents, and police reports sit in filing cabinets or scattered across shared drives. Finding a specific document means asking the person who's been there longest, or spending hours searching. New employees have no institutional memory. FOIA requests are labor-intensive. And the people making decisions often can't access the information that should inform them.

Meanwhile, the IT department — the one team that could solve this — is treated as a utility. Plug things in, keep them running, don't ask questions. Nobody invites IT to the table when decisions are made about technology.

## The Vision

A multimodal AI system that ingests, understands, and makes queryable the entire document archive of a municipal government. Not just text search — true understanding of tables, charts, scanned forms, handwritten notes, and the relationships between documents.

Built on NVIDIA's Enterprise RAG Blueprint, running locally on a DGX Spark. No data leaves the building — critical for government and law enforcement use cases.

## Key Capabilities

- **Document Management System** — Digitize, organize, and classify the paper archive. Automated retention scheduling and disposition.
- **Multimodal RAG** — Query across document types: text, tables, charts, scanned images. "Show me all budget amendments from 2023 that affected the police department."
- **Smart Disposal** — AI classifies documents by retention schedule, automates legal disposition workflows
- **Cross-reference Intelligence** — Connect related documents across departments. A permit application linked to the relevant ordinance, the commission meeting where it was discussed, and the inspection report.
- **Natural Language Interface** — Staff ask questions in plain English. The system returns relevant documents with context, not just keyword matches.

## Why It Matters

This isn't a tech demo — it's the future of how small governments operate. The same approach scales to any municipality, any county office, any state agency dealing with document-heavy workflows. The total addressable market for government document intelligence is enormous, and almost nobody is building solutions that respect the unique constraints: data sovereignty, limited budgets, non-technical users, and legal compliance requirements.

## The Infrastructure

Running on a locally-hosted NVIDIA DGX Spark (128GB unified memory, GB10 GPU) behind the municipal firewall. Kubernetes (k3s) orchestration for the processing pipeline. Elasticsearch for full-text search alongside vector search for semantic queries. The entire stack is air-gappable if needed.

## What This Demonstrates

The ability to design and implement AI solutions within the constraints of government IT: privacy requirements, budget limitations, change-resistant culture, and the need for solutions that non-technical staff can actually use. This isn't Silicon Valley AI — it's practical, deployable, privacy-respecting intelligence for the real world.
