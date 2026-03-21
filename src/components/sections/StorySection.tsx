'use client';

import { motion } from 'framer-motion';

const chapters = [
  {
    period: 'The Foundation',
    headline: 'Twenty years under desks and in server rooms',
    text: 'I started building and fixing technology before cloud computing was a thing. Crawling under desks, debugging production at 2 AM, figuring out why a network serving 500 people just went dark. That foundation matters — when I build AI systems now, I build them like infrastructure: resilient, practical, designed to work when nobody is watching.',
  },
  {
    period: 'The Teaching Years',
    headline: 'NMSU Grants — bridging theory and practice',
    text: 'Teaching CS at a university taught me that the best technology is the kind people can actually understand and use. If you can\'t explain it clearly, you don\'t understand it well enough. That principle drives everything I build.',
  },
  {
    period: 'Government IT',
    headline: 'IT Director, Town of Edgewood',
    text: 'Running IT for a municipality means your systems affect real people — emergency services, public safety, daily operations. There\'s no "move fast and break things" when the thing you break is a 911 dispatch system. You learn to be thorough, secure by default, and obsessively reliable.',
  },
  {
    period: 'The Pivot',
    headline: 'From maintaining systems to building intelligent ones',
    text: 'AI changed everything. Suddenly, one person with the right tools and the right infrastructure could build things that used to require a team of twenty. I went from being the person who keeps the lights on to the person who builds the next generation of tools — and I brought twenty years of "what breaks" knowledge with me.',
  },
  {
    period: 'Now',
    headline: 'Proving the model',
    text: 'Running production LLMs on local hardware. Building AI products. Consulting for clients who need real solutions, not demos. Every project is proof that deep infrastructure knowledge plus AI fluency is a combination the market desperately needs.',
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function StorySection() {
  return (
    <section id="story" className="py-20 md:py-28 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-turquoise mb-2">
            The Journey
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">
            How I got here
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-30px' }}
          className="space-y-12"
        >
          {chapters.map((chapter, i) => (
            <motion.div
              key={chapter.period}
              variants={item}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
                  <span className="w-6 h-6 rounded-full bg-turquoise/15 flex items-center justify-center text-xs font-bold text-turquoise font-sans">
                    {i + 1}
                  </span>
                  <p className="font-sans text-sm font-medium text-turquoise">{chapter.period}</p>
                </div>
              </div>
              <div className="md:col-span-3">
                <h3 className="font-serif text-xl font-bold text-charcoal dark:text-cream mb-3">
                  {chapter.headline}
                </h3>
                <p className="font-sans text-charcoal/70 dark:text-dark-muted leading-relaxed">
                  {chapter.text}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
