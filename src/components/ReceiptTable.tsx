import React from 'react';
import { ReceiptData, ReceiptStatus } from '../types';
import { CheckCircle, AlertCircle, Clock, FileSpreadsheet, ExternalLink, Search, Filter, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReceiptTableProps {
  receipts: ReceiptData[];
  onDelete: (id: string) => void;
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ receipts, onDelete }) => {
  const [filterText, setFilterText] = React.useState('');

  const filteredReceipts = receipts.filter(r => 
    r.merchantName.toLowerCase().includes(filterText.toLowerCase()) || 
    r.category.toLowerCase().includes(filterText.toLowerCase()) ||
    (r.customerDocument && r.customerDocument.includes(filterText))
  );

  const getStatusColor = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.VERIFIED: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case ReceiptStatus.PROCESSING: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case ReceiptStatus.REVIEW_NEEDED: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.VERIFIED: return <CheckCircle className="w-3 h-3 mr-1.5" />;
      case ReceiptStatus.PROCESSING: return <Clock className="w-3 h-3 mr-1.5" />;
      case ReceiptStatus.REVIEW_NEEDED: return <AlertCircle className="w-3 h-3 mr-1.5" />;
    }
  };

  const exportToExcel = () => {
    // Preparar datos para Excel
    const dataToExport = filteredReceipts.map(r => ({
      Fecha: r.date,
      'Cédula/NIT': r.customerDocument || 'N/A',
      Comercio: r.merchantName,
      Categoría: r.category,
      Total: r.totalAmount,
      Moneda: r.currency,
      Estado: r.status,
      'Items Detalle': r.items.map(i => `${i.description} ($${i.price})`).join(', ')
    }));

    // Crear hoja de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Ajustar ancho de columnas automáticamente (simple)
    const wscols = [
      {wch: 12}, // Fecha
      {wch: 15}, // Cédula
      {wch: 20}, // Comercio
      {wch: 15}, // Categoría
      {wch: 10}, // Total
      {wch: 8},  // Moneda
      {wch: 15}, // Estado
      {wch: 50}  // Items
    ];
    worksheet['!cols'] = wscols;

    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");

    // Descargar archivo
    XLSX.writeFile(workbook, "Reporte_Gastos_AI.xlsx");
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por comercio, categoría o cédula..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
             <Filter className="w-4 h-4" />
             Filtrar
           </button>
           <button 
            onClick={exportToExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
             <FileSpreadsheet className="w-4 h-4" />
             Exportar Excel
           </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-medium">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Cédula/NIT</th>
              <th className="p-4">Comercio</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Total</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-sm">
            {filteredReceipts.length === 0 ? (
               <tr>
                 <td colSpan={7} className="p-8 text-center text-slate-500">
                   No se encontraron recibos con ese criterio.
                 </td>
               </tr>
            ) : (
              filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="p-4 text-slate-300 whitespace-nowrap">{receipt.date}</td>
                  <td className="p-4 text-slate-300 font-mono text-xs">{receipt.customerDocument || '-'}</td>
                  <td className="p-4 font-medium text-white flex items-center gap-3">
                    <img src={receipt.imageUrl} alt="thumb" className="w-8 h-8 rounded object-cover bg-slate-700" />
                    {receipt.merchantName}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full bg-slate-700 text-slate-300 text-xs">
                      {receipt.category}
                    </span>
                  </td>
                  <td className="p-4 text-white font-mono">
                    {receipt.currency === 'USD' ? '$' : receipt.currency + ' '}{receipt.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(receipt.status)}`}>
                      {getStatusIcon(receipt.status)}
                      {receipt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400"
                        title="Ver Detalles"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400"
                        title="Eliminar"
                        onClick={() => onDelete(receipt.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center bg-slate-900/30">
        <span>Mostrando {filteredReceipts.length} recibos</span>
        <div className="flex gap-2">
           <span className="cursor-pointer hover:text-slate-300">Anterior</span>
           <span className="text-slate-600">|</span>
           <span className="cursor-pointer hover:text-slate-300">Siguiente</span>
        </div>
      </div>
    </div>
  );
};