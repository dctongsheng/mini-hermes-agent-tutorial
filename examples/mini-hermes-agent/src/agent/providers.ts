import OpenAI from 'openai';
import type { ChatMessage, LLMRequest, LLMResponse, ToolCall } from '../shared/types';

export interface LLMProvider {
  complete(request: LLMRequest): Promise<LLMResponse>;
}

function toolCall(name: string, args: Record<string, unknown>): ToolCall {
  return {
    id: `call_${Math.random().toString(36).slice(2, 10)}`,
    name,
    arguments: args
  };
}

function latestUserMessage(messages: ChatMessage[]): string {
  return [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
}

function summarizeToolMessages(messages: ChatMessage[]): string {
  const toolMessages = messages.filter((message) => message.role === 'tool');
  const calculator = toolMessages
    .map((message) => {
      try {
        const parsed = JSON.parse(message.content) as { result?: unknown };
        return parsed.result;
      } catch {
        return undefined;
      }
    })
    .find((value) => value !== undefined);

  const memorySaved = toolMessages.some((message) => message.content.includes('"saved"'));
  const parts = [];
  if (calculator !== undefined) {
    parts.push(`计算结果是 ${calculator}`);
  }
  if (memorySaved) {
    parts.push('我也已经把稳定偏好写入记忆');
  }
  return parts.length > 0 ? `${parts.join('，')}。` : '工具执行完成。';
}

export class MockPlannerProvider implements LLMProvider {
  async complete(request: LLMRequest): Promise<LLMResponse> {
    if (request.messages.some((message) => message.role === 'tool')) {
      return { content: summarizeToolMessages(request.messages) };
    }

    const user = latestUserMessage(request.messages);
    const calls: ToolCall[] = [];
    const expression = user.match(/(\d+\s*[*+\-/]\s*\d+(?:\s*[*+\-/]\s*\d+)*)/)?.[1];
    if (expression) {
      calls.push(toolCall('calculator', { expression }));
    }
    if (/记住|偏好|喜欢|prefer|typescript/i.test(user)) {
      calls.push(toolCall('memory_add', { content: '用户偏好 TypeScript' }));
    }
    if (/现在几点|time|时间/.test(user)) {
      calls.push(toolCall('get_time', {}));
    }
    if (/以前|记忆|remember|recall/i.test(user)) {
      calls.push(toolCall('memory_search', { query: user }));
    }

    if (calls.length > 0) {
      return { toolCalls: calls };
    }
    return {
      content:
        '这是 Mock LLM 的回答。配置 OPENAI_API_KEY 后，同一个 Agent 循环会切到真实 OpenAI-compatible tool calling。'
    };
  }
}

export class OpenAIChatProvider implements LLMProvider {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: request.messages.map((message) => {
        if (message.role === 'tool') {
          return {
            role: 'tool',
            tool_call_id: message.toolCallId ?? 'unknown',
            content: message.content
          };
        }
        if (message.role === 'assistant' && message.toolCalls) {
          return {
            role: 'assistant',
            content: message.content || null,
            tool_calls: message.toolCalls.map((call) => ({
              id: call.id,
              type: 'function',
              function: {
                name: call.name,
                arguments: JSON.stringify(call.arguments)
              }
            }))
          };
        }
        return {
          role: message.role,
          content: message.content
        };
      }) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      tools: request.tools,
      tool_choice: 'auto'
    });

    const message = response.choices[0]?.message;
    const calls =
      message?.tool_calls?.flatMap((call) => {
        if (call.type !== 'function') {
          return [];
        }
        return [
          {
            id: call.id,
            name: call.function.name,
            arguments: JSON.parse(call.function.arguments || '{}') as Record<string, unknown>
          }
        ];
      }) ?? [];

    return {
      content: message?.content ?? undefined,
      toolCalls: calls.length > 0 ? calls : undefined
    };
  }
}
