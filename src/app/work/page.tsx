import type { Metadata } from 'next';
import type { WorldName } from '@/components/world';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Projects and products built by James Reader. From personal finance apps to AI-powered bid intelligence.',
};

const projects = [
  {
    id: 'meridian-money',
    category: 'Fintech Product',
    title: 'Meridian Money',
    subtitle: 'Personal finance, reimagined',
    description: `Most budgeting apps are either too simple to be useful or too complex to stick with. Meridian Money sits in the sweet spot: envelope budgeting that actually makes sense, with AI available when you want it and completely out of your way when you don't. Your data is yours — no selling, no training models on it, no lock-in.`,
    details: [
      'Envelope budgeting with automatic bank sync via Stripe Financial Connections',
      'AI-optional: Plutus AI coach ($10/mo add-on) or bring your own AI via MCP server',
      'Your data stays 100% yours — no selling to third parties, no AI training on user data',
      'Built with Next.js, React, Prisma, PostgreSQL, and TypeScript',
      '$5/month for core budgeting — positioned against YNAB at $14.99',
    ],
    link: 'https://meridianmoney.app',
    linkLabel: 'Visit meridianmoney.app',
    status: 'Live',
  },
  {
    id: 'smis',
    category: 'Enterprise AI',
    title: 'SMIS AI Tool',
    subtitle: 'Bid intelligence for forestry and construction',
    description: `Federal contracting is a $700B market buried in bureaucratic noise. SMIS cuts through it. The platform monitors SAM.gov, analyzes contract opportunities using LLMs, and delivers qualified leads to forestry and construction companies who used to spend hours manually searching.`,
    details: [
      'Automated SAM.gov monitoring and opportunity scoring',
      'RAG pipeline for matching company capabilities to contracts',
      'LLM-powered bid analysis and competitive intelligence',
      'Custom relevance scoring for forestry/construction verticals',
      'Built with Python, FastAPI, and vector databases',
    ],
    link: null,
    linkLabel: null,
    status: 'Active Development',
  },
  {
    id: 'edgewood-tools',
    category: 'Government',
    title: 'Edgewood Internal Tools',
    subtitle: "Build, don't buy: a two-person town IT shop",
    description: `The Town of Edgewood runs IT with two people across eight sites, including a police department that never closes. Off-the-shelf software fit our process about 70% of the way, and the other 30% became permanent workarounds. So I build most of our internal tools and run them on hardware the town already owns. AI handling the grunt work on the code side made building faster than buying.`,
    details: [
      "One intake form drives onboarding and offboarding across eight systems, with every action logged",
      "Equipment tracking with signed equipment forms generated for HR",
      "Central internal document platform as the single system of record",
      'Document intelligence: entity cross-referencing and ordinance/resolution relationships (amends, repeals), groundwork for a municipal codebook',
      "Public records portal (records.edgewood-nm.gov) where AI suggests past requests that may already answer yours",
      "Clerk's IPRA fulfillment tools: one action emails the requester and publishes to the portal",
      "AI assistant on edgewood-nm.gov, reconciled hourly against the live site",
      'Local-first AI on mirrored DGX Sparks (open-weights model, load balancing, session pinning), with cloud failover only for IPRA-releasable data',
      'Spreadsheets turned into apps: a bill-tracking kanban for Finance, a training-hours tracker for the PD',
    ],
    link: 'https://records.edgewood-nm.gov',
    linkLabel: 'Visit the records portal',
    status: 'In Production',
  },
  {
    id: 'local-ai',
    category: 'Infrastructure',
    title: 'Local AI Infrastructure',
    subtitle: 'Production LLMs, zero cloud dependency',
    description: `Running large language models shouldn't require sending your data to someone else's servers. I built a local AI infrastructure stack on an NVIDIA DGX Spark with 128GB of unified memory. vLLM for inference, custom orchestration, and the kind of performance that makes cloud APIs look expensive and slow.`,
    details: [
      'NVIDIA DGX Spark with Grace CPU and 128GB unified memory',
      'vLLM inference server with multiple model support',
      'Open WebUI for team access and prompt management',
      'k3s cluster for orchestration and scaling',
      'Docker-based deployment pipeline',
      'Models: Qwen, DeepSeek, Devstral, and custom fine-tunes',
      'dgate: a cache-aware admission gate so agents take turns and interactive requests never wait behind them',
      'Lossless engine tuning: about 7% faster decode and half a second off every follow-up, verified bit-identical',
    ],
    link: null,
    linkLabel: null,
    status: 'Running',
  },
  {
    id: "millwright",
    category: "Agentic Platform",
    title: "Millwright",
    subtitle: "Describe an internal app; an agent assembles it safely",
    description: "Internal tools run every organization, and AI agents can now build them from a prompt, but nobody can say for sure where the data goes. Millwright's agent builds only from prebuilt, security-reviewed components, and a deterministic data-flow gate traces every restricted value before anything deploys. A live canvas shows the architecture and the data moving through it.",
    details: [
      "Prompt to working app in one to one and a half minutes on a self-hosted model",
      "A data-flow gate the agent can't talk its way past, covering renamed fields, custom code and later versions",
      "The agent never holds keys: a separate broker makes every outbound call, and the builder sets every destination",
      "Custom code runs in a WebAssembly sandbox with independent model review and builder confirmation",
      "Hardened through five adversarial review rounds, each finding reproduced as a failing test before the fix",
      "AGPL-3.0, early: product or open-source project still undecided",
    ],
    link: null,
    linkLabel: null,
    status: "Early Build",
  },
  {
    id: "caretaker",
    category: "Autonomous Operations",
    title: "Caretaker",
    subtitle: "A maintenance agent that earns its authority",
    description: "Caretaker watches my servers, AI hardware, public sites and repositories. It fixes known problems on its own, keeps things patched, and proposes improvements, but it asks before deploying anything it isn't already trusted to do. Every approval I give joins a ledger, and that ledger is how its standing authority grows.",
    details: [
      "A patrol with no AI in it probes everything every 15 minutes",
      "Fixes come only from a written playbook: one attempt per incident, then it escalates",
      "Claude triages every few hours and runs a weekly security and improvement pass",
      "Hard fences on money, outbound actions, the AI serving layer, reboots, credentials and data deletion",
      "Reaches me by desktop notification, push or email depending on where I am; approvals need a one-time code",
    ],
    link: null,
    linkLabel: null,
    status: "In Production",
  },
  {
    id: "agent-hosting",
    category: "Infrastructure",
    title: "Agent-Operated Hosting",
    subtitle: "Replacing cPanel and WHMCS with hosting my agent runs",
    description: "I host about a dozen sites, most for paying clients. I'm replacing the reseller stack with my own hosting, run by my AI agent on a server I already pay for, with Cloudflare at the edge and Stripe for billing. Every protection lives in code, not in the model's judgment. Leaving the old hosts retires about $1,200 a year in bills.",
    details: [
      "The agent acts only through a narrow control API: update, scan, snapshot, restore, quarantine, read logs",
      "Healing means restoring a clean snapshot, not hand-patching",
      "Site content is treated as hostile input: scanners first, then a quarantined model with no tools or memory",
      "Sensors contain a compromised site in seconds with no AI involved",
      "Performance matched with nginx FastCGI caching, Redis and Cloudflare; a live store is the pilot",
    ],
    link: null,
    linkLabel: null,
    status: "In Progress",
  },
];

