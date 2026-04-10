import React from 'react';
import { Image, Type, FileSpreadsheet, Trash2, Plus, Upload, Settings, RotateCcw, GripVertical, QrCode } from 'lucide-react';
import { useIdStore } from '../store/useIdStore';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export const Sidebar = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const { addField, setExcelFile, excelFile, templateImage, setTemplate, excelHeaders, setExcelHeaders, setExcelData } = useIdStore();

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        setExcelHeaders(headers || []);
        setExcelData(jsonData || []);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onDragStart = (e: React.DragEvent, header: string) => {
    e.dataTransfer.setData('headerName', header);
  };

  return (
    <div className="h-full w-full bg-zinc-950 border-r border-white/5 flex flex-col py-8 backdrop-blur-md z-10 overflow-hidden">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="p-2 bg-brand-red/10 rounded-xl border border-brand-red/20">
          <div className="w-6 h-6 bg-brand-red rounded-lg flex items-center justify-center font-black text-white italic text-sm">A</div>
        </div>
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Utility</h2>
      </div>

      <div className="px-6 space-y-6 flex-1 overflow-y-auto">
        <section className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Tools</label>
          <div className="grid grid-cols-3 gap-2">
            <ToolButton icon={<Type size={18} />} label="Text" onClick={() => addField('text')} />
            <ToolButton icon={<Image size={18} />} label="Image" onClick={() => addField('image')} />
            <ToolButton icon={<QrCode size={18} />} label="QR" onClick={() => addField('qr')} />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Excel Fields</label>
            <label className="cursor-pointer text-brand-red hover:text-red-400 transition-colors">
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} />
              <Plus size={14} />
            </label>
          </div>
          
          {excelHeaders.length > 0 ? (
            <div className="space-y-2">
              {excelHeaders.map((header) => (
                <div 
                  key={header}
                  draggable
                  onDragStart={(e) => onDragStart(e, header)}
                  onClick={() => {
                    const isImage = header.toLowerCase().includes('photo') || 
                                    header.toLowerCase().includes('image') || 
                                    header.toLowerCase().includes('pic');
                    addField(isImage ? 'image' : 'text', header);
                  }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-400 hover:border-brand-red/50 hover:text-white transition-all cursor-grab active:cursor-grabbing group"
                >
                  <GripVertical size={14} className="text-zinc-600 group-hover:text-brand-red transition-colors" />
                  <span className="truncate flex-1 font-medium">{header}</span>
                  <Plus size={12} className="text-zinc-700 group-hover:text-brand-red opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-6 text-center space-y-2">
              <FileSpreadsheet size={24} className="mx-auto text-zinc-700" />
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Upload Excel to see fields</p>
            </div>
          )}
        </section>
      </div>

      <div className="px-6 mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
        <button 
          onClick={() => setTemplate(null as any)}
          className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw size={14} /> Reset Template
        </button>
        
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white/10 hover:text-white transition-all"
        >
          <Settings size={14} /> Settings
        </button>
      </div>
    </div>
  );
};

const ToolButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 aspect-square bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
  >
    {icon}
    <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);
