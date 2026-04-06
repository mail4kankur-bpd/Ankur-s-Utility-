import React from 'react';
import { Stage, Layer } from 'react-konva';
import { useIdStore } from './store/useIdStore';
import { TemplateLayer } from './components/TemplateLayer';
import { EditableField } from './components/EditableField';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Login } from './components/Login';
import { CanvasSetup } from './components/CanvasSetup';
import { PasswordChange } from './components/PasswordChange';
import { ExportModal } from './components/ExportModal';
import { Download, Loader2, AlertCircle, Menu, Settings as SettingsIcon, X, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { fields, templateImage, canvasSize, selectedId, setSelectedId, excelFile, isGenerating, setIsGenerating, isAuthenticated } = useIdStore();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = React.useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [stageScale, setStageScale] = React.useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scale stage to fit container
  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 80;
        const containerHeight = containerRef.current.offsetHeight - 80;
        const scaleX = containerWidth / canvasSize.width;
        const scaleY = containerHeight / canvasSize.height;
        setStageScale(Math.min(scaleX, scaleY, 1));
      }
    };

    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasSize]);

  const handleGenerate = () => {
    if (!templateImage || !excelFile) return;
    setIsExportModalOpen(true);
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!templateImage) {
    return <CanvasSetup />;
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col md:flex-row text-white font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-950 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400">
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-black tracking-tighter flex items-center gap-1">
          ANKUR'S <span className="text-brand-red">ID</span>
        </h1>
        <button onClick={() => setIsPropertiesOpen(true)} className="p-2 text-zinc-400">
          <Sliders size={20} />
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed md:relative inset-y-0 left-0 z-[60] md:z-10 w-72 md:w-64 bg-zinc-950 shadow-2xl md:shadow-none"
          >
            <div className="md:hidden absolute top-4 right-4 z-10">
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-500">
                <X size={20} />
              </button>
            </div>
            <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {(isSidebarOpen || isPropertiesOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsSidebarOpen(false); setIsPropertiesOpen(false); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 relative flex flex-col min-w-0">
        {/* Top Bar - Desktop */}
        <div className="hidden md:flex h-20 border-b border-white/5 items-center justify-between px-10 backdrop-blur-md bg-zinc-950/50">
          <div>
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
              ANKUR'S ID <span className="text-brand-red">UTILITY</span>
              <div className="h-1 w-8 bg-brand-yellow" />
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence>
              {!templateImage && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-brand-yellow text-[10px] font-bold uppercase tracking-widest bg-brand-yellow/10 px-4 py-2 rounded-full border border-brand-yellow/20"
                >
                  <AlertCircle size={12} /> Upload Template to Start
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleGenerate}
              disabled={!templateImage || !excelFile || isGenerating}
              className="px-6 py-2.5 bg-brand-red rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Bulk Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div 
          ref={containerRef}
          className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black overflow-hidden p-4 md:p-20"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const headerName = e.dataTransfer.getData('headerName');
            if (headerName) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left - (rect.width / 2)) / stageScale + (canvasSize.width / 2);
              const y = (e.clientY - rect.top - (rect.height / 2)) / stageScale + (canvasSize.height / 2);
              
              const isImage = headerName.toLowerCase().includes('photo') || 
                              headerName.toLowerCase().includes('image') || 
                              headerName.toLowerCase().includes('pic');
              
              useIdStore.getState().addField(isImage ? 'image' : 'text', headerName);
              
              const fields = useIdStore.getState().fields;
              const lastField = fields[fields.length - 1];
              useIdStore.getState().updateField(lastField.id, { x, y });
              setSelectedId(lastField.id);
            }
          }}
        >
          {/* Mobile Floating Action Button for Export */}
          <div className="md:hidden fixed bottom-6 right-6 z-40">
             <button 
              onClick={handleGenerate}
              disabled={!templateImage || !excelFile || isGenerating}
              className="w-14 h-14 bg-brand-red rounded-full flex items-center justify-center shadow-2xl disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin text-white" /> : <Download className="text-white" />}
            </button>
          </div>

          <div 
            className="relative shadow-[0_0_100px_rgba(220,38,38,0.1)] rounded-2xl overflow-hidden bg-white"
            style={{ 
              width: canvasSize.width * stageScale, 
              height: canvasSize.height * stageScale 
            }}
          >
            {!templateImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 gap-4 pointer-events-none">
                <div className="w-20 h-20 border-2 border-dashed border-zinc-200 rounded-3xl flex items-center justify-center">
                   <Download className="text-zinc-200 rotate-180" size={32} />
                </div>
                <p className="text-sm font-medium">Canvas Empty</p>
              </div>
            )}
            <Stage 
              width={canvasSize.width} 
              height={canvasSize.height}
              scaleX={stageScale}
              scaleY={stageScale}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) setSelectedId(null);
              }}
              onTouchStart={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) setSelectedId(null);
              }}
            >
              <Layer>
                {templateImage && <TemplateLayer url={templateImage} />}
                {fields.map((field) => (
                  <EditableField 
                    key={field.id} 
                    data={field} 
                    isSelected={selectedId === field.id}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Properties Panel - Desktop & Mobile */}
      <AnimatePresence>
        {(isPropertiesOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed md:relative inset-y-0 right-0 z-[60] md:z-10 w-80 bg-zinc-950 shadow-2xl md:shadow-none"
          >
            <div className="md:hidden absolute top-4 left-4 z-10">
              <button onClick={() => setIsPropertiesOpen(false)} className="p-2 text-zinc-500">
                <X size={20} />
              </button>
            </div>
            <PropertiesPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <PasswordChange isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-8 right-8 z-50">
        <button 
          onClick={handleGenerate}
          disabled={!templateImage || !excelFile || isGenerating}
          className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
        >
          {isGenerating ? <Loader2 className="animate-spin text-white" /> : <Download className="text-white" />}
        </button>
      </div>
    </div>
  );
}
