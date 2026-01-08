
import React from 'react';

interface StatementTableProps {
  data: any[];
  theme: string;
  currentBalance: number;
}

export const StatementTable: React.FC<StatementTableProps> = ({ data, theme, currentBalance }) => {
  const totals = data.reduce((acc, t) => ({
    debit: acc.debit + t.debit,
    credit: acc.credit + t.credit
  }), { debit: 0, credit: 0 });

  return (
    <div className="vibrant-card overflow-hidden shadow-2xl border-2">
      <div className="p-6 bg-brandPrimary text-white flex justify-between items-center">
         <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <h4 className="font-black text-sm lg:text-lg">كشف الحساب التفصيلي (Ledger)</h4>
         </div>
         <button onClick={() => window.print()} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-black text-xs transition-all border border-white/30">
            🖨️ طباعة الكشف
         </button>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-right financial-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>التاريخ</th>
              <th>البيان والعملية</th>
              <th className="bg-rose-700">مدين (+)</th>
              <th className="bg-emerald-700">دائن (-)</th>
              <th className="bg-blue-900">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((t, idx) => (
              <tr key={t.id + idx} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                <td className="text-center font-black opacity-40 tabular-nums">{idx + 1}</td>
                <td className="tabular-nums font-black text-brandPrimary dark:text-blue-300">
                   {new Date(t.date).toLocaleDateString('ar-YE', {day:'2-digit', month:'2-digit', year:'2-digit'})}
                </td>
                <td>
                   <div className="flex flex-col">
                      <span className="font-black text-brandPrimary dark:text-white">{t.type}</span>
                      <span className="text-[10px] font-bold text-slate-500 italic">{t.details}</span>
                   </div>
                </td>
                <td className="text-center font-black tabular-nums text-brandDanger">
                   {t.debit > 0 ? t.debit.toLocaleString() : '-'}
                </td>
                <td className="text-center font-black tabular-nums text-brandSuccess">
                   {t.credit > 0 ? t.credit.toLocaleString() : '-'}
                </td>
                <td className={`text-center font-black tabular-nums bg-blue-50/50 dark:bg-blue-900/5 ${t.balance > 0 ? 'text-brandDanger' : 'text-brandSuccess'}`}>
                    {Math.abs(t.balance).toLocaleString()}
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan={6} className="p-20 text-center text-slate-400 font-black text-xl">لا توجد عمليات مالية مسجلة</td>
              </tr>
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot className="bg-slate-900 text-white">
              <tr className="text-sm font-black">
                <td colSpan={3} className="p-6 text-center uppercase tracking-widest">إجمالي الحساب الختامي</td>
                <td className="p-6 text-center text-rose-400 tabular-nums">{totals.debit.toLocaleString()}</td>
                <td className="p-6 text-center text-emerald-400 tabular-nums">{totals.credit.toLocaleString()}</td>
                <td className={`p-6 text-center tabular-nums text-xl ${currentBalance > 0 ? 'bg-brandDanger' : 'bg-brandSuccess'}`}>
                   {Math.abs(currentBalance).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
