
import React from 'react';
import { Currency } from '../../types';

interface IncomeStatementProps {
  stats: any;
  currency: Currency;
}

export const IncomeStatement: React.FC<IncomeStatementProps> = ({ stats, currency }) => {
  const formatNum = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-4 border-indigo-500/30">
        <div className="relative z-10">
          <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">قائمة الدخل التقديرية • Income Statement</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-slate-400 font-bold">إجمالي المبيعات (+)</span>
              <span className="text-xl font-black tabular-nums text-emerald-400">{formatNum(stats.totalSales)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-slate-400 font-bold">تكلفة المشتريات (-)</span>
              <span className="text-xl font-black tabular-nums text-orange-400">{formatNum(stats.totalPurchases)}</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
              <span className="text-slate-200 font-black">إجمالي الربح (Gross Profit)</span>
              <span className="text-2xl font-black tabular-nums text-sky-400">{formatNum(stats.grossProfit)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mt-4">
              <span className="text-slate-400 font-bold">المصاريف التشغيلية (-)</span>
              <span className="text-xl font-black tabular-nums text-rose-400">{formatNum(stats.totalExpenses)}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-4 border-indigo-500 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">صافي الربح النهائي</p>
              <h2 className={`text-5xl font-black tabular-nums tracking-tighter ${stats.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatNum(stats.netProfit)}
              </h2>
            </div>
            <span className="bg-indigo-600 px-4 py-1 rounded-full font-black text-xs">{currency}</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 shadow-lg">
           <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">حجم المبيعات</p>
           <div className="flex items-end gap-2">
              <span className="text-3xl font-black tabular-nums">{stats.salesVolume}</span>
              <span className="text-[10px] font-bold text-slate-400 pb-1">حبة/كيس</span>
           </div>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 shadow-lg">
           <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">قيمة المخزون</p>
           <div className="flex items-end gap-2 text-sky-600 dark:text-sky-400">
              <span className="text-3xl font-black tabular-nums">{formatNum(stats.stockValue)}</span>
              <span className="text-[10px] font-bold opacity-60 pb-1">{currency}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
