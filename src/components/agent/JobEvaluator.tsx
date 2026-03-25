'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgent } from '@/context/AgentProvider';

// ── Types ──────────────────────────────────────────────

type EvalPhase = 'input' | 'streaming' | 'complete';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt';

// ── Component ──────────────────────────────────────────

export default function JobEvaluator() {
  const { sessionId } = useAgent();
  const [phase, setPhase] = useState<EvalPhase>('input');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evaluation, setEvaluation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!jobDescription.trim() && !selectedFile) return;

    setPhase('streaming');
    setEvaluation('');
    setError(null);

    try {
      let res: Response;

      if (selectedFile) {
        // File upload path
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (sessionId) formData.append('session_id', sessionId);

        res = await fetch('/api/agent/evaluate', {
          method: 'POST',
          body: formData,
        });
      } else {
        // JSON text path
        res = await fetch('/api/agent/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_description: jobDescription.trim(),
            session_id: sessionId,
          }),
        });
      }

      if (!res.ok || !res.body) {
        setError('Failed to reach the evaluation service. Please try again.');
        setPhase('input');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === 'text' && parsed.content) {
              accumulated += parsed.content;
              setEvaluation(accumulated);
            }
          } catch {
            // skip malformed SSE chunks
          }
        }
      }

      if (!accumulated) {
        setError('No evaluation received. Please try again.');
        setPhase('input');
        return;
      }

      setPhase('complete');
    } catch {
      setError('Connection lost. Please try again.');
      setPhase('input');
    }
  }, [jobDescription, selectedFile, sessionId]);

  const handleReset = useCallback(() => {
    setPhase('input');
    setJobDescription('');
    setSelectedFile(null);
    setEvaluation('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const canSubmit = (jobDescription.trim().length > 0 || selectedFile !== null) && phase === 'input';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-turquoise/10 mb-4"
        >
          <span className="text-2xl">🎯</span>
        </motion.div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream mb-2">
          Job Fit Evaluation
        </h2>
        <p className="font-sans text-sm sm:text-base text-charcoal/60 dark:text-dark-muted max-w-lg mx-auto">
          Paste a job description or upload a file. Reader will give you an honest assessment
          of whether James is a good fit — strengths, gaps, and all.
        </p>
      </div>

      {/* Input Phase */}
      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Textarea */}
            <div className="relative mb-4">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={8}
                disabled={!!selectedFile}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-sans leading-relaxed
                  resize-y min-h-[160px] max-h-[400px] outline-none transition-all duration-200
                  bg-white dark:bg-dark-surface
                  text-charcoal dark:text-dark-text
                  placeholder:text-charcoal/40 dark:placeholder:text-dark-muted/60
                  ${selectedFile
                    ? 'border-stone-dark/10 dark:border-dark-border/10 opacity-50 cursor-not-allowed'
                    : 'border-stone-dark/30 dark:border-dark-border/40 focus:border-turquoise/60 focus:ring-1 focus:ring-turquoise/20'
                  }`}
              />

              {/* Character count */}
              {jobDescription.length > 0 && !selectedFile && (
                <span className="absolute bottom-3 right-3 text-[10px] font-sans text-charcoal/30 dark:text-dark-muted/40">
                  {jobDescription.length.toLocaleString()} chars
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-stone-dark/20 dark:bg-dark-border/20" />
              <span className="text-xs font-sans text-charcoal/40 dark:text-dark-muted/50">or</span>
              <div className="h-px flex-1 bg-stone-dark/20 dark:bg-dark-border/20" />
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-turquoise/30 bg-turquoise/5 dark:bg-turquoise/10">
                  <svg className="w-5 h-5 text-turquoise shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-charcoal dark:text-cream truncate">{selectedFile.name}</p>
                    <p className="text-[10px] font-sans text-charcoal/40 dark:text-dark-muted/50">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 rounded-lg hover:bg-stone/50 dark:hover:bg-dark-surface/50 transition-colors text-charcoal/40 dark:text-dark-muted hover:text-charcoal dark:hover:text-cream"
                    aria-label="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={jobDescription.trim().length > 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed
                    transition-all duration-200 font-sans text-sm
                    ${jobDescription.trim().length > 0
                      ? 'border-stone-dark/10 dark:border-dark-border/10 text-charcoal/20 dark:text-dark-muted/20 cursor-not-allowed'
                      : 'border-stone-dark/30 dark:border-dark-border/40 text-charcoal/50 dark:text-dark-muted hover:border-turquoise/50 hover:text-turquoise hover:bg-turquoise/5 cursor-pointer'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload PDF, DOCX, or TXT
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-sans text-red-500 dark:text-red-400 mb-4 text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl font-sans text-sm font-medium transition-all duration-200
                bg-turquoise text-white
                hover:bg-turquoise-dim
                disabled:opacity-30 disabled:cursor-not-allowed
                active:scale-[0.98]"
            >
              Evaluate Fit
            </button>
          </motion.div>
        )}

        {/* Streaming / Complete Phase */}
        {(phase === 'streaming' || phase === 'complete') && (
          <motion.div
            key="result"
            ref={resultRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* What was submitted */}
            <div className="mb-4 px-4 py-3 rounded-xl bg-turquoise/10 border border-turquoise/20">
              <p className="text-xs font-sans text-turquoise font-medium mb-1">Evaluating</p>
              <p className="text-sm font-sans text-charcoal dark:text-dark-text line-clamp-2">
                {selectedFile ? `📄 ${selectedFile.name}` : jobDescription.slice(0, 150) + (jobDescription.length > 150 ? '…' : '')}
              </p>
            </div>

            {/* Evaluation result */}
            <div className="rounded-xl border border-stone-dark/20 dark:border-dark-border/30
              bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm px-5 py-4
              max-h-[60vh] overflow-y-auto scrollbar-thin">
              {evaluation ? (
                <div className="prose-agent text-sm leading-relaxed text-charcoal dark:text-dark-text">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{evaluation}</ReactMarkdown>
                  {phase === 'streaming' && (
                    <motion.span
                      className="inline-block w-0.5 h-4 bg-turquoise ml-0.5 align-text-bottom"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 py-4">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 rounded-full bg-turquoise/60"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1, 0.85] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-sans text-charcoal/50 dark:text-dark-muted">
                    Analyzing the job description…
                  </span>
                </div>
              )}
            </div>

            {/* Actions after completion */}
            {phase === 'complete' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex flex-col sm:flex-row items-center gap-3"
              >
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-sans text-sm font-medium
                    border border-stone-dark/30 dark:border-dark-border/40
                    text-charcoal/70 dark:text-dark-muted
                    hover:border-turquoise/50 hover:text-turquoise
                    transition-all duration-200"
                >
                  Evaluate Another
                </button>
              </motion.div>
            )}

            {/* Error during streaming */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-sans text-red-500 dark:text-red-400 mt-4 text-center"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
