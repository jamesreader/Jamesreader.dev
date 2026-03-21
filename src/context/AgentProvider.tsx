'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────

export type Intent = 'consulting' | 'technical' | 'personal' | 'exploring';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

interface AgentState {
  intent: Intent | null;
  sessionId: string | null;
  conversationHistory: Message[];
  isOpen: boolean;
  isConnected: boolean;
  isStreaming: boolean;
  welcomeMessage: string | null;
}

interface AgentContextValue extends AgentState {
  setIntent: (intent: Intent) => void;
  setSessionId: (id: string) => void;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addMessage: (msg: Message) => void;
  updateLastAgentMessage: (content: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setWelcomeMessage: (msg: string) => void;
  clearSession: () => void;
  checkHealth: () => Promise<boolean>;
}

// ── Storage Keys ───────────────────────────────────────

const STORAGE_KEYS = {
  intent: 'reader_intent',
  sessionId: 'reader_session_id',
  history: 'reader_history',
  welcomeMessage: 'reader_welcome',
} as const;

// ── Helpers ────────────────────────────────────────────

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable or full — silently fail
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Context ────────────────────────────────────────────

const AgentContext = createContext<AgentContextValue | null>(null);

// ── Provider ───────────────────────────────────────────

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [intent, setIntentState] = useState<Intent | null>(null);
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [welcomeMessage, setWelcomeMessageState] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedIntent = safeGetItem(STORAGE_KEYS.intent) as Intent | null;
    const storedSessionId = safeGetItem(STORAGE_KEYS.sessionId);
    const storedHistory = safeGetItem(STORAGE_KEYS.history);
    const storedWelcome = safeGetItem(STORAGE_KEYS.welcomeMessage);

    if (storedIntent) setIntentState(storedIntent);
    if (storedSessionId) setSessionIdState(storedSessionId);
    if (storedWelcome) setWelcomeMessageState(storedWelcome);
    if (storedHistory) {
      try {
        setConversationHistory(JSON.parse(storedHistory));
      } catch {
        // corrupted — start fresh
      }
    }
    hydrated.current = true;
  }, []);

  // Persist intent
  const setIntent = useCallback((newIntent: Intent) => {
    setIntentState(newIntent);
    safeSetItem(STORAGE_KEYS.intent, newIntent);
  }, []);

  // Persist session ID
  const setSessionId = useCallback((id: string) => {
    setSessionIdState(id);
    safeSetItem(STORAGE_KEYS.sessionId, id);
  }, []);

  // Persist welcome message
  const setWelcomeMessage = useCallback((msg: string) => {
    setWelcomeMessageState(msg);
    safeSetItem(STORAGE_KEYS.welcomeMessage, msg);
  }, []);

  // Add message to history & persist
  const addMessage = useCallback((msg: Message) => {
    setConversationHistory((prev) => {
      const next = [...prev, msg];
      // Keep last 100 messages to avoid localStorage bloat
      const trimmed = next.slice(-100);
      safeSetItem(STORAGE_KEYS.history, JSON.stringify(trimmed));
      return trimmed;
    });
  }, []);

  // Update the content of the last agent message (for streaming)
  const updateLastAgentMessage = useCallback((content: string) => {
    setConversationHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last.role !== 'agent') return prev;
      const next = [...prev.slice(0, -1), { ...last, content }];
      safeSetItem(STORAGE_KEYS.history, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  const clearSession = useCallback(() => {
    setIntentState(null);
    setSessionIdState(null);
    setConversationHistory([]);
    setWelcomeMessageState(null);
    setIsOpen(false);
    Object.values(STORAGE_KEYS).forEach(safeRemoveItem);
  }, []);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/agent/health');
      if (!res.ok) { setIsConnected(false); return false; }
      const data = await res.json();
      const ok = data?.status === 'ok';
      setIsConnected(ok);
      return ok;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  // Health check on mount & every 60s
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const value: AgentContextValue = {
    intent,
    sessionId,
    conversationHistory,
    isOpen,
    isConnected,
    isStreaming,
    welcomeMessage,
    setIntent,
    setSessionId,
    setIsOpen,
    toggleOpen,
    addMessage,
    updateLastAgentMessage,
    setIsStreaming,
    setWelcomeMessage,
    clearSession,
    checkHealth,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

// ── Hooks ──────────────────────────────────────────────

export function useAgent(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
}

export function useConversation() {
  const agent = useAgent();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || agent.isStreaming) return;

      // Add user message
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };
      agent.addMessage(userMsg);

      // Create placeholder for agent response
      const agentMsg: Message = {
        id: generateId(),
        role: 'agent',
        content: '',
        timestamp: Date.now(),
      };
      agent.addMessage(agentMsg);
      agent.setIsStreaming(true);

      try {
        const res = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            session_id: agent.sessionId,
            intent: agent.intent,
          }),
        });

        if (!res.ok || !res.body) {
          agent.updateLastAgentMessage('Sorry, I had trouble connecting. Please try again.');
          agent.setIsStreaming(false);
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
                agent.updateLastAgentMessage(accumulated);
              } else if (parsed.type === 'meta' && parsed.session_id) {
                agent.setSessionId(parsed.session_id);
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }

        if (!accumulated) {
          agent.updateLastAgentMessage("I didn't get a response. Please try again.");
        }
      } catch {
        agent.updateLastAgentMessage('Connection lost. Please try again.');
      } finally {
        agent.setIsStreaming(false);
      }
    },
    [agent],
  );

  const initSession = useCallback(
    async (selectedIntent: Intent) => {
      agent.setIntent(selectedIntent);

      try {
        const res = await fetch('/api/agent/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: selectedIntent }),
        });

        if (!res.ok) return;

        const data = await res.json();
        if (data.session_id) agent.setSessionId(data.session_id);
        if (data.welcome_message) {
          agent.setWelcomeMessage(data.welcome_message);
          // Add welcome as first agent message
          agent.addMessage({
            id: generateId(),
            role: 'agent',
            content: data.welcome_message,
            timestamp: Date.now(),
          });
        }
      } catch {
        // Session init failed — user can still browse
      }
    },
    [agent],
  );

  return {
    messages: agent.conversationHistory,
    isStreaming: agent.isStreaming,
    sendMessage,
    initSession,
  };
}
