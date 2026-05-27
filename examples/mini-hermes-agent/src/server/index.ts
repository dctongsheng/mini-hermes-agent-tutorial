import cors from 'cors';
import express from 'express';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MiniHermesAgent } from '../agent/MiniHermesAgent';
import { MemoryStore } from '../agent/memory';
import { MockPlannerProvider, OpenAIChatProvider } from '../agent/providers';
import { createDefaultRegistry } from '../agent/tools';
import type { ChatRequest, ChatResponse } from '../shared/types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 8790);

const provider = process.env.OPENAI_API_KEY
  ? new OpenAIChatProvider(process.env.OPENAI_API_KEY)
  : new MockPlannerProvider();

const agent = new MiniHermesAgent({
  provider,
  tools: createDefaultRegistry(),
  memory: new MemoryStore(join(__dirname, '../../data/memory.json'))
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    provider: process.env.OPENAI_API_KEY ? 'openai-compatible' : 'mock'
  });
});

app.post('/api/chat', async (req, res, next) => {
  try {
    const body = req.body as ChatRequest;
    if (!body.message || typeof body.message !== 'string') {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const result = await agent.run(body.message);
    const response: ChatResponse = {
      answer: result.finalAnswer,
      trace: result.trace,
      messages: result.messages
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`Mini Hermes Agent API listening on http://localhost:${port}`);
});
