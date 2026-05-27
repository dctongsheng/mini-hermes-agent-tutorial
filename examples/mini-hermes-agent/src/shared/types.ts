export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface JsonSchema {
  [key: string]: unknown;
  type: 'object';
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
}

export interface OpenAIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
    strict: true;
  };
}

export interface LLMRequest {
  messages: ChatMessage[];
  tools: OpenAIToolDefinition[];
  systemPrompt: string;
}

export interface LLMResponse {
  content?: string;
  toolCalls?: ToolCall[];
}

export type TraceStep =
  | {
      kind: 'llm';
      content: string;
    }
  | {
      kind: 'tool_call';
      toolName: string;
      arguments: Record<string, unknown>;
      result: string;
    };

export interface AgentRunResult {
  finalAnswer: string;
  trace: TraceStep[];
  messages: ChatMessage[];
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
  trace: TraceStep[];
  messages: ChatMessage[];
}
