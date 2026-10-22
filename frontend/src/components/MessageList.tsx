import { isValidElement, useEffect, useRef, useState, type ReactNode } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../api/types';
import { Icon } from './Icon';

export function MessageList({ messages }: { messages: Message[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // Follow the answer as it streams in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, last?.content]);

  return (
    <div className="messages">
      {messages.map((m) =>
        m.role === 'USER' ? (
          <div key={m.id} className="msg msg--user">
            <div className="msg__bubble">{m.content}</div>
          </div>
        ) : (
          <div key={m.id} className={`msg msg--assistant${m.status === 'FAILED' ? ' msg--failed' : ''}`}>
            <div className="msg__head">
              <span className="msg__avatar" aria-hidden="true">
                <Icon name="sparkle" size={18} />
              </span>
              <span className="msg__name">chatAI</span>
            </div>
            <div className="msg__body">
              {m.status === 'STREAMING' && !m.content ? (
                <span className="typing" aria-label="Thinking">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <div className="markdown">
                  <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {m.content}
                  </Markdown>
                </div>
              )}
              {m.status === 'FAILED' && <p className="msg__error">The answer could not be completed.</p>}
              {m.citations && m.citations.length > 0 && (
                <div className="citations">
                  <span className="citations__label">Sources</span>
                  {m.citations.map((c, i) => (
                    <a key={i} href={c.url} className="chip chip--link" target="_blank" rel="noreferrer">
                      [{i + 1}] {c.title}
                    </a>
                  ))}
                </div>
              )}
              {m.status === 'COMPLETE' && m.content && (
                <div className="msg__actions">
                  <CopyButton text={m.content} label="Copy answer" />
                </div>
              )}
            </div>
          </div>
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}

// Fenced code gets a header with its language and a Copy button.
const markdownComponents: Components = {
  pre({ children }) {
    const code = isValidElement<{ className?: string; children?: ReactNode }>(children) ? children.props : undefined;
    const language = /language-(\S+)/.exec(code?.className ?? '')?.[1];
    return (
      <div className="code">
        <div className="code__header">
          <span>{language ?? 'code'}</span>
          <CopyButton text={String(code?.children ?? '').replace(/\n$/, '')} label="Copy code" variant="text" />
        </div>
        <pre>{children}</pre>
      </div>
    );
  },
};

function CopyButton({ text, label, variant = 'icon' }: { text: string; label: string; variant?: 'icon' | 'text' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context / permissions): nothing to do
    }
  };
  return variant === 'text' ? (
    <button className="text-button" onClick={copy} aria-label={label}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  ) : (
    <button className="icon-button" onClick={copy} aria-label={label} title={copied ? 'Copied' : label}>
      <Icon name={copied ? 'check' : 'copy'} size={18} />
    </button>
  );
}
