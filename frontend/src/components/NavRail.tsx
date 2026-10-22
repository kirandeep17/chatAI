import { NavLink } from 'react-router';
import type { Client } from '../api/types';
import { Icon } from './Icon';

interface Props {
  client?: Client;
  productId?: string;
  onToggle: () => void;
  onNavigate: () => void;
}

/** Material 3 navigation rail: list-pane toggle, "New chat" FAB, and the client's products as destinations. */
export function NavRail({ client, productId, onToggle, onNavigate }: Props) {
  const fabProduct = client?.products.find((p) => p.id === productId) ?? client?.products[0];

  return (
    <div className="rail">
      <button className="icon-button" onClick={onToggle} aria-label="Toggle chat list">
        <Icon name="menu" size={20} />
      </button>
      {client && fabProduct && (
        <NavLink
          to={`/c/${client.id}/p/${fabProduct.id}`}
          end
          className="fab"
          onClick={onNavigate}
          aria-label="New chat"
          title={`New ${fabProduct.name} chat`}
        >
          <Icon name="pencil" size={22} />
        </NavLink>
      )}
      <nav className="rail__nav" aria-label="Products">
        {client?.products.map((p) => (
          <NavLink
            key={p.id}
            to={`/c/${client.id}/p/${p.id}`}
            className={`rail__item${p.id === productId ? ' rail__item--active' : ''}`}
            onClick={onNavigate}
          >
            <span className="rail__indicator">
              <Icon name="box" size={20} />
            </span>
            <span className="rail__label">{p.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
