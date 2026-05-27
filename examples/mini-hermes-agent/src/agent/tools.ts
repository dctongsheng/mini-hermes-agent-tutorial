import { z } from 'zod';
import type { JsonSchema, OpenAIToolDefinition } from '../shared/types';
import type { MemoryStore } from './memory';

export interface ToolContext {
  memory: MemoryStore;
}

export interface ToolEntry {
  name: string;
  description: string;
  parameters: JsonSchema;
  handler: (args: Record<string, unknown>, context: ToolContext) => Promise<string> | string;
}

export class ToolRegistry {
  private readonly tools = new Map<string, ToolEntry>();

  register(entry: ToolEntry): void {
    if (this.tools.has(entry.name)) {
      throw new Error(`Tool already registered: ${entry.name}`);
    }
    this.tools.set(entry.name, entry);
  }

  toOpenAITools(): OpenAIToolDefinition[] {
    return [...this.tools.values()].map((entry) => ({
      type: 'function',
      function: {
        name: entry.name,
        description: entry.description,
        parameters: entry.parameters,
        strict: true
      }
    }));
  }

  async dispatch(name: string, args: Record<string, unknown>, context: ToolContext): Promise<string> {
    const entry = this.tools.get(name);
    if (!entry) {
      return JSON.stringify({ error: `Unknown tool: ${name}` });
    }

    try {
      return await entry.handler(args, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return JSON.stringify({ error: message });
    }
  }
}

const calculatorArgs = z.object({
  expression: z.string().min(1)
});

const memoryAddArgs = z.object({
  content: z.string().min(1)
});

const memorySearchArgs = z.object({
  query: z.string().min(1)
});

function objectSchema(properties: Record<string, unknown>, required: string[]): JsonSchema {
  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false
  };
}

function safeCalculate(expression: string): number {
  if (!/^[\d\s+\-*/().]+$/.test(expression)) {
    throw new Error('Calculator only accepts numbers and + - * / ( ) operators.');
  }
  const value = Function(`"use strict"; return (${expression});`)() as unknown;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Calculator expression did not produce a finite number.');
  }
  return value;
}

export function createDefaultRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  registry.register({
    name: 'calculator',
    description: 'Evaluate a small arithmetic expression. Use only for numeric calculations.',
    parameters: objectSchema(
      {
        expression: {
          type: 'string',
          description: 'Arithmetic expression, for example "21 * 2".'
        }
      },
      ['expression']
    ),
    handler(args) {
      const { expression } = calculatorArgs.parse(args);
      return JSON.stringify({ expression, result: safeCalculate(expression) });
    }
  });

  registry.register({
    name: 'get_time',
    description: 'Return the current server time as an ISO string.',
    parameters: objectSchema({}, []),
    handler() {
      return JSON.stringify({ now: new Date().toISOString() });
    }
  });

  registry.register({
    name: 'memory_add',
    description: 'Persist one durable user preference, project fact, or environment note.',
    parameters: objectSchema(
      {
        content: {
          type: 'string',
          description: 'One compact memory entry.'
        }
      },
      ['content']
    ),
    async handler(args, context) {
      const { content } = memoryAddArgs.parse(args);
      const entries = await context.memory.add(content);
      return JSON.stringify({ saved: content, total: entries.length });
    }
  });

  registry.register({
    name: 'memory_search',
    description: 'Search persisted memory entries by keyword before asking the user to repeat context.',
    parameters: objectSchema(
      {
        query: {
          type: 'string',
          description: 'Search query.'
        }
      },
      ['query']
    ),
    async handler(args, context) {
      const { query } = memorySearchArgs.parse(args);
      return JSON.stringify({ query, matches: await context.memory.search(query) });
    }
  });

  return registry;
}