// Which world-engine scene each project section belongs to (observed as it crosses mid-viewport).
const WORK_WORLD: Record<string, WorldName> = {
  'meridian-money': 'envelopes',
  smis: 'radar',
  'edgewood-tools': 'mesa',
  'local-ai': 'homelab',
  millwright: 'blueprint',
  caretaker: 'lattice',
  'agent-hosting': 'intake',
};

export default function WorkPage() {
  return (
    <div id="page-work" className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
            Selected Work
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-6">
            Building things that matter
          </h1>
          <p className="font-sans text-lg text-charcoal/70 dark:text-dark-muted max-w-2xl leading-relaxed">
            I don&apos;t build demos. Everything here is either live, in production, or actively being used to solve real problems for real people.
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-20">
          {projects.map((project, i) => (
            <article key={project.id} id={project.id} data-world={WORK_WORLD[project.id]} className="scroll-mt-24">
              {/* Divider (not on first) */}
              {i > 0 && (
                <div className="mb-12 border-t border-stone-dark/20 dark:border-dark-border/20" />
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise">
                    {project.category}
                  </p>
                  <span className="text-xs font-sans px-2 py-0.5 bg-stone/50 dark:bg-dark-border/30 text-charcoal/50 dark:text-dark-muted rounded-full">
                    {project.status}
                  </span>
                </div>

                <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-2">
                  {project.title}
                </h2>
                <p className="font-serif text-lg italic text-charcoal/50 dark:text-dark-muted mb-6">
                  {project.subtitle}
                </p>

                <p className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed mb-8 text-lg">
                  {project.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {project.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 bg-turquoise rounded-full flex-shrink-0" />
                      <span className="font-sans text-sm text-charcoal/60 dark:text-dark-muted">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center font-sans text-sm text-turquoise hover:underline"
                  >
                    {project.linkLabel} &rarr;
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
