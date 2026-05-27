import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ChatResponse, TraceStep } from '../shared/types';
import './styles.css';

interface ChatTurn {
  user: string;
  answer: string;
  trace: TraceStep[];
}

function TraceView({ trace }: { trace: TraceStep[] }) {
  if (trace.length === 0) {
    return null;
  }

  return (
    <div className="trace">
      {trace.map((step, index) => (
        <div className="trace-row" key={index}>
          <span className="trace-kind">{step.kind === 'tool_call' ? step.toolName : 'final'}</span>
          <code>{step.kind === 'tool_call' ? step.result : step.content}</code>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [message, setMessage] = useState('请计算 21 * 2，并记住我偏好 TypeScript。');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = (await response.json()) as ChatResponse;
      setTurns((current) => [...current, { user: message, answer: data.answer, trace: data.trace }]);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header>
          <p className="eyebrow">TypeScript teaching build</p>
          <h1>Mini Hermes Agent</h1>
          <p>
            一个保留 Hermes 核心思想的教学版 Agent：稳定系统提示词、函数调用、工具观测、冻结记忆快照和迭代预算。
          </p>
        </header>

        <form onSubmit={sendMessage} className="composer">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="输入一个需要计算、记忆或查询时间的任务"
          />
          <button disabled={loading || !message.trim()}>{loading ? '运行中...' : '发送'}</button>
        </form>

        {error ? <pre className="error">{error}</pre> : null}

        <div className="turns">
          {turns.map((turn, index) => (
            <article className="turn" key={index}>
              <p className="user">{turn.user}</p>
              <p className="answer">{turn.answer}</p>
              <TraceView trace={turn.trace} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
