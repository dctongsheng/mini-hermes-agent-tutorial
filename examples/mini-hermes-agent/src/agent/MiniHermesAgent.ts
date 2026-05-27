import type { AgentRunResult, ChatMessage, TraceStep } from '../shared/types';
import type { MemoryStore } from './memory';
import { buildHermesStyleSystemPrompt } from './prompt';
import type { LLMProvider } from './providers';
import type { ToolRegistry } from './tools';

export interface MiniHermesAgentOptions {
  provider: LLMProvider;
  tools: ToolRegistry;
  memory: MemoryStore;
  maxIterations?: number;
}

export class MiniHermesAgent {
  private readonly provider: LLMProvider;
  private readonly tools: ToolRegistry;
  private readonly memory: MemoryStore;
  private readonly maxIterations: number;
  private readonly history: ChatMessage[] = [];
  private frozenSystemPrompt?: string;

  constructor(options: MiniHermesAgentOptions) {
    this.provider = options.provider;
    this.tools = options.tools;
    this.memory = options.memory;
    this.maxIterations = options.maxIterations ?? 6;
  }

  async buildSystemPrompt(): Promise<string> {
    if (!this.frozenSystemPrompt) {
      this.frozenSystemPrompt = await buildHermesStyleSystemPrompt({
        memory: this.memory,
        tools: this.tools.toOpenAITools()
      });
    }
    return this.frozenSystemPrompt;
  }

  async run(userMessage: string): Promise<AgentRunResult> {
    const systemPrompt = await this.buildSystemPrompt();
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.history,
      { role: 'user', content: userMessage }
    ];
    const trace: TraceStep[] = [];

    for (let iteration = 0; iteration < this.maxIterations; iteration += 1) {
      const response = await this.provider.complete({
        messages,
        tools: this.tools.toOpenAITools(),
        systemPrompt
      });

      if (response.toolCalls && response.toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: response.content ?? '',
          toolCalls: response.toolCalls
        });

        for (const call of response.toolCalls) {
          const result = await this.tools.dispatch(call.name, call.arguments, { memory: this.memory });
          trace.push({
            kind: 'tool_call',
            toolName: call.name,
            arguments: call.arguments,
            result
          });
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            content: result
          });
        }
        continue;
      }

      const finalAnswer = response.content ?? '';
      trace.push({ kind: 'llm', content: finalAnswer });
      messages.push({ role: 'assistant', content: finalAnswer });
      this.history.push({ role: 'user', content: userMessage }, { role: 'assistant', content: finalAnswer });
      return { finalAnswer, trace, messages };
    }

    const finalAnswer = 'Agent reached its iteration budget before producing a final answer.';
    trace.push({ kind: 'llm', content: finalAnswer });
    return { finalAnswer, trace, messages };
  }
}
