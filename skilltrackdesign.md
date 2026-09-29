# DESIGN.md — Merivo Design System v1.0

```
AUDIENCE    : AI coding agent (machine-parsed). Human readability is secondary.
PARSE MODE  : literal. MUST/NEVER/ALWAYS = hard rule. No rule is optional unless marked [optional].
STACK       : Next.js (App Router) + Tailwind CSS v4 + shadcn/ui + Recharts (shadcn Chart) + dnd-kit + lucide-react
THEMES      : light [from-image] · dark [inferred]
SOURCE      : one Dribbble preview image (orange e-commerce admin dashboard, "Merivo")
```

## TAG LEGEND

| Tag | Meaning |
|---|---|
| `[from-image]` | Directly visible in the reference image |
| `[est]` | Visible but value estimated; snapped to 4px grid. Correct here if the designer's file disagrees |
| `[inferred]` | NOT in the image; derived from tokens + personality. Follows the same rules, lower confidence |

## AUTHORITY ORDER (on conflict, higher wins)

1. Section 5 (Consistency Law)
2. Section 2 (Tokens)
3. Section 15 (Content Organization)
4. Section 4 (Component specs)
5. Section 9 (Page templates)
6. Agent judgment (only when 1–5 are silent; then match Section 0 attributes and document the new rule)

---

## 0. META

| Field | Value |
|---|---|
| Name | Merivo |
| Product type | Multi-page web product; core = admin/SaaS dashboard; extended to auth, marketing, settings, commerce [inferred] |
| Personality (measurable) | see next table |
| Accent policy | ONE accent hue (orange). Used only for: primary action, brand mark, focus ring, active emphasis, chart series 1 |
| Signature | **Dot-matrix data visualization**. Sparklines, forecast chart, and map are made of dots. See Section 4.14 |

| Attribute | Value | Numeric backing |
|---|---|---|
| corner-radius | medium-large | controls 8px (`rounded-lg`), cards 12px (`rounded-xl`), badges 9999px (`rounded-full`) |
| density | compact-medium | control height 36px (`h-9`), table row 48px (`h-12`), card padding 20px (`p-5`) |
| contrast | neutral surfaces + one saturated accent | page `#F7F7F7` vs card `#FFFFFF` (light) |
| motion | subtle | 120–260ms, no bounce, no parallax |
| depth | flat, border-defined | borders 1px; shadows only on floating layers (`shadow-xs` cards optional, `shadow-md` popovers) |
| iconography | thin outline | lucide-react, 16px (`size-4`), stroke 1.5px |
| whitespace | generous between cards, tight inside controls | card gap 16px, page padding 24px |
| alignment | left-aligned text, right-aligned actions | headers: title left, actions right |

### Decision log (agent MUST honor)

| ID | Decision | Reason |
|---|---|---|
| D-01 | Brand fill `#F26A0F` with white text measures ~3.2:1. This fails WCAG AA for text under 18.66px bold. Two options are provided: `--primary` (image-accurate, default) and `--primary-strong` `#CC4A08` (measured ~4.6:1 with white, AA-safe). If the project requires AA-strict, set `--primary: var(--primary-strong)` in `:root` | Accessibility vs. fidelity; owner picks once, globally |
| D-02 | Orange TEXT on light backgrounds (links, active labels) MUST use `text-primary-strong`, never `text-primary` | Contrast |
| D-03 | Dark mode is a full second theme via CSS variables. Components MUST NOT contain `dark:` color overrides except where Section 2.9 allows | Single source of truth |
| D-04 | Next.js assumed. If plain React/Vite, only Section 13 file paths change | Stack |
| D-05 | shadcn components newer than your installed CLI (e.g. `field`, `input-group`, `button-group`, `spinner`, `kbd`, `empty`, `item`) MUST be tried with `npx shadcn@latest add <name>`. If unavailable, build from the spec in Section 4 using the same tokens | Registry changes over time |

---

## 1. DESIGN DNA (extracted from image)

| Attribute | Value | Confidence |
|---|---|---|
| Layout archetype | Left sidebar + fluid content, page header inside content (no top bar) | high |
| Page background | `#F7F7F7` | med `[est]` |
| Sidebar background | `#F3F3F3` (slightly darker than page) | med `[est]` |
| Surface (cards) | `#FFFFFF`, 1px border `#EAEAEA`, no visible shadow | high |
| Brand / accent | orange `#F26A0F` | med `[est]` |
| Text | primary `#171717`, secondary `#6B6B72` | med `[est]` |
| Data colors | purple `#8B3DFF`, orange `#F26A0F`, blue `#2F4FE0`, green `#22C55E`, yellow `#FACC15`, red `#DC2626` | med `[est]` |
| Font | geometric sans (Plus Jakarta Sans-like). Fallback Inter | low `[est]` |
| Weights used | 400 body, 500 labels/titles, 600 big numbers and buttons | med |
| Type sizes (real px) | page title 28, stat number 32, card title 16, body 14, small/table/button 13, caption 12 | med `[est]` (preview was downscaled ~1.4x) |
| Radius | cards 12, controls 8, badges/chips full | high |
| Borders | 1px hairline everywhere, neutral | high |
| Shadows | none on cards; soft shadow only on the map tooltip and popovers | high |
| Icons | outline, ~16px, ~1.5px stroke; tinted 28px rounded-square chips for card icons | high |
| Density | compact controls (36px), roomy cards | med |
| Gradients / glass / blur | none inside the app (the orange gradient is Dribbble preview background only; IGNORE it) | high |
| Whitespace ratio | ~35% empty in dashboards; 16px card gaps; 20px card padding | med |
| Primary button | solid orange, white 13px medium text, trailing `+` icon, radius 8px | high |
| Secondary controls | grey-filled icon button with 1px border; outline button with leading icon + trailing chevron (date picker) | high |
| Status badges | pill, tinted background + same-hue text + leading 6px dot | high |
| Sidebar pattern | workspace switcher (grey filled dropdown) → nav → collapsible groups with `+` → user card at bottom with upward menu | high |
| Data viz | dots, not lines/bars; empty/future dots rendered as faint grey | high |
| Table | tinted header row, sortable columns (double-chevron icon), avatar/thumbnail + text cells, left-aligned numbers | high |
| Not in image | forms, auth, modals, mobile, dark mode, hover/focus/error states | n/a → `[inferred]` |

---

## 2. DESIGN TOKENS

### 2.1 `app/globals.css` (Tailwind v4, shadcn variable convention) — COPY VERBATIM

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.5rem;                              /* 8px base; sm=4 md=6 lg=8 xl=12 */

  /* surfaces */
  --background: #F7F7F7;
  --foreground: #171717;
  --card: #FFFFFF;
  --card-foreground: #171717;
  --popover: #FFFFFF;
  --popover-foreground: #171717;
  --muted: #F3F3F3;
  --muted-foreground: #6B6B72;
  --accent: #EFEFEF;
  --accent-foreground: #171717;
  --secondary: #F3F3F3;
  --secondary-foreground: #171717;

  /* brand */
  --primary: #F26A0F;
  --primary-foreground: #FFFFFF;
  --primary-strong: #CC4A08;                     /* AA text-on-light. See D-01/D-02 */
  --primary-soft: #FFEDD9;                       /* tinted chip bg */

  /* lines and focus */
  --border: #EAEAEA;
  --input: #E4E4E7;
  --ring: #F26A0F;

  /* status: base (dot/icon/fill), soft (badge bg), text (badge text) */
  --success: #16A34A;  --success-soft: #E6F6EC;  --success-text: #15803D;
  --warning: #F59E0B;  --warning-soft: #FFF4DC;  --warning-text: #B45309;
  --danger:  #DC2626;  --danger-soft:  #FEECEC;  --danger-text:  #B91C1C;
  --info:    #2F4FE0;  --info-soft:    #EAEEFF;  --info-text:    #2440C2;
  --destructive: var(--danger);
  --destructive-foreground: #FFFFFF;

  /* charts */
  --chart-1: #F26A0F; --chart-2: #8B3DFF; --chart-3: #2F4FE0; --chart-4: #16A34A; --chart-5: #FACC15;
  --chip-purple: #F3E8FF; --chip-purple-fg: #8B3DFF;
  --chip-blue: #E4EAFF;   --chip-blue-fg: #2F4FE0;
  --dot-above: #22C55E; --dot-track: #F97316; --dot-below: #FACC15; --dot-empty: #E5E5E5;

  /* sidebar */
  --sidebar: #F3F3F3;
  --sidebar-foreground: #171717;
  --sidebar-primary: #F26A0F;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #E9E9E9;
  --sidebar-accent-foreground: #171717;
  --sidebar-border: #E4E4E4;
  --sidebar-ring: #F26A0F;
}

.dark {                                          /* [inferred] entire block */
  --background: #0E0E10;
  --foreground: #F2F2F3;
  --card: #17171A;
  --card-foreground: #F2F2F3;
  --popover: #1E1E22;
  --popover-foreground: #F2F2F3;
  --muted: #1E1E22;
  --muted-foreground: #A1A1AA;
  --accent: #26262B;
  --accent-foreground: #F2F2F3;
  --secondary: #1E1E22;
  --secondary-foreground: #F2F2F3;

  --primary: #FF7A26;
  --primary-foreground: #1A0A00;                 /* dark text on bright orange, ~7.5:1 */
  --primary-strong: #FF9A5C;                     /* orange text on dark surfaces */
  --primary-soft: rgba(255, 122, 38, 0.14);

  --border: #2A2A2F;
  --input: #34343A;
  --ring: #FF7A26;

  --success: #4ADE80;  --success-soft: rgba(74,222,128,0.14);  --success-text: #86EFAC;
  --warning: #FBBF24;  --warning-soft: rgba(251,191,36,0.14);  --warning-text: #FCD34D;
  --danger:  #F87171;  --danger-soft:  rgba(248,113,113,0.14); --danger-text:  #FCA5A5;
  --info:    #7C93FF;  --info-soft:    rgba(124,147,255,0.14); --info-text:    #A5B4FF;
  --destructive: var(--danger);
  --destructive-foreground: #1A0505;

  --chart-1: #FF7A26; --chart-2: #A970FF; --chart-3: #6C86FF; --chart-4: #4ADE80; --chart-5: #FDE047;
  --chip-purple: rgba(169,112,255,0.16); --chip-purple-fg: #C4A0FF;
  --chip-blue: rgba(108,134,255,0.16);   --chip-blue-fg: #A5B4FF;
  --dot-above: #4ADE80; --dot-track: #FB923C; --dot-below: #FACC15; --dot-empty: #2E2E33;

  --sidebar: #131315;
  --sidebar-foreground: #F2F2F3;
  --sidebar-primary: #FF7A26;
  --sidebar-primary-foreground: #1A0A00;
  --sidebar-accent: #1E1E22;
  --sidebar-accent-foreground: #F2F2F3;
  --sidebar-border: #26262B;
  --sidebar-ring: #FF7A26;
}

