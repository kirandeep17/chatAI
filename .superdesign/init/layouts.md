# Layouts

App shell = `Layout` (sidebar + `<main>` outlet). Sidebar = brand, ClientSwitcher, ProductList tree, UserCard. Below 768px the sidebar is an overlay with a scrim.

### `frontend/src/components/Layout.tsx`

```tsx
import { useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';
import { useEntitlements } from '../hooks/queries';
import { Icon } from './Icon';
import { Sidebar } from './Sidebar';

export function Layout() {
  const { clientId, productId, conversationId } = useParams();
  const { data: user, isLoading, error } = useEntitlements();
  const [sidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia('(max-width: 768px)').matches);

  if (isLoading) return <div className="center-note">Loading…</div>;
  if (error || !user) return <div className="center-note">Could not load your entitlements. {error?.message}</div>;
  if (user.clients.length === 0) return <div className="center-note">You don’t have access to any client yet.</div>;
  if (!clientId) return <Navigate to={`/c/${user.clients[0]!.id}`} replace />;

  return (
    <div className={`app${sidebarOpen ? '' : ' app--collapsed'}`}>
      {sidebarOpen && (
        <>
          <Sidebar
            user={user}
            clientId={clientId}
            productId={productId}
            conversationId={conversationId}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="scrim" onClick={() => setSidebarOpen(false)} />
        </>
      )}
      <main className="main">
        {!sidebarOpen && (
          <button className="icon-button main__open" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Icon name="sidebar" />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}
```

### `frontend/src/components/Sidebar.tsx`

```tsx
import type { Entitlements } from '../api/types';
import { ClientSwitcher } from './ClientSwitcher';
import { Icon } from './Icon';
import { ProductList } from './ProductList';
import { UserCard } from './UserCard';

interface Props {
  user: Entitlements;
  clientId?: string;
  productId?: string;
  conversationId?: string;
  onClose: () => void;
}

export function Sidebar({ user, clientId, productId, conversationId, onClose }: Props) {
  const client = user.clients.find((c) => c.id === clientId);
  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <div className="brand">
          <span className="brand__logo">◆</span> chatAI
          <button className="icon-button sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <Icon name="sidebar" />
          </button>
        </div>
        <ClientSwitcher clients={user.clients} current={client} />
      </div>

      <div className="sidebar__middle">
        {client ? (
          <ProductList
            key={client.id}
            client={client}
            activeProductId={productId}
            activeConversationId={conversationId}
            onNavigate={() => window.matchMedia('(max-width: 768px)').matches && onClose()}
          />
        ) : (
          <p className="tree__hint">Select a client to see its products.</p>
        )}
      </div>

      <div className="sidebar__bottom">
        <UserCard user={user} />
      </div>
    </aside>
  );
}
```

### `frontend/src/components/ProductList.tsx`

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { api } from '../api/client';
import type { Client, Conversation, Product } from '../api/types';
import { keys, useConversations } from '../hooks/queries';
import { Icon } from './Icon';

interface Props {
  client: Client;
  activeProductId?: string;
  activeConversationId?: string;
  onNavigate?: () => void;
}

