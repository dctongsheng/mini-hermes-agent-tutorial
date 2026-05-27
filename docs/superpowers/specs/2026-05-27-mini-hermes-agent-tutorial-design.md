# Mini Hermes Agent Tutorial Design

## Goal

Build a runnable VitePress Chinese tutorial project that explains Hermes Agent principles and teaches readers to implement a TypeScript mini Agent with React frontend and Node.js backend.

## Audience

Computer science graduates and junior developers who understand TypeScript basics but have not built an agent loop before.

## Scope

- VitePress documentation site with progressive Chinese tutorial content.
- Mermaid diagrams for architecture, flow, and sequence views.
- Runnable `examples/mini-hermes-agent` project.
- TypeScript Agent core with tool registry, prompt builder, memory store, provider abstraction, tests, Express API, and React UI.
- Source reference page linking official Hermes, Nous, OpenAI, MCP, and VitePress materials.

## Architecture

The tutorial site lives under `docs/`. The runnable example lives under `examples/mini-hermes-agent/`. The example keeps the Agent core independent from HTTP and React:

- `shared/types.ts` defines message, tool, trace, and API contracts.
- `agent/tools.ts` registers strict function schemas and dispatches handlers.
- `agent/memory.ts` persists durable memory.
- `agent/prompt.ts` assembles a stable Hermes-style system prompt.
- `agent/providers.ts` offers a Mock provider and OpenAI-compatible provider.
- `agent/MiniHermesAgent.ts` runs the tool-call loop.
- `server/index.ts` exposes `/api/chat`.
- `client/main.tsx` renders conversation and tool trace.

## Validation

- Unit tests cover strict tool schemas, frozen memory prompt injection, and a full tool-call loop.
- TypeScript build verifies frontend, server, and Agent modules.
- VitePress build verifies the tutorial site and Mermaid enhancement bundle.
