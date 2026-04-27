import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Database, RefreshCcw, Activity, Server } from 'lucide-react';

function App() {
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [fileSize, setFileSize] = useState(133);
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date().toLocaleTimeString());

  // --- GOD MODE: LIVE CLOUD POLLING HEARTBEAT ---
  useEffect(() => {
    const checkCloudStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/status');
        const data = await response.json();
        
        // We only update the status automatically if we aren't in the middle of a recovery click
        if (!isRecovering) {
          setSystemStatus(data.status);
          setFileSize(data.size || 0);
          setLastChecked(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("Heartbeat failed to reach Python API:", err);
      }
    };

    // Poll every 2.5 seconds to avoid rate limiting but keep it feeling "live"
    const interval = setInterval(checkCloudStatus, 2500);
    return () => clearInterval(interval);
  }, [isRecovering]);

  // --- TRIGGER ATTACK ---
  const simulateAttack = async () => {
    // Optimistic UI update: flip to red immediately to show reaction
    setSystemStatus('compromised');
    try {
      await fetch('http://localhost:5001/attack', { method: 'POST' });
    } catch (error) {
      console.error("Attack trigger failed", error);
    }
  };
  
  // --- TRIGGER RECOVERY ---
  const initiateRecovery = async () => {
    setIsRecovering(true);
    try {
      // This tells Python to run the recovery script
      await fetch('http://localhost:5001/recover', { method: 'POST' });
      
      // We DON'T manually set status to healthy here.
      // The Heartbeat (useEffect) will see the file change to 133 bytes 
      // in the cloud and flip the UI for us once the cloud is actually ready.
      
    } catch (error) {
      console.error("Recovery trigger failed", error);
      setIsRecovering(false);
    } finally {
      // We keep the loading state slightly longer for visual effect
      setTimeout(() => setIsRecovering(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white font-sans">
      
      {/* Background Animated Atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl animate-pulse delay-1000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-4xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-10 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-xs font-mono text-emerald-500 uppercase tracking-tighter">Live Connection: Established</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              CRYPTO VAULT <span className="font-light text-slate-500">v3.0</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest">Disaster Recovery Command Console</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-500 uppercase">Last Cloud Sync</p>
            <p className="text-sm font-mono text-blue-400">{lastChecked}</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* Asset Info Card */}
          <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Database className="text-blue-400 w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Cloud Asset Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">GCS Bucket</p>
                  <p className="font-mono text-sm text-slate-300">secure-dr-vault-shaurya-2026</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Target Path</p>
                  <p className="font-mono text-sm text-blue-400">/financial_ledger.csv</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Live Object Size</p>
                    <p className={`text-2xl font-black font-mono transition-colors duration-500 ${fileSize === 133 ? "text-emerald-400" : "text-red-500"}`}>
                        {fileSize} <span className="text-xs font-normal text-slate-500">BYTES</span>
                    </p>
                </div>
                <Server className={`w-5 h-5 ${systemStatus === 'healthy' ? "text-emerald-500/30" : "text-red-500/30"}`} />
            </div>
          </div>

          {/* System Integrity Status */}
          <motion.div 
            animate={{ 
              backgroundColor: systemStatus === 'healthy' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.08)',
              borderColor: systemStatus === 'healthy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.4)'
            }}
            className="rounded-2xl p-8 border flex flex-col justify-center items-center text-center transition-colors duration-700 relative overflow-hidden"
          >
             {/* Scanline Effect for Compromised State */}
             {systemStatus !== 'healthy' && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-20 w-full animate-scan"></div>
             )}

            {systemStatus === 'healthy' ? (
              <div className="relative z-10">
                <div className="bg-emerald-500/20 p-4 rounded-full mb-4 inline-block">
                    <ShieldCheck className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-emerald-400 tracking-tighter">INTEGRITY SECURE</h3>
                <p className="text-emerald-500/60 text-xs mt-2 font-mono">GCS VERSIONING: ACTIVE</p>
              </div>
            ) : (
              <div className="relative z-10">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="bg-red-500/20 p-4 rounded-full mb-4 inline-block"
                >
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </motion.div>
                <h3 className="text-2xl font-black text-red-500 tracking-tighter uppercase italic">Threat Detected</h3>
                <p className="text-red-400/60 text-xs mt-2 font-mono uppercase tracking-widest">Unauthorized Entry Point: Localhost</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={simulateAttack}
            disabled={systemStatus === 'compromised' || isRecovering}
            className="group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            SIMULATE EXPLOIT
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={initiateRecovery}
            disabled={systemStatus === 'healthy' || isRecovering}
            className={`relative overflow-hidden px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${
              systemStatus === 'healthy' 
                ? 'bg-slate-800/50 text-slate-600 border border-white/5 cursor-not-allowed' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]'
            }`}
          >
            <RefreshCcw className={`w-5 h-5 ${isRecovering ? 'animate-spin' : ''}`} />
            <span className="tracking-widest uppercase">
                {isRecovering ? 'Restoring Cloud State...' : 'Initiate Recovery'}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-center opacity-30">
        <p className="text-[10px] uppercase tracking-[0.5em] font-light">
          Hybrid Infrastructure Security System // 2026 Academic Demo
        </p>
      </div>
    </div>
  );
}

export default App;