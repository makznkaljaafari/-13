
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
import { DetailedBalanceModal } from './dashboard/DetailedBalanceModal';
import { Currency } from '../types';

const Dashboard: React.FC = memo(() => {
  const { navigate, isSyncing, resolvedTheme } = useUI();
  const { user } = useAuth();
  const { 
    sales, purchases, vouchers, customers, suppliers, expenses, 
    loadAllData 
  } = useData();
  
  const [activeCurrency, setActiveCurrency] = useState<Currency>('YER');
  const [showFullDetails, setShowFullDetails] = useState(false);

  const currentSummary = useMemo(() => {
    const budgetSummary = financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers, expenses);
    return budgetSummary.find(s => s.currency === activeCurrency) || { cash: 0, assets: 0, liabilities: 0, net: 0 };
  }, [customers, suppliers, sales, purchases, vouchers, expenses, activeCurrency]);

  const detailedBreakdown = useMemo(() => {
    return financeService.getDetailedCashBreakdown(
      activeCurrency, sales, purchases, vouchers, expenses, 
      currentSummary.assets, currentSummary.liabilities
    );
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
        
        {/* بطاقة السيولة */}
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
                    onClick={() => setActiveCurrency(cur as Currency)} 
                    className={`px-2 py-1 rounded-md font-black text-[8px] transition-all ${activeCurrency === cur ? 'bg-white text-brandPrimary' : 'text-white/40'}`}
                  >{cur}</button>
                ))}
              </div>
              <span className="text-[8px] font-black bg-brandSecondary/30 px-2 py-0.5 rounded-full">تفاصيل الجدول 📊</span>
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

      <DetailedBalanceModal 
        isOpen={showFullDetails} 
        onClose={() => setShowFullDetails(false)} 
        activeCurrency={activeCurrency} 
        netAmount={currentSummary.net} 
        breakdown={detailedBreakdown} 
      />
    </PageLayout>
  );
});

export default Dashboard;
