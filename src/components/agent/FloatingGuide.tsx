"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgent } from '@/context/AgentProvider'

interface Annotation {
  id: string
  content: string
  section: string
}

const SECTIONS = [
  { id: 'hero', label: 'Top' },
  { id: 'projects', label: 'Projects' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'story', label: 'Story' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'consulting', label: 'Consulting' },
]

export default function FloatingGuide() {
  const { intent, isOpen, setIsOpen } = useAgent()
  const [currentSection, setCurrentSection] = useState('hero')
  const [showSectionNav, setShowSectionNav] = useState(false)
  const [annotation, setAnnotation] = useState<Annotation | null>(null)
  const [isLoadingAnnotation, setIsLoadingAnnotation] = useState(false)
  const lastAnnotatedSection = useRef<string>('')
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const requestAnnotation = useCallback(async (sectionId: string) => {
    if (isLoadingAnnotation || sectionId === lastAnnotatedSection.current) return
    lastAnnotatedSection.current = sectionId

    try {
      setIsLoadingAnnotation(true)

      const sectionElement = document.getElementById(sectionId)
      let scrollDepth = 0
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect()
        const sectionTop = window.scrollY + rect.top
        const sectionScroll = Math.max(0, window.scrollY - sectionTop)
        scrollDepth = Math.min(1, sectionScroll / rect.height)
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
          const newId = `${sectionId}-${Date.now()}`
          setAnnotation({
            id: newId,
            content: data.annotation,
            section: sectionId,
          })

          // Auto-dismiss after 10 seconds
          if (dismissTimer.current) clearTimeout(dismissTimer.current)
          dismissTimer.current = setTimeout(() => {
            setAnnotation(prev => prev?.id === newId ? null : prev)
          }, 10000)
        }
      }
    } catch (error) {
      console.error('Failed to fetch annotation:', error)
    } finally {
      setIsLoadingAnnotation(false)
    }
  }, [isLoadingAnnotation, intent])

  // Track scroll position and current section
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const windowHeight = window.innerHeight

        setShowSectionNav(scrollY > windowHeight * 0.3)

        const sections = SECTIONS.slice(1)
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
          if (current !== 'hero') {
            requestAnnotation(current)
          }
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentSection, requestAnnotation])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openChat = () => {
    if (!isOpen) setIsOpen(true)
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
            className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3"
          >
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="group relative flex items-center"
                title={section.label}
              >
                <span
                  className={`
                    block rounded-full transition-all duration-300
                    ${currentSection === section.id
                      ? 'w-3 h-3 bg-turquoise shadow-md shadow-turquoise/30'
                      : 'w-2 h-2 bg-charcoal/20 dark:bg-cream/20 group-hover:bg-turquoise/60'
                    }
                  `}
                />
                <span className="absolute left-7 whitespace-nowrap text-xs font-sans
                  text-charcoal/60 dark:text-cream/60 opacity-0 group-hover:opacity-100
                  transition-opacity duration-200 pointer-events-none">
                  {section.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotations */}
      <AnimatePresence mode="wait">
        {annotation && (
          <>
            {/* Desktop — right side floating card */}
            <motion.div
              key={annotation.id}
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block max-w-[280px]"
            >
              <div className="relative bg-charcoal/95 dark:bg-dark-surface/95 backdrop-blur-sm
                border border-turquoise/20 rounded-xl p-5 shadow-2xl shadow-turquoise/5">
                {/* Turquoise accent line */}
                <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-turquoise/60 to-transparent" />
                
                <p className="text-sm text-cream/90 dark:text-cream/90 leading-relaxed mb-4 font-sans">
                  {annotation.content}
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={openChat}
                    className="text-xs text-turquoise hover:text-turquoise-dim font-medium 
                      transition-colors font-sans flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    Ask Reader
                  </button>
                  <button
                    onClick={() => setAnnotation(null)}
                    className="text-cream/30 hover:text-cream/60 transition-colors text-xs"
                  >
                    dismiss
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Mobile — bottom toast */}
            <motion.div
              key={`mobile-${annotation.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 left-4 right-4 z-40 lg:hidden"
            >
              <div className="bg-charcoal/95 dark:bg-dark-surface/95 backdrop-blur-sm
                border border-turquoise/20 rounded-xl p-4 shadow-2xl">
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-turquoise/60 to-transparent" />
                <p className="text-sm text-cream/90 leading-relaxed mb-3 font-sans">
                  {annotation.content}
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={openChat}
                    className="text-xs text-turquoise hover:text-turquoise-dim font-medium transition-colors font-sans"
                  >
                    Ask Reader →
                  </button>
                  <button
                    onClick={() => setAnnotation(null)}
                    className="text-cream/30 hover:text-cream/60 transition-colors text-xs"
                  >
                    dismiss
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