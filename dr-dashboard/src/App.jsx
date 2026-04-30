import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Database, RefreshCcw, Activity, Server, Terminal, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- INTERACTIVE NEURAL NETWORK BACKGROUND ---
const NetworkBackground = ({ status }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let mouse = { x: null, y: null, radius: 150 };
    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const isHealthy = status === 'healthy';
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const baseColor = isHealthy ? '16, 185, 129' : '239, 68, 68';
    const speedMultiplier = isHealthy ? 0.5 : 2.5;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.vx = (Math.random() - 0.5) * speedMultiplier;
        this.vy = (Math.random() - 0.5) * speedMultiplier;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            this.x -= dx / this.density;
            this.y -= dy / this.density;
          }
        }
      }
      draw() {
        ctx.fillStyle = `rgba(${baseColor}, 0.8)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${baseColor}, ${1 - distance / 120})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [status]); 

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

// --- MAIN APP COMPONENT ---
function App() {
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [fileSize, setFileSize] = useState(133);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date().toLocaleTimeString());
  const [scrambleText, setScrambleText] = useState('');
  const [lifecycleActive, setLifecycleActive] = useState(false);
  
  // Forensic Logs & Chart Data
  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), text: 'System initialized. Monitoring GCS Bucket...', type: 'info' }]);
  const [chartData, setChartData] = useState(Array(15).fill({ time: '', size: 133 }));
  
  // The state for UI rendering, and the Ref for network callback logic
  const [rtoTimer, setRtoTimer] = useState(0); 
  const rtoTimerRef = useRef(0);
  
  const [incidentCost, setIncidentCost] = useState(0);

  const addLog = (text, type = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), text, type }, ...prev].slice(0, 50));
  };

  // 1. SCRAMBLE & RTO TIMER
  useEffect(() => {
    let interval;
    if (isRecovering) {
      interval = setInterval(() => {
        const chars = '0123456789ABCDEF';
        let result = '0x';
        for (let i = 0; i < 4; i++) result += chars[Math.floor(Math.random() * chars.length)];
        setScrambleText(result);
        
        // Sync the visual state and the ref simultaneously
        setRtoTimer(prev => {
          const newTime = prev + 50;
          rtoTimerRef.current = newTime;
          return newTime;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRecovering]);

  // 2. LIVE CLOUD POLLING & GHOST READ FIX
  useEffect(() => {
    const checkCloudStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/status');
        const data = await response.json();
        const now = new Date().toLocaleTimeString();
        
        if (!isAttacking) {
          let currentCloudStatus = data.status;
          let currentCloudSize = data.size || 0;

          // THE GHOST READ FIX
          if (systemStatus === 'compromised' && currentCloudStatus === 'healthy' && !isRecovering) {
            currentCloudStatus = 'compromised';
            currentCloudSize = 0;
          }

          // Update Chart Data
          setChartData(prev => [...prev.slice(1), { time: now.split(' ')[0], size: currentCloudSize }]);

          if (isRecovering && data.size === 133) {
            setSystemStatus('healthy');
            setFileSize(data.size);
            setIsRecovering(false);
            
            // Use the Ref here to pull the exact time without resetting the heartbeat
            addLog(`✅ CLEAN BACKUP FOUND. System restored in ${(rtoTimerRef.current / 1000).toFixed(2)}s.`, 'success');
          } else if (!isRecovering) {
            if (systemStatus === 'healthy' && currentCloudStatus === 'compromised') {
              addLog(`🚨 ANOMALY DETECTED: File size changed to ${currentCloudSize}B`, 'error');
            }
            setSystemStatus(currentCloudStatus);
            setFileSize(currentCloudSize);
          }
          setLastChecked(now);
        }
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    const interval = setInterval(checkCloudStatus, 2000);
    return () => clearInterval(interval);
  // Removed rtoTimer from this array to prevent the heartbeat from restarting every 50ms
  }, [isRecovering, isAttacking, systemStatus]);

  // 3. FINANCIAL IMPACT COUNTER
  useEffect(() => {
    let costInterval;
    if (systemStatus === 'compromised' && !isRecovering) {
      costInterval = setInterval(() => setIncidentCost(prev => prev + 142), 1000); 
    }
    return () => clearInterval(costInterval);
  }, [systemStatus, isRecovering]);

  // 4. TRIGGERS & ACTIONS
  const simulateAttack = async () => {
    setIsAttacking(true);
    setSystemStatus('compromised');
    addLog('⚠️ INTRUSION DETECTED: Payload execution initiated via Localhost.', 'error');
    try {
      await fetch('http://localhost:5001/attack', { method: 'POST' });
    } finally {
      setTimeout(() => setIsAttacking(false), 4000);
    }
  };
  
  const initiateRecovery = async () => {
    setIsRecovering(true);
    setRtoTimer(0);
    rtoTimerRef.current = 0; // Reset the ref too
    addLog('🔄 INITIATING RECOVERY: Scanning noncurrent GCS versions...', 'warning');
    try {
      await fetch('http://localhost:5001/recover', { method: 'POST' });
    } catch (error) {
      addLog('❌ RECOVERY FAILED: API unreachable.', 'error');
      setIsRecovering(false);
    }
  };

  const activateLifecycle = async () => {
    try {
      setLifecycleActive(true);
      await fetch('http://localhost:5001/lifecycle', { method: 'POST' });
      addLog('⚙️ STORAGE OPTIMIZATION: 30-Minute Aggressive Purge Executed.', 'info');
      
      // Auto-unlock after 5 seconds
      setTimeout(() => {
        setLifecycleActive(false);
      }, 5000);
    } catch (error) {
      addLog('❌ CONFIGURATION FAILED: Cannot reach Cloud API.', 'error');
      console.error("Lifecycle update failed", error);
      setLifecycleActive(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-1000 relative overflow-hidden ${
      systemStatus === 'healthy' ? 'bg-slate-950' : 'bg-red-950'
    } text-white font-sans`}>
      
      {/* INTERACTIVE BACKGROUND */}
      <NetworkBackground status={systemStatus} />
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none"></div>

      {/* MAIN DASHBOARD */}
      <motion.div 
        animate={isAttacking ? { x: [-10, 10, -10, 10, -5, 5, 0], filter: ['hue-rotate(90deg)', 'hue-rotate(0deg)'] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative z-10 w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border transition-colors duration-700 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-6 ${
          systemStatus === 'healthy' ? 'border-emerald-500/20' : 'border-red-500/40 shadow-[0_0_100px_rgba(239,68,68,0.3)]'
        }`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-white/10 pb-6 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full animate-ping ${systemStatus === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs font-mono uppercase tracking-tighter ${systemStatus === 'healthy' ? 'text-emerald-500' : 'text-red-500'}`}>
                {systemStatus === 'healthy' ? 'Live Connection: Established' : 'CRITICAL ALERT: NETWORK COMPROMISED'}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
              CRYPTO VAULT <span className="font-light text-slate-500">v3.0</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-widest">Disaster Recovery Command Console</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-500 uppercase">Last Cloud Sync</p>
            <p className="text-sm font-mono text-blue-400">{lastChecked}</p>
          </div>
        </div>

        {/* TOP ROW: CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Asset Info Card */}
          <div className="bg-black/60 rounded-2xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
            {isRecovering && (
              <motion.div 
                initial={{ top: "-10%" }} animate={{ top: "110%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] z-50 opacity-70"
              />
            )}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-800 rounded-lg border border-white/5">
                  <Database className="text-blue-400 w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Cloud Asset Info</h3>
              </div>
              <div className="space-y-3 relative z-10">
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

            {/* LIFECYCLE MANAGEMENT BUTTON */}
            <div className="pt-4 mt-4 border-t border-white/5 relative z-10">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Data Retention Policy</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Aggressive 30-Min Purge</span>
                <button 
                  onClick={activateLifecycle}
                  disabled={lifecycleActive || isAttacking || isRecovering}
                  className={`text-[10px] px-3 py-1 rounded border font-mono tracking-widest transition-all ${
                    lifecycleActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-not-allowed'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {lifecycleActive ? '30-MIN PURGE COMPLETE' : 'EXECUTE 30-MIN PURGE'}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end relative z-10">
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Live Object Size</p>
                    <p className={`text-3xl font-black font-mono transition-colors duration-300 ${
                      isRecovering ? "text-blue-400" : systemStatus === 'healthy' ? "text-emerald-400" : "text-red-500"
                    }`}>
                        {isRecovering ? scrambleText : fileSize} <span className="text-xs font-normal text-slate-500 tracking-widest">BYTES</span>
                    </p>
                </div>
                <Server className={`w-6 h-6 transition-all duration-500 ${systemStatus === 'healthy' ? "text-emerald-500/30" : "text-red-500/50"}`} />
            </div>
          </div>

          {/* System Integrity Status */}
          <div className={`rounded-2xl p-8 border flex flex-col justify-center items-center text-center transition-all duration-700 relative overflow-hidden ${
            systemStatus === 'healthy' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/10 border-red-500/40 shadow-[inset_0_0_50px_rgba(239,68,68,0.1)]'
          }`}>
             {systemStatus !== 'healthy' && !isRecovering && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent h-20 w-full animate-scan"></div>
             )}
            <AnimatePresence mode="wait">
              {systemStatus === 'healthy' ? (
                <motion.div key="healthy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10">
                  <div className="bg-emerald-500/10 p-4 rounded-full mb-4 inline-block border border-emerald-500/20">
                      <ShieldCheck className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400 tracking-tighter drop-shadow-sm">INTEGRITY SECURE</h3>
                  <p className="text-emerald-500/60 text-xs mt-2 font-mono">GCS VERSIONING: ACTIVE</p>
                </motion.div>
              ) : (
                <motion.div key="compromised" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10">
                  <motion.div animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="bg-red-500/20 p-4 rounded-full mb-4 inline-block border border-red-500/30">
                      <ShieldAlert className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-red-500 tracking-tighter uppercase italic drop-shadow-md">Threat Detected</h3>
                  <p className="text-red-400/80 text-xs mt-2 font-mono uppercase tracking-widest">Unauthorized Entry Point</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MIDDLE ROW: TELEMETRY & LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Time-Series Graph */}
          <div className="lg:col-span-2 bg-black/40 rounded-2xl p-6 border border-white/5 relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="text-blue-400 w-4 h-4" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Volume Telemetry</h3>
              </div>
              {systemStatus === 'compromised' && (
                <div className="text-right">
                  <p className="text-[10px] text-red-500 uppercase font-bold animate-pulse">Financial Impact</p>
                  <p className="font-mono text-red-400 font-bold">${incidentCost.toLocaleString()}</p>
                </div>
              )}
              {systemStatus === 'healthy' && rtoTimer > 0 && (
                <div className="text-right">
                  <p className="text-[10px] text-emerald-500 uppercase font-bold">Last RTO</p>
                  <p className="font-mono text-emerald-400 font-bold">{(rtoTimer / 1000).toFixed(2)}s</p>
                </div>
              )}
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 200]} hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  <Line 
                    type="stepAfter" 
                    dataKey="size" 
                    stroke={systemStatus === 'healthy' ? "#10b981" : "#ef4444"} 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forensic Terminal */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-white/10 flex flex-col font-mono text-[10px] relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 uppercase tracking-widest">Forensic Audit Log</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 max-h-40 flex flex-col-reverse">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className={`
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                    ${log.type === 'warning' ? 'text-yellow-400' : ''}
                    ${log.type === 'info' ? 'text-blue-300' : ''}
                  `}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={simulateAttack}
            disabled={systemStatus === 'compromised' || isRecovering || isAttacking}
            className={`group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden relative ${
              isAttacking 
              ? 'bg-red-900/50 text-red-400 border-red-500/30'
              : 'bg-white/5 border-white/10 hover:bg-red-500/20 hover:border-red-500/50 text-slate-300 hover:text-white'
            }`}
          >
            <Activity className={`w-5 h-5 transition-transform ${isAttacking ? 'animate-pulse text-red-500' : 'group-hover:scale-110 group-hover:text-red-400'}`} />
            <span className="relative z-10">
              {isAttacking ? 'DEPLOYING PAYLOAD...' : 'SIMULATE EXPLOIT'}
            </span>
          </button>

          <button
            onClick={initiateRecovery}
            disabled={systemStatus === 'healthy' || isRecovering || isAttacking}
            className={`relative overflow-hidden px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-300 ${
              systemStatus === 'healthy' 
                ? 'bg-slate-800/30 text-slate-600 border border-white/5 cursor-not-allowed' 
                : 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.7)] border border-blue-400/30'
            }`}
          >
            <RefreshCcw className={`w-5 h-5 ${isRecovering ? 'animate-spin' : ''}`} />
            <span className="tracking-widest uppercase relative z-10">
                {isRecovering ? 'Decryption Phase...' : 'Initiate Recovery'}
            </span>
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-center opacity-40 z-10 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-slate-300 drop-shadow-md">
          Hybrid Infrastructure Security System // Academic Demo
        </p>
      </div>
    </div>
  );
}

export default App;