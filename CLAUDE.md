# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ToolHub is a React-based online tool collection website. All data processing happens client-side in the browser — no API calls, no server dependencies.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server on port 3000 (auto-opens browser)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build
```

No test suite or linter is configured. The `build` script runs `tsc` before `vite build`, so type errors will fail the build.

## Architecture

### Tech Stack
React 18 + TypeScript (strict) + Vite 5 + Tailwind CSS v3 + React Router v6

### Key Dependencies
- `react-router-dom` — client-side routing
- `sql-formatter` — SQL formatting (multiple dialects)
- `cronstrue` / `cron-parser` — cron expression parsing
- `crypto-js` — MD5 hashing
- `jsonpath` — JSONPath queries
- `@headlessui/react` — accessible UI primitives

### Routing (src/App.tsx)
All routes are nested under `<Layout />` which provides nav + footer via `<Outlet />`:
```
/          → Home (tool cards landing page)
/json      → JSONFormatter
/jsonpath  → JSONPath
/timestamp → TimestampConverter
/encoder   → EncoderDecoder
/aes       → AESKeyGenerator
/md5       → MD5Encryptor
/sql       → SQLFormatter
/cron      → CronParser
/theme     → ThemeCustomizer
```

### State & Context Providers (src/App.tsx)
The provider hierarchy is: `ThemeProvider` → `ToastProvider` → `Router`. Theme state persists to `localStorage` under key `toolhub-color-mode`.

### Theme System
The project uses CSS custom properties (design tokens) defined in `src/styles/global.css`, NOT Tailwind's built-in dark mode. Theme switching works by setting `data-theme="light|dark"` on `<html>`, which activates the corresponding CSS variable set.

Key CSS classes for components (use these, not raw Tailwind colors):
- **Layout containers**: `glass`, `tool-card`, `th-card`
- **Inputs**: `th-input`, `th-select`
- **Buttons**: `th-btn-accent` (primary), `th-btn-ghost` (secondary), `th-btn-danger`, `th-btn-soft`
- **Panels**: `th-panel-success`, `th-panel-error`, `th-panel-info`, `th-panel-warning`
- **Tags/badges**: `th-tag`, `th-badge-valid`, `th-badge-invalid`
- **Text**: `gradient-text`
- **Code**: `code-block`, `code-highlight`, `glass-code`
- **Animations**: `slide-up`, `fade-in`

Always use CSS variables (`var(--fg)`, `var(--bg)`, `var(--border)`, etc.) for colors rather than hardcoded Tailwind classes, so components respect the active theme.

### Component Pattern (src/pages/*.tsx)
All tool pages follow the same structure:
1. `useState` with typed interfaces for input/output state
2. Two-column input/output layout (stacked on mobile via `md:` breakpoints)
3. Action buttons for format/encode/swap/copy
4. Pre-filled example data for quick testing
5. Try-catch error handling with inline error display
6. Copy-to-clipboard via `navigator.clipboard.writeText()`

Toast notifications use the `useToast()` hook from `src/components/Toast.tsx`.

### Syntax Highlighting
JSON and SQL have custom syntax highlighters (`JSONSyntaxHighlight.tsx`, `SQLSyntaxHighlight.tsx`) that use the `--syn-*` CSS variables from global.css. These are NOT generic libraries — they are hand-built token renderers.

## Adding a New Tool

1. Create `src/pages/YourTool.tsx` following the existing page pattern
2. Add route in `src/App.tsx` (import + `<Route>`)
3. Add nav item in `src/components/Layout.tsx` (`navItems` array)
4. Add tool card in `src/pages/Home.tsx` (`tools` array)

## Deployment

Vite config uses `base: './'` for relative paths, so the build is deployable to any subdirectory.
