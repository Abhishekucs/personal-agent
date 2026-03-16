'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [agentId, setAgentId] = useState('');
  const [userName, setUserName] = useState('');
  const [agentType, setAgentType] = useState('gym');
  const [status, setStatus] = useState('Loading...');
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState('');

  // Chat state
  const [chatMode, setChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/agent/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status || 'Offline');
      })
      .catch(() => setStatus('Offline'));
  }, []);

  const handleDeploy = async () => {
    if (!agentId || !userName) {
      setMessage('Please enter an Agent ID and User Name.');
      return;
    }
    setDeploying(true);
    setMessage('');
    try {
      const response = await fetch('/api/agent/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentType, userName }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Success! Agent '${agentId}' is deployed and ready in OpenClaw.`);
        setChatMode(true);
      } else {
        setMessage('Deploy Error: ' + data.error);
      }
    } catch (e: any) {
      setMessage('Network error: ' + e.message);
    }
    setDeploying(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !agentId) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatLog((prev) => [...prev, { role: 'user', text: userMessage }]);
    setSending(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, message: userMessage }),
      });
      const data = await response.json();
      if (data.success) {
        setChatLog((prev) => [...prev, { role: 'agent', text: data.reply }]);
      } else {
        setChatLog((prev) => [...prev, { role: 'agent', text: 'Error connecting to agent: ' + data.error }]);
      }
    } catch (e: any) {
      setChatLog((prev) => [...prev, { role: 'agent', text: 'Network Error: ' + e.message }]);
    }
    setSending(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white font-sans">
      <div className="max-w-2xl mx-auto space-y-8 mt-12">
        <header className="text-center border-b border-zinc-800 pb-8">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Invook Agent Marketplace
          </h1>
          <p className="text-zinc-400 text-lg mt-4">One-click deploy isolated OpenClaw agents.</p>
          <div className="mt-4 inline-block px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-mono text-zinc-300">
            OpenClaw Gateway: {status.split('\n')[0].substring(0, 50)}
          </div>
        </header>

        {!chatMode ? (
          <section className="space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Agent ID (Unique handle)</label>
              <input
                type="text"
                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. abhi-sales-bot"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Your Name (For USER.md)</label>
              <input
                type="text"
                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Abhishek"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <label className="text-sm font-semibold text-zinc-300">Select Agent Personality</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setAgentType('gym')}
                  className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center gap-2 ${agentType === 'gym' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'}`}
                >
                  <span className="text-3xl">🏋️‍♂️</span>
                  <span className="font-medium text-sm">Gym Bot</span>
                </button>
                <button
                  onClick={() => setAgentType('sales')}
                  className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center gap-2 ${agentType === 'sales' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'}`}
                >
                  <span className="text-3xl">💼</span>
                  <span className="font-medium text-sm">Sales Bot</span>
                </button>
                <button
                  onClick={() => setAgentType('support')}
                  className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center gap-2 ${agentType === 'support' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'}`}
                >
                  <span className="text-3xl">🎧</span>
                  <span className="font-medium text-sm">Support Bot</span>
                </button>
              </div>
            </div>

            <footer className="flex flex-col items-center gap-4 pt-4">
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {deploying ? 'Provisioning Sub-Agent Workspace...' : 'Deploy AI Agent'}
              </button>
              {message && <div className="text-sm font-medium text-emerald-400 p-4 bg-emerald-900/30 border border-emerald-800 rounded-lg w-full text-center">{message}</div>}
            </footer>
          </section>
        ) : (
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col h-[500px] overflow-hidden">
            <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex justify-between items-center">
              <div className="font-bold">Chatting with: <span className="text-emerald-400">{agentId}</span></div>
              <button onClick={() => setChatMode(false)} className="text-xs text-zinc-400 hover:text-white">← Back to Setup</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatLog.length === 0 && (
                <div className="text-center text-zinc-500 mt-10">Say hi to your new dedicated {agentType} bot!</div>
              )}
              {chatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-100 rounded-bl-sm whitespace-pre-wrap'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 text-zinc-400 p-3 rounded-2xl rounded-bl-sm">Thinking...</div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                disabled={sending || !chatInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
