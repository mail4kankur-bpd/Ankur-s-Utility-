import React, { useState } from 'react';
import { useIdStore } from '../store/useIdStore';
import { Lock, ShieldCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PasswordChangeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordChange = ({ isOpen, onClose }: PasswordChangeProps) => {
  const { accessKey, setAccessKey } = useIdStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (oldPassword !== accessKey) {
      setError('Current password is incorrect');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setAccessKey(newPassword);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-red/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-red/10 rounded-lg border border-brand-red/20">
                  <Lock className="text-brand-red" size={20} />
                </div>
                <h2 className="text-lg font-black tracking-tight uppercase">Change Access Key</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-12 text-center gap-4"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 border border-green-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Password Updated</h3>
                  <p className="text-zinc-500 text-sm mt-1">Your new access key is now active.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Current Access Key</label>
                  <input 
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-red transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">New Access Key</label>
                  <input 
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-red transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Confirm New Access Key</label>
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-red transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-brand-red text-[10px] font-bold uppercase tracking-widest bg-brand-red/5 p-3 rounded-lg border border-brand-red/10"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-brand-red hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] mt-4"
                >
                  UPDATE ACCESS KEY
                </button>
              </form>
            )}

            <div className="flex items-center justify-center gap-2 text-zinc-700 text-[9px] font-bold uppercase tracking-widest mt-8">
              <ShieldCheck size={10} />
              Secure Key Management
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
