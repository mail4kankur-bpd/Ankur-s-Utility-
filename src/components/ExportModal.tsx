import React, { useState, useEffect } from 'react';
import { useIdStore } from '../store/useIdStore';
import { X, Download, Layout, Image as ImageIcon, FileText, Loader2, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { Stage, Layer, Text, Rect, Group, Image as KonvaImage } from 'react-konva';
import { TemplateLayer } from './TemplateLayer';
import useImage from 'use-image';
import QRCode from 'qrcode';
import { Field } from '../store/useIdStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreviewField = ({ data }: { data: Field }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrImage] = useImage(qrUrl);

  useEffect(() => {
    if (data.type === 'qr') {
      QRCode.toDataURL('QR Placeholder', { margin: 1 })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [data.type]);

  if (data.type === 'text') {
    return (
      <Text
        x={data.x}
        y={data.y}
        text={data.name}
        width={data.width}
        height={data.height}
        fontSize={data.fontSize}
        fontFamily={data.fontFamily}
        fill={data.fill}
        fontStyle={data.fontWeight === 'bold' || data.fontWeight === '600' ? 'bold' : 'normal'}
        align={data.align}
        verticalAlign="middle"
        wrap={data.wrap === 'none' ? 'none' : data.wrap}
      />
    );
  }

  if (data.type === 'image') {
    return (
      <Group x={data.x} y={data.y}>
        <Rect
          width={data.width}
          height={data.height}
          fill="#f4f4f5"
          stroke="#e4e4e7"
          strokeWidth={1}
          cornerRadius={data.cornerRadius || 0}
        />
        <Text
          text="PHOTO"
          width={data.width}
          height={data.height}
          fontSize={8}
          align="center"
          verticalAlign="middle"
          fill="#71717a"
        />
      </Group>
    );
  }

  return (
    <Group x={data.x} y={data.y}>
      {qrImage ? (
        <KonvaImage
          image={qrImage}
          width={data.width}
          height={data.height}
        />
      ) : (
        <Rect
          width={data.width}
          height={data.height}
          fill="#f4f4f5"
          stroke="#e4e4e7"
          strokeWidth={1}
        />
      )}
    </Group>
  );
};

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const { fields, templateImage, canvasSize, canvasSizeCm, excelData, isGenerating, setIsGenerating } = useIdStore();
  
  const [exportType, setExportType] = useState<'individual' | 'a4'>('individual');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpg'>('png');
  const [a4Orientation, setA4Orientation] = useState<'portrait' | 'landscape'>('portrait');
  const [columns, setColumns] = useState(2);
  const [rows, setRows] = useState(5);
  const [gapCm, setGapCm] = useState(0.5);
  const [autoLayout, setAutoLayout] = useState(true);
  const [previewPage, setPreviewPage] = useState(0);

  // A4 dimensions in cm
  const A4_W = 21.0;
  const A4_H = 29.7;

  useEffect(() => {
    if (autoLayout) {
      const pageW = a4Orientation === 'portrait' ? A4_W : A4_H;
      const pageH = a4Orientation === 'portrait' ? A4_H : A4_W;
      
      // Calculate how many can fit with gaps
      const cardW = canvasSizeCm.width + gapCm;
      const cardH = canvasSizeCm.height + gapCm;
      
      const cols = Math.floor((pageW - gapCm) / cardW);
      const rws = Math.floor((pageH - gapCm) / cardH);
      
      setColumns(Math.max(1, cols));
      setRows(Math.max(1, rws));
    }
  }, [a4Orientation, gapCm, autoLayout, canvasSizeCm]);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      if (exportType === 'individual') {
        await exportIndividual();
      } else {
        await exportA4();
      }
    } catch (error) {
      console.error(error);
      alert("Export failed. Please check your data.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportIndividual = async () => {
    const zip = new JSZip();
    const folder = zip.folder("id_cards");
    
    // We'll use the backend to generate each image or do it here with a hidden canvas
    // Doing it on the backend is safer for complex layouts
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const fileName = `${String(i + 1).padStart(3, '0')}-${row['Full Name'] || 'ID'}.${imageFormat}`;
      
      const response = await fetch("/api/generate-single", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layout: JSON.stringify({
            width: canvasSize.width,
            height: canvasSize.height,
            templateUrl: templateImage,
            fields: fields,
            singleData: row
          }),
          format: imageFormat
        }),
      });

      if (!response.ok) throw new Error(`Failed to generate card for ${row['Full Name']}`);
      const blob = await response.blob();
      folder?.file(fileName, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "id_cards.zip";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportA4 = async () => {
    const response = await fetch("/api/generate-a4", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        layout: JSON.stringify({
          width: canvasSize.width,
          height: canvasSize.height,
          templateUrl: templateImage,
          fields: fields,
          excelData: excelData
        }),
        a4Config: JSON.stringify({
          orientation: a4Orientation,
          columns,
          rows,
          gapCm
        })
      }),
    });

    if (!response.ok) throw new Error("A4 Generation failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "id_cards_a4.pdf";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Settings Panel */}
        <div className="w-full md:w-80 border-r border-white/5 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight">Export Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Export Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setExportType('individual')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${exportType === 'individual' ? 'bg-brand-red/10 border-brand-red text-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                >
                  <ImageIcon size={20} />
                  <span className="text-[9px] font-bold uppercase">Individual</span>
                </button>
                <button 
                  onClick={() => setExportType('a4')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${exportType === 'a4' ? 'bg-brand-red/10 border-brand-red text-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                >
                  <Layout size={20} />
                  <span className="text-[9px] font-bold uppercase">A4 Grid</span>
                </button>
              </div>
            </section>

            {exportType === 'individual' ? (
              <section className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setImageFormat('png')}
                    className={`py-3 rounded-xl border transition-all text-[10px] font-bold uppercase ${imageFormat === 'png' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}
                  >
                    PNG
                  </button>
                  <button 
                    onClick={() => setImageFormat('jpg')}
                    className={`py-3 rounded-xl border transition-all text-[10px] font-bold uppercase ${imageFormat === 'jpg' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}
                  >
                    JPG
                  </button>
                </div>
              </section>
            ) : (
              <div className="space-y-6">
                <section className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Orientation</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setA4Orientation('portrait')}
                      className={`py-3 rounded-xl border transition-all text-[10px] font-bold uppercase ${a4Orientation === 'portrait' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}
                    >
                      Portrait
                    </button>
                    <button 
                      onClick={() => setA4Orientation('landscape')}
                      className={`py-3 rounded-xl border transition-all text-[10px] font-bold uppercase ${a4Orientation === 'landscape' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-zinc-600'}`}
                    >
                      Landscape
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Grid Layout</label>
                    <button 
                      onClick={() => setAutoLayout(!autoLayout)}
                      className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${autoLayout ? 'bg-brand-yellow text-black' : 'bg-white/5 text-zinc-500'}`}
                    >
                      Auto
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-600 uppercase font-bold">Columns</span>
                      <input 
                        type="number" 
                        disabled={autoLayout}
                        value={columns}
                        onChange={(e) => setColumns(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-red disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-600 uppercase font-bold">Rows</span>
                      <input 
                        type="number" 
                        disabled={autoLayout}
                        value={rows}
                        onChange={(e) => setRows(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-red disabled:opacity-50"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Gap between cards (cm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={gapCm}
                    onChange={(e) => setGapCm(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-red"
                  />
                </section>
              </div>
            )}

            <button 
              onClick={handleExport}
              disabled={isGenerating}
              className="w-full bg-brand-red text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.2)] disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Download size={18} />}
              START EXPORT
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-zinc-900/50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500">
            <Eye size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Layout Preview</span>
          </div>

          <div className="flex-1 flex items-center justify-center w-full">
            {exportType === 'a4' ? (
              <div 
                className="bg-white shadow-2xl origin-center transition-all duration-500"
                style={{
                  width: a4Orientation === 'portrait' ? '210px' : '297px',
                  height: a4Orientation === 'portrait' ? '297px' : '210px',
                  padding: `${gapCm * 10}px`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gap: `${gapCm * 10}px`,
                  transform: 'scale(1.8)'
                }}
              >
                {Array.from({ length: columns * rows }).map((_, i) => (
                  <div key={i} className="bg-zinc-200 rounded-[1px] border border-zinc-300 flex items-center justify-center text-[8px] text-zinc-400 font-bold">
                    {i + 1}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div 
                  className="bg-white shadow-2xl rounded-xl overflow-hidden mx-auto relative"
                  style={{
                    width: canvasSize.width * Math.min(200 / canvasSize.width, 250 / canvasSize.height),
                    height: canvasSize.height * Math.min(200 / canvasSize.width, 250 / canvasSize.height)
                  }}
                >
                  <Stage 
                    width={canvasSize.width} 
                    height={canvasSize.height}
                    scaleX={Math.min(200 / canvasSize.width, 250 / canvasSize.height)}
                    scaleY={Math.min(200 / canvasSize.width, 250 / canvasSize.height)}
                  >
                    <Layer>
                      {templateImage && <TemplateLayer url={templateImage} />}
                      {fields.map((field) => (
                        <PreviewField key={field.id} data={field} />
                      ))}
                    </Layer>
                  </Stage>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400 font-medium max-w-[240px] mx-auto">
                    Individual cards will be exported as {imageFormat.toUpperCase()} files in a ZIP archive.
                  </p>
                  <div className="bg-white/5 rounded-xl px-4 py-2 inline-block border border-white/5">
                    <code className="text-[10px] text-brand-yellow font-mono">001-Name.{imageFormat}</code>
                  </div>
                </div>
              </div>
            )}
          </div>

          {exportType === 'a4' && (
            <div className="mt-8 text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                {columns * rows} cards per page • {Math.ceil(excelData.length / (columns * rows))} pages total
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
