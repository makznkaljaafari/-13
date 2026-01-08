
import React, { memo } from 'react';
import { Sale, Theme } from '../../types';
import { shareToWhatsApp, formatSaleInvoice } from '../../services/shareService';

interface SaleCardProps {
  sale: Sale;
  theme: Theme;
  agencyName: string;
  onNavigate: (page: any, params: any) => void;
  onReturn: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

export const SaleCard: React.FC<SaleCardProps> = memo(({ sale, theme, agencyName, onNavigate, onReturn, onDelete }) => {
  const isDark = theme === 'dark';
  
  return (
    <div 
      className={`vibrant-card p-6 rounded-[2.5rem] transition-all relative overflow-hidden cursor-pointer active:scale-[0.98] border-2 group
        ${sale.is_returned ? 'opacity-60 grayscale border-slate-300' : 'vibrant-card-success border-emerald-500/20'}`}
      onClick={() => onNavigate('invoice-view', { sale })}
    >
      {/* أيقونة خلفية نابضة بالحياة */}
      <div className="absolute -right-4 -bottom-4 text-7xl opacity-[0.05] group-hover:opacity-[0.1] group-hover:scale-125 group-hover:-rotate-12 transition-all pointer-events-none">
        {sale.status === 'نقدي' ? '💰' : '⏳'}
      </div>

      {/* شريط الحالة الملون في الأعلى */}
      <div className={`absolute top-0 right-0 left-0 h-1.5 ${sale.is_returned ? 'bg-slate-400' : (sale.status === 'نقدي' ? 'bg-emerald-500' : 'bg-amber-500')}`}></div>

      {sale.is_returned && (
        <div className="absolute top-4 -left-8 bg-rose-500 text-white py-1 px-10 -rotate-45 text-[8px] font-black uppercase tracking-widest z-10 shadow-lg">مرتجع</div>
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:rotate-6 ${
            sale.is_returned ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            👤
          </div>
          <div>
              <h3 className="font-black text-lg text-[var(--color-text-default)] truncate max-w-[150px]">{sale.customer_name}</h3>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brandSecondary animate-pulse"></span>
                {sale.qat_type} • {sale.quantity} حبة
              </p>
          </div>
        </div>
        <div className="text-left">
            <p className={`text-2xl font-black tabular-nums leading-none ${sale.is_returned ? 'line-through text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {sale.total.toLocaleString()}
            </p>
            <small className="text-[9px] font-black opacity-40 text-[var(--color-text-muted)] block mt-1 uppercase tracking-tighter">{sale.currency}</small>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5 relative z-10" onClick={e => e.stopPropagation()}>
        <div className="flex gap-1.5">
           <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
             sale.status === 'نقدي' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
           }`}>
             {sale.status}
           </span>
           <span className="px-2 py-1 rounded-lg text-[8px] font-black bg-slate-100 dark:bg-white/5 text-slate-400 tabular-nums">
             #{sale.id.slice(-4).toUpperCase()}
           </span>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => shareToWhatsApp(formatSaleInvoice(sale, agencyName))} className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-90">💬</button>
          {!sale.is_returned && (
            <button onClick={() => onReturn(sale)} className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-amber-600 hover:text-white transition-all active:scale-90">🔄</button>
          )}
          <button onClick={() => onDelete(sale)} className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-90">🗑️</button>
        </div>
      </div>
    </div>
  );
});