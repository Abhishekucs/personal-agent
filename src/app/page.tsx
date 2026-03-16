'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [soul, setSoul] = useState('');
  const [userDesc, setUserDesc] = useState('');
  const [status, setStatus] = useState('Loading...');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch Agent Identity/Config
    fetch('/api/agent/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSoul(data.soul);
          setUserDesc(data.user);
        }
      });

    // Fetch OpenClaw Gateway Status
    fetch('/api/agent/status')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status || 'Offline');
      })
      .catch(() => setStatus('Offline'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/agent/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soul, user: userDesc }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Agent profile saved successfully! ✨');
      } else {
        setMessage('Error saving profile: ' + data.error);
      }
    } catch (e: any) {
      setMessage('Network error: ' + e.message);
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              OpenClaw Agent Setup
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Manage your personal AI agent identity behind the scenes.</p>
          </div>
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-mono whitespace-pre-wrap">
            {status}
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">🤖</span> SOUL.md - Agent Identity
            </label>
            <p className="text-xs text-zinc-500">Who your agent is, how it behaves, its tone, rules, and core directives.</p>
            <textarea
              className="w-full h-64 p-4 bg-zinc-900 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
              value={soul}
              onChange={(e) => setSoul(e.target.value)}
              placeholder="# Identity\n\nYou are a helpful assistant..."
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">👤</span> USER.md - Your Profile
            </label>
            <p className="text-xs text-zinc-500">What the agent knows about you, your preferences, and your goals.</p>
            <textarea
              className="w-full h-48 p-4 bg-zinc-900 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
              value={userDesc}
              onChange={(e) => setUserDesc(e.target.value)}
              placeholder="# User Profile\n\nName: Abhishek\nGoals: ..."
            />
          </div>
        </section>

        <footer className="flex items-center gap-4 border-t border-zinc-800 pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {saving ? 'Saving to workspace...' : 'Save Agent Identity'}
          </button>
          {message && <span className="text-sm font-medium text-emerald-400">{message}</span>}
        </footer>
      </div>
    </main>
  );
}
