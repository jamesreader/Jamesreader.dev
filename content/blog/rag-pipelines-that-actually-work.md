---
title: "RAG Pipelines That Actually Work"
slug: rag-pipelines-that-actually-work
excerpt: "Everyone is building RAG. Most of it is bad. Here is what I learned building a retrieval pipeline that handles real-world government data."
category: AI
date: 2026-03-01
published: true
---

Retrieval-Augmented Generation is the most oversold and under-delivered pattern in AI right now. Every tutorial shows you how to chunk a PDF, embed it, and ask questions. None of them show you what happens when your documents are messy, your queries are vague, and your users expect real answers.

I've built two production RAG systems — one for SMIS (a federal contract intelligence platform) and one for this site's AI agent. Here's what actually matters.

## Chunking Is Where Most Pipelines Die

The default approach: split your documents into 512-token chunks with 50-token overlap. It's in every tutorial. It's also terrible for anything beyond simple Q&A.

The problem is that meaning doesn't respect token boundaries. A paragraph about contract requirements might reference a clause defined three pages earlier. A project specification might span multiple sections with critical context in the headers. Naive chunking destroys these relationships.

What works better: semantic chunking that respects document structure. Split on section headers, paragraph boundaries, and logical units. Keep metadata about where each chunk came from — document title, section title, page number. That metadata becomes critical when you need to rank results.

For SMIS, we process federal contract documents that follow specific formatting conventions. SAM.gov solicitations have predictable section structures — scope of work, evaluation criteria, submission requirements. Chunking along those boundaries preserves the semantic units that matter for bid analysis.

## Hybrid Search Beats Pure Vector

Vector similarity search is elegant. It's also insufficient for production use. Pure embedding similarity misses keyword matches that a human would consider obvious, and it hallucinates relevance for semantically similar but factually irrelevant content.

The pattern that works: vector search for semantic relevance, combined with keyword/BM25 scoring for precision. Rank the results using a weighted combination. In practice, this means PostgreSQL with pgvector for embeddings alongside full-text search indexes.

For the Reader agent on this site, I use a hybrid approach with audience tag boosting. Each document chunk has audience tags (consulting, technical, personal) that get a 1.2x score boost when they match the visitor's stated intent. A technical visitor asking about infrastructure gets architecture-focused chunks ranked higher than business-focused ones for the same query. Simple, effective, and no ML wizardry required.

## The Seen-Chunk Problem

Here's something nobody talks about in RAG tutorials: conversation memory and result deduplication. If a user asks three questions about the same topic, naive RAG returns the same chunks every time. The conversation feels repetitive because the model keeps getting the same context.

The fix: track which chunks each session has already seen. On subsequent queries, filter out or deprioritize previously retrieved chunks. This forces the system to surface new information as the conversation progresses. In Redis, it's a simple set per session:

Store the chunk IDs after each retrieval. On the next query, exclude them from results. The conversation naturally deepens instead of circling.

## Embedding Model Selection

I use `nomic-embed-text-v1.5` running locally on the DGX Spark. It's not the highest-performing embedding model on benchmarks, but it has three properties that matter in production:

1. **It runs locally.** No API calls, no rate limits, no per-request costs.
2. **It's fast enough.** Embedding a query takes milliseconds, not seconds.
3. **It's good enough.** For domain-specific content with hybrid search backing it up, marginal embedding quality improvements don't move the needle.

The temptation is always to use the latest, greatest embedding model from OpenAI or Cohere. If your entire retrieval quality depends on embedding precision, your pipeline has bigger problems.

## Prompting the Generator

The final piece most people get wrong: how you present retrieved context to the LLM. Dumping raw chunks into the system prompt with "use this context" produces mediocre results.

What works: structured context with source attribution. Each chunk gets a label — document title, section, source type. The system prompt explicitly instructs the model on how to use context, what to do when context is insufficient, and how to handle conflicting information across chunks.

For Reader, the system prompt includes intent-specific instructions. A consulting-focused visitor gets a prompt that emphasizes business outcomes and ROI. A technical visitor gets peer-to-peer language and architecture details. Same RAG pipeline, different generation behavior.

## The Honest Truth

RAG is plumbing. It's not glamorous, it's not novel, and the difference between a bad RAG system and a good one is boring engineering work: proper chunking, hybrid search, session management, thoughtful prompting. No magic, just care.

The systems that work in production aren't the ones with the fanciest embeddings or the most sophisticated re-ranking. They're the ones where someone paid attention to the details.
