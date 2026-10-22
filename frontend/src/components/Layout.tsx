import { useState } from 'react';
import { Navigate, Outlet, useOutletContext, useParams } from 'react-router';
import { useEntitlements } from '../hooks/queries';
import { ChatListPane } from './ChatListPane';
import { NavRail } from './NavRail';

const isCompact = () => window.matchMedia('(max-width: 768px)').matches;

/** Lets pages open the navigation (the top app bar's menu button on compact screens). */
export const useOpenNav = () => useOutletContext<() => void>();

export function Layout() {
  const { clientId, productId, conversationId } = useParams();
  const { data: user, isLoading, error } = useEntitlements();
  // Expanded: toggles the list pane next to the rail. Compact: toggles the whole modal drawer.
  const [navOpen, setNavOpen] = useState(() => !isCompact());

  if (isLoading) return <div className="center-note">Loading…</div>;
  if (error || !user) return <div className="center-note">Could not load your entitlements. {error?.message}</div>;
  if (user.clients.length === 0) return <div className="center-note">You don’t have access to any client yet.</div>;
  if (!clientId) return <Navigate to={`/c/${user.clients[0]!.id}`} replace />;

  const client = user.clients.find((c) => c.id === clientId);
  const closeOnCompact = () => isCompact() && setNavOpen(false);

  return (
    <div className={`app${navOpen ? '' : ' app--nav-closed'}`}>
      <div className="drawer">
        <NavRail
          client={client}
          productId={productId}
          onToggle={() => setNavOpen((o) => !o)}
          onNavigate={closeOnCompact}
        />
        <ChatListPane
          key={client?.id}
          user={user}
          client={client}
          productId={productId}
          conversationId={conversationId}
          onNavigate={closeOnCompact}
        />
      </div>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <main className="main">
        <Outlet context={() => setNavOpen(true)} />
      </main>
    </div>
  );
}
