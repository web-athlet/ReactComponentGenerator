# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UIGen** — An AI-powered React component generator with live preview. Users describe a UI component in a chat interface, and Claude generates React + Tailwind code that renders in a live preview panel.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Production build
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/MessageList.test.tsx

# Lint
npm run lint

# Reset database
npm run db:reset
```

## Environment

Set `ANTHROPIC_API_KEY` in a `.env` file to enable real Claude AI generation. Without it, the app uses a mock provider that streams a pre-built example component.

## Architecture

### AI Generation Pipeline

The core flow: `Chat UI → POST /api/chat → Vercel AI SDK (streamText) → Claude → tool calls → virtual file system → live preview`.

- **`src/app/api/chat/route.ts`** — Streaming API endpoint. Calls Claude with `maxSteps: 40` using two tools: `str_replace_editor` (file edits) and `file_manager` (create/delete/list). Uses prompt caching (`ephemeral` cache control on the system prompt).
- **`src/lib/provider.ts`** — Returns either the real Anthropic provider or a `MockLanguageModel` that simulates streaming tool calls.
- **`src/lib/prompts/generation.tsx`** — System prompt. Key constraint: Claude must always create `App.jsx` as the entry point, use only Tailwind for styling, and use `@/` imports for inter-file references.
- **`src/lib/tools/`** — Tool implementations for file operations against the virtual FS.

### Virtual File System

**`src/lib/file-system.ts`** — An in-memory virtual FS that supports full CRUD on files/directories. Serialized to JSON and persisted to the database on the `Project.files` column. The `FileSystemContext` (`src/lib/contexts/`) provides this to all components.

### Preview Rendering

**`src/components/preview/PreviewFrame.tsx`** — Client-side Babel transpilation of the generated JSX. Reads `App.jsx` from the virtual FS and renders it in a sandboxed `<div>`. The `@/` imports are resolved against other virtual FS files at runtime.

### Layout

**`src/app/main-content.tsx`** — Three-panel resizable layout: Chat (left) | Preview/Code Editor (right, tabbed). Uses `react-resizable-panels`.

### Auth & Persistence

- **`src/lib/auth.ts`** — JWT sessions (jose), 7-day expiry, stored in HTTP-only cookies.
- **`src/middleware.ts`** — Protects `/api/*` routes.
- **`src/actions/index.ts`** — Server actions for sign up / sign in / sign out.
- **`prisma/schema.prisma`** — SQLite, two models: `User` (email, hashed password) → `Project` (files JSON, messages JSON). Dev database at `prisma/dev.db`.
- Anonymous users get a temporary session (via `src/lib/anon-work-tracker.ts` in `sessionStorage`) but cannot persist work across sessions.

### Testing

Tests live in `__tests__/` subdirectories next to the components they test. Uses Vitest + JSDOM + React Testing Library.
