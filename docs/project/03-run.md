# 运行方式与未来扩展

## 安装依赖

在仓库根目录运行：

```bash
npm install
```

## 启动教程站点

```bash
npm run docs:dev
```

默认会启动 VitePress。浏览器打开终端显示的本地地址即可。

## 启动 mini Hermes Agent

```bash
npm run demo
```

这会同时启动：

- Node API：`http://localhost:8790`
- React UI：`http://localhost:5175`

没有配置 API Key 时，后端使用 `MockPlannerProvider`，仍然可以看到完整工具调用链路。

## 使用真实模型

配置 OpenAI-compatible 环境变量：

```bash
export OPENAI_API_KEY="你的 Key"
export OPENAI_MODEL="gpt-4.1-mini"
# 可选：如果使用兼容服务
export OPENAI_BASE_URL="https://your-compatible-endpoint/v1"

npm run demo
```

## 验证

```bash
npm test
npm --workspace mini-hermes-agent run build
npm run docs:build
```

## 可以怎样扩展

### 1. 接入更多外部 API

先从只读工具开始，例如：

- `weather(city)`：天气查询。
- `github_issue(repo, query)`：Issue 检索。
- `docs_search(query)`：内部文档搜索。

等只读工具稳定后，再接有副作用工具，例如创建 Issue、发送消息、写文件。

### 2. 优化记忆机制

当前 `MemoryStore` 是简单 JSON。下一步可以改成：

- `MEMORY.md` + `USER.md` 双文件。
- 每条记忆带 `createdAt`、`source`、`confidence`。
- 超过长度后调用总结模型压缩。
- 引入向量检索或 SQLite FTS。

### 3. 加入任务规划

可以新增 `todo` 工具：

```ts
todo({
  action: 'set',
  items: [
    { id: '1', text: '读取需求', status: 'done' },
    { id: '2', text: '调用搜索工具', status: 'in_progress' }
  ]
});
```

UI 可以把 todo 状态渲染成任务板。这就是从单 Agent 走向多步工作流的第一步。

### 4. 接入 MCP

Hermes 支持 MCP，是因为 MCP 可以把外部工具服务器动态暴露给 Agent。mini 项目可以先做一个静态版本：

1. 启动一个 MCP filesystem server。
2. Node 后端发现工具列表。
3. 把 MCP 工具包装成 `ToolEntry`。
4. 通过现有 Registry 暴露给模型。

关键是保持边界：MCP 是工具来源，不应该改变 Agent Loop。

## 常见问题

### 为什么默认不用真实模型？

因为教学的第一步是看清 Agent Loop。真实模型会引入 Key、网络、模型差异和计费因素，容易遮住核心机制。

### 为什么不用数据库？

为了降低起步成本。教程版先用 JSON 文件解释“持久记忆”和“冻结快照”；理解后再换 SQLite 或向量库。

### 为什么 React 页面这么简单？

Agent 教学 UI 最重要的是 Trace。花哨聊天气泡不如清楚展示：模型调用了什么工具、传了什么参数、工具返回了什么。
