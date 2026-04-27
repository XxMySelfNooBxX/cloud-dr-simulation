import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Database, RefreshCcw, Activity } from 'lucide-react';

function App() {
  const [systemStatus, setSystemStatus] = useState('healthy'); 
  const [isRecovering, setIsRecovering] = useState(false);

  const simulateAttack = async () => {
    setSystemStatus('compromised');
    try {
      await fetch('http://localhost:5001/attack', { method: 'POST' });
    } catch (error) {
      console.error("Failed to connect to API", error);
    }
  };
  
  const initiateRecovery = async () => {
    setIsRecovering(true);
    try {
      await fetch('http://localhost:5001/recover', { method: 'POST' });
      setSystemStatus('healthy');
    } catch (error) {
      console.error("Failed to connect to API", error);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      
      {/* Background Animated Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>

      {/* Main Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Hybrid Cloud Crypto Vault
            </h1>
            <p className="text-slate-400 mt-2">Disaster Recovery & Incident Response Console</p>
          </div>
          <Activity className="text-blue-400 animate-pulse w-8 h-8" />
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Target File Status */}
          <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <Database className="text-slate-400" />
              <h3 className="text-lg font-medium text-slate-300">Target Asset</h3>
            </div>
            <p className="font-mono text-sm text-slate-400">secure-dr-vault-shaurya-2026</p>
            <p className="font-mono text-blue-400 mt-1">/financial_ledger.csv</p>
          </div>

          {/* System Health Status */}
          <motion.div 
            animate={{ 
              backgroundColor: systemStatus === 'healthy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: systemStatus === 'healthy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.5)'
            }}
            className="rounded-2xl p-6 border flex flex-col justify-center items-center text-center transition-colors duration-500"
          >
            {systemStatus === 'healthy' ? (
              <>
                <ShieldCheck className="w-12 h-12 text-emerald-400 mb-2" />
                <h3 className="text-xl font-bold text-emerald-400">SYSTEM SECURE</h3>
                <p className="text-emerald-500/70 text-sm mt-1">GCS Versioning Active</p>
              </>
            ) : (
              <>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <ShieldAlert className="w-12 h-12 text-red-500 mb-2" />
                </motion.div>
                <h3 className="text-xl font-bold text-red-500">RANSOMWARE DETECTED</h3>
                <p className="text-red-400/70 text-sm mt-1">Unauthorized modifications detected.</p>
              </>
            )}
          </motion.div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 justify-center">
          {/* Attack Button (For Demo Purposes) */}
          <button 
            onClick={simulateAttack}
            disabled={systemStatus === 'compromised' || isRecovering}
            className="px-6 py-3 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all disabled:opacity-50"
          >
            Simulate Attack
          </button>

          {/* The Hero Recovery Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initiateRecovery}
            disabled={systemStatus === 'healthy' || isRecovering}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${
              systemStatus === 'healthy' 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
            }`}
          >
            <RefreshCcw className={`w-5 h-5 ${isRecovering ? 'animate-spin' : ''}`} />
            {isRecovering ? 'EXECUTING ROLLBACK...' : 'INITIATE INCIDENT RESPONSE'}
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}

export default App;