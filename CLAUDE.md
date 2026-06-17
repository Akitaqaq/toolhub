# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ToolHub** is a React-based online tool collection website built with Vite, TypeScript, and Tailwind CSS. It provides client-side utilities for JSON formatting, SQL formatting, cron expression parsing, timestamp conversion, encoding/decoding, AES key generation, MD5 encryption, JSONPath queries, image compression, and theme customization. All data processing happens locally in the browser for privacy and security.

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 3000, auto-opens browser)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
```

No test framework is configured. `npm run build` (which runs `tsc` first) is the primary validation step.

## Architecture

### Tech Stack
- React 18 + TypeScript (strict mode) + Vite 5
- Tailwind CSS v3 with custom glassmorphism design system (defined in `src/styles/global.css`)
- React Router v6 with flat route structure under a shared `Layout`

### Routing (App.tsx)
```
/                → Home (tool catalog)
/json            → JSONFormatter
/jsonpath        → JSONPath
/timestamp       → TimestampConverter
/encoder         → EncoderDecoder
/aes             → AESKeyGenerator
/md5             → MD5Encryptor
/sql             → SQLFormatter
/cron            → CronParser
/image           → ImageCompressor
/theme           → ThemeCustomizer
```

### Adding a New Tool
1. Create `src/pages/YourTool.tsx` — follow the existing page pattern (see below)
2. Import and add `<Route>` in `src/App.tsx`
3. Add nav entry in `src/components/Layout.tsx` (`navItems` array: `{ path, label }`)
4. Add card in `src/pages/Home.tsx` (`tools` array: `{ path, title, desc, icon }`)
5. Update tool count in Home hero section

### Page Component Pattern
Every tool page follows this structure:
- **State**: `useState` with typed interfaces; errors tracked in state
- **Layout**: `max-w-[90rem] mx-auto space-y-6 animate-fade-in px-4` wrapper → centered header with `gradient-text` title → two-column `grid grid-cols-1 xl:grid-cols-2` with `glass rounded-xl p-5` panels
- **Buttons**: `th-btn-accent` (primary), `th-btn-ghost` (secondary), `th-btn-danger` (destructive), `th-tag` (chips/toggles)
- **Inputs**: `th-input` for textareas, `th-select` for dropdowns
- **Feedback**: `toast.success/error/info` from `../components/Toast`; `th-panel-error/success/info` for inline status
- **Examples**: Pre-filled sample data via `th-tag` buttons
- **Copy**: `navigator.clipboard.writeText()` + toast confirmation

### Design System (global.css)
CSS custom properties (not hardcoded colors): `var(--fg)`, `var(--fg-muted)`, `var(--fg-faint)`, `var(--accent)`, `var(--accent-2)`, `var(--accent-fg)`, `var(--bg)`, `var(--surface)`, `var(--surface-active)`, `var(--border)`, `var(--nav-bg)`, `var(--nav-border)`, `var(--danger)`.

Key classes: `glass`, `glass-code`, `tool-card`, `gradient-text`, `slide-up`, `fade-in`.

### Key Dependencies
- `crypto-js` — AES key generation, MD5 hashing
- `sql-formatter` — SQL formatting with dialect support
- `cronstrue` / `cron-parser` — Cron expression parsing
- `jsonpath` — JSONPath queries
- `@headlessui/react` — Accessible UI primitives

### TypeScript
- Strict mode with `noUnusedLocals` and `noUnusedParameters`
- `tsc` runs before every `vite build` — build fails on type errors
- Target ES2020, bundler module resolution

### Build & Deployment
- `base: './'` in vite.config.ts — relative paths, deployable in subdirectories
- Dev server on port 3000 with auto-open
