import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Database, RefreshCcw, Activity, Server } from 'lucide-react';

// --- INTERACTIVE NEURAL NETWORK BACKGROUND ---
const NetworkBackground = ({ status }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Resize handler
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Mouse tracking
    let mouse = { x: null, y: null, radius: 150 };
    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Node Physics & Colors based on State
    const isHealthy = status === 'healthy';
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const baseColor = isHealthy ? '16, 185, 129' : '239, 68, 68';
    const speedMultiplier = isHealthy ? 0.5 : 2.5; // Faster when compromised

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

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse Interaction
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
        
        // Draw lines between close particles
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
  }, [status]); // Re-run effect when status changes to update colors/speed

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

  // 1. CRYPTOGRAPHIC SCRAMBLE EFFECT
  useEffect(() => {
    let interval;
    if (isRecovering) {
      interval = setInterval(() => {
        const chars = '0123456789ABCDEF';
        let result = '0x';
        for (let i = 0; i < 4; i++) result += chars[Math.floor(Math.random() * chars.length)];
        setScrambleText(result);
      }, 50);
    } else {
      setScrambleText('');
    }
    return () => clearInterval(interval);
  }, [isRecovering]);

  // 2. THE "ABSOLUTE TRUTH" HEARTBEAT
  useEffect(() => {
    const checkCloudStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/status');
        const data = await response.json();
        
        // Update states directly from GCP Truth
        setSystemStatus(data.status);
        setFileSize(data.size || 0);
        setLastChecked(new Date().toLocaleTimeString());

        // Smart cleanup: If cloud is healthy, turn off recovery spinner
        if (data.status === 'healthy' && isRecovering) {
          setIsRecovering(false);
        }
        
        // Smart cleanup: If cloud is compromised, turn off attack spinner
        if (data.status === 'compromised' && isAttacking) {
          setIsAttacking(false);
        }

      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    const interval = setInterval(checkCloudStatus, 2000);
    return () => clearInterval(interval);
  }, [isRecovering, isAttacking]);

  // 3. TRIGGERS (No more fake UI updates!)
  const simulateAttack = async () => {
    setIsAttacking(true); // Just show loading state
    try {
      await fetch('http://localhost:5001/attack', { method: 'POST' });
    } catch (error) {
      console.error("Attack trigger failed", error);
      setIsAttacking(false);
    }
  };
  
  const initiateRecovery = async () => {
    setIsRecovering(true); // Start the hex scramble
    try {
      await fetch('http://localhost:5001/recover', { method: 'POST' });
    } catch (error) {
      console.error("Recovery failed", error);
      setIsRecovering(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-1000 relative overflow-hidden ${
      systemStatus === 'healthy' ? 'bg-slate-950' : 'bg-red-950'
    } text-white font-sans`}>
      
      {/* --- THE NEW INTERACTIVE BACKGROUND --- */}
      <NetworkBackground status={systemStatus} />
      
      {/* Subtle overlay to ensure text readability over the canvas */}
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none"></div>

      {/* --- THE DASHBOARD --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          systemStatus === 'compromised' && !isRecovering 
            ? { x: [-15, 15, -10, 10, -5, 5, 0], opacity: 1, scale: 1 } 
            : { x: 0, opacity: 1, scale: 1 }
        }
        transition={systemStatus === 'compromised' && !isRecovering ? { duration: 0.4 } : { duration: 0.5 }}
        className={`relative z-10 w-full max-w-4xl bg-slate-900/70 backdrop-blur-2xl border transition-colors duration-700 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
          systemStatus === 'healthy' ? 'border-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.1)]' : 'border-red-500/40 shadow-[0_0_100px_rgba(239,68,68,0.3)]'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-10 border-b border-white/10 pb-6 relative">
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* Asset Info Card */}
          <div className="bg-black/60 rounded-2xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
            
            {/* Laser scan effect while recovering */}
            {isRecovering && (
              <motion.div 
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
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

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end relative z-10">
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
                  <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }} 
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="bg-red-500/20 p-4 rounded-full mb-4 inline-block border border-red-500/30"
                  >
                      <ShieldAlert className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-red-500 tracking-tighter uppercase italic drop-shadow-md">Threat Detected</h3>
                  <p className="text-red-400/80 text-xs mt-2 font-mono uppercase tracking-widest">Unauthorized Entry Point</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls */}
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