import React from 'react';
import { useIdStore } from '../store/useIdStore';
import { Trash2, AlignLeft, AlignCenter, AlignRight, Type as TypeIcon, Palette, Maximize } from 'lucide-react';
import { cn } from '../lib/utils';

export const PropertiesPanel = () => {
  const { fields, selectedId, updateField, removeField } = useIdStore();
  const activeField = fields.find(f => f.id === selectedId);

  if (!activeField) {
    return (
      <div className="h-full w-full bg-zinc-950 border-l border-white/5 p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-700">
          <Maximize size={32} />
        </div>
        <div>
          <h3 className="text-zinc-400 font-bold">No Field Selected</h3>
          <p className="text-zinc-600 text-xs mt-1">Select a field on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-950 border-l border-white/5 p-6 space-y-8 backdrop-blur-md overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Properties</h2>
        <button 
          onClick={() => removeField(activeField.id)}
          className="p-2 text-zinc-500 hover:text-brand-red transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <section className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest text-brand-yellow font-bold">Field Mapping</label>
        <div className="relative">
          <input 
            value={activeField.name}
            onChange={(e) => updateField(activeField.id, { name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-red outline-none transition"
            placeholder="Excel Column Name..."
          />
        </div>
        <p className="text-[9px] text-zinc-600 italic">This must match your Excel column header exactly.</p>
      </section>

      {activeField.type === 'text' && (
        <>
          <section className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
              <TypeIcon size={12} /> Typography
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[9px] block text-zinc-500 uppercase mb-1">Size</span>
                <input 
                  type="number" 
                  value={activeField.fontSize} 
                  onChange={(e) => updateField(activeField.id, { fontSize: parseInt(e.target.value) })}
                  className="bg-transparent w-full outline-none font-bold text-sm" 
                />
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[9px] block text-zinc-500 uppercase mb-1">Color</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={activeField.fill} 
                    onChange={(e) => updateField(activeField.id, { fill: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" 
                  />
                  <span className="text-[10px] font-mono">{activeField.fill.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateField(activeField.id, { align })}
                  className={cn(
                    "flex-1 py-2 rounded-lg flex items-center justify-center transition-all",
                    activeField.align === align ? "bg-brand-red text-white shadow-lg" : "text-zinc-500 hover:bg-white/5"
                  )}
                >
                  {align === 'left' && <AlignLeft size={14} />}
                  {align === 'center' && <AlignCenter size={14} />}
                  {align === 'right' && <AlignRight size={14} />}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateField(activeField.id, { fontWeight: activeField.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={cn(
                  "py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeField.fontWeight === 'bold' ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-zinc-500"
                )}
              >
                Bold
              </button>
              <select 
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 outline-none focus:border-brand-red"
                value={activeField.fontFamily}
                onChange={(e) => updateField(activeField.id, { fontFamily: e.target.value })}
              >
                <option value="Inter">Inter</option>
                <option value="sans-serif">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Text Flow</label>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={activeField.shrinkToFit}
                    onChange={(e) => updateField(activeField.id, { shrinkToFit: e.target.checked, wrap: e.target.checked ? 'none' : activeField.wrap })}
                    className="peer sr-only"
                  />
                  <div className="w-10 h-5 bg-zinc-800 rounded-full border border-white/10 peer-checked:bg-brand-red transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold group-hover:text-zinc-300 transition-colors">Shrink to Fit</span>
              </label>

              <div className="space-y-2">
                <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Wrap Mode</span>
                <div className="flex gap-2">
                  {(['none', 'word', 'char'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateField(activeField.id, { wrap: mode, shrinkToFit: mode !== 'none' ? false : activeField.shrinkToFit })}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all",
                        activeField.wrap === mode ? "bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow" : "bg-white/5 border-white/10 text-zinc-600"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeField.type === 'qr' && (
        <section className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-brand-yellow font-bold">QR Data Source</label>
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-500 mb-2">Select fields to include in QR code:</p>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {useIdStore.getState().excelHeaders.map((header) => (
                <label key={header} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input 
                    type="checkbox"
                    checked={activeField.qrFields?.includes(header)}
                    onChange={(e) => {
                      const currentFields = activeField.qrFields || [];
                      const newFields = e.target.checked 
                        ? [...currentFields, header]
                        : currentFields.filter(f => f !== header);
                      updateField(activeField.id, { qrFields: newFields });
                    }}
                    className="accent-brand-red"
                  />
                  <span className="text-xs text-zinc-300 truncate">{header}</span>
                </label>
              ))}
            </div>
            <div className="p-3 bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl mt-4">
              <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-widest mb-1">Static Text Included:</p>
              <p className="text-[10px] text-zinc-400 italic">"Created with Ankur's ID Card Utility"</p>
            </div>
          </div>
        </section>
      )}

      {activeField.type === 'image' && (
        <section className="space-y-6">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Image Border</label>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[9px] block text-zinc-500 uppercase mb-1">Thickness</span>
                <input 
                  type="number" 
                  min="0"
                  max="20"
                  value={activeField.strokeWidth || 0} 
                  onChange={(e) => updateField(activeField.id, { strokeWidth: parseInt(e.target.value) || 0 })}
                  className="bg-transparent w-full outline-none font-bold text-sm" 
                />
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-[9px] block text-zinc-500 uppercase mb-1">Color</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={activeField.stroke || '#000000'} 
                    onChange={(e) => updateField(activeField.id, { stroke: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" 
                  />
                  <span className="text-[10px] font-mono">{(activeField.stroke || '#000000').toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Corner Style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateField(activeField.id, { cornerRadius: 0 })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                    activeField.cornerRadius === 0 ? "bg-brand-red text-white shadow-lg" : "bg-white/5 border-white/10 text-zinc-500"
                  )}
                >
                  Sharp
                </button>
                <button
                  onClick={() => updateField(activeField.id, { cornerRadius: 10 })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                    activeField.cornerRadius && activeField.cornerRadius > 0 ? "bg-brand-red text-white shadow-lg" : "bg-white/5 border-white/10 text-zinc-500"
                  )}
                >
                  Rounded
                </button>
              </div>
              {activeField.cornerRadius && activeField.cornerRadius > 0 && (
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 mt-2">
                  <span className="text-[9px] block text-zinc-500 uppercase mb-1">Radius</span>
                  <input 
                    type="range" 
                    min="1"
                    max="100"
                    value={activeField.cornerRadius} 
                    onChange={(e) => updateField(activeField.id, { cornerRadius: parseInt(e.target.value) })}
                    className="w-full accent-brand-red" 
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
