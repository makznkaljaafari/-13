
import React, { useMemo, useState, memo, useCallback } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PageLayout } from './ui/Layout';
import { financeService } from '../services/financeService';
import { InstallPWAButton } from './ui/InstallPWAButton';
import { StatCard } from './ui/atoms/StatCard';
import { FinancialChart } from './ui/molecules/FinancialChart';
import { QuickActionsGrid } from './dashboard/QuickActionsGrid';

const Dashboard: React.FC = memo(() => {
  const { navigate, isSyncing, resolvedTheme } = useUI();
  const { user } = useAuth();
  const { 
    sales, purchases, vouchers, customers, suppliers, expenses, 
    loadAllData 
  } = useData();
  
  const [activeCurrency, setActiveCurrency] = useState<'YER' | 'SAR' | 'OMR'>('YER');
  const [showFullDetails, setShowFullDetails] = useState(false);

  const currentSummary = useMemo(() => {
    const budgetSummary = financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers, expenses);
    return budgetSummary.find(s => s.currency === activeCurrency) || { cash: 0, assets: 0, liabilities: 0, net: 0 };
  }, [customers, suppliers, sales, purchases, vouchers, expenses, activeCurrency]);

  const detailedBreakdown = useMemo(() => {
    const cur = activeCurrency;
    const cashSales = sales.filter(s => s.status === 'نقدي' && s.currency === cur && !s.is_returned).reduce((sum, s) => sum + s.total, 0);
    const voucherReceipts = vouchers.filter(v => v.type === 'قبض' && v.currency === cur).reduce((sum, v) => sum + v.amount, 0);
    const cashPurchases = purchases.filter(p => p.status === 'نقدي' && p.currency === cur && !p.is_returned).reduce((sum, p) => sum + p.total, 0);
    const voucherPayments = vouchers.filter(v => v.type === 'دفع' && v.currency === cur).reduce((sum, v) => sum + v.amount, 0);
    const totalExp = (expenses || []).filter(e => e.currency === cur).reduce((sum, e) => sum + e.amount, 0);

    return [
      { category: 'الأصول النقدية', item: 'نقدية مبيعات المعرض', plus: cashSales, minus: 0, color: 'text-emerald-600' },
      { category: 'الأصول النقدية', item: 'مقبوضات السندات (قبض)', plus: voucherReceipts, minus: 0, color: 'text-emerald-600' },
      { category: 'الالتزامات النقدية', item: 'مشتريات نقدية مدفوعة', plus: 0, minus: cashPurchases, color: 'text-rose-600' },
      { category: 'الالتزامات النقدية', item: 'مدفوعات السندات (دفع)', plus: 0, minus: voucherPayments, color: 'text-rose-600' },
      { category: 'المصاريف', item: 'إجمالي المصاريف التشغيلية', plus: 0, minus: totalExp, color: 'text-rose-600' },
      { category: 'المديونيات', item: 'ديون مستحقة لنا (عند العملاء)', plus: currentSummary.assets, minus: 0, color: 'text-blue-600' },
      { category: 'المديونيات', item: 'ديون مستحقة علينا (للموردين)', plus: 0, minus: currentSummary.liabilities, color: 'text-amber-600' },
    ];
  }, [sales, vouchers, purchases, expenses, activeCurrency, currentSummary]);

  const handleRefreshData = useCallback(() => {
    if (user?.id) loadAllData(user.id, false);
  }, [user?.id, loadAllData]);

  return (
    <PageLayout 
      title={user?.agency_name || 'وكالة الشويع'}
      headerExtra={
        <button 
          onClick={handleRefreshData} 
          className={`w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl active:scale-90 transition-all ${isSyncing ? 'animate-spin' : ''}`}
        >🔄</button>
      }
    >
      <InstallPWAButton />
      <div className="space-y-6 pb-24 w-full">
        
        {/* بطاقة السيولة الرشيقة والمحسنة - تصميم Minimalist */}
        <div 
          onClick={() => setShowFullDetails(true)}
          className="cursor-pointer bg-brandPrimary p-4 sm:p-5 rounded-[1.8rem] text-white shadow-xl relative overflow-hidden flex items-center justify-between border-b-4 border-brandSecondary active:scale-[0.98] transition-all group"
        >
           <div className="relative z-10">
              <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1 opacity-70">السيولة الصافية</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-black tabular-nums tracking-tighter">
                  {currentSummary.net.toLocaleString()}
                </h2>
                <span className="text-[10px] font-bold opacity-60">{activeCurrency}</span>
              </div>
           </div>
           
           <div className="flex flex-col items-end gap-1.5 relative z-10">
              <div className="flex bg-black/20 p-0.5 rounded-lg gap-0.5" onClick={e => e.stopPropagation()}>
                {(['YER', 'SAR', 'OMR'] as const).map(cur => (
                  <button 
                    key={cur} 
                    onClick={() => setActiveCurrency(cur)} 
                    className={`px-2 py-1 rounded-md font-black text-[8px] transition-all ${activeCurrency === cur ? 'bg-white text-brandPrimary' : 'text-white/40'}`}
                  >{cur}</button>
                ))}
              </div>
              <span className="text-[8px] font-black bg-brandSecondary/30 px-2 py-0.5 rounded-full">تفاصيل 📊</span>
           </div>
           
           <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
        </div>

        {/* الكروت الإحصائية */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <StatCard title="كاش الصندوق" value={currentSummary.cash} currency={activeCurrency} colorClass="text-brandSuccess" icon="💰" onClick={() => navigate('reports')} />
           <StatCard title="مديونية لنا" value={currentSummary.assets} currency={activeCurrency} colorClass="text-brandSecondary" icon="📈" onClick={() => navigate('debts')} />
           <StatCard title="مديونية علينا" value={currentSummary.liabilities} currency={activeCurrency} colorClass="text-brandDanger" icon="📉" onClick={() => navigate('debts')} />
           <StatCard title="الميزانية" value={currentSummary.net} currency={activeCurrency} colorClass="text-brandPrimary dark:text-blue-400" icon="⚖️" onClick={() => navigate('reports')} />
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-4 mb-4 px-2">
             <h3 className="text-[9px] font-black text-brandPrimary dark:text-blue-400 uppercase tracking-[0.3em]">الوصول السريع</h3>
             <div className="h-px flex-1 bg-brandPrimary/10 rounded-full"></div>
          </div>
          <QuickActionsGrid navigate={navigate} theme={resolvedTheme} />
        </div>

        {/* الشارت المالي */}
        <div className="vibrant-card p-6 bg-white dark:bg-slate-900 border-2 border-brandPrimary/5">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <h3 className="text-lg font-black text-brandPrimary dark:text-white">تحليل السيولة الأسبوعي</h3>
                 <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic">تقرير مقارنة التدفقات</p>
              </div>
           </div>
           <div className="h-64 sm:h-72">
              <FinancialChart data={financeService.getWeeklyTrendData(sales, expenses, activeCurrency)} theme={resolvedTheme} />
           </div>
        </div>
      </div>

      {/* مودال تفاصيل السيولة (Excel Table) */}
      {showFullDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border-2 border-brandPrimary">
            <div className="p-5 bg-brandPrimary text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <h3 className="font-black text-base">التفصيل الدقيق للميزانية ({activeCurrency})</h3>
              </div>
              <button onClick={() => setShowFullDetails(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black">✕</button>
            </div>

            <div className="flex-1 overflow-auto p-4 no-scrollbar">
              <table className="w-full text-right border-collapse financial-table text-xs">
                <thead>
                  <tr>
                    <th className="w-10">#</th>
                    <th>البيان المالي</th>
                    <th className="bg-emerald-600">إضافة (+)</th>
                    <th className="bg-rose-600">خصم (-)</th>
                  </tr>
                </thead>
                <tbody className="font-bold">
                  {detailedBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="text-center opacity-30">{idx + 1}</td>
                      <td className="text-brandPrimary dark:text-blue-300">{row.item}</td>
                      <td className="text-center text-emerald-600 tabular-nums">{row.plus > 0 ? row.plus.toLocaleString() : '-'}</td>
                      <td className="text-center text-rose-600 tabular-nums">{row.minus > 0 ? row.minus.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black">
                    <td colSpan={2} className="p-4 text-center">الرصيد الصافي النهائي</td>
                    <td colSpan={2} className="p-4 text-center text-xl tabular-nums">{currentSummary.net.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t flex gap-3">
              <button onClick={() => window.print()} className="flex-1 bg-slate-200 dark:bg-slate-700 p-3 rounded-xl font-black text-xs">🖨️ طباعة</button>
              <button onClick={() => setShowFullDetails(false)} className="flex-[2] bg-brandPrimary text-white p-3 rounded-xl font-black text-xs shadow-lg">إغلاق التقرير ✅</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
});

export default Dashboard;
