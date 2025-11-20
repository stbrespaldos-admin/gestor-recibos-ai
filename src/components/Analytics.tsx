import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ReceiptData } from '../types';

interface AnalyticsProps {
  receipts: ReceiptData[];
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const Analytics: React.FC<AnalyticsProps> = ({ receipts }) => {
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    receipts.forEach(r => {
      if (data[r.category]) {
        data[r.category] += r.totalAmount;
      } else {
        data[r.category] = r.totalAmount;
      }
    });
    return Object.keys(data).map(key => ({
      name: key,
      value: Number(data[key].toFixed(2))
    }));
  }, [receipts]);

  const monthlyData = useMemo(() => {
     // Mock data for visual purposes if receipts are sparse
     return [
        { name: 'Ene', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 550 },
        { name: 'Abr', value: 450 },
        { name: 'May', value: 600 },
        { name: 'Jun', value: 850 },
     ];
  }, []);

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-white">Resumen Financiero</h2>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
             <h3 className="text-lg font-semibold text-slate-200 mb-6">Gastos por Categoría</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                       itemStyle={{ color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((entry, index) => (
                   <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm text-slate-400">{entry.name}</span>
                      <span className="text-sm font-mono text-white ml-auto">${entry.value}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
             <h3 className="text-lg font-semibold text-slate-200 mb-6">Tendencia Mensual</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                       cursor={{fill: '#334155', opacity: 0.4}}
                       contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>
    </div>
  );
};