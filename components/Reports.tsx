
import React, { useState, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatDailyClosingReport } from '../services/shareService';
import { ForecastCard } from './ui/molecules/ForecastCard';
import { ReportDetailView } from './ui/organisms/ReportDetailView';
import { useFinancialStats } from '../hooks/useFinancialStats';
import { useReportsData } from '../hooks/useReportsData';
import { MetricsGrid } from './reports/MetricsGrid';
import { ReportsNavigation } from './reports/ReportsNavigation';
import { IncomeStatement } from './reports/IncomeStatement';
import { Currency } from '../types';

type ReportTab = 'overview' | 'income' | 'details';

const Reports: React.FC = () => {
  const { 
    navigate, theme, user, sales, expenses, categories, purchases, vouchers, addNotification 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportCurrency, setReportCurrency] = useState<Currency>('YER');

  // استخدام الـ Hooks الجديدة
  const stats = useFinancialStats(sales, purchases, expenses, categories, reportCurrency);
  const { forecast, isForecastLoading } = useReportsData({
    sales, purchases, expenses, categories, currency: reportCurrency as any, addNotification
  });

  const reportDetails = useMemo(() => {
    if (!selectedReport) return null;
    
    switch (selectedReport) {
      case 'sales':
        return {
          title: `سجل المبيعات التفصيلي (${reportCurrency})`,
          headers: ['التاريخ', 'العميل', 'الصنف', 'الكمية', 'الإجمالي'],
          rows: stats.activeSales.map(s => [
            new Date(s.date).toLocaleDateString('ar-YE'), s.customer_name, s.qat_type, s.quantity, s.total.toLocaleString()
          ])
        };
      case 'purchases':
        return {
          title: `سجل المشتريات (${reportCurrency})`,
          headers: ['التاريخ', 'المورد', 'الصنف', 'الكمية', 'التكلفة'],
          rows: stats.activePurchases.map(p => [
            new Date(p.date).toLocaleDateString('ar-YE'), p.supplier_name, p.qat_type, p.quantity, p.total.toLocaleString()
          ])
        };
      default: return null;
    }
  }, [selectedReport, stats, reportCurrency]);

  const handleDailyClosing = useCallback(() => {
    if (window.confirm("هل أنت متأكد من مشاركة التقرير اليومي؟")) {
      shareToWhatsApp(formatDailyClosingReport({
        sales, expenses, purchases, vouchers, agencyName: user?.agency_name || "وكالة الشويع"
      }));
    }
  }, [sales, expenses, purchases, vouchers, user?.agency_name]);

  if (selectedReport && reportDetails) {
    return <ReportDetailView data={reportDetails} onBack={() => setSelectedReport(null)} onPrint={() => window.print()} theme={theme} />;
  }

  return (
    <PageLayout title="التقارير والتحليلات" onBack={() => navigate('dashboard')}>
      <div className="space-y-6 pb-44 max-w-7xl mx-auto w-full px-2">
        
        {/* شريط تبديل الأقسام */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-[2rem] gap-1 sticky top-4 z-30 shadow-lg border border-white/10 backdrop-blur-md">
           {[
             { id: 'overview', label: 'نظرة عامة', icon: '📊' },
             { id: 'income', label: 'قائمة الدخل', icon: '⚖️' },
             { id: 'details', label: 'السجلات', icon: '📜' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as ReportTab)}
               className={`flex-1 py-3 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <span>{tab.icon}</span>
               <span>{tab.label}</span>
             </button>
           ))}
        </div>

        {/* شريط العملات */}
        <div className="flex justify-center gap-2">
            {(['YER', 'SAR', 'OMR'] as const).map(cur => (
              <button 
                key={cur} onClick={() => setReportCurrency(cur)} 
                className={`px-6 py-2 rounded-full font-black text-[10px] border-2 transition-all ${reportCurrency === cur ? 'bg-indigo-600 text-white border-transparent shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-white/5'}`}
              >{cur}</button>
            ))}
        </div>

        {/* عرض المحتوى الديناميكي */}
        {activeTab === 'overview' && (
          <div className="space-y-6 page-enter">
            <MetricsGrid metrics={stats} currency={reportCurrency} onSelectReport={setSelectedReport} />
            <ForecastCard text={forecast} isLoading={isForecastLoading} />
            <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border-2 border-amber-500/20 flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">💡</div>
               <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 leading-relaxed">
                 تحليل: إجمالي السيولة النشطة يمثل المبالغ النقدية المتوقعة بعد تحصيل كافة الديون وتسوية حسابات الموردين.
               </p>
            </div>
          </div>
        )}

        {activeTab === 'income' && <IncomeStatement stats={stats} currency={reportCurrency} />}

        {activeTab === 'details' && (
          <div className="page-enter">
            <ReportsNavigation onNavigate={navigate} onSelectReport={setSelectedReport} onDailyClosing={handleDailyClosing} />
          </div>
        )}

      </div>
    </PageLayout>
  );
};

export default Reports;
