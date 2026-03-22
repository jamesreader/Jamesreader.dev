"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentContext } from '@/context/AgentProvider'

interface Annotation {
  id: string
  content: string
  section: string
  cta?: {
    text: string
    action: () => void
  }
}

// Section navigation dots
const SECTIONS = [
  { id: 'hero', label: 'Top' },
  { id: 'projects', label: 'Projects' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'story', label: 'Story' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'consulting', label: 'Consulting' },
]

export default function FloatingGuide() {
  const { intent } = useAgentContext()
  const [currentSection, setCurrentSection] = useState('hero')
  const [showSectionNav, setShowSectionNav] = useState(false)
  const [annotation, setAnnotation] = useState<Annotation | null>(null)
  const [isLoadingAnnotation, setIsLoadingAnnotation] = useState(false)

  // Track scroll position and current section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      // Show section nav after scrolling past hero
      setShowSectionNav(scrollY > windowHeight * 0.3)

      // Determine current section based on scroll position
      const sections = SECTIONS.slice(1) // Skip 'hero'
      let current = 'hero'
      
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= windowHeight * 0.4) {
            current = section.id
          }
        }
      }

      if (current !== currentSection) {
        setCurrentSection(current)
        // Trigger annotation when entering a new section
        if (current !== 'hero') {
          requestAnnotation(current, scrollY)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentSection])

  const requestAnnotation = async (sectionId: string, scrollY: number) => {
    if (isLoadingAnnotation) return

    try {
      setIsLoadingAnnotation(true)
      
      // Calculate scroll depth within the section
      const sectionElement = document.getElementById(sectionId)
      let scrollDepth = 0
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect()
        const sectionTop = scrollY + rect.top
        const sectionHeight = rect.height
        const sectionScroll = Math.max(0, scrollY - sectionTop)
        scrollDepth = Math.min(1, sectionScroll / sectionHeight)
      }

      const response = await fetch('/api/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: sectionId,
          intent,
          scroll_depth: scrollDepth,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.annotation) {
          setAnnotation({
            id: `${sectionId}-${Date.now()}`,
            content: data.annotation,
            section: sectionId,
            cta: {
              text: "Ask Reader",
              action: () => {
                // Open chat with context
                const chatButton = document.querySelector('[data-chat-toggle]') as HTMLElement
                if (chatButton) {
                  chatButton.click()
                }
                // TODO: Pre-fill chat input with section-specific question
              }
            }
          })
          
          // Auto-dismiss after 8 seconds
          setTimeout(() => {
            setAnnotation(prev => prev?.id === `${sectionId}-${Date.now()}` ? null : prev)
          }, 8000)
        }
      }
    } catch (error) {
      console.error('Failed to fetch annotation:', error)
    } finally {
      setIsLoadingAnnotation(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Section Navigation - Left side */}
      <AnimatePresence>
        {showSectionNav && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
          >
            <nav className="flex flex-col gap-3">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`
                    group relative w-3 h-3 rounded-full transition-all duration-200
                    ${currentSection === section.id
                      ? 'bg-turquoise-400 scale-125'
                      : 'bg-charcoal-200 hover:bg-turquoise-300'
                    }
                  `}
                  title={section.label}
                >
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap
                    text-sm text-charcoal-600 opacity-0 group-hover:opacity-100
                    transition-opacity duration-200 pointer-events-none">
                    {section.label}
                  </span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotations - Right side desktop, bottom mobile */}
      <AnimatePresence>
        {annotation && (
          <>
            {/* Desktop annotation */}
            <motion.div
              key={annotation.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block max-w-xs"
            >
              <div className="bg-cream-50 border border-turquoise-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-turquoise-400 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-700 leading-relaxed mb-3">
                      {annotation.content}
                    </p>
                    {annotation.cta && (
                      <button
                        onClick={annotation.cta.action}
                        className="text-xs text-turquoise-600 hover:text-turquoise-700 
                          font-medium transition-colors"
                      >
                        {annotation.cta.text} →
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setAnnotation(null)}
                    className="text-charcoal-400 hover:text-charcoal-600 text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Mobile annotation - bottom toast */}
            <motion.div
              key={`mobile-${annotation.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-4 right-4 z-40 lg:hidden"
            >
              <div className="bg-cream-50 border border-turquoise-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-turquoise-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-700 leading-relaxed mb-2">
                      {annotation.content}
                    </p>
                    {annotation.cta && (
                      <button
                        onClick={annotation.cta.action}
                        className="text-xs text-turquoise-600 hover:text-turquoise-700 
                          font-medium transition-colors"
                      >
                        {annotation.cta.text} →
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setAnnotation(null)}
                    className="text-charcoal-400 hover:text-charcoal-600 text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}