# Extractable components

## Sidebar
- Source: `frontend/src/components/Sidebar.tsx` (+ ClientSwitcher, ProductList, UserCard)
- Category: layout
- Description: Brand, client switcher, expandable product tree with chats, user card
- Extractable props: activeProductId (string), activeConversationId (string)
- Hardcoded: brand mark, labels, icons, CSS

## Composer
- Source: `frontend/src/components/Composer.tsx`
- Category: basic
- Description: Auto-grow textarea with round send/stop button
- Extractable props: streaming (boolean, default false)
- Hardcoded: icons, CSS
