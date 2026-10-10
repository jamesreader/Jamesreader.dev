'use client';

import { useState, type FormEvent } from 'react';

interface PromptBarProps {
  onAsk: (text: string) => void;
  streaming: boolean;
}

/** Reader's prompt, pinned to the bottom of the viewport (safe-area aware). */
export default function PromptBar({ onAsk, streaming }: PromptBarProps) {
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || streaming) return;
    onAsk(text);
    setValue('');
  };

  return (
    <form className="exp-prompt" onSubmit={submit} autoComplete="off" role="search" aria-label="Ask Reader">
      <span className={`exp-avatar${streaming ? ' exp-avatar--thinking' : ''}`} aria-hidden="true">
        R
      </span>
      <label htmlFor="exp-q" className="sr-only">
        Ask Reader about James&apos;s work
      </label>
      <input
        id="exp-q"
        name="q"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={streaming ? 'Reader is answering…' : 'Ask Reader, or pick a destination'}
        enterKeyHint="send"
        maxLength={2000}
        aria-describedby={streaming ? 'exp-q-busy' : undefined}
      />
      {streaming && (
        <span id="exp-q-busy" className="sr-only">
          Reader is still answering; you can type your next question now and send it when the answer finishes.
        </span>
      )}
      <button type="submit" disabled={streaming || !value.trim()}>
        Ask
      </button>
    </form>
  );
}
