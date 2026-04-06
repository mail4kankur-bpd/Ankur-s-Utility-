import React, { useState } from 'react';
import { useIdStore } from '../store/useIdStore';
import { Maximize2, Upload, ArrowRight, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CanvasSetup = () => {
  const { setCanvasSizeCm, setTemplate, canvasSizeCm, dpi: storeDpi } = useIdStore();
  const [step, setStep] = useState<'size' | 'template'>('size');
  const [width, setWidth] = useState(canvasSizeCm.width);
  const [height, setHeight] = useState(canvasSizeCm.height);
  const [dpi, setDpi] = useState(storeDpi);

  const handleSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCanvasSizeCm(width, height, dpi);
    setStep('template');
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplate(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-red/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-6 md:p-10 bg-zinc-950 border border-white/5 rounded-3xl md:rounded-[3rem] shadow-2xl relative z-10 mx-4"
      >
        <AnimatePresence mode="wait">
          {step === 'size' ? (
            <motion.div 
              key="size"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/20">
                  <Ruler className="text-brand-yellow" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Canvas Dimensions</h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Define size in Centimeters (cm)</p>
                </div>
              </div>

              <form onSubmit={handleSizeSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Width (cm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-yellow transition-all text-xl font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Height (cm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-yellow transition-all text-xl font-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Resolution (DPI)</label>
                  <input 
                    type="number" 
                    value={dpi}
                    onChange={(e) => setDpi(parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-yellow transition-all text-xl font-black"
                  />
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Standard: 300 DPI for high quality printing</p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-yellow text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(250,204,21,0.2)] group"
                >
                  NEXT: UPLOAD TEMPLATE
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-brand-red/10 rounded-2xl border border-brand-red/20">
                  <Upload className="text-brand-red" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Upload Template</h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Image will be scaled to {width}x{height} cm</p>
                </div>
              </div>

              <label className="block w-full aspect-video border-2 border-dashed border-white/10 rounded-[2rem] hover:border-brand-red/50 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden">
                <input type="file" className="hidden" accept="image/*" onChange={handleTemplateUpload} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Upload size={32} className="text-zinc-700 group-hover:text-brand-red transition-colors" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Template Image</span>
                </div>
              </label>

              <button 
                onClick={() => setStep('size')}
                className="w-full text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Go Back to Resize
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