export function ProductList({ client, activeProductId, activeConversationId, onNavigate }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(activeProductId ? [activeProductId] : []));

  // Opening a product (from anywhere) expands it in the tree.
  useEffect(() => {
    if (activeProductId) setExpanded((s) => (s.has(activeProductId) ? s : new Set(s).add(activeProductId)));
  }, [activeProductId]);

  const toggle = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <nav className="products" aria-label="Products">
      <div className="section-label">Products</div>
      <ul className="tree">
        {client.products.map((p) => (
          <ProductNode
            key={p.id}
            client={client}
            product={p}
            expanded={expanded.has(p.id)}
            active={p.id === activeProductId}
            activeConversationId={activeConversationId}
            onToggle={() => toggle(p.id)}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  );
}

function ProductNode({
  client,
  product,
  expanded,
  active,
  activeConversationId,
  onToggle,
  onNavigate,
}: {
  client: Client;
  product: Product;
  expanded: boolean;
  active: boolean;
  activeConversationId?: string;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useConversations(client.id, product.id, expanded);
  const newChatPath = `/c/${client.id}/p/${product.id}`;

  return (
    <li className={`tree__node${active ? ' tree__node--active' : ''}`}>
      <div className="tree__row">
        <button
          className="tree__toggle"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${product.name}`}
        >
          <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
        </button>
        <button
          className="tree__label"
          onClick={() => {
            if (!expanded) onToggle();
            navigate(newChatPath);
            onNavigate?.();
          }}
        >
          <Icon name="box" size={15} />
          <span>{product.name}</span>
        </button>
      </div>

      {expanded && (
        <ul className="tree__children">
          <li>
            <NavLink to={newChatPath} end className="tree__leaf tree__leaf--new" onClick={onNavigate}>
              <Icon name="plus" size={14} /> New chat
            </NavLink>
          </li>
          {isLoading && <li className="tree__hint">Loading…</li>}
          {conversations?.length === 0 && <li className="tree__hint">No chats yet</li>}
          {conversations?.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === activeConversationId}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function ConversationItem({
  conversation: c,
  active,
  onNavigate,
}: {
  conversation: Conversation;
  active: boolean;
  onNavigate?: () => void;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(c.title);
  const listKey = keys.conversations(c.clientId, c.productId);

  const rename = async () => {
    setEditing(false);
    const next = title.trim();
    if (!next || next === c.title) return setTitle(c.title);
    await api.renameConversation(c.clientId, c.productId, c.id, next);
    void qc.invalidateQueries({ queryKey: listKey });
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${c.title}"?`)) return;
    await api.deleteConversation(c.clientId, c.productId, c.id);
    void qc.invalidateQueries({ queryKey: listKey });
    if (active) navigate(`/c/${c.clientId}/p/${c.productId}`);
  };

  if (editing) {
    return (
      <li>
        <input
          className="tree__edit"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={rename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void rename();
            if (e.key === 'Escape') {
              setTitle(c.title);
              setEditing(false);
            }
          }}
          aria-label="Chat title"
        />
      </li>
    );
  }

  return (
    <li className="tree__item">
      <NavLink
        to={`/c/${c.clientId}/p/${c.productId}/${c.id}`}
        className="tree__leaf"
        title={c.title}
        onClick={onNavigate}
      >
        <span className="tree__title">{c.title}</span>
      </NavLink>
      <span className="tree__actions">
        <button onClick={() => setEditing(true)} aria-label={`Rename ${c.title}`}>
          <Icon name="pencil" size={13} />
        </button>
        <button onClick={remove} aria-label={`Delete ${c.title}`}>
          <Icon name="trash" size={13} />
        </button>
      </span>
    </li>
  );
}
```

### `frontend/src/components/ChatView.tsx`

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { api } from '../api/client';
import type { Message } from '../api/types';
import { sendMessage, stopStreaming, useIsStreaming } from '../hooks/chat';
import { keys, useConversations, useMessages, useScopeNames } from '../hooks/queries';
import { Composer } from './Composer';
import { MessageList } from './MessageList';

const SUGGESTIONS = [
  'Summarise the latest quarterly report',
  'Are there any open incidents?',
  'What changed in the last release?',
  'Who owns the onboarding runbook?',
];

export function ChatView() {
  const { clientId = '', productId = '', conversationId } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { client, product } = useScopeNames(clientId, productId);
  const { data: messages, isLoading, isError } = useMessages(clientId, productId, conversationId);
  const { data: conversations } = useConversations(clientId, productId);
  const streaming = useIsStreaming(conversationId);

  if (client && !product) {
    return <div className="center-note">You are not entitled to this product.</div>;
  }

  const title = conversations?.find((c) => c.id === conversationId)?.title;
  const scopeLabel = client && product ? `${client.name} · ${product.name}` : '';

  const send = async (text: string) => {
    let id = conversationId;
    if (!id) {
      // First message of a new chat: create the conversation, then move to its URL.
      const conv = await api.createConversation(clientId, productId);
      id = conv.id;
      qc.setQueryData<Message[]>(keys.messages(clientId, productId, id), []);
      navigate(`/c/${clientId}/p/${productId}/${id}`, { replace: true });
    }
    await sendMessage(qc, clientId, productId, id, text);
  };

  const empty = !conversationId || (messages && messages.length === 0);

  return (
    <section className="chat">
      <header className="chat__header">
        <span className="chat__scope">{scopeLabel}</span>
        {title && <span className="chat__title">{title}</span>}
      </header>

      <div className="chat__scroll">
        {isError ? (
          <div className="center-note">This conversation could not be loaded.</div>
        ) : isLoading ? (
          <div className="center-note">Loading…</div>
        ) : empty ? (
          <div className="welcome">
            <h1>What can I help you with?</h1>
            <p>
              Ask anything about <strong>{product?.name}</strong> for <strong>{client?.name}</strong>.
            </p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion" onClick={() => void send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages ?? []} />
        )}
      </div>

      <div className="chat__composer">
        <Composer
          placeholder={product ? `Message ${product.name}…` : 'Message…'}
          streaming={streaming}
          disabled={!product}
          onSend={(t) => void send(t)}
          onStop={() => conversationId && stopStreaming(conversationId)}
        />
        <p className="chat__disclaimer">Answers are generated from internal data and may be incomplete. Verify before use.</p>
      </div>
    </section>
  );
}
```

