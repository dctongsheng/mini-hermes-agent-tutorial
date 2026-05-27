# Mini Hermes Agent Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Chinese VitePress tutorial and runnable TypeScript mini Hermes Agent.

**Architecture:** Keep documentation and runnable code separate. The Agent core is framework-independent, with React and Express as thin adapters.

**Tech Stack:** VitePress, TypeScript, Node.js, Express, React, Vite, Vitest, Mermaid.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `docs/.vitepress/config.ts`
- Create: `docs/.vitepress/theme/index.ts`
- Create: `examples/mini-hermes-agent/package.json`
- Create: `examples/mini-hermes-agent/tsconfig.json`

- [x] Add root workspace scripts for docs, demo, and tests.
- [x] Add VitePress config with Chinese nav/sidebar.
- [x] Add Mermaid rendering enhancement for `mermaid` code fences.
- [x] Add example workspace package scripts.

### Task 2: Agent Core

**Files:**
- Create: `examples/mini-hermes-agent/src/shared/types.ts`
- Create: `examples/mini-hermes-agent/src/agent/memory.ts`
- Create: `examples/mini-hermes-agent/src/agent/tools.ts`
- Create: `examples/mini-hermes-agent/src/agent/prompt.ts`
- Create: `examples/mini-hermes-agent/src/agent/providers.ts`
- Create: `examples/mini-hermes-agent/src/agent/MiniHermesAgent.ts`
- Test: `examples/mini-hermes-agent/tests/agent.test.ts`

- [x] Write tests first for schema strictness, frozen memory, and full loop.
- [x] Implement memory store.
- [x] Implement tool registry and default tools.
- [x] Implement prompt builder.
- [x] Implement mock and OpenAI-compatible providers.
- [x] Implement Agent Loop.

### Task 3: React and Node Demo

**Files:**
- Create: `examples/mini-hermes-agent/src/server/index.ts`
- Create: `examples/mini-hermes-agent/src/client/main.tsx`
- Create: `examples/mini-hermes-agent/src/client/styles.css`
- Create: `examples/mini-hermes-agent/index.html`
- Create: `examples/mini-hermes-agent/vite.config.ts`

- [x] Expose `/api/chat`.
- [x] Select Mock provider by default and OpenAI provider when `OPENAI_API_KEY` exists.
- [x] Render user message, final answer, and tool trace in React.
- [x] Proxy `/api` from Vite client to Express server.

### Task 4: Tutorial Content

**Files:**
- Create: `docs/index.md`
- Create: `docs/guide/*.md`
- Create: `docs/demo/*.md`
- Create: `docs/project/*.md`
- Create: `docs/reference/sources.md`

- [x] Explain Hermes architecture and design principles.
- [x] Explain Function Calling with sequence diagrams and pitfalls.
- [x] Explain System Prompt layering.
- [x] Explain memory and planning.
- [x] Explain final project architecture, implementation, running, and extensions.

### Task 5: Verification

**Files:**
- All project files.

- [x] Run `npm test`.
- [x] Run `npm --workspace mini-hermes-agent run build`.
- [x] Run `npm run docs:build`.
- [x] Fix any failing tests or build errors.
