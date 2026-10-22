# Routes

Config-based (React Router), defined in `src/App.tsx`. Unauthenticated users see `TokenGate` (paste bearer token) instead of the router.

| Path | Component | Layout |
|---|---|---|
| `/` | redirects to first client | Layout |
| `/c/:clientId` | ProductPicker (grid of product cards) | Layout |
| `/c/:clientId/p/:productId/:conversationId?` | ChatView (header, messages or welcome+suggestions, composer) | Layout |
| (no token) | TokenGate sign-in card | none |

### `frontend/src/App.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { useToken } from './auth/token';
import { ChatView } from './components/ChatView';
import { Layout } from './components/Layout';
import { ProductPicker } from './components/ProductPicker';
import { TokenGate } from './components/TokenGate';

// URL carries the scope: /c/{clientId}/p/{productId}/{conversationId?}
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'c/:clientId', element: <ProductPicker /> },
      { path: 'c/:clientId/p/:productId/:conversationId?', element: <ChatView /> },
    ],
  },
];

export function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );
  const token = useToken();

  // Signing out (or the token being rejected) drops everything cached for that user.
  useEffect(() => {
    if (!token) queryClient.clear();
  }, [token, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {token ? <AuthenticatedApp /> : <TokenGate />}
    </QueryClientProvider>
  );
}

function AuthenticatedApp() {
  const [router] = useState(() => createBrowserRouter(routes));
  return <RouterProvider router={router} />;
}
```

