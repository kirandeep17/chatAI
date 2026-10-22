import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { api } from '../api/client';
import type { Conversation, Product } from '../api/types';
import { keys, useConversations } from '../hooks/queries';
import { Icon } from './Icon';

interface Props {
  clientId: string;
  product: Product;
  activeConversationId?: string;
  query: string;
  onNavigate: () => void;
}

export function ConversationList({ clientId, product, activeConversationId, query, onNavigate }: Props) {
  const { data: conversations, isLoading } = useConversations(clientId, product.id);
  const q = query.trim().toLowerCase();
  const shown = q ? conversations?.filter((c) => c.title.toLowerCase().includes(q)) : conversations;

  return (
    <section aria-label={`${product.name} chats`}>
      <h2 className="list__header">{product.name}</h2>
      <ul className="list">
        {isLoading && <li className="list__hint">Loading…</li>}
        {conversations?.length === 0 && <li className="list__hint">No chats yet</li>}
        {q && shown?.length === 0 && conversations?.length !== 0 && <li className="list__hint">No matching chats</li>}
        {shown?.map((c) => (
          <ConversationItem
            key={c.id}
            conversation={c}
            active={c.id === activeConversationId}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </section>
  );
}

function ConversationItem({
  conversation: c,
  active,
  onNavigate,
}: {
  conversation: Conversation;
  active: boolean;
  onNavigate: () => void;
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
          className="list__edit"
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
    <li className="list__item">
      <NavLink
        to={`/c/${c.clientId}/p/${c.productId}/${c.id}`}
        className="list__link"
        title={c.title}
        onClick={onNavigate}
      >
        <Icon name="chat" size={18} />
        <span className="list__title">{c.title}</span>
      </NavLink>
      <span className="list__actions">
        <button className="icon-button icon-button--sm" onClick={() => setEditing(true)} aria-label={`Rename ${c.title}`}>
          <Icon name="pencil" size={14} />
        </button>
        <button className="icon-button icon-button--sm" onClick={remove} aria-label={`Delete ${c.title}`}>
          <Icon name="trash" size={14} />
        </button>
      </span>
    </li>
  );
}
