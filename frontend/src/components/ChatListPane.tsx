import { useState } from 'react';
import type { Client, Entitlements } from '../api/types';
import { ClientSwitcher } from './ClientSwitcher';
import { ConversationList } from './ConversationList';
import { Icon } from './Icon';
import { UserCard } from './UserCard';

interface Props {
  user: Entitlements;
  client?: Client;
  productId?: string;
  conversationId?: string;
  onNavigate: () => void;
}

/** List pane next to the rail: client, search, the selected product's chats, signed-in user. */
export function ChatListPane({ user, client, productId, conversationId, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const product = client?.products.find((p) => p.id === productId);

  return (
    <aside className="pane">
      <div className="pane__top">
        <ClientSwitcher clients={user.clients} current={client} />
        <label className="search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            placeholder="Search chats"
            aria-label="Search chats"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="pane__middle">
        {client && product ? (
          <ConversationList
            key={`${client.id}/${product.id}`}
            clientId={client.id}
            product={product}
            activeConversationId={conversationId}
            query={query}
            onNavigate={onNavigate}
          />
        ) : (
          <p className="list__hint">Choose a product to see its chats.</p>
        )}
      </div>

      <div className="pane__bottom">
        <UserCard user={user} />
      </div>
    </aside>
  );
}
