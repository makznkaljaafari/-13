
import React from 'react';
import { Currency } from '../../types';

interface DetailedBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCurrency: Currency;
  netAmount: number;
  breakdown: any[];
}

export const DetailedBalanceModal: React.FC<DetailedBalanceModalProps> = ({ 
  isOpen, onClose, activeCurrency, netAmount, breakdown 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-4 border-brandPrimary">
        
        {/* رأس المودال */}
        <div className="p-6 bg-brandPrimary text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📋</div>
            <div>
               <h3 className="font-black text-lg">تحليل الميزانية (Excel Mode)</h3>
               <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest">Global Financial Balance • {activeCurrency}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white/10 hover:bg-rose-500 rounded-full flex items-center justify-center font-black transition-colors"
          >✕</button>
        </div>

        {/* محتوى الجدول المنظم */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 no-scrollbar">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th className="text-right">بيان العملية المالية</th>
                <th>إضافة (+)</th>
                <th>خصم (-)</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, idx) => (
                <tr key={idx}>
                  <td className="text-center opacity-40 tabular-nums">{idx + 1}</td>
                  <td className="text-brandPrimary dark:text-blue-300">{row.item}</td>
                  <td className={`cell-plus tabular-nums ${row.plus === 0 ? 'opacity-10' : ''}`}>
                    {row.plus > 0 ? row.plus.toLocaleString() : '0'}
                  </td>
                  <td className={`cell-minus tabular-nums ${row.minus === 0 ? 'opacity-10' : ''}`}>
                    {row.minus > 0 ? row.minus.toLocaleString() : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-black">
                <td colSpan={2} className="p-5 text-center text-sm uppercase tracking-widest border-l border-white/10">الصافي الإجمالي ({activeCurrency})</td>
                <td colSpan={2} className="p-5 text-center text-2xl tabular-nums tracking-tighter">
                  {netAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
             <span className="text-xl">💡</span>
             <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 leading-relaxed">
               هذا الجدول يوضح كافة التدفقات النقدية والديون النشطة. تم احتساب الصافي بناءً على (الكاش + مديونية العملاء - مديونية الموردين).
             </p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button 
            onClick={() => window.print()} 
            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white p-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>🖨️</span> طباعة التقرير
          </button>
          <button 
            onClick={onClose} 
            className="flex-[2] bg-brandPrimary hover:bg-brandSecondary text-white p-4 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>✅</span> إغلاق العرض
          </button>
        </div>
      </div>
    </div>
  );
};
