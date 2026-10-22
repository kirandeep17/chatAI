# Pages

## /c/:clientId/p/:productId/:conversationId (Chat — main page)
Entry: frontend/src/components/ChatView.tsx (rendered inside Layout)
Dependencies:
- frontend/src/components/Layout.tsx
  - frontend/src/components/Sidebar.tsx
    - frontend/src/components/ClientSwitcher.tsx
      - frontend/src/components/Icon.tsx
    - frontend/src/components/ProductList.tsx
    - frontend/src/components/UserCard.tsx
- frontend/src/components/MessageList.tsx
- frontend/src/components/Composer.tsx
- frontend/src/styles/app.css

## /c/:clientId (Product picker)
Entry: frontend/src/components/ProductPicker.tsx
Dependencies:
- frontend/src/components/Layout.tsx (as above)
- frontend/src/components/Icon.tsx

## Sign-in (no token)
Entry: frontend/src/components/TokenGate.tsx
Dependencies:
- frontend/src/styles/app.css
