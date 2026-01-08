
import React, { memo } from 'react';
import { QatCategory, Theme } from '../../types';

interface CategoryCardProps {
  cat: QatCategory;
  theme: Theme;
  onNavigate: (page: any, params: any) => void;
  stats: { totalSold: number; salesCount: number };
}

export const CategoryCard: React.FC<CategoryCardProps> = memo(({ cat, theme, onNavigate, stats }) => {
  const isLow = cat.stock <= (cat.low_stock_threshold || 5);
  const isDark = theme === 'dark';

  return (
    <div 
      className={`vibrant-card p-6 rounded-[2.5rem] transition-all relative overflow-hidden group border-2
        ${isLow ? 'vibrant-card-danger border-rose-500/40 animate-pulse-slow' : 'vibrant-card-primary border-indigo-500/20'}`}
    >
      {/* تأثيرات بصرية خلفية */}
      <div className={`absolute -right-6 -top-6 text-8xl opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12`}>
        🌿
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 ${
            isLow ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-brandPrimary text-white shadow-indigo-500/30'
          }`}>
            🌿
          </div>
          <div>
            <h3 className="font-black text-xl text-[var(--color-text-default)] leading-tight">{cat.name}</h3>
            <p className="text-[10px] font-extrabold text-[var(--color-text-muted)] mt-1 uppercase tracking-[0.2em] opacity-60">
              {cat.price.toLocaleString()} {cat.currency} / للحبة
            </p>
          </div>
        </div>
        <div className="text-left bg-white/50 dark:bg-black/20 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
           <span className={`text-4xl font-black tabular-nums tracking-tighter ${isLow ? 'text-rose-500' : 'text-emerald-500'}`}>
             {cat.stock}
           </span>
           <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-1">متوفر الآن</p>
        </div>
      </div>

      <div className={`rounded-3xl p-5 mb-6 flex justify-around items-center border relative z-10 transition-colors ${
        isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
      }`}>
         <div className="text-center group/stat">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">المبيعات</p>
            <p className="font-black text-sm tabular-nums text-[var(--color-text-default)] group-hover/stat:scale-110 transition-transform">{stats.totalSold} حبه</p>
         </div>
         <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
         <div className="text-center group/stat">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">الفواتير</p>
            <p className="font-black text-sm tabular-nums text-[var(--color-text-default)] group-hover/stat:scale-110 transition-transform">{stats.salesCount}</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
         <button 
           onClick={() => onNavigate('add-sale', { qatType: cat.name })} 
           className={`py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 border-b-4 ${
             isLow ? 'bg-rose-500 text-white border-rose-800' : 'bg-sky-500 text-white border-sky-800'
           }`}
         >
           💰 بيع سريع
         </button>
         <button 
           onClick={() => onNavigate('add-category', { categoryId: cat.id })} 
           className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border-b-4 border-slate-300 dark:border-white/5"
         >
           📝 تعديل
         </button>
      </div>
      
      {isLow && (
        <div className="mt-4 flex items-center gap-2 px-2 animate-bounce">
           <span className="text-sm">⚠️</span>
           <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">تنبيه: المخزون حرج جداً!</span>
        </div>
      )}
    </div>
  );
});