import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Rocket, Wallet, Activity, Shield } from 'lucide-react';

const API_BASE = "http://localhost:8000/api/v1";

function App() {
  const [status, setStatus] = useState<any>(null);
  const [mint, setMint] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await axios.get(`${API_BASE}/status`);
      setStatus(res.data);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSnipe = async () => {
    if (!mint) return alert("Vul een token mint adres in");
    await axios.post(`${API_BASE}/snipe/${mint}`);
    alert("Snipe opdracht verzonden voor " + mint);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-8 font-sans">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Rocket size={24}/></div>
          <h1 className="text-2xl font-bold tracking-tighter">NEXUS<span className="text-blue-500">SNIPER</span></h1>
        </div>
        <WalletMultiButton />
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Stats */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 mb-2"><Wallet size={16}/> Balance</div>
          <div className="text-3xl font-mono font-bold">
            {status?.balance_sol.toFixed(4)} <span className="text-sm text-blue-500">SOL</span>
          </div>
          <div className="mt-4 text-[10px] text-gray-500 break-all bg-black/30 p-2 rounded">
            Bot Wallet: {status?.wallet}
          </div>
        </div>

        {/* Challenge Monitor */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-white/5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Activity size={18} className="text-green-500"/> 0.01 SOL Challenge</h3>
            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Live</span>
          </div>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
              placeholder="Token Mint Address (e.g. Pump.fun token)"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
            />
            <button 
              onClick={handleSnipe}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all"
            >
              SNIPE
            </button>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="md:col-span-3 bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4">
          <Shield className="text-blue-500" />
          <p className="text-sm text-blue-200">
            Nexus Sniper gebruikt een <b>Hot Wallet</b> voor automatische executie. Zorg dat er nooit meer dan 0.05 SOL op de bot wallet staat.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
