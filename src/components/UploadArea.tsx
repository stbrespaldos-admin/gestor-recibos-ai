import React, { useCallback, useState, useEffect } from 'react';
import { Upload, FileImage, Loader2, ClipboardPaste } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      onUpload(files[0]);
    }
  }, [onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  }, [onUpload]);

  // Global Paste Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) onUpload(blob);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUpload]);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-700 bg-slate-800/50 hover:border-indigo-400 hover:bg-slate-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
          isProcessing ? 'bg-indigo-500/20' : 'bg-slate-700'
        }`}>
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-slate-400" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-200">
            {isProcessing ? 'Analizando Recibo...' : 'Subir Recibo'}
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Arrastra tu imagen aquí, <span className="text-indigo-400">pega desde el portapapeles</span> (Ctrl+V), o busca archivos.
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Buscar Archivos
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileInput}
              disabled={isProcessing}
            />
          </label>
          
          <button 
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            onClick={() => navigator.clipboard.read().then(async items => {
               // Simple manual trigger check for some browsers requiring interaction
               // Main paste logic is in useEffect
            }).catch(() => alert("Por favor usa Ctrl+V para pegar"))}
          >
            <ClipboardPaste className="w-4 h-4" />
            Pegar
          </button>
        </div>
      </div>
    </div>
  );
};