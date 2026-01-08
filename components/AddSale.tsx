
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useApp } from '../context/AppContext';
import { PageLayout } from './ui/Layout';
import { shareToWhatsApp, formatSaleInvoice } from '../services/shareService';
import ImageUploadInput from './ui/ImageUploadInput';
import { BaseInput } from './ui/atoms/BaseInput';
import { BaseSelect } from './ui/atoms/BaseSelect';
import { OperationTotalBar } from './ui/molecules/OperationTotalBar';
import { CurrencySwitcher } from './ui/molecules/CurrencySwitcher';

const AddSale: React.FC = memo(() => {
  const { customers, categories, sales, addSale, navigate, navigationParams, addNotification, user, resolvedTheme, formatValue } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editingSale = useMemo(() => 
    navigationParams?.saleId ? sales.find(s => s.id === navigationParams.saleId) : null
  , [sales, navigationParams?.saleId]);

  const [formData, setFormData] = useState({
    customer_id: editingSale?.customer_id || navigationParams?.customerId || '',
    qat_type: editingSale?.qat_type || navigationParams?.qatType || '',
    quantity: editingSale?.quantity || '' as number | '',
    unit_price: editingSale?.unit_price || '' as number | '',
    status: editingSale?.status || 'نقدي' as any,
    currency: editingSale?.currency || 'YER' as any,
    notes: editingSale?.notes || '',
    image_url: editingSale?.image_url,
  });

  useEffect(() => {
    if (!formData.customer_id && !editingSale) {
      const gen = customers.find(c => c.name === "الزبون العام نقدي");
      if (gen) setFormData(p => ({ ...p, customer_id: gen.id }));
    }
    if (!formData.qat_type && categories.length > 0) {
      setFormData(p => ({ ...p, qat_type: categories[0].name }));
    }
  }, [customers, categories, editingSale]);

  const totalAmount = useMemo(() => 
    formatValue((Number(formData.quantity) || 0) * (Number(formData.unit_price) || 0))
  , [formData.quantity, formData.unit_price, formatValue]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    const customer = customers.find(c => c.id === formData.customer_id);
    if (!customer) return addNotification("تنبيه ⚠️", "يرجى اختيار العميل أولاً", "warning");

    const q = formatValue(formData.quantity);
    const p = formatValue(formData.unit_price);
    if (q <= 0 || p <= 0) return addNotification("خطأ ❌", "يرجى إدخال كمية وسعر صحيحين", "warning");

    setIsSubmitting(true);
    try {
      const saleData = { 
        ...formData, 
        id: editingSale?.id, 
        customer_name: customer.name, 
        quantity: q, 
        unit_price: p, 
        total: totalAmount, 
        date: editingSale?.date || new Date().toISOString() 
      };
      
      const addedSale = await addSale(saleData);
      const autoShare = user?.accounting_settings?.auto_share_whatsapp ?? true;
      if (autoShare) shareToWhatsApp(formatSaleInvoice(addedSale || (saleData as any), user?.agency_name || 'وكالة الشويع'), customer.phone);
      
      navigate('sales');
    } catch (err: any) {
      // Errors handled by context notification system
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, customers, totalAmount, editingSale, addSale, user, navigate, addNotification, formatValue]);

  return (
    <PageLayout title={editingSale ? "تعديل فاتورة" : "فاتورة بيع"} onBack={() => navigate('sales')}>
      <div className="space-y-6 page-enter pb-44 max-w-2xl mx-auto w-full px-2">
        <div className={`p-6 sm:p-8 rounded-[2.5rem] border-2 shadow-2xl space-y-6 ${resolvedTheme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseSelect 
              label="العميل" icon="👤" 
              options={[{ value: '', label: '-- اختر العميل --' }, ...customers.map(c => ({ value: c.id, label: c.name }))]} 
              value={formData.customer_id} 
              onChange={e => setFormData(p => ({ ...p, customer_id: e.target.value }))} 
            />
            <BaseSelect 
              label="نوع القات" icon="🌿" 
              options={categories.map(cat => ({ value: cat.name, label: cat.name }))} 
              value={formData.qat_type} 
              onChange={e => setFormData(p => ({ ...p, qat_type: e.target.value }))} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">العملة</label>
                <CurrencySwitcher value={formData.currency} onChange={v => setFormData(p => ({...p, currency: v}))} />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">نوع القيد</label>
                <div className="bg-slate-50 dark:bg-white/5 p-1 rounded-2xl flex gap-1 border border-slate-100 dark:border-white/5 shadow-inner">
                  {['نقدي', 'آجل'].map(s => (
                    <button key={s} type="button" onClick={() => setFormData(p => ({...p, status: s as any}))} className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${formData.status === s ? (s === 'آجل' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white shadow-md') : 'text-slate-400'}`}>{s}</button>
                  ))}
                </div>
             </div>
          </div>

          <BaseInput label="البيان / ملاحظات" icon="📝" placeholder="اكتب بيان الفاتورة..." value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} />

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
             <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الكمية (بالحبة)</p>
                <input type="number" step="0.1" className="w-full bg-transparent text-center font-black text-5xl outline-none tabular-nums" value={formData.quantity} onChange={e => setFormData(p => ({...p, quantity: e.target.value === '' ? '' : parseFloat(e.target.value)}))} />
             </div>
             <div className="text-center space-y-2 border-r border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السعر للحبة</p>
                <input type="number" className="w-full bg-transparent text-center font-black text-5xl outline-none text-sky-500 tabular-nums" value={formData.unit_price} onChange={e => setFormData(p => ({...p, unit_price: e.target.value === '' ? '' : parseFloat(e.target.value)}))} />
             </div>
          </div>
        </div>

        {user?.id && (
          <ImageUploadInput
            userId={user.id} recordType="sales" recordId={editingSale?.id || 'new'}
            currentImageUrl={formData.image_url} 
            onImageUploadSuccess={url => typeof url === 'string' && setFormData(p => ({...p, image_url: url}))}
            onImageDelete={() => setFormData(p => ({ ...p, image_url: undefined }))}
          />
        )}

        <OperationTotalBar 
          total={totalAmount} 
          currency={formData.currency} 
          label="إجمالي مبلغ الفاتورة" 
          buttonText={editingSale ? 'تحديث الفاتورة' : 'حفظ الفاتورة ✅'} 
          onConfirm={handleSubmit} 
          isLoading={isSubmitting} 
          variant={formData.status === 'آجل' ? 'danger' : 'success'}
          theme={resolvedTheme}
        />
      </div>
    </PageLayout>
  );
});

export default AddSale;
