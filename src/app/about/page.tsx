import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'James Reader: IT Director, AI engineer, and entrepreneur. 20+ years building infrastructure and solving problems that matter.',
};

const timeline = [
  {
    period: '2024 - Present',
    role: 'IT Director',
    org: 'Town of Edgewood, NM',
    description: 'Leading the technology strategy for a growing New Mexico municipality. Modernizing government IT from the ground up.',
  },
  {
    period: '2021 - 2024',
    role: 'IT Manager',
    org: 'International Protective Service (IPS)',
    description: 'Managed IT operations for a global security services provider. Infrastructure, cybersecurity, and systems management across international operations.',
  },
  {
    period: '2018 - 2021',
    role: 'Systems Engineer',
    org: 'DocTech',
    description: 'Full-stack generalist at a managed services provider. Hands-on with everything from network architecture to client-facing support across diverse environments.',
  },
  {
    period: '2014 - Present',
    role: 'IT Consultant',
    org: 'Reader & Associates',
    description: 'Running a consulting practice serving small businesses and government organizations across New Mexico. Network design, cloud migrations, and AI solutions.',
  },
  {
    period: '2016 - 2018',
    role: 'Adjunct Professor',
    org: 'NMSU Grants',
    description: 'Teaching computer science courses. Bridging the gap between academic fundamentals and real-world IT practice.',
  },
];

const skills = [
  { category: 'AI & Machine Learning', items: ['LLMs', 'RAG Pipelines', 'vLLM', 'Fine-tuning', 'Prompt Engineering', 'Vector Databases'] },
  { category: 'Languages & Frameworks', items: ['Python', 'TypeScript', 'Next.js', 'React', 'FastAPI', 'Node.js'] },
  { category: 'Infrastructure', items: ['Docker', 'k3s/Kubernetes', 'Linux', 'NVIDIA DGX', 'Networking', 'Cybersecurity'] },
  { category: 'Cloud & DevOps', items: ['AWS', 'Azure', 'Coolify', 'CI/CD', 'Terraform', 'Monitoring'] },
];

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-3">
            About
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-8">
            The human behind the systems
          </h1>
        </div>

        {/* Photo + Intro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          {/* Photo placeholder */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] bg-stone dark:bg-dark-surface rounded-lg flex items-center justify-center border border-stone-dark/20 dark:border-dark-border/30">
              <div className="text-center">
                <p className="font-serif text-6xl text-charcoal/20 dark:text-dark-muted/30">JR</p>
                <p className="font-sans text-xs text-charcoal/30 dark:text-dark-muted/50 mt-2">Photo coming soon</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <div className="font-sans text-lg text-charcoal/80 dark:text-dark-text leading-relaxed space-y-6">
              <p>
                I&apos;ve been building and fixing technology for over twenty years. Not the kind of building where you push pixels around in Figma. The kind where you crawl under desks, debug production at 2 AM, and figure out why a network serving 500 people just went dark.
              </p>
              <p>
                That foundation matters. When I build AI systems now, I build them the way I build infrastructure: resilient, practical, and designed to work when nobody is watching.
              </p>
              <p>
                I&apos;m currently the IT Director for the Town of Edgewood, New Mexico. Before that, I managed IT for International Protective Service, a global security provider operating across multiple countries. Before that, I was a systems engineer at an MSP, and I&apos;ve been running my own consulting practice since 2014. I also taught CS at NMSU Grants. Each role taught me something different about what technology owes the people who depend on it.
              </p>
              <p>
                Outside of work, I&apos;m building{' '}
                <a href="https://meridianmoney.app" className="text-turquoise hover:underline" target="_blank" rel="noopener noreferrer">
                  Meridian Money
                </a>
                , running LLMs on local hardware, and trying to prove that one person with the right tools can build things that used to take a team of twenty.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-10">
            Career
          </h2>
          <div className="space-y-8">
            {timeline.map((item) => (
              <div key={item.period} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <p className="font-sans text-sm text-turquoise font-medium">{item.period}</p>
                </div>
                <div className="md:col-span-3">
                  <h3 className="font-sans font-semibold text-charcoal dark:text-cream">{item.role}</h3>
                  <p className="font-sans text-sm text-charcoal/50 dark:text-dark-muted mb-2">{item.org}</p>
                  <p className="font-sans text-sm text-charcoal/70 dark:text-dark-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-20">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-cream mb-10">
            What I work with
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {skills.map((group) => (
              <div key={group.category}>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-4">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="font-sans text-sm px-3 py-1.5 bg-stone/50 dark:bg-dark-border/30 text-charcoal/70 dark:text-dark-muted rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="border-t border-stone-dark/20 dark:border-dark-border/20 pt-10">
          <p className="font-sans text-charcoal/60 dark:text-dark-muted leading-relaxed">
            Based in Moriarty, New Mexico. Available for consulting, collaboration, and interesting problems.
            <br />
            <a href="mailto:james@swds.biz" className="text-turquoise hover:underline">
              james@swds.biz
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
