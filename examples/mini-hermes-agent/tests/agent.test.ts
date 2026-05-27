import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { MiniHermesAgent } from '../src/agent/MiniHermesAgent';
import { MockPlannerProvider } from '../src/agent/providers';
import { createDefaultRegistry } from '../src/agent/tools';
import { MemoryStore } from '../src/agent/memory';

let tempDir: string | undefined;

async function makeTempMemory() {
  tempDir = await mkdtemp(join(tmpdir(), 'mini-hermes-'));
  return new MemoryStore(join(tempDir, 'memory.json'));
}

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('mini Hermes agent loop', () => {
  it('exposes strict function schemas from the tool registry', () => {
    const registry = createDefaultRegistry();
    const tools = registry.toOpenAITools();

    expect(tools.map((tool) => tool.function.name)).toContain('calculator');
    expect(tools.every((tool) => tool.function.strict)).toBe(true);
    expect(tools.every((tool) => tool.function.parameters.additionalProperties === false)).toBe(true);
  });

  it('injects a frozen memory snapshot into the system prompt', async () => {
    const memory = await makeTempMemory();
    await memory.add('用户喜欢先看架构图，再看代码。');

    const agent = new MiniHermesAgent({
      provider: new MockPlannerProvider(),
      tools: createDefaultRegistry(),
      memory
    });

    const prompt = await agent.buildSystemPrompt();
    await memory.add('这条新记忆要等下一轮会话才进入冻结快照。');

    expect(prompt).toContain('用户喜欢先看架构图');
    expect(prompt).not.toContain('这条新记忆');
  });

  it('runs model tool calls, appends tool observations, then returns a final answer', async () => {
    const memory = await makeTempMemory();
    const agent = new MiniHermesAgent({
      provider: new MockPlannerProvider(),
      tools: createDefaultRegistry(),
      memory
    });

    const result = await agent.run('请计算 21 * 2，并记住我偏好 TypeScript。');

    expect(result.finalAnswer).toContain('42');
    expect(result.trace.some((step) => step.kind === 'tool_call' && step.toolName === 'calculator')).toBe(true);
    expect(result.trace.some((step) => step.kind === 'tool_call' && step.toolName === 'memory_add')).toBe(true);
    expect(await memory.list()).toContain('用户偏好 TypeScript');
  });
});
