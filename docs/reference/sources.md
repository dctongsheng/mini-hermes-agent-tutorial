# 资料来源与延伸阅读

本教程主要参考以下资料，并做了教学化重组。阅读源码时建议优先看官方文档，再看具体文件。

## Hermes / Nous 资料

| 资料 | 用途 |
| --- | --- |
| [NousResearch/hermes-agent GitHub](https://github.com/NousResearch/hermes-agent) | 了解 Hermes Agent 的定位、快速安装、主要能力和项目入口 |
| [Hermes Agent Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture) | 参考 Agent Loop、Prompt Builder、Tool Dispatch、Session Storage 的整体架构 |
| [Agent Loop Internals](https://hermes-agent.nousresearch.com/docs/developer-guide/agent-loop) | 参考 turn lifecycle、工具执行、迭代预算、压缩与持久化 |
| [Prompt Assembly](https://hermes-agent.nousresearch.com/docs/developer-guide/prompt-assembly) | 参考稳定 Prompt 层、SOUL.md、记忆快照、技能索引和上下文文件注入 |
| [Tools Runtime](https://hermes-agent.nousresearch.com/docs/developer-guide/tools-runtime) | 参考工具自注册、schema 收集、dispatch、错误包装和危险命令审批 |
| [Persistent Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory) | 参考 MEMORY.md / USER.md、冻结快照、memory tool actions |
| [Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) | 参考 progressive disclosure 和技能作为按需知识文档的设计 |
| [Session Storage](https://hermes-agent.nousresearch.com/docs/developer-guide/session-storage) | 参考 SQLite、FTS5、session lineage、消息存储 schema |
| [Hermes-Function-Calling](https://github.com/NousResearch/Hermes-Function-Calling) | 参考 Hermes tool call prompt format、ChatML、JSON schema 和示例链路 |
| [Hermes 3 Technical Report](https://nousresearch.com/wp-content/uploads/2024/08/Hermes-3-Technical-Report.pdf) | 参考系统提示词敏感性、tool use 和 instruct 模型定位 |
| [Hermes 4 Technical Report](https://nousresearch.com/wp-content/uploads/2025/08/Hermes_4_Technical_Report.pdf) | 参考 schema adherence、tool use environment、tool_response 训练链路 |

## 通用 Agent / 工具调用资料

| 资料 | 用途 |
| --- | --- |
| [OpenAI Function Calling Guide](https://developers.openai.com/api/docs/guides/function-calling) | 参考工具调用五步流程、strict schema、parallel tool calls、token 成本 |
| [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat) | 区分 function calling 与 response_format 的适用场景 |
| [Model Context Protocol Schema Reference](https://modelcontextprotocol.io/specification/2025-06-18/schema) | 后续扩展 MCP 工具服务器时参考 JSON-RPC 与 schema |
| [VitePress Markdown Extensions](https://vitepress.dev/zh/guide/markdown) | 参考 VitePress Markdown、代码块、内部链接和内容组织能力 |

## 如何继续读源码

建议按这个顺序：

1. `run_agent.py`：只看主循环和工具调用分支，不要一开始钻所有 callback。
2. `agent/prompt_builder.py`：看 Prompt 层次和 context file 注入。
3. `model_tools.py` + `tools/registry.py`：看工具 schema 如何收集与 dispatch。
4. `hermes_state.py`：看 session 和 message 如何持久化。
5. `agent/memory_manager.py` / memory provider：看长期记忆如何从文件演化到插件。

源码很大，不要试图一次读完。抓住“消息如何流动”这条线，会比按文件树从上到下读有效得多。
