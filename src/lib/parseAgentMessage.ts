// Content block parser — shared between StageView and ConversationThread
// Detects content directives in agent messages: {{project:smis}}, {{infra}}, etc.

export interface ParsedBlock {
  type: 'text' | 'content';
  value: string;
  contentType?: string;
  props?: Record<string, unknown>;
}

export function parseAgentMessage(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  // Match both {{type:data}} and {type:data} (some models use single braces)
  const pattern = /\{\{?(\w+)(?::([^}]*))?\}?\}/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Text before this block
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({ type: 'text', value: textBefore });
      }
    }

    const blockType = match[1];
    const blockData = match[2] || '';

    // Strip leading/trailing quotes and whitespace from data
    const cleanData = blockData.replace(/^[\s"']+|[\s"']+$/g, '').trim();

    switch (blockType) {
      case 'project':
        blocks.push({ type: 'content', value: cleanData, contentType: 'project', props: { projectId: cleanData.replace(/[- ]/g, (m) => m === ' ' ? '-' : m).toLowerCase() } });
        break;
      case 'infra':
        blocks.push({ type: 'content', value: 'infra', contentType: 'infra' });
        break;
      case 'stat': {
        const [value, label, context] = cleanData.split('|');
        blocks.push({ type: 'content', value: 'stat', contentType: 'stat', props: { value, label, context } });
        break;
      }
      case 'philosophy':
        blocks.push({ type: 'content', value: cleanData, contentType: 'philosophy', props: { quote: cleanData } });
        break;
      case 'cta':
        blocks.push({ type: 'content', value: 'cta', contentType: 'cta' });
        break;
      default:
        blocks.push({ type: 'text', value: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      blocks.push({ type: 'text', value: remaining });
    }
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', value: text }];
}
