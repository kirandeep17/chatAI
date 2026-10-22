# chatAI — Design System (Material 3, terracotta seed)

## Product context
chatAI is an internal ChatGPT-style assistant. Employees chat with internal data (via the OrgAI layer). Every conversation is scoped to exactly one **client** and one **product** the user is entitled to.
Key screens: Chat (main), Product picker (per client), Sign-in (paste bearer token).
Content that must be kept: client switcher, products (each with "New chat" + its conversations), signed-in user, scope ("ACME Corp · Payments") + conversation title, message thread, composer, source citations ("[1] Q3 report"), disclaimer.

## Visual direction
Google **Material Design 3** (Material You), light scheme generated from the terracotta seed #C4552F. Follow M3 components, layout, shape, elevation and type scale faithfully. Tonal surfaces instead of borders; elevation via surface-container tones; state layers on hover/press (8% / 12% of the content color). Never purple/indigo/violet.

## Color roles (light)
| Role | Value |
|---|---|
| primary / onPrimary | #8F4C38 / #FFFFFF |
| primaryContainer / onPrimaryContainer | #FFDBD1 / #3A0B01 |
| secondary / onSecondary | #77574E / #FFFFFF |
| secondaryContainer / onSecondaryContainer | #FFDBD1 / #2C150F |
| tertiary / tertiaryContainer / onTertiaryContainer | #6C5D2F / #F5E1A7 / #231B00 |
| error / errorContainer | #BA1A1A / #FFDAD6 |
| surface / onSurface | #FFF8F6 / #231917 |
| onSurfaceVariant | #53433F |
| surfaceContainerLowest | #FFFFFF |
| surfaceContainerLow | #FFF1ED |
| surfaceContainer | #FCEAE5 |
| surfaceContainerHigh | #F7E4DF |
| surfaceContainerHighest | #F1DFDA |
| outline / outlineVariant | #85736E / #D8C2BC |
| code block | inverseSurface #392E2B, text #FFEDE8, keyword #FFB5A0, string #D8C58D, comment #A08C87, function #E7BDB2 |

## Typography
**Roboto Flex** (fallback Roboto) for everything; **Roboto Mono** for code. M3 type scale: Title Large 22/28 (top app bar title), Title Medium 16/24 500, Title Small 14/20 500, Body Large 16/24 (messages), Body Medium 14/20, Label Large 14/20 500 (buttons, nav items), Label Medium 12/16 500, Label Small 11/16 500. Icons: **Material Symbols Rounded** (weight 400, fill 0; fill 1 for active nav item).

## Shape & elevation
Shape scale: extra-small 4, small 8, medium 12, large 16, extra-large 28, full (pill). Cards medium–large; FAB large (16); navigation drawer extra-large on the end edge; active nav indicator full pill; chips small (8); text field/composer extra-large (28).
Elevation: level 0 flat surfaces, level 1 cards/composer (surfaceContainerLow + shadow 0 1px 2px rgb(0 0 0/.3), 0 1px 3px 1px rgb(0 0 0/.15)), level 3 FAB/menus. Top app bar on scroll uses surfaceContainer.

## Layout (M3 canonical "list-detail" for expanded width)
- **Navigation rail** (80px, surface) on the far left: menu icon, an extended-style **FAB "New chat"** (edit icon, primaryContainer), then rail destinations as icons with labels for the client's products (Payments, Lending, Cards); active destination = pill indicator in secondaryContainer.
- **Navigation drawer / list pane** (~300px, surfaceContainerLow, rounded 16 card): client switcher as an outlined/filled select ("Client · ACME Corp" with dropdown), a search bar (M3 search, full pill, surfaceContainerHigh) "Search chats", section header "Payments" (Title Small, onSurfaceVariant), conversation list items (one-line list items 56px, chat_bubble icon, title, trailing more_vert on hover); active item = full-pill secondaryContainer indicator. Bottom: user list item with avatar (primary circle, initials) + name + email + logout icon button.
- **Detail pane** (surface): **small top app bar** with Title Large conversation title and supporting text "ACME Corp · Payments", trailing icon buttons (share, more_vert). Thread max-width 760px.
- Below 840px: rail + drawer collapse into a modal navigation drawer opened from the top app bar menu icon.

## Components
- **User message**: right-aligned, primaryContainer bubble, onPrimaryContainer text, large radius (16) with a 4px corner at top-right.
- **Assistant message**: left, on surface (no bubble) with a 32px avatar (primary tonal circle with sparkle/auto_awesome icon), name "chatAI" Label Large; Body Large text; ordered list; code block in inverseSurface card (radius 12) with header (filename + "Copy" text button); citations as **assist chips** (outlined, small radius, leading description icon) "[1] Q3 report"; action row of standard icon buttons (content_copy, thumb_up, thumb_down, refresh).
- **Typing indicator**: three primary dots pulsing, or an M3 linear progress indicator under the avatar.
- **Composer**: elevated (level 1) extra-large-radius container on surfaceContainerLow; leading icon button (add / attach_file), multi-line field "Message Payments…", **filter chip** showing scope "ACME Corp · Payments", trailing **filled icon button** (primary, arrow_upward; becomes stop while streaming). Disclaimer Body Small onSurfaceVariant centered below.
- **Buttons**: filled (primary), tonal (secondaryContainer), text; all full-pill, Label Large, 40px tall.

## Motion
M3 emphasized easing cubic-bezier(.2,0,0,1); 200ms for state changes, 300–400ms for drawer/pane transitions; ripple/state-layer on press.
