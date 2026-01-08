
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { Sale } from '../types';
import { SaleCard } from './sales/SaleCard';
import { SalesTable } from './sales/SalesTable';

const SalesList: React.FC = memo(() => {
  const { sales, navigate, returnSale, user, theme, loadAllData, isSyncing, addNotification, deleteSale } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // حفظ وضع العرض في التخزين المحلي لضمان استمرارية تجربة المستخدم
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('sales_view_mode') as 'grid' | 'list') || 'list'
  );

  // تحسين الأداء: تصفية المبيعات تتم فقط عند تغيير نص البحث أو قائمة المبيعات
  const filteredSales = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return sales;
    return sales.filter(s => 
      s.customer_name.toLowerCase().includes(query) || 
      s.qat_type.toLowerCase().includes(query) ||
      s.notes?.toLowerCase().includes(query)
    );
  }, [sales, searchTerm]);

  const toggleView = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('sales_view_mode', mode);
  }, []);

  const handleReturn = useCallback(async (sale: Sale) => {
    if (sale.is_returned) return;
    if (window.confirm(`هل أنت متأكد من إرجاع فاتورة ${sale.customer_name}؟`)) {
      try {
        await returnSale(sale.id);
      } catch (err: any) {
        addNotification("خطأ ⚠️", err.message || "فشل إرجاع الفاتورة.", "warning");
      }
    }
  }, [returnSale, addNotification]);

  const handleDelete = useCallback(async (sale: Sale) => {
    if (window.confirm(`⚠️ حذف نهائي للفاتورة رقم ${sale.id.slice(-6).toUpperCase()}؟`)) {
      try {
        await deleteSale(sale.id);
        addNotification("تم الحذف 🗑️", "تم حذف السجل بنجاح.", "success");
      } catch (err: any) {
        addNotification("خطأ ⚠️", "فشل حذف فاتورة البيع.", "warning");
      }
    }
  }, [deleteSale, addNotification]);

  return (
    <PageLayout 
      title="سجل المبيعات" 
      onBack={() => navigate('dashboard')}
      headerExtra={
        <button 
          onClick={() => user?.id && loadAllData(user.id, false)} 
          className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg active:scale-90 transition-all ${isSyncing ? 'animate-spin' : ''}`}
        >🔄</button>
      }
      floatingButton={
        <button 
          onClick={() => navigate('add-sale')} 
          className="w-16 h-16 bg-brandPrimary text-white rounded-[1.8rem] shadow-2xl flex items-center justify-center text-4xl border-4 border-white dark:border-slate-800 active:scale-90 transition-all hover:rotate-6"
        >💰＋</button>
      }
    >
      <div className="space-y-4 pb-44 max-w-7xl mx-auto w-full px-2 page-enter">
        {/* شريط التحكم المحسن */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="ابحث باسم العميل، الصنف، أو الملاحظات..."
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 pr-12 font-bold text-sm shadow-sm focus:border-brandPrimary outline-none transition-all"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-white/10 rounded-full text-[10px] font-black">✕</button>
            )}
          </div>
          
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">
            <button 
              onClick={() => toggleView('grid')} 
              className={`p-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-md' : 'opacity-40 text-slate-500'}`}
            ><span>🎴</span> <span className="hidden md:inline font-black text-[10px]">شبكة</span></button>
            <button 
              onClick={() => toggleView('list')} 
              className={`p-2 px-4 rounded-lg text-sm transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brandPrimary shadow-md' : 'opacity-40 text-slate-500'}`}
            ><span>📜</span> <span className="hidden md:inline font-black text-[10px]">قائمة</span></button>
          </div>
        </div>

        {/* عرض المحتوى */}
        <div className="min-h-[400px]">
          {filteredSales.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSales.map((sale) => (
                  <SaleCard 
                    key={sale.id} 
                    sale={sale} 
                    theme={theme} 
                    agencyName={user?.agency_name || 'الوكالة'} 
                    onNavigate={navigate} 
                    onReturn={handleReturn} 
                    onDelete={handleDelete} 
                  />
                ))}
              </div>
            ) : (
              <SalesTable 
                sales={filteredSales} 
                theme={theme} 
                agencyName={user?.agency_name || 'الوكالة'} 
                onNavigate={navigate} 
                onReturn={handleReturn} 
                onDelete={handleDelete} 
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-20 text-center animate-in fade-in zoom-in duration-700">
               <span className="text-9xl mb-4">💰</span>
               <h3 className="font-black text-2xl text-slate-500">لا توجد سجلات مطابقة</h3>
               <p className="text-xs font-bold mt-2">جرب البحث بكلمات مختلفة أو أضف بيعاً جديداً</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
});

export default SalesList;