@theme inline {
  --font-sans: var(--font-plus-jakarta), "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  --color-background: var(--background);   --color-foreground: var(--foreground);
  --color-card: var(--card);               --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);         --color-popover-foreground: var(--popover-foreground);
  --color-muted: var(--muted);             --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);           --color-accent-foreground: var(--accent-foreground);
  --color-secondary: var(--secondary);     --color-secondary-foreground: var(--secondary-foreground);
  --color-primary: var(--primary);         --color-primary-foreground: var(--primary-foreground);
  --color-primary-strong: var(--primary-strong);  --color-primary-soft: var(--primary-soft);
  --color-border: var(--border);           --color-input: var(--input);  --color-ring: var(--ring);
  --color-destructive: var(--destructive); --color-destructive-foreground: var(--destructive-foreground);

  --color-success: var(--success); --color-success-soft: var(--success-soft); --color-success-text: var(--success-text);
  --color-warning: var(--warning); --color-warning-soft: var(--warning-soft); --color-warning-text: var(--warning-text);
  --color-danger: var(--danger);   --color-danger-soft: var(--danger-soft);   --color-danger-text: var(--danger-text);
  --color-info: var(--info);       --color-info-soft: var(--info-soft);       --color-info-text: var(--info-text);

  --color-chart-1: var(--chart-1); --color-chart-2: var(--chart-2); --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4); --color-chart-5: var(--chart-5);
  --color-chip-purple: var(--chip-purple); --color-chip-purple-fg: var(--chip-purple-fg);
  --color-chip-blue: var(--chip-blue);     --color-chip-blue-fg: var(--chip-blue-fg);
  --color-dot-above: var(--dot-above); --color-dot-track: var(--dot-track);
  --color-dot-below: var(--dot-below); --color-dot-empty: var(--dot-empty);

  --color-sidebar: var(--sidebar);                         --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);         --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);           --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);           --color-sidebar-ring: var(--sidebar-ring);

  --radius-sm: calc(var(--radius) - 4px);   /* 4  */
  --radius-md: calc(var(--radius) - 2px);   /* 6  */
  --radius-lg: var(--radius);               /* 8  */
  --radius-xl: calc(var(--radius) + 4px);   /* 12 */

  /* custom type scale -> utilities text-caption, text-body-sm, text-body, text-title, text-h2, text-h1, text-stat */
  --text-caption: 0.75rem;    --text-caption--line-height: 1rem;
  --text-body-sm: 0.8125rem;  --text-body-sm--line-height: 1.125rem;
  --text-body: 0.875rem;      --text-body--line-height: 1.25rem;
  --text-title: 1rem;         --text-title--line-height: 1.5rem;
  --text-h2: 1.25rem;         --text-h2--line-height: 1.75rem;
  --text-h1: 1.75rem;         --text-h1--line-height: 2.25rem;
  --text-stat: 2rem;          --text-stat--line-height: 2.5rem;
  --text-display: 3.5rem;     --text-display--line-height: 1.05;

  /* motion */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground font-sans antialiased; font-feature-settings: "tnum" 0; }
  .tabular { font-variant-numeric: tabular-nums; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Font loading (`app/layout.tsx`): `const jakarta = Plus_Jakarta_Sans({ subsets:["latin"], variable:"--font-plus-jakarta", weight:["400","500","600","700"] })`; apply `className={jakarta.variable}` on `<html>`. Theme: `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`.

### 2.2 Semantic color roles

| Role | Light | Dark | Tailwind utility | Use ONLY for |
|---|---|---|---|---|
| page bg | `#F7F7F7` | `#0E0E10` | `bg-background` | app canvas |
| surface | `#FFFFFF` | `#17171A` | `bg-card` | cards, table containers, inputs |
| surface-raised | `#FFFFFF` | `#1E1E22` | `bg-popover` | dropdowns, popovers, dialogs, sheets, toasts |
| sidebar | `#F3F3F3` | `#131315` | `bg-sidebar` | sidebar only |
| muted fill | `#F3F3F3` | `#1E1E22` | `bg-muted` | table header (`/60`), search field, skeleton, kanban column |
| hover fill | `#EFEFEF` | `#26262B` | `bg-accent` | hover on ghost/menu/list items |
| border | `#EAEAEA` | `#2A2A2F` | `border-border` | all dividers/card borders |
| input border | `#E4E4E7` | `#34343A` | `border-input` | form controls |
| text-primary | `#171717` | `#F2F2F3` | `text-foreground` | headings, values |
| text-secondary | `#6B6B72` | `#A1A1AA` | `text-muted-foreground` | labels, captions, placeholder, table header |
| brand | `#F26A0F` | `#FF7A26` | `bg-primary` | primary buttons, focus ring, active indicators |
| brand text | `#CC4A08` | `#FF9A5C` | `text-primary-strong` | links, orange text |
| success/warning/danger/info | see 2.1 | see 2.1 | `bg-{s}-soft text-{s}-text`, dot `bg-{s}` | badges, alerts, deltas |

Interactive states (all themes): hover = `/90` on solid fills or `bg-accent` on ghost; active = `/80`; focus-visible = `ring-3 ring-ring/40` + `border-ring` on inputs; disabled = `opacity-50 pointer-events-none`; selected = `bg-accent` (menus/rows) or `bg-primary-soft text-primary-strong` (tabs/chips) `[inferred]`.

### 2.3 Typography scale

| Token | Size / line-height | Weight | Tracking | Tailwind | Use |
|---|---|---|---|---|---|
| display | 56px / 1.05 | 600 | `tracking-tight` | `text-display font-semibold` | landing hero only |
| stat | 32px / 40px | 600 | `tracking-tight` | `text-stat font-semibold tabular-nums` | KPI numbers |
| h1 | 28px / 36px | 500 | `tracking-tight` | `text-h1 font-medium` | page title `[from-image]` |
| h2 | 20px / 28px | 600 | normal | `text-h2 font-semibold` | section title, dialog title |
| title | 16px / 24px | 500 | normal | `text-title font-medium` | card title `[est]` |
| body | 14px / 20px | 400 | normal | `text-body` | default paragraph, inputs on mobile |
| body-sm | 13px / 18px | 400/500 | normal | `text-body-sm` | buttons, nav, table cells, inputs `[from-image]` |
| caption | 12px / 16px | 400/500 | normal | `text-caption` | helper text, deltas, badges, timestamps |
| overline | 11px / 16px | 600 | `tracking-wider uppercase` | `text-[11px]` (ONLY allowed arbitrary value) | group labels `[inferred]` |
| code | 13px / 20px | 400 | normal | `font-mono text-body-sm` | code, IDs |

Rules: MUST use `tabular-nums` on every number in tables, stats, deltas, dates. Body copy line length ≤ 72ch (`max-w-prose`). NEVER use font sizes under 12px. NEVER use weights other than 400/500/600 (700 only in display/marketing).

### 2.4 Spacing scale (Tailwind default 4px step; only these steps are allowed)

| Step | px | Tailwind | Step | px | Tailwind |
|---|---|---|---|---|---|
| 0 | 0 | `0` | 8 | 32 | `8` |
| 0.5 | 2 | `0.5` | 10 | 40 | `10` |
| 1 | 4 | `1` | 12 | 48 | `12` |
| 1.5 | 6 | `1.5` | 14 | 56 | `14` |
| 2 | 8 | `2` | 16 | 64 | `16` |
| 3 | 12 | `3` | 20 | 80 | `20` |
| 4 | 16 | `4` | 24 | 96 | `24` |
| 5 | 20 | `5` | 32 | 128 | `32` |
| 6 | 24 | `6` | | | |

Steps 7, 9, 11 (28/36/44px) are allowed ONLY as control sizes: `size-7`, `h-9`, `h-11`.

### 2.5 Radius · 2.6 Elevation · 2.7 Borders/opacity

| Token | px | Tailwind | Use |
|---|---|---|---|
| radius-sm | 4 | `rounded-sm` | checkbox, kbd, small chips inside tables |
| radius-md | 6 | `rounded-md` | icon chips (28px), menu items, tabs trigger |
| radius-lg | 8 | `rounded-lg` | buttons, inputs, selects, dropdown content, toasts |
| radius-xl | 12 | `rounded-xl` | cards, dialogs, popovers, tables container, sidebar user card |
| radius-2xl | 16 | `rounded-2xl` | auth card, marketing cards, image frames `[inferred]` |
| radius-full | 9999 | `rounded-full` | badges, avatars, switches, dots |

| Level | Tailwind | Use |
|---|---|---|
| 0 | none | page, sidebar, cards (default) `[from-image]` |
| 1 | `shadow-xs` | interactive card hover `[inferred]`, sticky bars |
| 2 | `shadow-sm` | segmented control active thumb, dragged card |
| 3 | `shadow-md` | dropdown, popover, tooltip-card (map tooltip `[from-image]`) |
| 4 | `shadow-lg` | dialog, sheet, command palette |
| 5 | `shadow-xl` | reserved; marketing mockups only |

Borders: 1px (`border`) default; 2px (`border-2`) only for dashed dropzones, selected pricing card, focus on segmented. Opacity scale: `/5 /10 /20 /40 /50 /60 /80 /90` only. Dark mode: shadows are near-invisible; separation MUST come from border + surface lightness.

### 2.8 z-index · breakpoints · containers · motion

| z token | value | Tailwind | Layer |
|---|---|---|---|
| base | 0 | `z-0` | content |
| sticky | 10 | `z-10` | sticky table header, page header |
| sidebar | 20 | `z-20` | sidebar, topbar |
| dropdown | 50 | `z-50` | popover, dropdown, tooltip, select (Radix default) |
| modal | 50 | `z-50` | dialog, sheet, drawer (portal order handles stacking) |
| toast | 100 | `z-[100]` (allowed) | Sonner |

| Breakpoint | min-width | Tailwind | Device class |
|---|---|---|---|
| base | 0 | (none) | mobile |
| sm | 640 | `sm:` | large mobile |
| md | 768 | `md:` | tablet |
| lg | 1024 | `lg:` | desktop (sidebar becomes persistent) |
| xl | 1280 | `xl:` | wide |
| 2xl | 1536 | `2xl:` | ultra-wide |

| Container | Tailwind | Use |
|---|---|---|
| dashboard content | fluid, `max-w-[1600px]` allowed once on `SidebarInset` inner wrapper `[inferred]` | app pages |
| marketing | `mx-auto w-full max-w-7xl px-4 md:px-6` (1280px) | landing, pricing |
| reading | `max-w-prose` (65ch) / `max-w-3xl` (768px) | blog post, settings forms |
| auth card | `max-w-sm` (384px) | login, signup |
| form page | `max-w-2xl` (672px) | create/edit |

| Motion token | Value | Tailwind |
|---|---|---|
| duration-fast | 120ms | `duration-100` (closest) or `duration-150` |
| duration-base | 180ms | `duration-200` |
| duration-slow | 260ms | `duration-300` |
| ease-standard | `cubic-bezier(0.2,0,0,1)` | `ease-standard` (custom in `@theme`) |

Rule: use `duration-150` for hover/color, `duration-200` for overlays, `duration-300` for drawers/sheets. No other durations.

### 2.9 Dark mode rules `[inferred]`

| # | Rule |
|---|---|
| DM-1 | Components MUST use semantic utilities (`bg-card`, `text-foreground`). Raw colors and `dark:` color overrides are FORBIDDEN, except `dark:` on effects below |
| DM-2 | Elevation order (darkest → lightest): `background` < `sidebar` < `card` < `popover`/raised < `accent` (hover). NEVER invert this order |
| DM-3 | Borders carry separation. Every card, input, table keeps `border`. Shadows are optional decoration only |
| DM-4 | Pure `#000` and pure `#FFF` are BANNED as surface or body-text colors |
| DM-5 | Primary button in dark: bright orange fill `#FF7A26` with DARK text `#1A0A00` (already handled by `--primary-foreground`) |
| DM-6 | Status badges use translucent fills (`*-soft` = 14% alpha) with lighter text (`*-text`). Same class names as light |
| DM-7 | Dot-matrix: filled dots use brighter dark palette; empty dots use `--dot-empty` `#2E2E33` (never pure grey `#444` or lighter) |
| DM-8 | Images and avatars: add `dark:brightness-90` (allowed `dark:` use). Illustrations must have a dark variant or transparent background |
| DM-9 | Charts: grid lines use `stroke-border`; axis labels `fill-muted-foreground`; NEVER hard-code chart strokes |
| DM-10 | Theme toggle lives in the user menu (Section 15). Options: Light / Dark / System. Persist via `next-themes`. No flash: `suppressHydrationWarning` on `<html>` |
| DM-11 | Every screen MUST be verified in both themes before it is considered done (Section 14) |

### 2.10 Tailwind v3 fallback (only if project is on v3)

Move the `@theme inline` mapping into `tailwind.config.ts` `theme.extend.colors` (`background: "hsl(var(--background))"` style, or keep hex and use `"var(--background)"`), `borderRadius`, `fontSize` (tuple `[size, { lineHeight }]`), `fontFamily`. Keep `:root` and `.dark` blocks unchanged. Set `darkMode: "class"`. All class strings in Section 4 stay valid except `ring-3` → `ring-[3px]`, `size-*` requires v3.4+.

---

## 3. LAYOUT SYSTEM

### 3.1 Grid

| Property | Value |
|---|---|
| Columns | 12 (`grid grid-cols-12`) at `lg+`; 6 at `md`; 1 at base |
| Gutter | 16px `gap-4` at ALL breakpoints |
| Page margin | 16px `px-4` base; 24px `px-6` at `md+` |
| Row pattern (dashboard) `[from-image]` | Row 1: 3 stat cards `col-span-4` each. Row 2: chart `col-span-8` + side card `col-span-4`. Row 3: table `col-span-12` |

### 3.2 Shells

| ID | Shell | When to use | Exact spec |
|---|---|---|---|
| S1 | **app-shell** (sidebar + inset) `[from-image]` | All authenticated app pages by default | `SidebarProvider` → `Sidebar` (w-60 = 240px expanded, w-16 = 64px icon-collapsed) + `SidebarInset` (`bg-background`). Sidebar fixed, full height (`h-svh`). Content scrolls, sidebar does not. Content padding `p-6` (24px); at base `p-4` |
| S2 | sidebar + topbar | Apps with deep hierarchy (breadcrumbs), global search, notifications `[inferred]` | S1 + topbar `h-14` (56px) `sticky top-0 z-20 border-b bg-background/80 backdrop-blur` containing `SidebarTrigger`, Breadcrumb, search (⌘K), notifications bell, avatar. Then page header omits breadcrumb |
| S3 | topbar-only | Marketing, pricing, blog, docs `[inferred]` | Header `h-16` (64px) `sticky top-0 z-20 border-b bg-background/80 backdrop-blur`; container `max-w-7xl px-4 md:px-6`; footer at end. Mobile: `Sheet` menu |
| S4 | centered-card | Login, signup, forgot/reset, verify email, 404/500 `[inferred]` | `min-h-svh grid place-items-center bg-background p-4`; card `w-full max-w-sm rounded-2xl border bg-card p-8`; logo above card `mb-8`; footer links below `mt-6 text-caption text-muted-foreground` |
| S5 | split-screen | Signup/onboarding with brand panel `[inferred]` | `grid min-h-svh lg:grid-cols-2`; left = form column (`flex items-center justify-center p-6 md:p-10`, form `max-w-sm`); right = `hidden lg:block bg-muted` brand panel with dot-matrix art + short testimonial |
| S6 | full-bleed | Landing hero, kanban canvas, map, file manager canvas | No container. Sections define their own inner `max-w-7xl` wrapper. Sticky S3 header still applies on marketing |

Shell selection rule: a user flow (e.g. auth) MUST use exactly one of S4/S5 across all its screens. All pages behind login MUST use S1 or S2 (pick one per product; NEVER mix).

### 3.3 Sidebar exact dimensions `[from-image]` + `[est]`

| Part | Value |
|---|---|
| Width expanded / collapsed | 240px `w-60` / 64px `w-16` |
| Padding | `p-3` (12px) |
| Header | logo (24px mark + wordmark `text-title font-semibold`) left, collapse button `size-7` ghost right. Height 40px `h-10` |
| Workspace switcher | `h-10 rounded-lg bg-sidebar-accent px-3` text `text-body-sm font-medium` + `ChevronsUpDown size-4` right. `mt-3` below header |
| Nav item | `h-9 rounded-lg px-3 gap-3 text-body-sm` icon `size-4`. Gap between items 2px `gap-0.5`. Active: `bg-sidebar-accent font-medium` `[inferred]` |
| Count badge | `ml-auto size-5 rounded-full bg-border text-caption` centered `[from-image]` |
| Group label row | `text-caption text-muted-foreground` + chevron left + `+` icon-button right, `h-8 px-3` |
| Sub-item | indented `pl-6` (24px) under its group label, same height as nav item |
| Separators | `border-t border-sidebar-border my-3` between sections `[from-image]` |
| Footer | user card `rounded-xl border bg-card p-2` (avatar 32px, name `text-body-sm font-medium`, plan `text-caption text-muted-foreground`, chevron). Opens upward menu: Settings, Log out `[from-image]` |

### 3.4 Page header `[from-image]`

```
[ H1 title                        ]   [ icon-btn filter ][ date-picker ][ PRIMARY CTA + ]
[ caption / subtitle              ]
```
Title `text-h1 font-medium`; subtitle `text-body-sm text-muted-foreground mt-1`; actions `flex items-center gap-2`; header `mb-6 flex items-start justify-between gap-4`. At base: actions wrap below title (`flex-col sm:flex-row`); primary CTA becomes full width only inside dialogs/forms, not in page headers.

### 3.5 Spacing rules table (relation → token)

| Relation | px | Tailwind |
|---|---|---|
| page padding (horizontal) | 16 / 24 | `px-4` / `md:px-6` |
| page padding (top/bottom) | 24 | `py-6` |
| page header → first row | 24 | `mb-6` |
| row-to-row / section-to-section (dashboard) | 16 | `gap-4` |
| section-to-section (marketing) | 96 (64 mobile) | `py-24` / `py-16` |
| card-to-card | 16 | `gap-4` |
| card padding | 20 (compact 16) | `p-5` (`p-4`) |
| card header → card body | 16 | `mb-4` |
| stat card: title row → number | 12 | `mt-3` |
| stat card: number → delta | 4 | `mt-1` |
| heading → subtext | 4 | `mt-1` |
| label → input | 6 | `gap-1.5` |
| input → helper/error | 6 | `mt-1.5` |
| input → input (same group) | 16 | `gap-4` |
| field group → field group | 24 | `gap-6` |
| form section → form section | 32 | `gap-8` |
| form last field → action row | 24 | `mt-6` |
| icon → text (button, badge) | 8 (badge 6) | `gap-2` (`gap-1.5`) |
| icon → text (nav item) | 12 | `gap-3` |
| button ↔ button | 8 | `gap-2` |
| table cell padding | 16 horizontal (first/last 20) | `px-4 first:pl-5 last:pr-5` |
| table header / row height | 40 / 48 | `h-10` / `h-12` |
| list item | 12 vertical, 16 horizontal | `py-3 px-4` |
| dropdown item | 32 high, 8 horizontal | `h-8 px-2 gap-2` |
| dropdown container padding | 4 | `p-1` |
| dialog padding | 24 | `p-6` |
| dialog header → body → footer | 16 → 24 | `gap-4` → `mt-6` |
| toast padding | 16 | `p-4` |
| sidebar padding | 12 | `p-3` |
| avatar ↔ text | 12 (table 8) | `gap-3` (`gap-2`) |

### 3.6 Alignment and hierarchy

| Rule | Value |
|---|---|
| Reading direction | LTR (RTL `[optional]`: use logical utilities `ms-*`, `ps-*`, `start-*` from day one) |
| Text alignment | Left. Center ONLY for: auth card header, empty states, marketing hero, pricing, 404 |
| Numeric columns | Left-aligned `[from-image]`; ALWAYS `tabular-nums`. Right-align only in dense financial tables with ≥ 6 numeric columns |
| Primary action position | Page header: top-right. Forms/dialogs: bottom-right (Cancel left of Primary). Mobile forms: stacked full-width, Primary on top |
| Visual weight order (top → bottom) | page title → KPI numbers → primary visualization → secondary visualization → detail table |
| One-primary rule | Max ONE solid-orange button per visible zone (page header, card toolbar, dialog). Table toolbar counts as its own zone `[from-image]` |

---

## 4. COMPONENT LIBRARY

Install baseline: `npx shadcn@latest init` then `npx shadcn@latest add button input textarea select checkbox radio-group switch slider toggle toggle-group calendar popover command dropdown-menu context-menu menubar navigation-menu dialog alert-dialog sheet drawer tooltip hover-card card table badge avatar tabs accordion collapsible breadcrumb pagination separator scroll-area resizable carousel aspect-ratio skeleton progress sonner alert sidebar chart input-otp label form` (see D-05 for newer components).

Spec format per component: **purpose · anatomy · variants · sizes · states · classes · a11y · DO/DON'T**. `{ }` = fill with the pattern. Every class below uses tokens only.

### 4.0 Global state model (applies to EVERY interactive component)

| State | Class pattern | Rule |
|---|---|---|
| default | per component | |
| hover | `hover:bg-accent` (ghost/menu) · `hover:bg-primary/90` (solid) · `hover:border-ring/50` (input) | transition `transition-colors duration-150` |
| focus-visible | `focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40` (+ `focus-visible:border-ring` on bordered controls) | MUST be visible on every focusable element. NEVER `outline-none` without ring replacement |
| active/pressed | `active:bg-primary/80` (solid) · `active:bg-accent/80` (ghost) | no scale/translate |
| disabled | `disabled:pointer-events-none disabled:opacity-50` | use `aria-disabled` for links |
| loading | replace leading icon with `Spinner`/`Loader2 animate-spin size-4`, set `aria-busy="true"`, `disabled`, keep width (no layout shift) | label stays; never swap label to "..." |
| error | `aria-invalid="true"` → `aria-invalid:border-destructive aria-invalid:ring-destructive/20` + message below with `text-caption text-danger-text` | message linked via `aria-describedby` |
| empty | Section 4.9 Empty state | required for every list/table/chart |
| selected | `data-[state=checked]:bg-primary` (controls) · `bg-accent` (rows/menus) | |

### 4.1 Button

| Field | Spec |
|---|---|
| Purpose | Trigger an action. NOT navigation (use `asChild` + `<Link>` styled as button, or Link variant) |
| Anatomy | `[leading icon?] label [trailing icon?]` · icon-only has no label + `aria-label` |
| Base | `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0` |

| Variant | Classes (append to base) | Use |
|---|---|---|
| default (primary) `[from-image]` | `bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80` | THE main action of the zone. Max 1 per zone. Trailing `Plus` icon for "create/add" `[from-image]` |
| secondary | `bg-secondary text-secondary-foreground border border-border hover:bg-accent` | second-most action, grey filled `[from-image]` (filter button) |
| outline | `border border-input bg-card text-foreground hover:bg-accent` | date picker trigger, neutral actions `[from-image]` |
| ghost | `text-foreground hover:bg-accent` | toolbar icons, table row actions, cancel |
| destructive | `bg-destructive text-destructive-foreground hover:bg-destructive/90` | irreversible action, ONLY inside AlertDialog footer or danger zone |
| link | `text-primary-strong underline-offset-4 hover:underline h-auto p-0` | inline text actions |

| Size | Classes | Height | Use |
|---|---|---|---|
| sm | `h-8 px-3` | 32px | table toolbar `[from-image]`, dense UI |
| default | `h-9 px-4` | 36px | default; page header CTA `[from-image]` |
| lg | `h-11 px-6 text-body` | 44px | auth submit, marketing CTA, mobile primary |
| icon | `size-9` | 36px | header tools `[from-image]` |
| icon-sm | `size-8` | 32px | table toolbar kebab |
| icon-xs | `size-7 rounded-md` | 28px | card corner arrow `[from-image]`, sidebar `+` |

Tag: **A11y** icon-only MUST have `aria-label`; min touch target 44px on touch devices (use `lg` or wrap with padding at `<md`). **DO** icon after label for "next/add", before for descriptors. **DON'T** two primary buttons in one zone; label like "Click here"; disabled primary without helper text explaining why; button-styled links for destructive navigation.

### 4.2 Form controls

Shared control base (`CONTROL`): `h-9 w-full rounded-lg border border-input bg-card px-3 text-body-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 hover:border-ring/50 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50`

| Component | Purpose | Spec (classes/rules) | Sizes | Extra states / notes |
|---|---|---|---|---|
| **Input** | single-line text | `CONTROL`. Types: text, email, password (with show/hide ghost icon-xs inside, `pr-10`), number (`tabular-nums`), tel, url | sm `h-8`, default `h-9`, lg `h-11` (auth, mobile) | mobile: font MUST be ≥ 16px (`text-title`) at `<md` to prevent iOS zoom |
| **Input with icon / InputGroup** | prefix/suffix (currency, search, unit) | wrapper `relative`; icon `absolute left-3 size-4 text-muted-foreground`; input `pl-9`. Addon variant: `flex` with addon `border border-input bg-muted px-3 rounded-l-lg` | same | |
| **Search field** `[from-image]` | filter list/table | Input with `Search` icon left, `bg-muted border-transparent hover:border-input`, width `w-56` (224px) in toolbars, `w-full` at base; `Kbd ⌘K` right optional | sm/default | debounce 300ms; `Esc` clears; `role="search"` on wrapper |
| **Textarea** | multi-line | `CONTROL` minus `h-9` plus `min-h-20 py-2 resize-y`; char counter `text-caption text-muted-foreground` bottom-right when limit exists | — | |
| **Select** | choose 1 of 6–15 | shadcn Select. Trigger = `CONTROL flex items-center justify-between` + `ChevronDown size-4 opacity-60`. Content `rounded-lg border bg-popover p-1 shadow-md`, item `h-8 rounded-md px-2 text-body-sm data-[highlighted]:bg-accent`, selected shows `Check size-4` right | sm/default | native `<select>` at `<md` `[optional]` |
| **Combobox** | 16+ options, async, or searchable | Popover + Command. Trigger like Select. Content `w-[--radix-popover-trigger-width] p-0`, `CommandInput` on top, list `max-h-64`, `CommandEmpty` "No results" | default | multi-select: selected as chips (`Badge secondary`) inside trigger, max 3 then "+N" |
| **Checkbox** | multi-choice / bulk select | `size-4 rounded-sm border border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground`; hit area extended to 24px via label; indeterminate for parent selects | 16px | label right, `gap-2`, `text-body-sm` |
| **Radio group** | choose 1 of 2–5 | `size-4 rounded-full border border-input`, checked = 2px `bg-primary` dot `data-[state=checked]:border-primary`; group `grid gap-3`; card-style radio (`rounded-xl border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft`) for plans/options with descriptions | 16px | |
| **Switch** | instant on/off (no submit) | track `h-5 w-9 rounded-full data-[state=unchecked]:bg-input data-[state=checked]:bg-primary`; thumb `size-4 rounded-full bg-background`; label left, switch right (settings rows) | 20×36 | MUST apply immediately + toast; if requires Save, use Checkbox |
| **Slider** | range values | track `h-1.5 rounded-full bg-muted`, range `bg-primary`, thumb `size-4 rounded-full border-2 border-primary bg-background`; value label above right `text-caption tabular-nums` | — | keyboard arrows step, PgUp/PgDn ×10 |
| **Toggle / ToggleGroup (segmented)** | choose 1 of 2–4 views/modes | group `inline-flex rounded-lg bg-muted p-1`; item `h-7 rounded-md px-3 text-body-sm data-[state=on]:bg-card data-[state=on]:shadow-sm` | h-9 | use for Day/Week/Month, list/grid view |
| **Calendar / Date picker** `[from-image]` trigger | single date, range | Trigger = outline button `Calendar size-4` left + formatted date + `ChevronDown` right (`w-auto`). Content Popover `p-0`; day cell `size-9 rounded-md`; today `bg-accent`; selected `bg-primary text-primary-foreground`; range middle `bg-primary-soft` | 36px cells | presets column left for ranges (Today, 7d, 30d, This month) |
| **OTP input** | 6-digit codes | 6 slots `size-11 rounded-lg border border-input text-title font-semibold tabular-nums`, group gap `gap-2`, optional separator after 3; active slot `ring-3 ring-ring/40 border-ring`; paste fills all; auto-submit on complete | 44px | error: shake NOT allowed; use `aria-invalid` red border + message |
| **File upload / Dropzone** | files | `rounded-xl border-2 border-dashed border-input bg-muted/40 p-8 text-center`; icon `Upload size-6 text-muted-foreground`; text "Drag files here or **browse**" (`text-primary-strong`); dragover `border-primary bg-primary-soft`; file rows below: `flex items-center gap-3 rounded-lg border p-3` with progress `h-1.5` and remove ghost icon | — | states: idle, dragover, uploading (progress), success (check `text-success`), error (`text-danger-text` + retry) |

**A11y (all controls):** every control has a visible `<Label>` (placeholder is NEVER a label); required fields marked `*` in `text-danger-text` + `aria-required`; error text `role="alert"` on submit, `aria-live="polite"` on blur; focus order = visual order.

### 4.3 Form field wrapper (Field)

```
<div className="grid gap-1.5">
  <Label className="text-body-sm font-medium">Email <span className="text-danger-text">*</span></Label>
  <Input aria-invalid={!!error} aria-describedby="email-msg" />
  <p id="email-msg" className="text-caption text-muted-foreground">Helper text</p>   // OR error:
  <p id="email-msg" role="alert" className="text-caption text-danger-text flex items-center gap-1"><AlertCircle className="size-3.5"/>Error text</p>
</div>
```
Rules: label ABOVE control (never inline-left except switch/checkbox rows); helper and error occupy the same slot (error replaces helper); max one line of helper; horizontal 2-column field layout allowed only `md+` with `grid md:grid-cols-2 gap-4`; field vertical gap 16px; form width `max-w-2xl`; use `react-hook-form` + `zod` via shadcn `Form`.

### 4.4 Cards

| Variant | Anatomy | Classes | Notes |
|---|---|---|---|
| **Card (basic)** `[from-image]` | header (title left, tools right) · content · footer? | `rounded-xl border bg-card text-card-foreground p-5`; header `flex items-center justify-between mb-4`; title `text-title font-medium` | no shadow. Never nest a card inside a card; use `bg-muted rounded-lg p-3` panel instead |
| **Stat card** `[from-image]` | icon chip + title (left) · corner arrow-button (right) / big number · delta · sparkline | `Card p-5`; top row `flex items-center justify-between`; icon chip `size-7 rounded-md grid place-items-center bg-chip-purple text-chip-purple-fg` (variants: purple, `bg-primary-soft text-primary-strong`, `bg-chip-blue text-chip-blue-fg`); title `text-body-sm ml-2`; arrow `Button ghost icon-xs` with `ArrowUpRight`; body `mt-3 flex items-end justify-between`; number `text-stat font-semibold tabular-nums`; delta `mt-1 flex items-center gap-1 text-caption` + `text-muted-foreground` " vs last week"; sparkline `w-36` (144px) DotSparkline (4.14) | delta: up-good `text-success-text` with `▲`/`TrendingUp`; down-bad `text-danger-text` `▼`; INVERT color for metrics where down is good (e.g. low-stock items rising is bad) |
| **Chart card** `[from-image]` | title + inline value + legend + controls / plot | `Card p-5`; header controls: badge (target chip `bg-primary-soft text-primary-strong rounded-md px-2 py-1 text-caption`), Select `sm` ("Day"), filter icon button | value `text-stat font-semibold`; delta beside value |
| **Media card** `[inferred]` | image (aspect-video, `rounded-lg`) · title · meta · action | `Card p-0 overflow-hidden`; image `aspect-video object-cover`; body `p-4` | image alt required; hover `shadow-xs` only if clickable |
| **Interactive card** `[inferred]` | whole card is a link/button | `Card transition-shadow duration-150 hover:shadow-xs hover:border-ring/40 focus-within:ring-3 focus-within:ring-ring/40` + stretched link | never put other buttons inside unless they stop propagation |
| **Pricing card** | see 4.13 | | |

### 4.5 Table & Data Table `[from-image]`

| Part | Spec |
|---|---|
| Container | `Card p-0 overflow-hidden`. Top bar `flex items-center justify-between gap-2 p-5 pb-4`: title left (`text-title font-medium`); right cluster: Search (sm, `w-56`), primary `Button sm` "Add Transaction +", kebab `Button ghost icon-sm` (opens DropdownMenu: Export CSV, Column visibility, Refresh) |
| Header row | `bg-muted/60 h-10 border-y`; th `px-4 first:pl-5 last:pr-5 text-left text-caption font-medium text-muted-foreground`; sortable th = button with label + `ChevronsUpDown size-3.5`; active sort shows `ArrowUp`/`ArrowDown` in `text-foreground` |
| Body row | `h-12 border-b last:border-0 text-body-sm hover:bg-muted/40 data-[state=selected]:bg-primary-soft` |
| Cell types | text · number (`tabular-nums`) · person (`Avatar size-6 rounded-full` + name, `gap-2`) · item (thumbnail `size-6 rounded-md` + name) · status (Badge 4.10) · date (`text-muted-foreground`) · actions (kebab) · checkbox (col width 40px) |
| Column widths | ID 96px · person 200px · item flexible · numeric 96–128px · status 120px · actions 48px |
| Footer | `flex items-center justify-between p-4 border-t text-caption text-muted-foreground`: "Showing 1–10 of 248" left, Pagination right |
| Pagination | Buttons `outline icon-sm` prev/next + page numbers max 5 + ellipsis; page size Select (10/25/50) |
| Selection | header checkbox; on ≥ 1 selected, a bulk bar replaces the toolbar: `"3 selected"` + actions + `Clear` |
| Overflow | `overflow-x-auto` on the wrapper; sticky first column at `<lg` `[inferred]`; NEVER wrap cell text on ID/number/status columns (`whitespace-nowrap`) |
| Row density | default 48px; compact 40px (`h-10`) `[inferred]`; NEVER below 40px |
| Empty | Empty state inside container (icon, title, description, primary action) |
| Loading | 5 skeleton rows `h-12`; header stays |
| Mobile (`<md`) | table → stacked card list (each row a `Card p-4`, key value pairs `grid grid-cols-2 gap-y-2`, status badge top-right, actions kebab) |
| Library | `@tanstack/react-table` + shadcn `Table`. Sorting/filter/pagination server-side when rows > 500 |

**DON'T** center-align data columns; put more than one inline row action visible (use kebab); truncate without tooltip; use zebra stripes (rows use hairline dividers only).

### 4.6 Navigation

| Component | Spec |
|---|---|
| **Sidebar** `[from-image]` | Use shadcn `Sidebar`. Dimensions per 3.3. Structure: `SidebarHeader` (logo, collapse) → workspace switcher (DropdownMenu) → `SidebarContent` groups → `SidebarFooter` (user menu). Groups collapse with `Collapsible`. Item `SidebarMenuButton`. Collapsed-icon mode shows tooltips. Active route: `data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium` |
| **Topbar** (S2/S3) | see 3.2 |
| **Tabs** | list `inline-flex h-9 items-center rounded-lg bg-muted p-1` (pill style) OR line style `border-b` with trigger `h-10 px-3 text-body-sm text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary`. Use line style for page-level sections, pill style inside cards. Max 6 tabs (Section 15) |
| **Breadcrumb** | `text-body-sm text-muted-foreground`, separator `ChevronRight size-3.5`, last item `text-foreground font-medium`; > 4 levels → middle levels collapse to `…` dropdown |
| **Pagination** | see 4.5; for content lists (blog) use numbered pages; for feeds use "Load more" button; infinite scroll only for feeds/chat |
| **Stepper** `[inferred]` | horizontal ≥ md: circles `size-7 rounded-full`, states: done (`bg-primary text-primary-foreground` + Check), current (`border-2 border-primary text-primary-strong`), upcoming (`border border-input text-muted-foreground`); connector `h-px flex-1 bg-border` (done = `bg-primary`). Vertical at base. Label `text-body-sm font-medium`, sub `text-caption text-muted-foreground` |
| **Navigation Menu** (marketing header) | trigger `h-9 px-3 rounded-lg text-body-sm hover:bg-accent`; content panel `rounded-xl border bg-popover p-4 shadow-md`, link grid max 2 cols, each item title + description |
| **Menubar** | desktop-app style (editor pages only) `[optional]` |

### 4.7 Menus

| Component | Spec |
|---|---|
| **Dropdown Menu** | Content `min-w-48 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md`; item `flex h-8 items-center gap-2 rounded-md px-2 text-body-sm outline-none data-[highlighted]:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground`; label `px-2 py-1.5 text-caption font-medium text-muted-foreground`; separator `my-1 h-px bg-border`; shortcut `ml-auto text-caption text-muted-foreground`; destructive item `text-danger-text data-[highlighted]:bg-danger-soft [&_svg]:text-danger-text`; checkbox/radio items show `Check` left. Align `end` for triggers at right edge; `side="top"` for sidebar footer user menu `[from-image]` |
| **Context Menu** | same visuals; right-click / long-press; MUST mirror an accessible kebab/toolbar path (context menus are never the only path) |
| **Command palette** `[inferred]` | `CommandDialog` `max-w-lg`; input `h-12 border-b px-4`; groups Recent / Navigate / Actions; item `h-9`; `⌘K` / `Ctrl+K`; `Esc` closes; footer hints `text-caption` |

### 4.8 Overlays

| Component | Purpose | Spec | Sizes |
|---|---|---|---|
| **Dialog** | focused task/confirmation blocking the page | `rounded-xl border bg-popover p-6 shadow-lg` centered; overlay `bg-black/50`; header: title `text-h2`, description `text-body-sm text-muted-foreground mt-1`; close `X` ghost icon-xs top-right; body `mt-4`; footer `mt-6 flex justify-end gap-2` = [Cancel ghost/outline][Primary]; max height `max-h-[85vh]` body scrolls | `max-w-sm` (384) confirm · `max-w-lg` (512) form · `max-w-2xl` (672) complex |
| **Alert Dialog** | irreversible/destructive confirmation | Dialog rules + cannot dismiss via overlay click; footer = [Cancel outline][Destructive]. Title states the action ("Delete 3 orders?"), description states consequence. Type-to-confirm input for irreversible bulk/account deletion | `max-w-sm` |
| **Sheet (side drawer)** | edit/create keeping page context, filters, detail preview | right side default; `w-full sm:max-w-md` (448px) or `sm:max-w-lg`; header/body/footer like Dialog; footer sticky `border-t p-4`; animation slide 300ms | 448 / 512 |
| **Drawer (bottom)** | mobile replacement for Dialog/Popover/Select menus at `<md` | vaul; `rounded-t-xl`, grab handle `h-1.5 w-12 rounded-full bg-muted mx-auto mt-3`; max height 90svh | — |
| **Popover** | small interactive panel (filters, date picker, quick edit) | `w-72 rounded-xl border bg-popover p-4 shadow-md`; can contain inputs | `w-72` / `w-80` |
| **Hover Card** | preview on hover (user, link) | `w-72 rounded-xl border bg-popover p-4 shadow-md`; delay 300ms; NEVER contains required actions | — |
| **Tooltip** | label icon-only controls, explain truncated text | `rounded-md bg-foreground px-2 py-1 text-caption text-background shadow-md` (inverted); delay 400ms; max `max-w-xs`; text only, no interactive content | — |
| **Map tooltip card** `[from-image]` | rich data callout on chart/map | `rounded-lg border bg-popover p-3 shadow-md text-body-sm`: flag/icon + title, value `font-semibold tabular-nums` + colored dot | — |

Rules: Dialog/Sheet MUST trap focus, restore focus on close, close on `Esc` (except destructive AlertDialog with pending input), have `DialogTitle` (visually hidden if design omits). Only one modal layer at a time; NEVER open a Dialog from a Dialog (use step inside the same dialog).

### 4.9 Feedback

| Component | Spec |
|---|---|
| **Toast (Sonner)** | bottom-right desktop, top-center mobile. `rounded-lg border bg-popover p-4 shadow-md text-body-sm`; icon left `size-4` colored by type; title `font-medium`, description `text-muted-foreground`; action button `sm ghost`. Duration 4s (info/success), 8s (error), persistent for undo until dismissed max 8s. Max 3 stacked. Use for: async result, undo. NEVER for validation errors |
| **Alert / Banner** | inline persistent message. `rounded-lg border p-4 flex gap-3`; variants: info `bg-info-soft border-info/30 text-info-text`, success, warning, danger (same pattern); icon `size-4 mt-0.5`; title `text-body-sm font-medium`, body `text-body-sm`; optional action link right; dismissible only for non-critical. Page-level banner sits above page header, full content width |
| **Progress** | `h-1.5 rounded-full bg-muted`, indicator `bg-primary rounded-full transition-all duration-300`; label `text-caption tabular-nums`; determinate when % known, else indeterminate shimmer |
| **Spinner** | `Loader2 size-4 animate-spin text-muted-foreground`; sizes 16/24/32. Inline in buttons; full-section spinners only if skeleton impossible |
| **Skeleton** | `animate-pulse rounded-md bg-muted`; MUST match final layout dimensions (stat = number block `h-8 w-24` + sparkline block). Show after 200ms delay to avoid flash; no spinner+skeleton combos |
| **Empty state** | centered `flex flex-col items-center gap-3 py-12 text-center`: icon in `size-10 rounded-full bg-muted` (icon `size-5 text-muted-foreground`), title `text-title font-medium`, description `text-body-sm text-muted-foreground max-w-sm`, ONE primary action (or secondary link). Variants: first-run (invite to create), no-results (Clear filters), no-permission, cleared |
| **Error state** | same layout as Empty with `AlertTriangle` in `bg-danger-soft text-danger-text`; title states what failed in plain words; description says what to do; actions: Retry (primary) + Contact support (link). Never show stack traces or raw codes except in a `code` line at the bottom `text-caption` |

### 4.10 Display

| Component | Spec |
|---|---|
| **Badge / Status pill** `[from-image]` | `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium whitespace-nowrap`; leading dot `size-1.5 rounded-full bg-{status}`. Status map: Pending → `bg-warning-soft text-warning-text` dot `bg-warning`; Success/Paid/Active → `bg-success-soft text-success-text`; Refunded/Failed/Overdue → `bg-danger-soft text-danger-text`; Info/Draft → `bg-info-soft text-info-text`; Neutral → `bg-muted text-muted-foreground`. Variants: `count` (`size-5 rounded-full` number), `outline` (`border`), `brand` (`bg-primary-soft text-primary-strong`). Status MUST include text (never color alone) |
| **Chip / Tag** | `h-7 rounded-md border bg-card px-2 text-caption` + optional remove `X size-3`; filter chips selected: `bg-primary-soft text-primary-strong border-primary/30` |
| **Avatar** | `rounded-full object-cover`; sizes 24 (`size-6` table) · 32 (`size-8` sidebar) · 40 (`size-10`) · 64 (`size-16` profile); fallback initials `bg-muted text-caption font-medium`; group overlap `-space-x-2` with `ring-2 ring-background`. Product thumbnails use `rounded-md` |
| **Accordion** | item `border-b`; trigger `flex w-full items-center justify-between py-4 text-body font-medium hover:underline-none` + `ChevronDown size-4 transition-transform data-[state=open]:rotate-180`; content `pb-4 text-body-sm text-muted-foreground`; single-open default |
| **Collapsible** | for sidebar groups and "Show more"; chevron rotates 90° (right → down) |
| **Separator** | `h-px bg-border` / `w-px bg-border`; stat-row dividers `[from-image]` vertical |
| **Scroll Area** | custom thin scrollbar for menus/lists with fixed max-height; page scrolls natively |
| **Resizable** | split panes (file manager, email) `[optional]`; handle `w-px bg-border` with 16px grab area |
| **Carousel** | `[optional]` marketing/testimonials; arrows `outline icon-sm`; dots `size-1.5`; swipe on touch; MUST pause autoplay on hover/focus and offer pause control |
| **Aspect Ratio** | 16/9 media, 1/1 avatars/products, 4/3 cards |
| **Kbd** | `rounded-sm border bg-muted px-1.5 text-caption font-mono` |
| **List** | `divide-y` rows `py-3 px-4 flex items-center gap-3`; leading avatar/icon, title `text-body-sm font-medium`, sub `text-caption text-muted-foreground`, trailing meta/action |
| **Timeline** `[inferred]` | vertical line `w-px bg-border ml-3`, node `size-6 rounded-full border bg-card`, item gap 24px |
| **Tree** `[inferred]` | indent 16px per level, chevron 16px, row `h-8`, arrow-key nav (roving tabindex) |

### 4.11 Standard charts (Recharts via shadcn `ChartContainer`)

Use standard charts when data density is high (> 60 points), axes need precision, or the metric is a continuous trend. Use dot-matrix (4.14) for KPI sparklines, hero forecast/summary charts, and geo.

| Type | Use | Rules |
|---|---|---|
| Line / Area | trends over time | 2px stroke `var(--color-chart-N)`, no dots except hover, area fill 10% opacity gradient to 0, curve `monotone`; max 4 series |
| Bar | category comparison | radius `[4,4,0,0]`, bar gap 4px, width ≤ 32px, single color unless categorical; horizontal bars for > 6 categories or long labels |
| Stacked bar/area | part-to-whole over time | max 5 segments; order by size desc bottom→top; legend order matches stack |
| Donut/Pie | part-to-whole, ≤ 5 slices | donut thickness 24px, center label = total `text-stat`; slices ≥ 5% else group as "Other" |
| Radar / Radial | multi-metric profile / single progress | max 6 axes; radial for single % |
| Sparkline (standard) | inline trend in tables | 24px high, no axes, 1.5px stroke |

| Shared chart rule | Value |
|---|---|
| Color order | `chart-1` (orange) → `chart-2` (purple) → `chart-3` (blue) → `chart-4` (green) → `chart-5` (yellow). Status semantics override (green = good, red = bad) |
| Grid | horizontal only, `stroke-border`, dashed `3 3`; no vertical grid; no chart border |
| Axes | no axis line; ticks `text-caption fill-muted-foreground`; y-axis ≤ 5 ticks; x-axis ≤ 7 labels; `tabular-nums`; format 12.4k / 1.2M |
| Tooltip | `ChartTooltipContent` (popover surface, `shadow-md`, `rounded-lg p-3`); indicator dot 8px; shows all series at cursor x |
| Legend | above plot, right-aligned, `text-caption`, dot 8px + label, `gap-4` `[from-image]` |
| Container | `aspect-video` or fixed `h-64` (256px) / `h-80` (320px); ALWAYS inside a Card with title + optional Select for range |
| a11y | `accessibilityLayer` on; `aria-label` summary sentence; data table toggle for complex charts |
| States | loading skeleton (same height), empty state ("No data for this range" + range change action), error state with Retry |
| Animation | ≤ 600ms on mount; disabled under reduced motion |

### 4.12 Drag and drop (dnd-kit)

Library: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. shadcn has no DnD component; build with these rules.

| Use case | Pattern | Sensors / constraints |
|---|---|---|
| Sortable list / reorder rows | `SortableContext` + `verticalListSortingStrategy`; drag handle `GripVertical size-4 text-muted-foreground` at row start, `cursor-grab`, visible on row hover at desktop, ALWAYS visible on touch | `PointerSensor` `activationConstraint: { distance: 6 }`; `TouchSensor` `{ delay: 200, tolerance: 8 }`; `KeyboardSensor` with `sortableKeyboardCoordinates` |
| Kanban | columns `w-72` (288px) `shrink-0 rounded-xl bg-muted/60 p-2 flex flex-col gap-2`; header `px-2 py-1` (title + count badge + kebab); cards `Card p-3` (`rounded-lg`); board `flex gap-4 overflow-x-auto pb-4`; add-card ghost button at column bottom | `rectIntersection` or `closestCorners`; `DragOverlay` required |
| Dashboard widget reorder `[optional]` | `rectSortingStrategy` grid | persist order per user |
| File dropzone | 4.2 File upload (native HTML5 drop, not dnd-kit) | validate type/size on drop; keyboard: button opens file picker |

| State | Style |
|---|---|
| idle | normal card |
| hover (handle) | handle `text-foreground` |
| dragging (source in place) | `opacity-40` |
| drag overlay (floating clone) | `shadow-md ring-2 ring-primary/40 bg-card rounded-lg cursor-grabbing` (no rotation, no scale) |
| drop target (column/list) | `bg-primary-soft ring-2 ring-primary/30 ring-inset` |
| insertion indicator (list) | `h-0.5 bg-primary rounded-full` line between items |
| drop invalid | `cursor-not-allowed` + `bg-danger-soft` |
| dropped | 200ms `bg-primary-soft` fade to normal |

a11y: Space/Enter lifts, arrows move, Space drops, Esc cancels; use dnd-kit `announcements` live region with plain sentences ("Picked up Task 4. Position 2 of 6"); every drag operation MUST have a non-drag alternative (Move to… menu item in the kebab). Autoscroll enabled on scroll containers. Persist optimistic; roll back with toast on failure.

### 4.13 Marketing / commerce components `[inferred]`

| Component | Spec |
|---|---|
| **Hero** | centered or split. Container `max-w-7xl`, `py-24 md:py-32`. Overline badge → H1 `text-display font-semibold tracking-tight` (≤ 12 words, `text-h1` at base) → sub `text-title text-muted-foreground max-w-2xl` → CTA row (`lg` primary + `lg` outline) `mt-8 gap-3` → social proof row → product screenshot inside `rounded-2xl border bg-card p-2 shadow-lg` |
| **Feature grid** | `grid gap-4 md:grid-cols-2 lg:grid-cols-3`; card: icon chip `size-10 rounded-lg bg-primary-soft text-primary-strong`, title `text-title font-medium mt-4`, text `text-body-sm text-muted-foreground mt-1` |
| **Pricing card** | `Card p-6 rounded-2xl`; name `text-title font-medium`; price `text-h1 font-semibold tabular-nums` + `/mo` `text-body-sm text-muted-foreground`; features list `gap-3` with `Check size-4 text-success`; CTA `w-full` at bottom (`outline` for standard, default for highlighted); highlighted plan: `border-2 border-primary` + badge "Most popular"; ≤ 4 plans; billing toggle = ToggleGroup |
| **Testimonial** | quote `text-body`, avatar 40px + name `text-body-sm font-medium` + role `text-caption text-muted-foreground`; ≤ 3 lines quote; card `p-6` |
| **FAQ** | Accordion in `max-w-3xl`; 5–8 items; question 1 line |
| **CTA band** | `rounded-2xl bg-foreground text-background p-10 md:p-16 text-center` (inverts per theme) with one `lg` primary (orange) button |
| **Footer** | `border-t py-12`; 4-column link grid at `lg` (2 at base); legal row `text-caption text-muted-foreground`; theme toggle optional |
| **Product card (commerce)** | image `aspect-square rounded-lg bg-muted`; name `text-body-sm font-medium`; price `text-body-sm font-semibold tabular-nums`; badges top-left; quick-add button appears on hover (desktop) / always (touch) |
| **Cart line item** | thumbnail 64px `rounded-lg`, name+variant, qty stepper (`outline icon-sm` −/+ with `tabular-nums` value), price right, remove ghost icon |
| **Order summary** | `Card p-5` rows `flex justify-between text-body-sm`, total `text-title font-semibold` after `Separator`, primary CTA `w-full lg` |

### 4.14 Dot-matrix data visualization (SIGNATURE) `[from-image]`

These are custom components. They MUST replace Recharts for the listed slots. Build as `components/viz/dot-sparkline.tsx`, `dot-forecast.tsx`, `dot-map.tsx` using SVG `<circle>` (≤ 2,500 dots) or `<canvas>` (> 2,500).

**Global dot rules**

| Property | Value |
|---|---|
| Shape | perfect circle, no stroke |
| Filled color | token from series (`fill-chart-N` or status dot tokens) |
| Empty/future color | `fill-dot-empty`; when drawn on top of a filled column background use `opacity-60` |
| Grid | dots on a strict rectangular grid; pitch = diameter + gap |
| Responsiveness | column count fixed by container width ÷ pitch (`ResizeObserver`); dot size never scales, count does |
| Motion | on mount, columns fade in left→right, 8ms stagger per column, total ≤ 600ms; hover on column raises opacity of that column and shows tooltip; reduced-motion: no animation |
| a11y | wrapper `role="img"` + `aria-label` describing the trend in one sentence; provide `<table className="sr-only">` fallback with the same data; do NOT rely on dot color alone (tooltip shows numeric value) |

**DotSparkline** (stat cards)

| Prop | Default |
|---|---|
| width × height | `w-36` (144px) × `h-14` (56px) |
| dot diameter / gap | 4px / 2px (pitch 6px) |
| columns | 20 (fits 144px approx; compute from width) |
| rows | 8; each column fills `round(value / max * rows)` dots from the bottom |
| filled color | series color (`chart-2` purple, `chart-1` orange, `chart-3` blue in stat cards) |
| unfilled | `fill-dot-empty` at 50% opacity, visible above bars `[from-image]` |
| data | last 20 points; no axes, no labels |

**DotForecast** (hero chart)

| Prop | Spec |
|---|---|
| Plot | `h-48` (192px) to `h-56` (224px); dot 8px, gap 3px (pitch 11px) `[est]` |
| X axis | date labels below (`text-caption`), first/last aligned to edges, active date bold `text-foreground` `[from-image]` |
| Column = time bucket; column height = value | stacked bands bottom→top: **below target** (`dot-below` yellow) → **on track** (`dot-track` orange) → **above target** (`dot-above` green) `[from-image]` |
| Future | columns after "today" render all `dot-empty` (grey) |
| Today marker | 1px vertical line `bg-foreground` full plot height + small dot at top; label pill above-right: `rounded-full border bg-card px-3 py-1 text-caption` with `font-semibold` value + `text-muted-foreground` label ("+16.03% Growth Projected") |
| Legend | top-right of card header: 3 items `text-caption`, dot 8px, gap 16px (Above Target / On Track / Below Target) |
| Header | big value `text-stat` + delta caption inline `[from-image]`; controls right (target chip, Day Select, filter button) |

**DotMap** (geo)

| Prop | Spec |
|---|---|
| Base | world map rasterized to a dot grid, land only, dot 3px, pitch 6px, `fill-dot-empty` `[from-image]` |
| Markers | 8–12px colored dots (`chart-1..5`) with 3px `ring-background` outline; selected marker gets ring `ring-primary/30` |
| Tooltip | Map tooltip card (4.8) with flag, country, users count, status dot |
| Stat footer | `grid grid-cols-3 divide-x border-t pt-4 mt-4`; each: value `text-h2 font-semibold tabular-nums`, label `text-caption text-muted-foreground` `[from-image]` |
| Data | `{ countryCode, value }[]`; map asset is a pre-computed JSON of dot coordinates (generate once, commit to `/public/geo/world-dots.json`) |
| Fallback | table of top countries in `sr-only` |

**When to use dot-matrix vs standard**

| Condition | Component |
|---|---|
| KPI card trend | DotSparkline |
| Single hero trend/forecast with target bands | DotForecast |
| Geographic distribution | DotMap |
| Dense time series, > 60 points, axes needed, comparison of ≥ 3 series | Standard chart (4.11) styled with the same tokens |
| Anything printed/exported | Standard chart |

---

## 5. CONSISTENCY LAW (cross-page rules)

Numbered and testable. Cite by number when correcting the agent (e.g. "you violated CL-07").

| ID | Rule |
|---|---|
| CL-01 | Every authenticated page MUST use one shell (S1 or S2) chosen once per product. NEVER mix shells inside a flow |
| CL-02 | Every auth screen (login, signup, forgot, reset, verify) MUST use the same auth shell (S4 or S5) |
| CL-03 | Only tokens from Section 2 may appear in code. Raw hex, raw px, and arbitrary Tailwind values are FORBIDDEN (allowed exceptions: `text-[11px]` overline, `z-[100]` toast, `max-w-[1600px]` content wrapper, `max-h-[85vh]` dialog body, Radix CSS-variable sizing such as `w-[--radix-popover-trigger-width]`) |
| CL-04 | Same component = same spacing everywhere. Never re-pad a component locally; add a documented variant instead |
| CL-05 | Max ONE primary (solid orange) button per zone. A page has at most 2 zones with a primary (page header + one card/dialog toolbar) |
| CL-06 | The primary action is ALWAYS in the same place: page header top-right; dialog/form footer bottom-right; table toolbar right of search |
| CL-07 | Page title is ALWAYS `text-h1 font-medium`, left-aligned, top of content, with optional caption under it |
| CL-08 | Card = `rounded-xl border bg-card p-5`. No card variants with different radius, padding, or shadow unless listed in 4.4 |
| CL-09 | Controls (button, input, select) share heights: 32 / 36 / 44px only. In one row, all controls have the same height |
| CL-10 | Card gap and row gap = 16px (`gap-4`); page padding = 24px (`p-6`) at `md+`. No exceptions in app shells |
| CL-11 | Icons: lucide-react only, outline, `size-4` in controls, `size-5` in empty states/feature chips, `size-6` for hero features. Never mix icon libraries or fill styles |
| CL-12 | Status is always shown as a Badge with text + dot, using the status map in 4.10. Same status = same color everywhere |
| CL-13 | Deltas: up-good green with ▲, down-bad red with ▼. Invert color (not arrow) when direction-is-bad. Format `+4.02%` / `-7.06%` with sign, 2 decimals, `tabular-nums` |
| CL-14 | Numbers: thousands separators; currency symbol prefix with no space (`$9,102`); compact `12.4k`/`1.2M` only in charts and stat sublines; dates `MMM d, yyyy` (`Jul 16, 2026`); times 12h with AM/PM (or user locale) |
| CL-15 | Labels/buttons/menus use sentence case ("Add transaction", not "Add Transaction"). Table headers sentence case. Page titles sentence or title case per brand, but consistent |
| CL-16 | Every list/table/chart has loading, empty, and error states implemented BEFORE the page is considered done |
| CL-17 | Every interactive element has a visible `focus-visible` ring and hover feedback (4.0) |
| CL-18 | Destructive actions: last in menu, `text-danger-text`, confirmed with AlertDialog naming the object and consequence |
| CL-19 | Row actions: ≤ 2 visible icon buttons, else kebab (Section 15) |
| CL-20 | Forms: single column, labels above, helper/error below in same slot, submit bottom-right, Cancel to its left |
| CL-21 | Form validation: on blur for first touch, on change after first error, full check on submit; focus moves to first invalid field on failed submit |
| CL-22 | Text alignment: left. Center only for auth headers, empty/error states, hero, pricing |
| CL-23 | Body text ≥ 13px (14px on marketing), captions ≥ 12px; interactive text ≥ 13px; inputs on mobile ≥ 16px |
| CL-24 | Colors carry meaning: orange = brand/primary, green = success/good, yellow/amber = pending/warning, red = error/destructive, blue = info, purple/blue in stat chips = decorative category. Never use red/green as decoration |
| CL-25 | Text on surfaces: primary `text-foreground`, secondary `text-muted-foreground`. NEVER use lighter grey than `muted-foreground` for readable text; placeholder = `muted-foreground` |
| CL-26 | Do not stack borders: card in card, table in card border-to-border, divider adjacent to border → remove one |
| CL-27 | Navigation labels and page titles MUST match (sidebar "Order Management" → page title "Order management"). Breadcrumb mirrors sidebar hierarchy |
| CL-28 | Dark mode parity: every screen verified in both themes; components use semantic tokens only (DM-1) |
| CL-29 | Responsive: every page has defined behavior at base/md/lg (Section 11). No horizontal page scroll at 360px width |
| CL-30 | Overlay hierarchy: Tooltip < Popover/Dropdown < Sheet < Dialog < Toast. One modal at a time |
| CL-31 | Copy tone: plain, concise, active voice; no exclamation marks in errors; no jargon; error = what happened + what to do |
| CL-32 | Dot-matrix components (4.14) MUST be used for KPI sparklines and the hero forecast; standard charts follow shared chart rules (4.11) |
| CL-33 | Data density is consistent within a page: do not mix 40px and 48px table rows, or `h-8` and `h-9` toolbar controls in the same toolbar |
| CL-34 | Any new UI element MUST be composed from existing tokens/components; if none fits, add a spec to Section 4 first, then use it |

---

## 6. DECISION MATRICES (execute without judgment)

### 6.1 Content type → component

| Content | Component |
|---|---|
| 3–4 headline KPIs | Stat cards (row of 3–4, `col-span-4` or `col-span-3`) |
| ≥ 5 comparable attributes across ≥ 5 items | Table |
| 2–4 attributes per item, visual-first (products, people) | Card grid |
| Sequential events | Timeline |
| Hierarchical items | Tree or nested Accordion |
| Trend over time (single) | DotForecast (hero) or Line/Area |
| Comparison across categories | Bar |
| Part-to-whole ≤ 5 parts | Donut; > 5 parts → horizontal Bar |
| Geographic data | DotMap |
| Status of one process | Progress (single) / Stepper (multi-stage) |
| Key-value details of one entity | Description list: `grid grid-cols-2 gap-y-3` label `text-muted-foreground`, value `font-medium` |
| Long-form reading | Prose `max-w-prose`, `text-body`, `leading-7` |
| Yes/no setting (instant) | Switch |
| Yes/no in a form (submitted) | Checkbox |
| Free-text short / long | Input / Textarea |
| Date / range | Date picker / range with presets |
| Choose 1: ≤ 5 options | RadioGroup (or ToggleGroup for view modes) |
| Choose 1: 6–15 | Select |
| Choose 1: ≥ 16 or remote | Combobox |
| Choose many: ≤ 5 | Checkbox group |
| Choose many: ≥ 6 | Multi-select Combobox |
| Numeric range | Slider (approx) / two Inputs (exact) |
| Files | Dropzone |
| Notifications transient / persistent | Toast / Alert or Notification Center |

### 6.2 Field count → form layout

| Fields | Layout |
|---|---|
| 1–4 | Single column, no sections |
| 5–8 | Single column, grouped into 2–3 titled sections (`gap-8`, section title `text-title font-medium`) |
| 9–15 | Sections with sidebar sub-nav OR Tabs; sticky footer action bar |
| ≥ 16 or dependent branches | Multi-step Stepper (max 5 steps, ≤ 7 fields per step), progress saved per step |
| Edit of existing entity (any count) | Sheet or dedicated page; inline edit only for 1 field |

### 6.3 Data volume → presentation

| Items | Presentation |
|---|---|
| 0 | Empty state |
| 1–5 | List or cards, no pagination |
| 6–25 | Table, no pagination |
| 26–500 | Table + pagination (10/25/50) + search + sort |
| > 500 | Server-side table + pagination + filters + saved views |
| Feed/chat/log | Infinite scroll with "Jump to latest"; virtualize > 200 rows |
| Image gallery | Grid + lazy load; lightbox on click |

### 6.4 Action severity → pattern

| Severity | Pattern |
|---|---|
| Reversible, low (toggle, archive) | Immediate + toast with Undo (8s) |
| Reversible, medium (bulk edit) | Confirm in Dialog or toast with Undo |
| Destructive, single, recoverable (soft delete) | AlertDialog, destructive button |
| Destructive, irreversible | AlertDialog + type-to-confirm (type object name) |
| Account/billing critical | Dedicated "Danger zone" card at page bottom (`border-danger/30`), AlertDialog + type-to-confirm |
| Long-running | Progress + toast on completion + notification entry |

### 6.5 Screen width → transformation

| Element | base (<768) | md (768–1023) | lg (≥1024) |
|---|---|---|---|
| Shell S1 sidebar | offcanvas Sheet via trigger | offcanvas | persistent 240px |
| Stat cards row | 1 col stack (or horizontal scroll snap `[optional]`) | 2 cols | 3–4 cols |
| Chart + side card | stacked | stacked | 8 + 4 |
| Table | card list | table with horizontal scroll, sticky first col | full table |
| Page header actions | wrap below title; primary stays visible | inline | inline |
| Dialog | full-screen Drawer (bottom) | centered | centered |
| Popover filters | bottom Drawer | Popover | Popover |
| Tabs | horizontal scroll | inline | inline |
| Forms 2-col | 1 col | 2 col | 2 col |
| Primary CTA in forms | full width, top of stack | right-aligned | right-aligned |
| Nav (S3) | hamburger → Sheet | inline | inline |

### 6.6 State → required UI

| State | Required UI |
|---|---|
| Loading (first) | Skeleton matching layout (delay 200ms) |
| Loading (refresh) | keep stale data + subtle top progress bar `h-0.5 bg-primary`; no skeleton |
| Empty (first-run) | Empty state + primary create action |
| Empty (filtered) | Empty state "No results" + "Clear filters" |
| Error (recoverable) | Error state + Retry |
| Error (partial widget) | Error inside that card only; rest of page renders |
| Success (action) | Toast; inline check for saves in forms |
| Partial data | Render available; show `—` for missing values (never `0`, `null`, `undefined`) |
| Offline | top Alert banner (warning) "You're offline. Changes will sync when you reconnect." |
| Permission denied | Error state variant with lock icon, who to ask, back link |
| Stale | timestamp `Last updated 30 sec ago` `[from-image]` in page header caption |

### 6.7 Intent → CTA hierarchy

| Intent on page | Primary | Secondary | Tertiary |
|---|---|---|---|
| Create entity | "New/Add {entity} +" | Import / Export (outline or in menu) | View docs (link) |
| Edit entity | Save changes | Cancel (ghost) | Delete (in menu or danger zone) |
| Auth | Sign in / Create account (lg, full width) | "Continue with Google" (outline lg) | Forgot password (link) |
| Checkout | Place order / Pay | Back (ghost) | Promo code (link) |
| Pricing | Highlighted plan CTA | other plan CTA (outline) | Contact sales (link) |
| Read-only view | none (or single "Edit") | Export/Share | — |

---

## 7. STATES & FEEDBACK PATTERNS

| Pattern | Rule |
|---|---|
| Validation timing | First blur → validate; after first error → validate on change; on submit → validate all, focus first invalid, announce count with `role="alert"` ("3 fields need attention") |
| Inline error copy | "{Field} is required." / "Enter a valid email address." / "Password must be at least 8 characters." Max 1 sentence, no blame |
| Success copy | Past tense, object-first: "Campaign created", "Changes saved". Max 6 words. No "Successfully" |
| Toast copy | Title only for simple results; add description only when more info/undo is needed |
| Destructive confirm copy | Title: "Delete {n} {object}?" · Body: "This can't be undone." or "You can restore from Trash for 30 days." · Buttons: "Cancel" / "Delete" |
| Empty copy | Title: what's missing ("No orders yet"). Body: how to fix, one sentence. CTA verb-first |
| Error copy | "Couldn't {verb} {object}. {Reason if known}. {Action}." e.g. "Couldn't load orders. Check your connection and try again." |
| Optimistic updates | Apply instantly; on failure revert + error toast with Retry; never for payments/destructive irreversibles |
| Loading buttons | Spinner replaces leading icon; label unchanged; disabled |
| Long operations | > 3s: progress indicator; > 10s: background task with notification |
| Autosave | "Saving…" → "Saved" `text-caption text-muted-foreground` in header, 2s debounce |
| Unsaved changes | Route/dialog leave → AlertDialog "Discard changes?" [Keep editing][Discard] |
| Rate/permission | 403: permission-denied state; 429: toast "Too many requests. Try again in {n}s." |
| Offline | 6.6 |
| Microcopy tone | calm, direct, human. Sentence case. No emojis in product UI. No ALL CAPS except overline |

---

## 8. MOTION & INTERACTION

| Element | Transition | Duration | Easing |
|---|---|---|---|
| Hover/focus color, border, bg | `transition-colors` | 150ms | `ease-standard` |
| Button press | color only (no scale) | 150ms | standard |
| Dropdown/Popover/Tooltip open | fade + zoom 95→100 + slide 4px (`tw-animate-css` `animate-in fade-in-0 zoom-in-95`) | 150ms | enter; exit 100ms `ease-exit` |
| Dialog | overlay fade + content fade/zoom 95→100 | 200ms | enter |
| Sheet / Drawer | slide from edge | 300ms | enter; exit 200ms |
| Accordion / Collapsible | height animation | 200ms | standard |
| Toast | slide-in 16px + fade | 200ms | enter |
| Tabs indicator | none (instant) or 150ms color | 150ms | standard |
| Sidebar collapse | width | 200ms | standard |
| Skeleton | `animate-pulse` | 2s loop | — |
| Chart mount | fade/stagger per 4.14 | ≤ 600ms | enter |
| Page navigation | none (instant); optional top progress bar `h-0.5 bg-primary` | — | — |
| List item add/remove | height+fade | 200ms | standard |
| Row highlight after update | `bg-primary-soft` fades out | 1000ms | linear |

Interaction feedback: hover on clickable card raises border tint (`hover:border-ring/40`); pressed = darker fill; drag states per 4.12; loading = spinner/skeleton; success = toast + inline check.

FORBIDDEN: bounce/spring, shake, parallax, auto-playing carousels without pause, animations > 600ms, scale transforms on buttons/cards, transitions on layout properties except those listed, animating on every scroll.

Reduced motion: `prefers-reduced-motion: reduce` → all transitions 0.01ms (see global CSS), skeleton pulse off, chart stagger off, keep opacity-only fades ≤ 100ms.

---

## 9. PAGE TEMPLATES

Notation: `[Shell]` from 3.2 · regions listed top→bottom, left→right · spacing tokens from 3.5 · `PRIMARY` = the single orange button. Every template inherits Section 5.

### 9.1 Dashboard / Overview `[from-image]` — Shell S1

```
┌ SIDEBAR 240 ┬──────────────────────────────────────────────────────────────────┐
│ logo  «     │  H1 "Welcome back, {name}"                [filter][date ▾][PRIMARY +]│  p-6
│ [workspace▾]│  caption "Last updated 30 sec ago"                                │
│ nav …       │  ── mb-6 ──                                                       │
│ groups …    │  ┌ Stat ┐ ┌ Stat ┐ ┌ Stat ┐              (col-span-4 ×3, gap-4)  │
│             │  └──────┘ └──────┘ └──────┘                                       │
│ [user card] │  ┌ Chart card (col-span-8) ─────────┐ ┌ Map card (col-span-4) ┐  │
│             │  │ title · target chip · Day▾ · ⚲   │ │ title · ↗             │  │
│             │  │ $9,102 ▲+1.02%  legend           │ │ DotMap + tooltip      │  │
│             │  │ DotForecast                       │ │ 3-stat footer         │  │
│             │  └──────────────────────────────────┘ └───────────────────────┘  │
│             │  ┌ Table card (col-span-12) ────────────────────────────────────┐ │
│             │  │ title            [search][Add +][⋮]                          │ │
│             │  │ header row / rows / footer pagination                        │ │
│             │  └──────────────────────────────────────────────────────────────┘ │
└─────────────┴──────────────────────────────────────────────────────────────────┘
```

| Region | Components | Notes |
|---|---|---|
| Header | H1, caption, Button icon (filter, secondary), Date picker (outline), Button default "New campaign +" | actions `gap-2`; one PRIMARY |
| KPI row | 3 Stat cards (icon chip + title + corner ArrowUpRight, number, delta, DotSparkline) | each card links to its detail page; row `grid gap-4 md:grid-cols-2 lg:grid-cols-3` |
| Analytics row | Chart card (`lg:col-span-2` of 3, i.e. 8/12) + Map card (4/12) | `grid gap-4 lg:grid-cols-3`; chart `lg:col-span-2` |
| Table row | Table card | 5–10 recent rows; "View all" link in card header replaces pagination when truncated |
| Responsive | see 11 | |

### 9.2 Login — Shell S4 `[inferred]`

```
        [logo mark + wordmark]                 mb-8
   ┌────────── card max-w-sm p-8 ───────────┐
   │ H2 "Welcome back"   (center)           │
   │ caption "Sign in to continue" (center) │  gap-1, mb-6
   │ [Continue with Google]  outline lg     │
   │ ──────── or ────────                   │  my-6
   │ Email    [input lg]                    │
   │ Password [input lg ●●● 👁]  Forgot? →  │  gap-4
   │ [ Sign in ]  PRIMARY lg w-full         │  mt-6
   └────────────────────────────────────────┘
        Don't have an account? Sign up        mt-6 caption
```
Rules: one PRIMARY; social button above divider OR below (choose once per product, keep in signup too); "Forgot password?" is a Link aligned right of the label row; error → Alert danger above form (`mb-4`) for credential errors, inline for field errors; show/hide password ghost icon; `autocomplete` attributes set; Enter submits.

### 9.3 Signup — Shell S5 (split) `[inferred]`

Left: logo top-left, form column `max-w-sm`: H2 "Create your account", fields Name, Email, Password (with strength meter `h-1 rounded-full` 4 segments and requirement list), Checkbox "I agree to Terms and Privacy", PRIMARY "Create account" lg full-width, then "Already have an account? Sign in". Right (`hidden lg:flex bg-muted`): DotMatrix art + one testimonial. If ≥ 5 fields, move extras to onboarding (never > 4 fields at signup).

### 9.4 List / Table view — S1

```
H1 "{Entities}"  caption "{n} total"                      [Export▾] [PRIMARY New {entity} +]
Tabs (line): All · Active · Archived  (saved views)
Toolbar row: [search]  [Filters ▾ (n)]  [Sort ▾]         (right) view toggle [list|grid]
Active filter chips row (only if filters applied) + "Clear all"
Table card (4.5) — bulk bar replaces toolbar on selection
```
Spacing: header `mb-6`; tabs `mb-4`; toolbar `mb-4`; chips `mb-4`; table card follows.

### 9.5 Detail view — S1

```
Breadcrumb (if S1: above H1, mb-2)
H1 {name} + Badge(status)                   [secondary actions ghost][PRIMARY Edit]  ⋮ (Delete last)
Tabs (line): Overview · Activity · Files · Settings
Grid lg:grid-cols-3 gap-4:
  main (col-span-2): Card "Summary" (description list 2-col) · Card "Related {entities}" (Table compact)
  aside (col-span-1): Card "Details" (key-values) · Card "Activity" (Timeline)
```

### 9.6 Create / Edit form — S1 (page) or Sheet

Page: `max-w-2xl` centered inside content, H1, form sections (`gap-8`) each in a Card `p-5` with section title + description on top; sticky footer bar `sticky bottom-0 border-t bg-background/80 backdrop-blur p-4` right-aligned [Cancel][PRIMARY Save]. Use Sheet (`max-w-md`) for ≤ 8 fields when list context should remain visible. Unsaved-changes guard per Section 7.

### 9.7 Settings — S1

```
H1 "Settings"
Layout: `lg:flex lg:gap-8` → left sub-nav `lg:w-56` (224px, vertical, items `h-9`, active `bg-accent`) · right content `flex-1 max-w-2xl`
Sub-nav: Profile · Account · Billing · Team · Notifications · Integrations · Security · (Danger zone at bottom of Account)
```
| Section | Content |
|---|---|
| Profile | Avatar upload (64px + Change/Remove), Name, Email (read-only + Change link), Bio Textarea; [Save changes] |
| Account | Language Select, Timezone Combobox, Theme ToggleGroup (Light/Dark/System), Danger zone card |
| Billing | Current plan Card (plan, price, renewal, PRIMARY "Upgrade"), Payment method row, Invoices Table (Date, Amount, Status, Download) |
| Team | Members Table (Avatar+name, Email, Role Select, Status, kebab), PRIMARY "Invite member" (Dialog) |
| Notifications | Rows: label+description left, Switch right; grouped by channel (Email/Push/In-app); autosave with toast |
| Security | Password change, 2FA Switch + setup Dialog, Active sessions Table with "Revoke" |
Rows pattern: `flex items-center justify-between gap-6 py-4 border-b`. Switch rows save instantly (CL: Switch rule).

### 9.8 Pricing — S3 `[inferred]`

Hero (overline, H1, sub, billing ToggleGroup Monthly/Yearly with "Save 20%" Badge) → 3 pricing cards `grid gap-4 md:grid-cols-3` (middle highlighted) → feature comparison Table (sticky header, Check/Minus icons) → FAQ → CTA band → Footer.

### 9.9 Landing / Home — S3 + S6 `[inferred]`

Order: Header → Hero → Logo strip (grayscale logos `opacity-60`, 5–6) → Feature grid (3×2) → Product showcase (alternating image/text sections ×2–3) → Stats band (3 numbers) → Testimonials (3) → Pricing teaser → FAQ → CTA band → Footer. One PRIMARY per viewport section. Section rhythm `py-24`.

### 9.10 Remaining page types (compact spec)

| Page | Shell | Regions (top→bottom) | Key components | PRIMARY |
|---|---|---|---|---|
| Forgot password | S4 | logo, card: H2, caption, email, submit, back link | Input lg, Button lg | "Send reset link" |
| Reset password | S4 | card: H2, new pw + strength, confirm, submit | Input, meter | "Update password" |
| Email verification | S4 | card: icon in `bg-primary-soft` circle, H2, text with email, OTP or "Open email app", resend link (30s timer) | OTP input | "Verify" (if OTP) |
| Onboarding (multi-step) | S5 or S4 wide (`max-w-lg`) | Stepper top, step card, footer [Back][PRIMARY Continue], "Skip" link | Stepper, Field, RadioGroup cards | "Continue" → "Finish" |
| Analytics | S1 | header (date range, compare toggle, export menu), Tabs, KPI row, 2 chart cards (6/6), breakdown table | Stat, DotForecast/Charts, Table | "Export" (outline; no primary) or none |
| Search results | S1 or S3 | search input lg, result count, filter chips, results list (title, snippet, meta), pagination | List, Chips | none |
| Profile (user) | S1 | header card (avatar 64, name, role, actions), Tabs, content cards | Avatar, Tabs, Cards | "Edit profile" |
| Notifications center | S1 | H1 + "Mark all read" ghost, Tabs (All/Unread), list grouped by day (`text-caption` group labels), item: icon/avatar, text, time, unread dot `size-2 bg-primary` | List, Tabs | none |
| Inbox / chat | S1 (full-bleed content, `Resizable`) | left list (w-80, search, threads), right thread (header, messages, composer sticky bottom) | List, Avatar, Textarea, Button | "Send" (icon) |
| Calendar | S1 | header (Today, ‹ ›, month title, view ToggleGroup Month/Week/Day, PRIMARY "New event") , grid | Calendar (large), Popover for events | "New event" |
| Kanban | S1 (full-bleed) | header + filter row, board (4.12) | Kanban columns, Cards | "Add task" |
| File manager | S1 | header (breadcrumb path, Upload PRIMARY), toolbar (search, view toggle, sort), Resizable (folder tree 240 / file grid or table), Dropzone overlay on drag | Tree, Table/Grid, Dropzone | "Upload" |
| Blog list | S3 | header, page hero (H1+sub), tag chips row, grid of media cards `md:grid-cols-2 lg:grid-cols-3`, pagination | Media card | none |
| Blog post | S3 | reading column `max-w-3xl`: breadcrumb, H1 (`text-h1 md:text-display`), meta row (avatar, author, date, read time), cover `rounded-2xl aspect-video`, prose `max-w-prose`, share row, related posts grid, CTA band | Prose | none |
| Product list | S3 (commerce) | breadcrumb, H1 + count, toolbar (Filters Sheet at base / left rail 240 at lg, Sort Select), product grid `grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4`, pagination | Product card | none (Add to cart per card is outline) |
| Product detail | S3 | 2-col: gallery (main image + 4 thumbs) / info (title, price, rating, variants RadioGroup, qty, PRIMARY "Add to cart" lg full-width, accordion: details/shipping/returns), reviews, related | Accordion, RadioGroup | "Add to cart" |
| Cart | S3 | H1, 2-col: line items / Order summary Card (sticky lg) | Cart line, Summary | "Checkout" |
| Checkout | S3 minimal (logo only header) | Stepper (Shipping → Payment → Review), form Cards (left), Order summary (right, sticky) | Field, RadioGroup cards, Summary | "Place order" |
| Order confirmation | S4 wide | success icon (`bg-success-soft`), H2 "Order confirmed", order number, summary Card, next steps, links | Card, Timeline | "Continue shopping" (outline) or "Track order" |
| About | S3 | hero (H1, sub), story split (text + image), values grid (3), team grid (avatar cards), CTA band | Feature grid, Avatar | "Join us"/"Contact" |
| Contact | S3 | H1 + sub, 2-col: form Card (Name, Email, Topic Select, Message) / contact details list + map image, FAQ link | Field, Textarea | "Send message" |
| Empty first-run (app) | S1 | header (no PRIMARY), one large Empty state centered in a Card `py-16`, optional 3-step checklist Card | Empty state | the single create action |
| 404 | S4 | display "404" `text-display font-semibold text-muted-foreground`, H2 "Page not found", text, [Go to dashboard] PRIMARY, [Contact support] link | | "Go to dashboard" |
| 500 | S4 | AlertTriangle chip, H2 "Something went wrong", text, [Try again] PRIMARY, incident id `code` caption | | "Try again" |
| Maintenance | S4 | wrench chip, H2 "We'll be right back", expected time, status link | | none |

---

## 10. USER FLOWS

Notation: screen → transition (trigger). "Persists" = what MUST stay identical between screens.

| Flow | Screens in order | Transitions | Persists | Consistency must not break |
|---|---|---|---|---|
| Auth (new user) | Landing → Signup (S5) → Verify email (S4) → Onboarding (steps 1–3) → Dashboard (S1) | signup submit → verify; OTP valid → onboarding; Finish → dashboard with first-run empty states + welcome toast | logo position, card width, input `lg` size, PRIMARY placement, copy tone | Signup and login must share auth shell and social-button placement |
| Auth (returning) | Login (S4) → Dashboard (S1) | submit → redirect to last visited route | same as above | error pattern: Alert above form |
| Password recovery | Login → Forgot (S4) → "Check your email" confirmation state (same card) → Reset (S4) → Login with success toast | link in email → reset | S4 shell | never change shell mid-flow |
| Onboarding | Step 1 profile → Step 2 workspace → Step 3 invite (skippable) → Done | Continue/Back; Skip on optional | Stepper, footer buttons position, card width `max-w-lg` | Continue is always bottom-right; Back ghost left |
| Core task: create entity | List (S1) → PRIMARY "New {entity}" → Sheet or Form page → Save → back to List with new row highlighted + toast "{Entity} created" | Cancel returns without change; unsaved guard | sidebar, breadcrumb, header structure | same form pattern for every entity (4.3, 9.6) |
| Core task: edit | Detail → Edit (same form as create, prefilled) → Save → Detail + toast | | | Edit form = create form (no divergent layouts) |
| Delete | Row kebab → Delete (last) → AlertDialog → confirm → row removed + toast with Undo | | | destructive style + copy pattern (Section 7) |
| Checkout | Cart → Checkout Shipping → Payment → Review → Confirmation | Stepper; each step validates before Continue; Back keeps data | minimal header, Order summary sticky right | summary card identical in cart and checkout |
| Settings change | Settings sub-page → edit → Save changes (toast) / Switch (instant toast) | dirty state enables Save; leave guard | Settings sub-nav, `max-w-2xl` content | Switch = instant; text fields = explicit Save |
| Error recovery | Any error → inline/Toast/Error state with Retry → success restores view; persistent failure → 500 page | Retry re-runs last request without page reload | shell stays rendered (errors occur inside content region) | never blank the sidebar/header on data errors |
| Session expiry | any → Dialog "Session expired" [Sign in] → Login with `returnTo` → back to prior route | | | preserve unsaved form state in memory where possible |

---

## 11. RESPONSIVE MATRIX

Breakpoints: **M** = base (<768) · **T** = md (768–1023) · **D** = lg (1024–1279) · **W** = xl+ (≥1280)

| Component / Page | M | T | D | W |
|---|---|---|---|---|
| S1 sidebar | hidden; `SidebarTrigger` in header; opens Sheet (w-72) | hidden; trigger; Sheet | persistent 240 (collapsible to 64) | persistent 240 |
| Page padding | `p-4` | `p-6` | `p-6` | `p-6` (`max-w-[1600px]` centered) |
| Page header | title, then actions wrap below; date picker + filter collapse into one "Filters" Popover | inline | inline | inline |
| KPI stat row | 1 col; sparkline stays right (`w-24`) | 2 cols | 3 cols | 3–4 cols |
| Chart + side card | stacked; DotForecast height `h-40`, dot pitch same, fewer columns | stacked | 8 + 4 | 8 + 4 |
| Legend | wraps under value | inline right | inline right | inline right |
| Table | card list (4.5) | table, `overflow-x-auto`, sticky first col | full table | full table, comfortable padding |
| Table toolbar | search full width row 1; Add + kebab row 2 | inline | inline | inline |
| Pagination | prev/next + "Page x of y" | numbers (max 5) | numbers | numbers + page size |
| Tabs | horizontal scroll (`overflow-x-auto`, no wrap) | inline | inline | inline |
| Forms | 1 col; inputs `lg` (44px, 16px font) | 1–2 col | 2 col where defined | 2 col |
| Form footer | sticky bottom, stacked full-width (PRIMARY on top) | sticky, right-aligned | sticky, right-aligned | inline or sticky |
| Dialog | Drawer (bottom, 90svh) | centered `max-w-lg` | centered | centered |
| Sheet | full width | `max-w-md` | `max-w-md` | `max-w-lg` |
| Dropdown Menu | Drawer if > 6 items, else Dropdown | Dropdown | Dropdown | Dropdown |
| Select | native or Drawer list | Select | Select | Select |
| Popover filters | Drawer | Popover | Popover | Popover |
| Settings | sub-nav becomes top horizontal scroll tabs | sub-nav left 200px | left 220px | left 220px |
| Detail view | single column (aside below main) | single column | 2/3 + 1/3 | 2/3 + 1/3 |
| Kanban | horizontal scroll with `snap-x snap-mandatory`, columns `w-72` (288px) | horizontal scroll | 3–4 columns visible | 4–5 visible |
| Product grid | 2 cols | 3 cols | 3–4 cols | 4 cols |
| Landing sections | stacked, `py-16`, H1 `text-h1` | stacked/2-col | multi-col, `py-24` | multi-col |
| Nav (S3) | hamburger → Sheet | inline links | inline + actions | inline + actions |
| Toast | top-center, full width minus 16px | bottom-right | bottom-right | bottom-right |
| Touch targets | ≥ 44px (icon buttons wrapped with `p-2`) | ≥ 44px | 36px OK (pointer) | 36px OK |
| Hover-only affordances | forbidden (drag handles, row actions always visible) | forbidden | allowed | allowed |

---

## 12. ACCESSIBILITY & QUALITY BAR

| Area | Requirement |
|---|---|
| Contrast (WCAG 2.1 AA) | Text < 18.66px bold / 24px regular: ≥ 4.5:1. Large text and UI boundaries/icons: ≥ 3:1. Verify in BOTH themes. Known exception: D-01 (brand fill + white text ~3.2:1); ship `--primary-strong` if AA-strict |
| Never color alone | Status, deltas, chart series, validation MUST also use text, icon, or shape |
| Focus ring | `ring-3 ring-ring/40` (+ `border-ring`) on every focusable; never removed; offset from dark surfaces via border color, not `outline` |
| Keyboard | All actions reachable by keyboard. Tab order = visual order. Skip link "Skip to content" first in DOM (`sr-only focus:not-sr-only`) |
| Menus/dialogs | Radix defaults kept: arrow keys in menus, `Esc` closes, focus trapped in modals, focus restored to trigger |
| Tap targets | ≥ 44×44px on touch (`<lg`); ≥ 24×24px hit area minimum on pointer for small controls (checkbox via label) |
| Semantic HTML | `<header> <nav> <main> <aside> <footer>`; one `<h1>` per page; headings sequential (no skipping); lists as `<ul>`; tables as `<table>` with `<th scope>`; buttons are `<button>`, navigation is `<a>` |
| ARIA | Icon-only buttons `aria-label`; live regions: toasts `role="status"`, errors `role="alert"`; `aria-current="page"` on active nav; `aria-sort` on sorted th; `aria-busy` on loading regions; `aria-expanded` on disclosure triggers |
| Forms | Label for every control; errors linked by `aria-describedby`; required via `aria-required`; on failed submit announce summary and focus first invalid |
| Images | Meaningful → descriptive `alt`; decorative → `alt=""`; avatars use name as alt |
| Charts | `role="img"` + summary label + `sr-only` data table (4.14) |
| Motion | Respect `prefers-reduced-motion` (Section 8); no flashing > 3/sec |
| Zoom / text scaling | Layout works at 200% zoom and 320px width; use `rem`; no fixed-height text containers |
| Language / direction | `<html lang>` set; use logical properties for future RTL |
| Testing | Run axe (`@axe-core/react` or Playwright axe) on every page template; keyboard-only walkthrough; check both themes |

---

## 13. AGENT IMPLEMENTATION PROTOCOL

### 13.1 Imperative instructions

1. READ this entire file before writing code. Re-read the relevant section before each task.
2. BUILD IN THIS ORDER: (a) `globals.css` tokens (2.1) + fonts + theme provider → (b) shadcn primitives (`components/ui`) → (c) custom primitives (DotSparkline, DotForecast, DotMap, StatCard, PageHeader, EmptyState, ErrorState, StatusBadge, DataTable) → (d) shells (S1–S6) → (e) page templates (Section 9) → (f) flows (Section 10).
3. BEFORE creating any UI element: search Sections 4, 6, 15 for an existing spec. If found → use it exactly. If none → derive one from tokens, ADD it to Section 4 (append a spec block), then use it. NEVER create an undocumented one-off.
4. NEVER invent colors, radii, shadows, font sizes, or spacing outside Section 2. If a needed value is missing, choose the nearest token and note it.
5. When a request is ambiguous, choose the option that matches Section 0 attributes (flat, border-defined, 36px controls, one orange accent).
6. When the user request conflicts with this file, follow this file and state the conflict in one sentence. Do not silently deviate.
7. Use shadcn components as the base; customize via variants/classes per Section 4, not by forking Radix behavior.
8. Every page MUST be built inside its shell (Section 3.2) via a shared layout file; pages never re-implement sidebar/header.
9. Compose pages from `PageHeader`, `Card`, `StatCard`, `DataTable`, `EmptyState`, etc. Pages contain layout and data wiring only, no ad-hoc styling.
10. Implement loading, empty, error states with the component (Section 4.9) for every data region BEFORE marking the page done.
11. Build both themes simultaneously. Test each screen in light and dark before moving on.
12. After each page, run Section 14 and fix all failures before starting the next page.
13. Use mock data via typed fixtures in `/lib/mock` until real APIs exist; shapes MUST match final types.
14. Use `next/link`, `next/image`, `next/font`. Use server components by default; add `"use client"` only for interactive components (dnd-kit, charts, menus).
15. Keep components ≤ 200 lines; extract subcomponents. One component per file. PascalCase files for components, kebab-case for folders.
16. Do not add libraries beyond: shadcn/Radix, `lucide-react`, `recharts`, `@tanstack/react-table`, `react-hook-form`, `zod`, `@dnd-kit/*`, `next-themes`, `sonner`, `date-fns`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `vaul`, `cmdk`. Ask before adding anything else.

### 13.2 Folder structure

```
app/
  (auth)/login/page.tsx signup/ forgot-password/ reset-password/ verify/     # layout.tsx = S4/S5
  (app)/layout.tsx                                                           # S1 shell
  (app)/dashboard/page.tsx  orders/ customers/ analytics/ settings/ ...
  (marketing)/layout.tsx                                                     # S3 shell
  (marketing)/page.tsx pricing/ about/ contact/ blog/
  globals.css  layout.tsx  not-found.tsx  error.tsx
components/
  ui/            # shadcn primitives (button, input, card, ...)
  patterns/      # PageHeader, StatCard, StatusBadge, DataTable, EmptyState, ErrorState, FilterBar, FormSection, ConfirmDialog
  viz/           # dot-sparkline, dot-forecast, dot-map, chart-card
  layouts/       # app-shell, auth-shell, marketing-shell, app-sidebar, user-menu, workspace-switcher
  dnd/           # sortable-list, kanban-board, dropzone
lib/  utils.ts (cn)  format.ts (currency, number, date)  mock/  hooks/
public/geo/world-dots.json
DESIGN.md
```

### 13.3 Utility helpers (MUST exist)

`cn()` = `twMerge(clsx())`. `format.currency(n)`, `format.compact(n)`, `format.percent(n, {sign:true})`, `format.date(d)` implementing CL-13/CL-14. `<StatusBadge status="pending|success|refunded|...">` is the ONLY way to render statuses.

### 13.4 Anti-patterns (each is a violation)

| # | Anti-pattern |
|---|---|
| AP-01 | Mixed radii (e.g., `rounded-md` card next to `rounded-xl` card) |
| AP-02 | Inconsistent icon weight/size or mixed icon libraries |
| AP-03 | More than one primary button in a zone/view |
| AP-04 | Random shadows on cards; shadows used instead of borders |
| AP-05 | Center-aligned body text or table data |
| AP-06 | Text smaller than 12px, or grey lighter than `muted-foreground` |
| AP-07 | Placeholder-as-label |
| AP-08 | Raw hex/px/arbitrary Tailwind values, or `dark:` color overrides in components |
| AP-09 | Card nested inside card with double borders |
| AP-10 | Different spacing for the same component on different pages |
| AP-11 | Different shell on sibling pages (e.g., login without the auth shell) |
| AP-12 | Hover-only controls on touch layouts |
| AP-13 | Icon-only button without `aria-label`/tooltip |
| AP-14 | Status shown as color without text |
| AP-15 | Destructive action as primary orange, or without confirmation |
| AP-16 | Table with visible row actions ≥ 3 (must be kebab), or zebra stripes |
| AP-17 | Modal opened from a modal; modal used for content that needs its own page |
| AP-18 | Full-page spinners where skeletons fit; skeleton with wrong dimensions |
| AP-19 | Standard Recharts default colors/styles instead of tokens; dot-matrix slots filled with bars/lines |
| AP-20 | Gradients, glass blur, or the orange Dribbble background inside the app |
| AP-21 | Misaligned baselines: mixing `h-8`/`h-9` controls in one row; icon not vertically centered with text |
| AP-22 | Pure `#000`/`#FFF` surfaces; dark mode as inverted light |
| AP-23 | Long unbroken text lines > 75ch |
| AP-24 | Toasts for validation errors; alerts for transient success |
| AP-25 | Data columns wrapping to multiple lines (IDs, money, status) |
| AP-26 | Missing empty/loading/error state |
| AP-27 | Inconsistent number/date formats; missing `tabular-nums` |
| AP-28 | More than 6 tabs, more than 8 top-level sidebar items ungrouped, or dropdown > 12 items without search |
| AP-29 | Bounce/spring/shake animations; scale on hover |
| AP-30 | Hiding the only path to an action behind hover, right-click, or drag |

---

## 14. SELF-VALIDATION CHECKLIST (run on EVERY screen; all must be YES)

| # | Check | Y/N |
|---|---|---|
| 1 | Correct shell used and identical to sibling pages (CL-01/02) | |
| 2 | All spacing on the 4px scale, matches 3.5 | |
| 3 | Only tokens used; no raw hex/px/arbitrary values (CL-03) | |
| 4 | Exactly ≤ 1 primary button per zone (CL-05); primary in the correct position (CL-06) | |
| 5 | Page title `text-h1`, caption, header layout per 3.4 (CL-07) | |
| 6 | Cards use `rounded-xl border bg-card p-5`, gap-4 (CL-08/10) | |
| 7 | Control heights consistent per row (CL-09/33) | |
| 8 | Loading, empty, error states implemented and visible (CL-16) | |
| 9 | Hover + focus-visible on every interactive element (CL-17) | |
| 10 | Status badges via `StatusBadge`; deltas per CL-13 | |
| 11 | Formats per CL-14; `tabular-nums` on numbers | |
| 12 | Section 15 placement rules applied (menus, kebabs, filters, tabs limits) | |
| 13 | Forms per CL-20/21; labels present; errors linked | |
| 14 | Destructive flows confirmed (CL-18) | |
| 15 | Light theme visually correct | |
| 16 | Dark theme visually correct; elevation order DM-2; no pure black/white | |
| 17 | Contrast passes AA in both themes (or D-01 documented) | |
| 18 | Responsive verified at 360, 768, 1024, 1440; no horizontal page scroll (CL-29) | |
| 19 | Keyboard-only pass: tab order, menus, dialogs, focus restore | |
| 20 | Icon-only controls labeled; images have alt; headings sequential | |
| 21 | No anti-pattern from 13.4 present | |
| 22 | Dot-matrix used for KPI sparklines/forecast/map where applicable (CL-32) | |
| 23 | `prefers-reduced-motion` honored | |
| 24 | No console errors/hydration warnings; no layout shift on load | |

---

## 15. CONTENT ORGANIZATION & PROGRESSIVE DISCLOSURE

Purpose: decide WHERE every piece of UI goes (inline, dropdown, popover, dialog, sheet, separate page). Apply top-down; first matching rule wins.

### 15.1 Placement ladder (prefer higher rungs)

| Rung | Pattern | Use when |
|---|---|---|
| 1 | Inline, always visible | Needed by > 50% of users on this screen, or is the primary/secondary action, or 1–3 items |
| 2 | Icon button + Tooltip | Frequent utility action (filter, refresh, collapse) with a universally understood icon |
| 3 | Dropdown Menu (kebab `MoreHorizontal`/`MoreVertical` or labeled trigger) | 4+ related commands, or infrequent commands, or per-row actions |
| 4 | Popover | Small set of inputs/controls (filters, quick edit, date picker), ≤ 6 controls, no long scroll |
| 5 | Accordion / Collapsible / "Show more" | Optional detail on the same page, content < 1 screen |
| 6 | Sheet | Multi-field create/edit or detail preview that keeps list context; 7–20 fields |
| 7 | Dialog | Short blocking task/confirmation, ≤ 5 fields |
| 8 | Separate page | > 20 fields, multi-step, needs URL/bookmark, or rich content |

### 15.2 Thresholds (numeric, testable)

| Situation | ≤ threshold → | > threshold → |
|---|---|---|
| Buttons in one action group | show up to 3 (1 primary + 2 secondary) | keep primary visible; move rest into "More" Dropdown |
| Row actions in table/list | 1–2 icon buttons ok (ghost `icon-sm` with tooltip) | 3+ → kebab Dropdown (rightmost column) |
| Page-header actions | filter icon + date + 1 PRIMARY `[from-image]` | move extras into an overflow menu (`⋮`) left of PRIMARY |
| Tabs | 6 inline | > 6 → group under "More" Dropdown tab, or use vertical sub-nav |
| Sidebar top-level items | 8 | > 8 → group into collapsible sections `[from-image]` |
| Sidebar group items | 6 | > 6 → link to a hub page, or add "Show more" |
| Choose 1 of N | ≤ 5 RadioGroup/ToggleGroup · 6–15 Select | ≥ 16 or remote → Combobox |
| Dropdown Menu items | 12 total, ≤ 3 groups, ≤ 7 per group | > 12 → Command/Combobox with search |
| Submenu depth | 1 level | never 2 levels; flatten with group labels |
| Filters on a list | 1–2 inline controls | 3–5 → Popover panel with active-count badge; 6+ → Sheet with Apply/Reset |
| Table columns visible | 8 | > 8 → column-visibility menu (kebab); default show the 6 most important |
| Breadcrumb levels | 4 | > 4 → collapse middle to `…` menu |
| Stat cards in a row | 4 | > 4 → second row or "Customize" menu |
| Form fields per dialog | 5 | > 5 → Sheet; > 20 → page |
| Toasts visible | 3 | queue the rest |
| Chips shown in an input | 3 | "+N" chip opens Popover with rest |
| Inline text truncation | 1 line (cells), 2 lines (card descriptions) | ellipsis + Tooltip with full text |
| Pagination numbers | 5 | ellipsis |

### 15.3 Menu vs Popover vs Dialog vs Sheet vs Drawer

| Content | Pattern |
|---|---|
| List of commands (Edit, Duplicate, Archive, Delete) | Dropdown Menu |
| Choose a value from a short list, no typing | Select / Dropdown radio items |
| Inputs + Apply (filters, date range) | Popover (desktop) / Drawer (mobile) |
| Hover preview (user, link) | Hover Card (never required actions) |
| Explain an icon or truncated text | Tooltip |
| Confirm/decline a single decision | AlertDialog (destructive) or Dialog (non-destructive) |
| Short form (≤ 5 fields) that blocks flow | Dialog |
| Longer form or detail with context | Sheet (right) |
| Any overlay at `<md` | Bottom Drawer |
| Global search/quick actions | Command palette (⌘K) |
| Contextual actions on canvas/list item | Context Menu + mirrored kebab |

### 15.4 Dropdown Menu composition rules

| # | Rule |
|---|---|
| DD-1 | Order: (1) primary/frequent commands → (2) secondary → (3) utilities → separator → (4) destructive last |
| DD-2 | Group related items; separate groups with `Separator`; optional group `Label` (`text-caption`). Max 3 groups |
| DD-3 | Icons: ALL items have leading icons or NONE do. Icon `size-4 text-muted-foreground` |
| DD-4 | Labels: verb + noun, sentence case, ≤ 3 words ("Export CSV", "Duplicate", "Move to…"). "…" suffix when the item opens another surface needing input |
| DD-5 | Shortcuts right-aligned `text-caption text-muted-foreground` |
| DD-6 | Selected value shown with `Check` (radio/checkbox items), never bold |
| DD-7 | Destructive item: `text-danger-text`, last, after separator, opens AlertDialog |
| DD-8 | Disabled items stay visible with `opacity-50` and, if non-obvious, a Tooltip explaining why |
| DD-9 | Trigger: kebab icon-only ghost `icon-sm` with `aria-label="More actions"` (rows/cards), or outline Button with label + `ChevronDown` (view/sort/options) |
| DD-10 | Align menu to trigger edge: `align="end"` for right-side triggers; `side="top"` when trigger is at the viewport bottom (sidebar user menu) |
| DD-11 | Never place the page's PRIMARY action inside a menu |
| DD-12 | Menu width: `min-w-48` (192px), `max-w-72`; long labels truncate |
| DD-13 | Workspace/account switchers: current item first with `Check`, others below, then "+ Add/Create workspace" item, then Manage link |

### 15.5 Where does X go? (lookup)

| Element | Location | Pattern |
|---|---|---|
| Create new {entity} | Page header, right (PRIMARY) + command palette | Button default with `Plus` |
| Add row inside a table | Table toolbar right (PRIMARY for that zone) `[from-image]` | Button sm |
| Search (page-scoped) | Table/list toolbar, left or right of actions | Search field (4.2) |
| Search (global) | Sidebar top or S2 topbar | ⌘K trigger field |
| Filters | Toolbar next to search; 1–2 inline, 3+ Popover, 6+ Sheet | 15.2 |
| Sort | Column headers for tables; Select "Sort by" for cards | |
| Date range | Page header right `[from-image]` | Date picker with presets |
| Time granularity (Day/Week/Month) | Chart card header | Select sm `[from-image]` or ToggleGroup |
| Export/Download | Toolbar kebab or header outline button | Dropdown: CSV, XLSX, PDF |
| Bulk actions | Bulk bar replacing toolbar on selection | Buttons + overflow |
| Row actions | Right-most cell | ≤ 2 icons or kebab |
| Status change | Inline Badge-as-Dropdown in detail header, or in row kebab | |
| Delete | Last item in kebab/menu; danger zone for account-level | AlertDialog |
| Duplicate / Archive | Kebab | |
| Share | Header outline button → Popover/Dialog (link, invite) | |
| Navigation between sections | Sidebar (S1) / Tabs inside a page | Sidebar for top-level, Tabs for same-entity views |
| Breadcrumbs | Above H1 (S1) or in topbar (S2) | |
| Notifications | Topbar bell (S2) or sidebar item with count badge (S1) → Popover list (5 latest) + "View all" | |
| Help / docs / support | Sidebar footer above user card, or user menu | Link |
| Settings | User menu + sidebar footer `[from-image]` | |
| Theme toggle | User menu (Light/Dark/System) + Settings > Account | |
| Language | Settings > Account; marketing footer | |
| Logout | User menu, LAST item, after separator `[from-image]` | |
| Workspace/project switcher | Top of sidebar `[from-image]` | Dropdown (DD-13) |
| Collapse sidebar | Sidebar header right `[from-image]` + `⌘B` | |
| User profile / plan | Sidebar bottom user card `[from-image]` (avatar, name, plan) | opens upward menu |
| Onboarding hints | Dismissible Alert or checklist Card on dashboard (first-run only) | |
| Save/Cancel (forms) | Footer bottom-right (sticky for long forms) | |
| Pagination | Table footer right; results count left | |
| View toggle (list/grid) | Toolbar far right | ToggleGroup icons |
| Saved views | Tabs above the table | |
| Card "see details" | Corner `ArrowUpRight` icon button in card header `[from-image]` or "View all" link | |
| Legal/policy links | Footer; auth card footer | |

### 15.6 Layout arrangement rules

| # | Rule |
|---|---|
| LA-01 | Page reading order = importance: title → KPIs → primary visualization → secondary → detail table |
| LA-02 | Top-left = context (title/breadcrumb); top-right = actions; bottom-right (forms) = submit |
| LA-03 | Group by user task, not by data model. Related controls sit within 16px; unrelated groups separated by ≥ 24px |
| LA-04 | Cards are units of meaning: 1 card = 1 topic. If a card needs > 1 title, split it |
| LA-05 | Equal-weight items → equal-size cards on the same row (3 stat cards = 3 equal columns) |
| LA-06 | Chart (wide) + summary (narrow) pairs use 8/4 split at `lg` `[from-image]` |
| LA-07 | Tables get full width (12/12) and sit last in a dashboard `[from-image]` |
| LA-08 | Progressive disclosure: show summary first; details on demand (row expand, Sheet, detail page). Default table shows 5–10 rows with "View all" |
| LA-09 | Limit visible choices per moment: ≤ 7 options in any menu group, ≤ 4 KPIs, ≤ 3 form sections visible without scrolling |
| LA-10 | Consistent alignment axis: cards' left edges align to the page-header title; controls' baselines align in rows |
| LA-11 | Group actions by effect: navigation (links) vs mutation (buttons) vs destructive (last, red) |
| LA-12 | Reduce clutter: prefer whitespace to dividers; use borders only on cards, inputs, table rows, sidebar sections |
| LA-13 | Long forms: chunk into titled sections with descriptions; order fields by frequency/dependency; required first |
| LA-14 | Mobile-first content priority: what remains visible at 360px is the primary task; secondary content moves into Drawers, Accordions, or below the fold |
| LA-15 | Never hide critical information (errors, destructive consequences, prices, deadlines) in tooltips or menus |

### 15.7 Sidebar organization

| Zone | Contents | Order rule |
|---|---|---|
| Header | Logo, collapse | fixed |
| Workspace | Switcher | fixed under header |
| Primary nav | 4–8 core areas (daily use), each with icon; count badge only for actionable counts | order by frequency of use |
| Secondary groups | Collapsible sections (Integrations, Channels) with `+` create where users add items | after primary, separated by `Separator` |
| Utilities | Help, Settings (optional here) | above footer |
| Footer | User card → menu: Profile · Plan/Billing · Theme · Settings · Help · Log out (last) | Log out last after separator |

Active state: current route highlighted; parent group auto-expanded; collapsed sidebar shows icons + Tooltips; remember expanded/collapsed state (cookie).

### 15.8 Forms and inputs arrangement

| Situation | Arrangement |
|---|---|
| Related short fields (First/Last name, City/ZIP) | 2-col grid at `md+` |
| Long text/bio/address line | full width |
| Optional fields | after required; labeled "(optional)" `text-muted-foreground`; collapse rarely used ones under "Advanced" Collapsible |
| Dependent fields | reveal after parent selection (fade 200ms), never disabled-without-reason |
| Destructive/critical settings | separate Danger zone card, last |
| Units / currency / prefixes | InputGroup addon, not in the label |
| Selection with rich descriptions | card-style RadioGroup |
| Passwords | show/hide toggle; strength meter on create only; "Forgot?" link on login |
| Inline edit | single field only (name, title); Enter saves, Esc cancels |
| Confirmation | primary right, Cancel left; on mobile stacked, primary on top |

---

## APPENDIX A — Mapping of image elements to this spec (for verification)

| Image element | Spec reference |
|---|---|
| Sidebar w/ workspace switcher, groups, `+`, count badge, user card + upward menu | 3.3, 4.6, 15.7 |
| "Welcome Back" header, "Last updated", filter, date, orange CTA | 3.4, 9.1 |
| 3 stat cards with tinted icon chip, arrow, delta, dot sparkline | 4.4, 4.14 |
| Revenue forecast dot chart with today marker, legend, target chip, Day select | 4.14, 4.11 |
| User geography dot map, tooltip, 3-stat footer | 4.14, 4.8 |
| Recent transactions table (sortable, avatars, thumbnails, status pills, search, Add, kebab) | 4.5, 4.10 |

## APPENDIX B — Values to verify against the designer's file (all `[est]`)

Brand orange hex · page/sidebar greys · font family · exact sizes (stat number, card title) · sidebar width · dot diameters/pitch · card padding. If a value is corrected, change ONLY Section 2 tokens; everything else inherits.

## APPENDIX C — Prompt to give the coding agent

```
Read DESIGN.md fully before writing code. Follow Section 13 (build order, rules, anti-patterns).
Task: build {page name} using its template in Section 9 and the shell in Section 3.2.
Use only tokens (Section 2) and components (Section 4). For placement of menus/actions/filters use Section 15.
Implement loading, empty, error states and both themes. Run Section 14 and fix every failed item before you reply.
If you need a UI element that has no spec, add a spec to Section 4 first, then use it.
```
