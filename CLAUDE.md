# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ToolHub** is a React-based online tool collection website built with Vite, TypeScript, and Tailwind CSS. It provides client-side utilities for JSON formatting, SQL formatting, cron expression parsing, timestamp conversion, encoding/decoding, AES key generation, MD5 encryption, JSONPath queries, and theme customization. All data processing happens locally in the browser for privacy and security.

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Preview production build
npm run preview
```

## Architecture & Structure

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS v3 with custom glassmorphism theme
- **Routing**: React Router v6
- **Type Safety**: Strict TypeScript configuration

### Key Files
```
src/
├── App.tsx                 # Main app with router configuration
├── main.tsx                # Entry point
├── components/
│   ├── Layout.tsx          # Main layout with navigation & gradient background
│   ├── JSONSyntaxHighlight.tsx  # Syntax highlighting for JSON output
│   ├── SQLSyntaxHighlight.tsx   # Syntax highlighting for SQL output
│   ├── Toast.tsx           # Toast notification system
│   └── ToolCard.tsx        # Reusable card & button components
├── pages/                  # Route-based tool pages
│   ├── Home.tsx            # Landing page with tool cards
│   ├── JSONFormatter.tsx   # JSON format/validate/minify/tree view
│   ├── JSONPath.tsx        # JSONPath query tool
│   ├── TimestampConverter.tsx  # Batch timestamp ↔ date conversion
│   ├── EncoderDecoder.tsx  # URL/Base64/Unicode encoding
│   ├── AESKeyGenerator.tsx # Secure AES key generation
│   ├── MD5Encryptor.tsx    # MD5 hash generation (16/32 bit)
│   ├── SQLFormatter.tsx    # SQL format/minify with syntax highlighting
│   ├── CronParser.tsx      # Cron expression parsing with human-readable descriptions
│   └── ThemeCustomizer.tsx # Custom theme color configuration
└── styles/
    └── global.css          # Custom CSS: glassmorphism, gradients, animations
```

### Routing Configuration (App.tsx)
```typescript
/
├── /json          → JSONFormatter
├── /jsonpath      → JSONPath
├── /timestamp     → TimestampConverter
├── /encoder       → EncoderDecoder
├── /aes           → AESKeyGenerator
├── /md5           → MD5Encryptor
├── /sql           → SQLFormatter
├── /cron          → CronParser
└── /theme         → ThemeCustomizer
```

### Design System
The project uses a custom **glassmorphism** design system defined in `global.css`:
- **Glass containers**: `glass` class with backdrop blur and semi-transparent backgrounds
- **Gradients**: Multiple CSS variables for text and backgrounds (`--gradient-primary`, etc.)
- **Animations**: `slide-up`, `fade-in`, `gradient-x` for smooth transitions
- **Colors**: Custom Tailwind theme extension with primary, secondary, accent palettes

### Component Patterns
All tool pages follow a consistent pattern:
1. **State management**: `useState` with typed interfaces
2. **Input/Output split**: Two-column layout on desktop, stacked on mobile
3. **Action buttons**: Clear, format/encode, copy operations
4. **Example data**: Pre-filled samples for quick testing
5. **Error handling**: Try-catch with user-friendly error messages
6. **Local processing**: No API calls, all data stays in browser

### Tool-Specific Features

**JSONFormatter** (`src/pages/JSONFormatter.tsx`):
- Format with 2/4/8 space indentation
- Minify/compress JSON
- Syntax validation with error display
- Syntax-highlighted output using `JSONSyntaxHighlight` component
- Collapsible tree view for large JSON structures
- Smart parsing of escaped JSON string inputs

**JSONPath** (`src/pages/JSONPath.tsx`):
- Query JSON data using JSONPath expressions
- Filter, slice, and recursively search JSON documents
- One-click sample queries

**TimestampConverter** (`src/pages/TimestampConverter.tsx`):
- **Batch mode**: Multiple input groups simultaneously
- Auto-detects seconds vs milliseconds
- Bidirectional: timestamp ↔ date
- Timezone selection (UTC, Asia, America, Europe, Australia)
- Clipboard import/export for bulk operations

**EncoderDecoder** (`src/pages/EncoderDecoder.tsx`):
- URL encoding/decoding
- Base64 with Chinese text support
- Unicode escape sequences (`\uXXXX`)
- Swap input/output, merge copy, length statistics

**AESKeyGenerator** (`src/pages/AESKeyGenerator.tsx`):
- Key sizes: 128/192/256 bits
- Formats: Hex, Base64, Raw, Java byte array, Java string
- Randomness iterations for enhanced security
- Java encryption usage examples

**MD5Encryptor** (`src/pages/MD5Encryptor.tsx`):
- 16-bit and 32-bit MD5 hash generation
- Real-time conversion as you type
- Copy result to clipboard

**SQLFormatter** (`src/pages/SQLFormatter.tsx`):
- Format SQL with 2/4/8 space indentation
- Minify/compress SQL to single line
- Dialect support: Standard SQL, MySQL, PostgreSQL, SQLite, T-SQL, BigQuery
- Keyword case options: uppercase, lowercase, preserve
- Syntax-highlighted output using `SQLSyntaxHighlight` component
- Pre-filled sample queries for quick testing

**CronParser** (`src/pages/CronParser.tsx`):
- Parse and validate cron expressions in real time
- Human-readable Chinese descriptions via `cronstrue`
- Display next 5 execution times via `cron-parser`
- Supports preset aliases (`@daily`, `@hourly`, etc.)
- One-click copy for description and execution times
- Common example expressions for quick testing

**ThemeCustomizer** (`src/pages/ThemeCustomizer.tsx`):
- Customize primary, secondary, and accent gradients
- Adjust background color palette
- Persistent theme saved to localStorage

### TypeScript Configuration
- **Strict mode enabled** (`strict: true`)
- **ES2020 target** with DOM support
- **No unused locals/parameters** linting
- **Bundler module resolution** for Vite

### Styling Architecture
- **Tailwind**: Utility-first with custom theme
- **Custom CSS**: Extended animations, glassmorphism, syntax highlighting
- **Responsive**: Mobile-first with `md:` breakpoints
- **Dark theme**: Default dark mode with slate/indigo color scheme

### Adding New Tools
To add a new tool:
1. Create new page in `src/pages/YourTool.tsx`
2. Import in `App.tsx` and add route
3. Add navigation item in `Layout.tsx` (navItems array)
4. Add tool card in `Home.tsx` (tools array)
5. Follow existing component patterns and styling

### Key Design Principles
- **Privacy-first**: All processing local, no server requests
- **User-friendly**: Clear error messages, helpful examples
- **Batch operations**: Support multiple inputs where applicable
- **Copy-friendly**: One-click copy for all outputs
- **Visual feedback**: Animations, hover states, success alerts

### Browser Compatibility
- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- Uses `crypto.getRandomValues()` for secure random generation

### Build & Deployment
- Vite builds optimized production bundle
- `base: './'` for relative paths (deployable in subdirectories)
- TypeScript compilation runs before Vite build
- No external dependencies beyond React ecosystem