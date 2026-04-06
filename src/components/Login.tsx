import React, { useState } from 'react';
import { useIdStore } from '../store/useIdStore';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { setAuthenticated, accessKey } = useIdStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === accessKey) {
      setAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-red/10 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 md:p-8 bg-zinc-950 border border-white/5 rounded-3xl md:rounded-[2.5rem] shadow-2xl backdrop-blur-xl relative z-10 mx-4"
      >
        <div className="flex flex-col items-center text-center gap-6">
          <div className="p-5 bg-brand-red/10 rounded-3xl border border-brand-red/20">
            <Lock className="text-brand-red" size={32} />
          </div>
          
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">
              ANKUR'S ID <span className="text-brand-red">UTILITY</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest">Secure Access Required</p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-4 mt-4">
            <div className="relative group">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Access Key..."
                className={`w-full bg-white/5 border ${error ? 'border-brand-red' : 'border-white/10'} rounded-2xl px-6 py-4 outline-none focus:border-brand-red transition-all text-center tracking-[0.5em] font-black placeholder:tracking-normal placeholder:font-medium placeholder:text-zinc-700`}
              />
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-brand-red text-[10px] font-bold uppercase tracking-widest mt-2"
                >
                  Invalid Access Key
                </motion.p>
              )}
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-red hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.2)] group"
            >
              UNLOCK UTILITY
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex items-center gap-2 text-zinc-700 text-[10px] font-bold uppercase tracking-widest mt-4">
            <ShieldCheck size={12} />
            End-to-End Encrypted Session
          </div>
        </div>
      </motion.div>

      {/* Decorative Brand Elements */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-20">
        <div className="h-px w-12 bg-white/20" />
        <div className="w-2 h-2 bg-brand-yellow rounded-full" />
        <div className="h-px w-12 bg-white/20" />
      </div>
    </div>
  );
};
