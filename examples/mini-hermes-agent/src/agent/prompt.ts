import type { OpenAIToolDefinition } from '../shared/types';
import type { MemoryStore } from './memory';

export interface PromptInputs {
  memory: MemoryStore;
  tools: OpenAIToolDefinition[];
}

export async function buildHermesStyleSystemPrompt(inputs: PromptInputs): Promise<string> {
  const memories = await inputs.memory.list();
  const toolNames = inputs.tools.map((tool) => tool.function.name).join(', ');

  return [
    '# Identity',
    'You are Mini Hermes Agent, a teaching-oriented autonomous assistant.',
    'You solve tasks by alternating between model reasoning, typed tool calls, observations, and final answers.',
    '',
    '# Tool Use Rules',
    'Use tools when they provide fresher data, external actions, calculation, or persistent recall.',
    'Do not invent tool results. After a tool call, read the tool observation before answering.',
    `Available tools: ${toolNames || 'none'}.`,
    '',
    '# Memory Snapshot',
    memories.length > 0 ? memories.map((entry) => `- ${entry}`).join('\n') : '- No durable memories yet.',
    '',
    '# Planning Style',
    'For multi-step work, keep a compact plan internally, execute the next useful tool, then revise from observations.'
  ].join('\n');
}
