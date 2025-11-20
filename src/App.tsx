import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { UploadArea } from './components/UploadArea';
import { ReceiptTable } from './components/ReceiptTable';
import { ReviewModal } from './components/ReviewModal';
import { MOCK_RECEIPTS } from './constants';
import { ReceiptData, ReceiptStatus } from './types';
import { analyzeReceiptImage } from './services/geminiService';
import { compressImage } from './utils/imageOptimizer';
import { Bell } from 'lucide-react';

const STORAGE_KEY = 'gestor_recibos_data_v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Inicializar estado con función lazy para leer LocalStorage una sola vez al inicio
  const [receipts, setReceipts] = useState<ReceiptData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing local storage", e);
        return MOCK_RECEIPTS;
      }
    }
    return MOCK_RECEIPTS;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<Partial<ReceiptData> | null>(null);

  // Efecto para guardar en LocalStorage cada vez que cambian los recibos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  const handleUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setNotification("Optimizando imagen y analizando con Gemini...");
    
    try {
      // 1. Comprimir y convertir a WebP (Optimización Edge)
      const optimizedBase64 = await compressImage(file);

      // 2. Enviar a Gemini
      const extractedData = await analyzeReceiptImage(optimizedBase64);
      
      // 3. Preparar datos para revisión
      const preFilledData: Partial<ReceiptData> = {
        ...extractedData,
        imageUrl: optimizedBase64, // Guardamos la versión optimizada y ligera
        uploadTimestamp: Date.now()
      };

      setReviewData(preFilledData);
      setIsProcessing(false);
      setNotification("Datos extraídos. Por favor verifica e ingresa la cédula.");
      setIsReviewOpen(true);

    } catch (error: any) {
      console.error("Upload failed", error);
      // Mostrar el mensaje real del error si está disponible
      const errorMessage = error.message || "Error desconocido";
      setNotification(`Error: ${errorMessage}`);
      setIsProcessing(false);
    }
  }, []);

  const handleSaveReview = (finalData: Partial<ReceiptData>) => {
    const newReceipt: ReceiptData = {
      id: `r-${Date.now()}`,
      merchantName: finalData.merchantName || 'Comercio Desconocido',
      totalAmount: finalData.totalAmount || 0,
      currency: finalData.currency || 'USD',
      date: finalData.date || new Date().toISOString().split('T')[0],
      category: finalData.category || 'Otros',
      customerDocument: finalData.customerDocument || '',
      items: finalData.items || [],
      imageUrl: reviewData?.imageUrl || '',
      status: ReceiptStatus.VERIFIED,
      uploadTimestamp: Date.now()
    };

    setReceipts(prev => [newReceipt, ...prev]);
    setIsReviewOpen(false);
    setReviewData(null);
    setNotification("Recibo guardado exitosamente.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelReview = () => {
    setIsReviewOpen(false);
    setReviewData(null);
    setNotification(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este recibo?')) {
        setReceipts(prev => prev.filter(r => r.id !== id));
        setNotification("Recibo eliminado.");
        setTimeout(() => setNotification(null), 2000);
    }
  };

  // Renderizadores
  const renderContent = () => {
    switch (activeTab) {
      case 'receipts':
        return <ReceiptTable receipts={receipts} onDelete={handleDelete} />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Gasto Total', value: `$${receipts.reduce((acc, r) => acc + r.totalAmount, 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: 'Total' },
                 { label: 'Recibos Guardados', value: receipts.length, change: 'Local' },
                 { label: 'Sin Cédula', value: receipts.filter(r => !r.customerDocument).length, color: 'text-amber-400' },
                 { label: 'Almacenamiento', value: 'Local', change: 'Edge Opt.' }
               ].map((stat, idx) => (
                 <div key={idx} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg transition-transform hover:scale-105">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{stat.label}</p>
                    <div className="flex items-end justify-between">
                       <h3 className={`text-2xl font-bold text-white truncate`}>{stat.value}</h3>
                       {stat.change && <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{stat.change}</span>}
                       {stat.color && <span className={`text-xs font-medium ${stat.color}`}>Revisar</span>}
                    </div>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold text-white">Recientes</h2>
                     <button onClick={() => setActiveTab('receipts')} className="text-sm text-indigo-400 hover:text-indigo-300">Ver todos</button>
                  </div>
                  <ReceiptTable receipts={receipts.slice(0, 5)} onDelete={handleDelete} />
               </div>

               <div className="space-y-6">
                  <UploadArea onUpload={handleUpload} isProcessing={isProcessing} />
                  
                  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                     <h3 className="text-sm font-bold text-slate-300 mb-3">Estado de Memoria</h3>
                     <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                        {/* Visualización aproximada del uso de LocalStorage */}
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ width: `${Math.min((JSON.stringify(receipts).length / 5000000) * 100, 100)}%` }}
                        ></div>
                     </div>
                     <p className="text-xs text-slate-500">
                        Uso local optimizado (WebP). Tus datos persisten al cerrar el navegador.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  const getTitle = (tab: string) => {
      switch(tab) {
          case 'dashboard': return 'Panel Principal';
          case 'receipts': return 'Todos los Recibos';
          case 'settings': return 'Configuración';
          default: return 'Panel';
      }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-0 md:ml-64 p-4 md:p-8 min-h-screen transition-all">
        <header className="flex justify-between items-center mb-8 sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md py-4 border-b border-slate-800/50 -mx-4 px-4 md:mx-0 md:px-0 md:border-none">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {getTitle(activeTab)}
            </h1>
            <p className="text-slate-400 text-sm hidden md:block">Gestión inteligente de gastos</p>
          </div>

          <div className="flex items-center gap-4">
             {notification && (
               <div className="fixed top-20 right-4 md:top-4 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300">
                 {notification}
               </div>
             )}

             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                <Bell className="w-5 h-5 text-slate-400" />
             </div>
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                AI
             </div>
          </div>
        </header>

        {renderContent()}
      </main>
      
      <ReviewModal 
        isOpen={isReviewOpen} 
        initialData={reviewData} 
        onSave={handleSaveReview} 
        onCancel={handleCancelReview} 
      />
    </div>
  );
};

export default App;