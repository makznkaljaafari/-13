
import React from 'react';
import { Theme } from '../../types';

interface DebtBalanceCardProps {
  item: any;
  theme: Theme;
  onNavigate: (page: any, params: any) => void;
  onShare: (item: any) => void;
  currency: string;
}

export const DebtBalanceCard: React.FC<DebtBalanceCardProps> = ({ item, theme, onNavigate, onShare, currency }) => {
  const isDark = theme === 'dark';
  const isCritical = item.status.level === 'critical';
  const isWarning = item.status.level === 'warning';
  
  // اختيار لون الإطار بناءً على الحالة
  const statusColor = isCritical ? 'border-rose-500 shadow-rose-500/10' : (isWarning ? 'border-amber-500 shadow-amber-500/10' : 'border-indigo-500/20 shadow-indigo-500/10');

  return (
    <div className={`vibrant-card p-6 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden active:scale-[0.99]
      ${isCritical ? 'vibrant-card-danger animate-pulse-slow' : ''} ${statusColor}`}>
      
      {/* خلفية تفاعلية */}
      <div className={`absolute -right-8 -bottom-8 text-9xl opacity-[0.04] transition-transform group-hover:scale-110 group-hover:-rotate-6 pointer-events-none`}>
        {item.type === 'عميل' ? '👤' : '🚛'}
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
         <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-3xl shadow-2xl transition-all group-hover:rotate-12 ${
              item.type === 'عميل' ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-orange-500 text-white shadow-orange-500/30'
            }`}>
              {item.type === 'عميل' ? '👤' : '🚛'}
            </div>
            <div>
               <h4 className="font-black text-lg text-[var(--color-text-default)] leading-tight">{item.name}</h4>
               <div className="flex items-center gap-3 mt-2">
                  <span className={`${item.status.color} bg-white dark:bg-black/20 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1.5 shadow-sm border border-current/10`}>
                     <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.status.color.replace('text-', 'bg-')}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${item.status.color.replace('text-', 'bg-')}`}></span>
                     </span>
                     {item.status.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                    📅 {item.days} يوم
                  </span>
               </div>
            </div>
         </div>
         <div className="text-left bg-white/40 dark:bg-black/30 p-4 rounded-[1.8rem] border border-white/20 backdrop-blur-md shadow-inner">
            <p className={`text-2xl font-black tabular-nums tracking-tighter ${item.amount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
               {Math.abs(item.amount).toLocaleString()}
            </p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mt-1">
              {item.amount > 0 ? 'لنا مديونية' : 'علينا للمورد'}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
         <button 
           onClick={() => onNavigate('account-statement', { personId: item.id, personType: item.type })}
           className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-black text-[10px] transition-all active:scale-95 border-b-4 border-slate-200 dark:border-white/10"
         >📑 كشف كامل</button>
         
         <button 
           onClick={() => onShare(item)}
           className="bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] transition-all shadow-lg active:scale-95 border-b-4 border-emerald-800"
         >💬 تذكير واتساب</button>

         <button 
           onClick={() => onNavigate('add-voucher', { 
             type: item.amount > 0 ? (item.type === 'عميل' ? 'قبض' : 'دفع') : (item.type === 'عميل' ? 'دفع' : 'قبض'), 
             personId: item.id, personType: item.type, amount: Math.abs(item.amount), currency 
           })}
           className="bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] transition-all shadow-lg active:scale-95 border-b-4 border-indigo-900"
         >✅ تسوية الآن</button>
      </div>

      {isCritical && (
        <div className="absolute top-2 right-2 flex items-center justify-center">
           <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};