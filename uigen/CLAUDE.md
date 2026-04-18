# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx

# Lint
npm run lint

# Reset database
npm run db:reset
```

**Windows note:** Scripts use `cross-env` to set `NODE_OPTIONS` — required for the `node-compat.cjs` polyfill that Next.js/Turbopack needs on this platform.

## Environment

Copy `.env.example` to `.env`. `ANTHROPIC_API_KEY` is optional — without it the app uses a `MockLanguageModel` that returns static component code (defined in `src/lib/provider.ts`). Set `JWT_SECRET` for a stable auth secret; defaults to `"development-secret-key"`.

## Architecture Overview

UIGen is a Next.js 15 App Router application where users chat with Claude to generate React components that render live in an iframe preview.

### Request / Generation Flow

1. User types a message → `ChatInterface` submits via `useChat` (Vercel AI SDK) to `POST /api/chat`
2. `route.ts` reconstructs a `VirtualFileSystem` from the serialized client state, injects the system prompt, and calls `streamText` with two tools: `str_replace_editor` and `file_manager`
3. As the model streams tool calls back, `onToolCall` in `ChatProvider` dispatches them to `FileSystemContext.handleToolCall`, which mutates the in-memory VFS and increments `refreshTrigger`
4. `PreviewFrame` watches `refreshTrigger`, gets all files from the VFS, runs them through `createImportMap` (Babel transform → blob URLs + esm.sh import map), and writes the full HTML to an `iframe`'s `srcdoc`

### Key Abstractions

- **`VirtualFileSystem`** (`src/lib/file-system.ts`) — in-memory tree; serialized as `Record<string, FileNode>` and round-tripped in every chat API request body so the server can reconstruct it
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — React context wrapping VFS mutations; `refreshTrigger` counter drives preview updates
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — thin wrapper around `useAIChat` that forwards tool calls into `FileSystemContext`
- **`jsx-transformer.ts`** (`src/lib/transform/`) — client-side Babel transform that converts JSX/TSX → blob URLs; builds an import map with `@/` alias support and auto-resolves third-party packages via `esm.sh`
- **`provider.ts`** — returns real `anthropic(MODEL)` when `ANTHROPIC_API_KEY` is set, otherwise `MockLanguageModel`

### AI Tools Given to the Model

| Tool | Purpose |
|---|---|
| `str_replace_editor` | `view`, `create`, `str_replace`, `insert` on the VFS |
| `file_manager` | `rename`, `delete` on the VFS |

### Auth & Persistence

- JWT sessions stored in `httpOnly` cookies; `src/lib/auth.ts` (server-only)
- Anonymous users can generate components; work is tracked in `src/lib/anon-work-tracker.ts`
- Authenticated users have projects persisted in SQLite via Prisma (`prisma/schema.prisma`): `User` → `Project` (stores `messages` and VFS `data` as JSON strings)
- Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes

### Generated Component Rules (enforced by system prompt)

- Every project must have `/App.jsx` as the root entry point with a default export
- Use Tailwind CSS for all styling (no hardcoded styles)
- Import local files with the `@/` alias (e.g. `@/components/Button`)
- No HTML files — the VFS is the only FS
