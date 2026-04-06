import { create } from 'zustand';

export interface Field {
  id: string;
  type: 'text' | 'image' | 'qr';
  name: string; // Excel Column Name
  qrFields?: string[]; // For QR type: list of field names to include
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
  align: 'left' | 'center' | 'right';
  shrinkToFit: boolean;
  wrap: 'none' | 'word' | 'char';
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

interface IdState {
  fields: Field[];
  selectedId: string | null;
  templateImage: string | null;
  canvasSize: { width: number; height: number };
  canvasSizeCm: { width: number; height: number };
  dpi: number;
  excelFile: File | null;
  excelHeaders: string[];
  excelData: any[];
  isGenerating: boolean;
  isAuthenticated: boolean;
  accessKey: string;
  setTemplate: (url: string) => void;
  setCanvasSizeCm: (w: number, h: number, dpi?: number) => void;
  setExcelHeaders: (headers: string[]) => void;
  setExcelData: (data: any[]) => void;
  addField: (type: 'text' | 'image' | 'qr', name?: string) => void;
  updateField: (id: string, updates: Partial<Field>) => void;
  removeField: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setExcelFile: (file: File | null) => void;
  setIsGenerating: (val: boolean) => void;
  setAuthenticated: (val: boolean) => void;
  setAccessKey: (val: string) => void;
}

export const useIdStore = create<IdState>((set) => ({
  fields: [],
  selectedId: null,
  templateImage: null,
  canvasSize: { width: 1004, height: 650 },
  canvasSizeCm: { width: 8.5, height: 5.5 }, // Default ID card size
  dpi: 300,
  excelFile: null,
  excelHeaders: [],
  excelData: [],
  isGenerating: false,
  isAuthenticated: false,
  accessKey: '244466666',
  setTemplate: (url) => set({ templateImage: url }),
  setCanvasSizeCm: (w, h, dpi = 300) => set((state) => {
    const currentDpi = dpi || state.dpi;
    const pixelsPerCm = currentDpi / 2.54;
    return { 
      canvasSizeCm: { width: w, height: h },
      dpi: currentDpi,
      canvasSize: { 
        width: Math.round(w * pixelsPerCm), 
        height: Math.round(h * pixelsPerCm) 
      }
    };
  }),
  setExcelHeaders: (headers) => set({ excelHeaders: headers }),
  setExcelData: (data) => set({ excelData: data }),
  addField: (type, name) => set((state) => ({
    fields: [...state.fields, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: name || (type === 'text' ? 'Full Name' : type === 'image' ? 'Photo' : 'QR Code'),
      qrFields: type === 'qr' ? [] : undefined,
      x: 50, y: 50, 
      width: type === 'qr' ? 100 : 200, 
      height: type === 'image' ? 100 : type === 'qr' ? 100 : 30,
      fontSize: 20, fontFamily: 'Inter', fill: '#000000',
      fontWeight: '600', align: 'center', shrinkToFit: true,
      wrap: 'none',
      stroke: 'transparent',
      strokeWidth: 0,
      cornerRadius: 0
    }]
  })),
  updateField: (id, updates) => set((state) => ({
    fields: state.fields.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
  removeField: (id) => set((state) => ({
    fields: state.fields.filter(f => f.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),
  setSelectedId: (id) => set({ selectedId: id }),
  setExcelFile: (file) => set({ excelFile: file }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  setAccessKey: (val) => set({ accessKey: val }),
}));
