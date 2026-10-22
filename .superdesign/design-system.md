# chatAI — Design System ("Warm terracotta editorial")

## Product context
chatAI is an internal ChatGPT-style assistant. Employees chat with internal data (via the OrgAI layer). Every conversation is scoped to exactly one **client** and one **product** the user is entitled to.
Key screens: Chat (main), Product picker (per client), Sign-in (paste bearer token).
Core structure that must be kept: sidebar = brand → client switcher → product tree (each product expands to "New chat" + its conversations) → signed-in user card. Main = header showing scope ("ACME Corp · Payments") + conversation title, message thread, composer. Answers carry source citations ("Sources: [1] Q3 report").

## Visual direction
Warm, editorial, restrained — the deliberate opposite of the dark indigo/violet AI-chat cliché. Light mode. Generous whitespace, hairline dividers, one accent used sparingly.

## Color
| Token | Value | Use |
|---|---|---|
| canvas | #FAF6F0 | app background (cream) |
| ink | #1A1A1A | primary text |
| muted | #6E655A | secondary text, placeholders |
| paper | #F4ECE1 | sidebar surface, inline-code chip |
| hairline | #E7DCCC | dividers, borders |
| accent | #C4552F | terracotta — brand mark, active states, links, list numerals, send button |
| accent-deep | #A8421F | hover, inline-code text |
| accent-soft | #F0E3D5 (border #EAD6C4) | user message card, active sidebar item |
| code-bg | #262019 (header #1F1A15) | code block |
| syntax | keyword #E39B6E · string #C9B78E · comment #8A7E6C · function #EAD9BE · text #F3EADC | code tokens |
Never use purple / indigo / violet, neon, or a dark full-app background.

## Typography
- **Fraunces** (serif, some italic): brand wordmark, conversation title (~18px), assistant name (italic), ordered-list numerals, empty-state headline.
- **Inter**: all body and UI. Message body 15px / 1.68. UI 13–14px. Tracked-caps section labels 11px, letter-spacing .08em.
- **JetBrains Mono**: code, 12.5px.

## Shape, depth, spacing
Radius: cards/composer 16px (rounded-2xl), pills 999px, buttons 10px. User card has a small tail (top-right radius 4px).
Shadows: composer only — 0 1px 2px rgb(60 40 20/.05), 0 8px 24px rgb(60 40 20/.06). Sticky bars are glass: canvas at 80% + backdrop-blur(12px) + hairline.
Spacing: 4px grid; thread max-width 760px; sidebar 264px.

## Components
- **Sidebar** (paper, right hairline): terracotta mark + Fraunces "chatAI"; client switcher card; tracked-caps "PRODUCTS" label; product rows (box icon + name, chevron); expanded product shows "+ New chat" and conversation rows; active conversation = accent-soft pill with terracotta icon. Bottom: ink initials avatar + name + email + sign-out.
- **Top bar** (sticky glass): scope label in muted Inter small caps style, conversation title in Fraunces; icon buttons right.
- **User turn**: right-aligned accent-soft card, max 85% width.
- **Assistant turn**: left-aligned, no bubble: small terracotta mark + italic Fraunces name, editorial paragraphs, serif terracotta list numerals, warm code block (filename + Copy header), check-icon bullets, source citations as paper chips, hover action row (copy / thumbs / regenerate).
- **Typing indicator**: three terracotta dots bouncing in sequence.
- **Composer** (sticky glass footer): rounded-2xl bordered cream card with soft shadow, auto-grow textarea, bottom row: attach button, scope chip (terracotta dot · "ACME Corp · Payments"), "⏎ to send" hint, round terracotta send button (becomes stop while streaming). Disclaimer line below.

## Motion
Subtle: 150ms ease color/background transitions; typing dots 1.2s staggered bounce; hover action row fades in at 120ms.
