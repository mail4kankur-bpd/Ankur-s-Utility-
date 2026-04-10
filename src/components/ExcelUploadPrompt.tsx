import React from 'react';
import { useIdStore } from '../store/useIdStore';
import { FileSpreadsheet, Upload, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';

export const ExcelUploadPrompt = () => {
  const { setExcelFile, setExcelHeaders, setExcelData, setTemplate } = useIdStore();

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

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-yellow/5 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-6 md:p-10 bg-zinc-950 border border-white/5 rounded-3xl md:rounded-[3rem] shadow-2xl relative z-10 mx-4"
      >
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/20">
              <FileSpreadsheet className="text-brand-yellow" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Step 2: Excel Data</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Upload your data source to populate the ID cards</p>
            </div>
          </div>

          <label className="block w-full aspect-video border-2 border-dashed border-white/10 rounded-[2rem] hover:border-brand-yellow/50 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden">
            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Upload size={32} className="text-zinc-700 group-hover:text-brand-yellow transition-colors" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Excel/CSV File</span>
            </div>
          </label>

          <div className="flex flex-col gap-4">
            <p className="text-[9px] text-zinc-600 text-center font-bold uppercase tracking-widest">
              The headers in your file will become draggable fields on the designer.
            </p>
            
            <button 
              onClick={() => setTemplate(null as any)}
              className="w-full text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={12} /> Change Template
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
