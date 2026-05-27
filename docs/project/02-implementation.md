# 核心实现：从类型安全到可运行 Agent

这一章按实现链路讲代码。建议你打开本地 `examples/mini-hermes-agent/src`，或者在 GitHub 中打开 [src 目录](https://github.com/dctongsheng/mini-hermes-agent-tutorial/tree/main/examples/mini-hermes-agent/src) 对照阅读。

## 1. 类型定义先行

[`shared/types.ts`](https://github.com/dctongsheng/mini-hermes-agent-tutorial/blob/main/examples/mini-hermes-agent/src/shared/types.ts) 定义了消息、工具调用、工具 schema 和 Trace。TypeScript 在 Agent 项目里特别重要，因为消息历史一旦拼错，Provider 往往只会返回一个很远的 400 错误。

```ts
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
```

## 2. Tool Registry

工具注册表做三件事：

1. 保存工具元数据。
2. 导出 OpenAI-compatible schema。
3. 根据模型给出的 `name` 和 `arguments` 执行 handler。

```ts
export class ToolRegistry {
  private readonly tools = new Map<string, ToolEntry>();

  register(entry: ToolEntry): void {
    if (this.tools.has(entry.name)) {
      throw new Error(`Tool already registered: ${entry.name}`);
    }
    this.tools.set(entry.name, entry);
  }

  async dispatch(name: string, args: Record<string, unknown>, context: ToolContext): Promise<string> {
    const entry = this.tools.get(name);
    if (!entry) {
      return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
    try {
      return await entry.handler(args, context);
    } catch (error) {
      return JSON.stringify({ error: error instanceof Error ? error.message : String(error) });
    }
  }
}
```

这里的错误包装很关键：工具失败也是 observation，应该回填给模型，而不是炸掉整个 Node 进程。

## 3. MemoryStore

教学版用 JSON 文件持久化：

```ts
await memory.add('用户偏好 TypeScript');
const snapshot = await memory.list();
```

真实 Hermes 使用 `MEMORY.md` / `USER.md` 这类人可读文件，并在 System Prompt 中显示容量信息。我们的版本保留“会话开始读取快照”的语义。

## 4. Prompt Builder

Prompt Builder 不应该知道 HTTP，也不应该执行工具。它只是把稳定输入拼成系统提示词：

```ts
const prompt = await buildHermesStyleSystemPrompt({
  memory,
  tools: registry.toOpenAITools()
});
```

## 5. Provider 抽象

`MockPlannerProvider` 用规则模拟 LLM，方便无 Key 教学：

- 看到算式就返回 `calculator`。
- 看到“记住/偏好/TypeScript”就返回 `memory_add`。
- 看到工具结果后返回最终回答。

`OpenAIChatProvider` 则把内部消息格式转换成 Chat Completions 格式。注意 assistant tool_calls 和 tool result 的顺序必须保留。

## 6. Agent Loop

[`MiniHermesAgent.run()`](https://github.com/dctongsheng/mini-hermes-agent-tutorial/blob/main/examples/mini-hermes-agent/src/agent/MiniHermesAgent.ts) 是整个项目最重要的函数：

```ts
for (let iteration = 0; iteration < this.maxIterations; iteration += 1) {
  const response = await this.provider.complete({
    messages,
    tools: this.tools.toOpenAITools(),
    systemPrompt
  });

  if (response.toolCalls && response.toolCalls.length > 0) {
    messages.push({ role: 'assistant', content: response.content ?? '', toolCalls: response.toolCalls });
    for (const call of response.toolCalls) {
      const result = await this.tools.dispatch(call.name, call.arguments, { memory: this.memory });
      messages.push({ role: 'tool', toolCallId: call.id, content: result });
    }
    continue;
  }

  return response.content;
}
```

这就是 Hermes Agent 的最小心脏：模型提出行动，应用执行行动，观察结果回到模型，直到完成。

## 测试如何保护核心行为

测试文件 [`tests/agent.test.ts`](https://github.com/dctongsheng/mini-hermes-agent-tutorial/blob/main/examples/mini-hermes-agent/tests/agent.test.ts) 覆盖了三个行为：

- 工具 schema 是 strict 的。
- 记忆以冻结快照形式进入 System Prompt。
- 工具调用、工具结果、最终回答能完整跑通。

如果你后续扩展工具，优先加测试。Agent 系统最怕“看起来能聊”，但关键消息格式悄悄坏掉。
