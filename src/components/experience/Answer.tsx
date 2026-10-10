'use client';

import { memo, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseAgentMessage } from '@/lib/parseAgentMessage';
import type { WorldApi, WorldName } from '@/components/world';
import rehypeTerms, { tagsIn } from './rehypeTerms';
import InlineCard from './InlineCard';

interface AnswerProps {
  content: string;
  /** The scene's own world; only its terms are wired. */
  world: WorldName | undefined;
  streaming: boolean;
  worldApi: Pick<WorldApi, 'setWorld' | 'swarmTo' | 'setFocus'>;
}

/** While streaming, hide a half-received content directive ("{{proj") so it never flashes as text. */
function stripPartialDirective(text: string): string {
  return text.replace(/\{\{?[^{}]*$/, '');
}

function TermSpan({
  tag,
  setFocus,
  children,
}: {
  tag: string;
  setFocus: (tag: string | null) => void;
  children: React.ReactNode;
}) {
  return (
    <span
      className="exp-term"
      tabIndex={0}
      data-term={tag}
      onPointerEnter={() => setFocus(tag)}
      onPointerLeave={() => setFocus(null)}
      onFocus={() => setFocus(tag)}
      onBlur={() => setFocus(null)}
    >
      {children}
    </span>
  );
}

/** Reader's answer as editorial type: markdown text with content-block cards inline at their position. */
function Answer({ content, world, streaming, worldApi }: AnswerProps) {
  const { setFocus } = worldApi;
  const blocks = useMemo(
    () => parseAgentMessage(streaming ? stripPartialDirective(content) : content),
    [content, streaming],
  );

  // Each focus tag is wired once per answer (first occurrence): text segment i excludes the
  // tags that earlier segments already wire.
  const excludeByBlock = useMemo(() => {
    const out: string[][] = [];
    const used = new Set<string>();
    for (const b of blocks) {
      out.push([...used]);
      if (world && b.type === 'text') tagsIn(world, b.value).forEach((t) => used.add(t));
    }
    return out;
  }, [blocks, world]);
  const components: Components = {
    span({ node, children, ...rest }) {
      const tag = (node?.properties as Record<string, unknown> | undefined)?.dataTerm;
      if (typeof tag === 'string') {
        return <TermSpan tag={tag} setFocus={setFocus}>{children}</TermSpan>;
      }
      return <span {...rest}>{children}</span>;
    },
    a({ node: _node, children, href, ...rest }) {
      const external = typeof href === 'string' && /^https?:\/\//.test(href);
      return (
        <a href={href} {...rest} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      );
    },
  };

  const lastTextIndex = blocks.reduce((acc, b, i) => (b.type === 'text' ? i : acc), -1);

  return (
    <div className="exp-answer">
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          const caretHere = streaming && i === blocks.length - 1;
          return (
            <div key={`t-${i}`} className="exp-answer-text" data-caret={caretHere ? '' : undefined}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={world ? [[rehypeTerms, { world, exclude: excludeByBlock[i] }]] : []}
                components={components}
              >
                {block.value}
              </ReactMarkdown>
              {/* With text, the caret is drawn by CSS after the last line (see experience.css). */}
              {caretHere && !block.value.trim() && <span className="exp-caret" aria-hidden="true" />}
            </div>
          );
        }
        return (
          <InlineCard key={`c-${block.contentType}-${i}`} block={block} live={streaming} world={worldApi} />
        );
      })}
      {/* Caret before any text arrives, or after a trailing card. */}
      {streaming && (blocks.length === 0 || lastTextIndex !== blocks.length - 1) && (
        <div className="exp-answer-text">
          <span className="exp-caret" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default memo(Answer);
