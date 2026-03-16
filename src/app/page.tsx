'use client';

import { useState } from 'react';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agentType, setAgentType] = useState('gym');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    setStatus('Configuring your custom OpenClaw agent...');
    try {
      const response = await fetch('/api/agent/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentType, userName }),
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ ${data.message} Workspace configured at ${data.workspace}`);
      } else {
        setStatus('❌ Error: ' + data.error);
      }
    } catch (e: any) {
      setStatus('❌ Network error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <header className="border-b border-zinc-800 pb-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Invook Agent Marketplace
          </h1>
          <p className="text-zinc-400 text-sm mt-2">Deploy your own custom OpenClaw AI Agent instantly.</p>
        </header>

        <section className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Your Name</label>
            <input
              type="text"
              className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Abhi"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Agent Identifier (Unique ID)</label>
            <input
              type="text"
              className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="e.g. abhi-gym-bot"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Select Agent Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'gym', icon: '🤖', title: 'Gym Bot' },
                { id: 'sales', icon: '💼', title: 'Sales Bot' },
                { id: 'support', icon: '🎧', title: 'Support Bot' },
              ].map(bot => (
                <button
                  key={bot.id}
                  onClick={() => setAgentType(bot.id)}
                  className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                    agentType === bot.id 
                      ? 'bg-teal-900/30 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                      : 'bg-zinc-950 border-zinc-700 hover:border-zinc-500 text-zinc-400'
                  }`}
                >
                  <span className="text-2xl">{bot.icon}</span>
                  <span className="text-sm font-medium">{bot.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="pt-4 flex flex-col gap-4">
          <button
            onClick={handleDeploy}
            disabled={loading || !agentId}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deploying...' : 'Deploy OpenClaw Agent ⚡️'}
          </button>
          
          {status && (
            <div className={`p-4 rounded-xl text-sm font-mono whitespace-pre-wrap ${status.includes('❌') ? 'bg-red-950/50 text-red-400 border border-red-900' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900'}`}>
              {status}
            </div>
          )}
        </footer>
      </div>
    </main>
  );
}
