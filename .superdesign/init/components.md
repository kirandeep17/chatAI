# Components

Stack: React 19 + TypeScript + Vite, React Router 8, TanStack Query, react-markdown + remark-gfm. No component library; vanilla CSS in `src/styles/app.css` (BEM-ish class names). Icons are inline SVG paths in `Icon.tsx`.

### `frontend/src/components/Icon.tsx`

```tsx
const paths = {
  chevronRight: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUpDown: 'M8 9l4-4 4 4M16 15l-4 4-4-4',
  plus: 'M12 5v14M5 12h14',
  send: 'M12 19V5M5 12l7-7 7 7',
  stop: 'M7 7h10v10H7z',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  sidebar: 'M4 5h16v14H4zM9 5v14',
  check: 'M5 12l5 5 9-10',
  chat: 'M4 5h16v11H8l-4 4z',
  signOut: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  box: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
```

### `frontend/src/components/Composer.tsx`

```tsx
import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

interface Props {
  placeholder: string;
  streaming: boolean;
  disabled?: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ placeholder, streaming, disabled, onSend, onStop }: Props) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow with content up to the CSS max-height.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const submit = () => {
    const value = text.trim();
    if (!value || streaming || disabled) return;
    onSend(value);
    setText('');
  };

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={ref}
        rows={1}
        value={text}
        placeholder={placeholder}
        aria-label="Message"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        autoFocus
      />
      {streaming ? (
        <button type="button" className="composer__button" onClick={onStop} aria-label="Stop generating">
          <Icon name="stop" />
        </button>
      ) : (
        <button type="submit" className="composer__button" disabled={!text.trim() || disabled} aria-label="Send">
          <Icon name="send" />
        </button>
      )}
    </form>
  );
}
```

### `frontend/src/components/MessageList.tsx`

```tsx
import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../api/types';

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
            <span className="msg__avatar" aria-hidden="true">
              ◆
            </span>
            <div className="msg__body">
              {m.status === 'STREAMING' && !m.content ? (
                <span className="typing" aria-label="Thinking">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <div className="markdown">
                  <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                </div>
              )}
              {m.status === 'FAILED' && <p className="msg__error">The answer could not be completed.</p>}
              {m.citations && m.citations.length > 0 && (
                <div className="citations">
                  <span>Sources</span>
                  {m.citations.map((c, i) => (
                    <a key={i} href={c.url} className="citation" target="_blank" rel="noreferrer">
                      [{i + 1}] {c.title}
                    </a>
                  ))}
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
```

### `frontend/src/components/ClientSwitcher.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Client } from '../api/types';
import { Icon, initials } from './Icon';

export function ClientSwitcher({ clients, current }: { clients: Client[]; current?: Client }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="client-switcher" ref={ref}>
      <button
        className="client-switcher__button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="avatar avatar--client">{current ? initials(current.name) : '?'}</span>
        <span className="client-switcher__text">
          <span className="client-switcher__label">Client</span>
          <span className="client-switcher__name">{current?.name ?? 'Select a client'}</span>
        </span>
        <Icon name="chevronUpDown" />
      </button>
      {open && (
        <ul className="menu" role="listbox" aria-label="Clients">
          {clients.map((c) => (
            <li key={c.id}>
              <button
                role="option"
                aria-selected={c.id === current?.id}
                className="menu__item"
                onClick={() => {
                  setOpen(false);
                  navigate(`/c/${c.id}`);
                }}
              >
                <span className="avatar avatar--client avatar--sm">{initials(c.name)}</span>
                <span className="menu__text">
                  {c.name}
                  <small>
                    {c.products.length} product{c.products.length === 1 ? '' : 's'}
                  </small>
                </span>
                {c.id === current?.id && <Icon name="check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### `frontend/src/components/UserCard.tsx`

```tsx
import type { Entitlements } from '../api/types';
import { clearToken } from '../auth/token';
import { Icon, initials } from './Icon';

export function UserCard({ user }: { user: Entitlements }) {
  return (
    <div className="user-card">
      <span className="avatar avatar--user">{initials(user.displayName)}</span>
      <span className="user-card__text">
        <span className="user-card__name">{user.displayName}</span>
        <span className="user-card__email">{user.email}</span>
      </span>
      <button className="icon-button user-card__signout" onClick={clearToken} aria-label="Sign out" title="Sign out">
        <Icon name="signOut" />
      </button>
    </div>
  );
}
```

### `frontend/src/components/ProductPicker.tsx`

```tsx
import { Link, useParams } from 'react-router';
import { useScopeNames } from '../hooks/queries';
import { Icon } from './Icon';

/** Landing page for a client: choose which product to chat about. */
export function ProductPicker() {
  const { clientId } = useParams();
  const { client } = useScopeNames(clientId);
  if (!client) return <div className="center-note">You are not entitled to this client.</div>;

  return (
    <section className="picker">
      <h1>{client.name}</h1>
      <p>Choose a product to start a conversation.</p>
      <div className="picker__grid">
        {client.products.map((p) => (
          <Link key={p.id} to={`/c/${client.id}/p/${p.id}`} className="picker__card">
            <Icon name="box" size={20} />
            <span>{p.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### `frontend/src/components/TokenGate.tsx`

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError, api } from '../api/client';
import { setToken } from '../auth/token';
import { config } from '../config';
import { keys } from '../hooks/queries';

/** Sign-in screen: the user pastes a bearer token, the backend verifies it before any UI is shown. */
export function TokenGate() {
  const qc = useQueryClient();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    const token = value.trim().replace(/^Bearer\s+/i, '');
    if (!token || checking) return;
    setChecking(true);
    setError(null);
    try {
      const entitlements = await api.verifyToken(token);
      qc.setQueryData(keys.entitlements, entitlements);
      setToken(token);
    } catch (err) {
      setError(
        err instanceof ApiError && err.problem.status === 401
          ? 'This token is invalid or has expired.'
          : 'Could not verify the token. Please try again.',
      );
      setChecking(false);
    }
  };

  return (
    <div className="gate">
      <form
        className="gate__card"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="brand gate__brand">
          <span className="brand__logo">◆</span> chatAI
        </div>
        <h1>Sign in</h1>
        <p>Paste your bearer token to continue.</p>
        <label htmlFor="token" className="gate__label">
          Bearer token
        </label>
        <textarea
          id="token"
          className="gate__input"
          rows={4}
          value={value}
          spellCheck={false}
          autoComplete="off"
          autoFocus
          placeholder="eyJhbGciOi…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          aria-invalid={!!error}
          aria-describedby={error ? 'token-error' : undefined}
        />
        {error && (
          <p id="token-error" className="gate__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="gate__submit" disabled={!value.trim() || checking}>
          {checking ? 'Verifying…' : 'Continue'}
        </button>
        {config.useMocks && (
          <p className="gate__hint">
            Mock mode: use <code>demo-token</code>
          </p>
        )}
      </form>
    </div>
  );
}
```

