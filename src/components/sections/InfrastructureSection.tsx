'use client';

import { motion } from 'framer-motion';

const infraItems = [
  {
    icon: '🧠',
    title: 'NVIDIA DGX Spark',
    subtitle: 'Daedalus',
    specs: ['Grace ARM CPU', '128GB unified memory', 'CUDA 13.0', '3.7TB NVMe'],
    description: 'The brain. Runs production LLMs locally — Qwen3.5-122B, GLM-4, and custom models. Zero data leaves the building.',
  },
  {
    icon: '⚡',
    title: 'vLLM Inference',
    subtitle: 'Continuous Batching',
    specs: ['PagedAttention', 'NVFP4 quantization', 'SSE streaming', 'Multi-model'],
    description: 'Continuous batching serves multiple concurrent users. PagedAttention manages memory efficiently across long conversations.',
  },
  {
    icon: '🔍',
    title: 'RAG Pipeline',
    subtitle: 'pgvector + Hybrid Search',
    specs: ['768-dim embeddings', 'Nomic embed v1.5', 'Intent-weighted retrieval', 'Metadata filtering'],
    description: 'Semantic search over structured knowledge. Hybrid vector + keyword retrieval with intent-based scoring.',
  },
  {
    icon: '🏗️',
    title: 'k3s Cluster',
    subtitle: 'Container Orchestration',
    specs: ['Elasticsearch 7.17', 'Kibana', 'FSCrawler', '160K+ documents indexed'],
    description: 'Lightweight Kubernetes for running search stacks, document processing, and application workloads.',
  },
  {
    icon: '🔒',
    title: 'Network',
    subtitle: 'Tailscale Mesh',
    specs: ['Zero-trust networking', 'Encrypted tunnels', 'Funnel for public access', 'No port forwarding'],
    description: 'All infrastructure connected via Tailscale. Secure by default, accessible from anywhere, no exposed ports.',
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function InfrastructureSection() {
  return (
    <section id="infrastructure" className="py-20 md:py-28 bg-cream-dark/50 dark:bg-dark-surface/30 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-2">
            Infrastructure
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-4">
            The stack behind the work
          </h2>
          <p className="font-sans text-lg text-charcoal/60 dark:text-dark-muted max-w-2xl">
            Everything runs on hardware I own. No cloud APIs for inference, no third-party data processing.
            The AI you&apos;re talking to right now runs on this exact infrastructure.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-30px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {infraItems.map((infra) => (
            <motion.div
              key={infra.title}
              variants={item}
              className="bg-white/70 dark:bg-dark-surface/70 backdrop-blur-sm border border-stone-dark/15 dark:border-dark-border/25 rounded-xl p-6 hover:border-turquoise/30 transition-colors"
            >
              <span className="text-2xl mb-3 block">{infra.icon}</span>
              <h3 className="font-serif text-lg font-bold text-charcoal dark:text-cream mb-0.5">
                {infra.title}
              </h3>
              <p className="font-sans text-xs text-turquoise font-medium mb-3">{infra.subtitle}</p>
              <p className="font-sans text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed mb-4">
                {infra.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {infra.specs.map((spec) => (
                  <span
                    key={spec}
                    className="text-[11px] font-sans px-2 py-0.5 bg-stone/50 dark:bg-dark-border/30 text-charcoal/50 dark:text-dark-muted rounded"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Meta callout */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 p-5 rounded-xl border border-turquoise/20 bg-turquoise/5"
        >
          <p className="font-sans text-sm text-charcoal/70 dark:text-dark-muted leading-relaxed">
            <span className="font-semibold text-turquoise">Meta:</span> The AI agent guiding this site runs on the Daedalus DGX Spark described above.
            Your conversation is being processed by a self-hosted model with RAG retrieval against a local pgvector database.
            The medium is the message — you&apos;re experiencing what I build.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
