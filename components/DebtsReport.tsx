
import React, { useMemo, useState, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatBudgetSummary, formatOverdueReminder } from '../services/shareService';
import { financeService } from '../services/financeService';
import { DebtBalanceCard } from './debts/DebtBalanceCard';

type TabType = 'all' | 'customer_debts' | 'supplier_debts' | 'critical';

const DebtsReport: React.FC = memo(() => {
  const { customers, suppliers, sales, purchases, vouchers, expenses, navigate, theme } = useApp();
  const [activeCurrency, setActiveCurrency] = useState<'YER' | 'SAR' | 'OMR'>('YER');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const budgetSummary = useMemo(() => financeService.getGlobalBudgetSummary(customers, suppliers, sales, purchases, vouchers, expenses), [customers, suppliers, sales, purchases, vouchers, expenses]);
  const currentSummary = useMemo(() => budgetSummary.find(s => s.currency === activeCurrency) || { net: 0 }, [budgetSummary, activeCurrency]);

  const filteredBalances = useMemo(() => {
    let list: any[] = [];
    customers.forEach(c => {
      const bal = financeService.getCustomerBalances(c.id, sales, vouchers).find(b => b.currency === activeCurrency);
      if (bal && bal.amount !== 0) list.push({ id: c.id, name: c.name, type: 'عميل', amount: bal.amount, days: bal.daysSinceLastOp, status: bal.status, phone: c.phone });
    });
    suppliers.forEach(s => {
      const bal = financeService.getSupplierBalances(s.id, purchases, vouchers).find(b => b.currency === activeCurrency);
      if (bal && bal.amount !== 0) list.push({ id: s.id, name: s.name, type: 'مورد', amount: -bal.amount, days: bal.daysSinceLastOp, status: bal.status, phone: s.phone });
    });

    const filtered = list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeTab === 'customer_debts') return filtered.filter(b => b.type === 'عميل' && b.amount > 0);
    if (activeTab === 'supplier_debts') return filtered.filter(b => b.type === 'مورد' && b.amount < 0);
    if (activeTab === 'critical') return filtered.filter(b => b.status.level === 'critical');
    return filtered;
  }, [customers, suppliers, sales, purchases, vouchers, activeCurrency, searchTerm, activeTab]);

  const handleShareOverdue = useCallback((item: any) => {
    shareToWhatsApp(formatOverdueReminder(item.name, Math.abs(item.amount), activeCurrency, item.days), item.phone);
  }, [activeCurrency]);

  return (
    <PageLayout title="الميزانية والديون" onBack={() => navigate('dashboard')}>
      <div className="space-y-4 pt-2 page-enter pb-44 max-w-lg mx-auto w-full px-2">
        <div className={`rounded-[2.5rem] p-6 shadow-2xl border ${theme === 'dark' ? 'bg-[var(--color-background-card)] border-white/5' : 'bg-white border-slate-100'}`}>
          <p className="text-[9px] font-black opacity-50 uppercase mb-1">صافي القيمة التقديرية</p>
          <h2 className={`text-4xl font-black tabular-nums ${currentSummary.net >= 0 ? 'text-[var(--color-status-success)]' : 'text-[var(--color-status-danger)]'}`}>
            {currentSummary.net.toLocaleString()} <small className="text-xs opacity-30 uppercase">{activeCurrency}</small>
          </h2>
        </div>

        <div className="flex bg-[var(--color-background-tertiary)] p-1 rounded-2xl gap-1 border border-[var(--color-border-default)]">
           {(['YER', 'SAR', 'OMR'] as const).map(cur => (
             <button key={cur} onClick={() => setActiveCurrency(cur)} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${activeCurrency === cur ? 'bg-[var(--color-accent-sky)] text-white shadow-lg' : 'text-slate-400'}`}>{cur}</button>
           ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {[{ id: 'all', label: 'الكل' }, { id: 'customer_debts', label: 'لنا' }, { id: 'supplier_debts', label: 'علينا' }, { id: 'critical', label: 'حرج ⚠️' }].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-shrink-0 px-5 py-2 rounded-full font-black text-xs border-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white border-transparent' : 'bg-white text-slate-400 border-slate-200'}`}>{tab.label}</button>
           ))}
        </div>

        <div className="space-y-3">
           {filteredBalances.map(item => (
             <DebtBalanceCard key={item.id} item={item} theme={theme} onNavigate={navigate} onShare={handleShareOverdue} currency={activeCurrency} />
           ))}
        </div>
      </div>
    </PageLayout>
  );
});

export default DebtsReport;
