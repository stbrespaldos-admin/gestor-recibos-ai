import React, { useState, useEffect } from 'react';
import { ReceiptData, ReceiptStatus } from '../types';
import { CATEGORIES } from '../constants';
import { X, Check, Save, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  initialData: Partial<ReceiptData> | null;
  onSave: (data: Partial<ReceiptData>) => void;
  onCancel: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ReceiptData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Asegurar valores por defecto
        merchantName: initialData.merchantName || '',
        totalAmount: initialData.totalAmount || 0,
        date: initialData.date || new Date().toISOString().split('T')[0],
        category: initialData.category || 'Otros',
        customerDocument: initialData.customerDocument || '',
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalAmount' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Revisar y Guardar</h2>
              <p className="text-xs text-slate-400">Verifica los datos extraídos por la IA</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body / Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Preview Image Thumbnail (Optional) */}
            {formData.imageUrl && (
              <div className="flex justify-center mb-4">
                <img 
                  src={formData.imageUrl} 
                  alt="Receipt Preview" 
                  className="h-32 object-contain rounded-lg border border-slate-700 bg-slate-800"
                />
              </div>
            )}

            {/* Campo Crítico: Cédula */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl">
               <label className="block text-indigo-300 text-sm font-bold mb-2 flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" />
                 Cédula / NIT Cliente (Requerido)
               </label>
               <input
                type="text"
                name="customerDocument"
                required
                value={formData.customerDocument || ''}
                onChange={handleChange}
                placeholder="Ingrese documento del cliente"
                className="w-full bg-slate-950 border-2 border-indigo-500/50 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-400 transition-colors placeholder-slate-600"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Fecha</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Monto Total</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    name="totalAmount"
                    step="0.01"
                    value={formData.totalAmount || 0}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-6 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Comercio</label>
              <input
                type="text"
                name="merchantName"
                value={formData.merchantName || ''}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1">Categoría</label>
              <select
                name="category"
                value={formData.category || 'Otros'}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="review-form"
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Guardar Recibo
          </button>
        </div>

      </div>
    </div>
  );
};