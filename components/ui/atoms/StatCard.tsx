
import React, { memo } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  currency: string;
  colorClass: string;
  icon: string;
  onClick?: () => void;
  subText?: string;
}

/**
 * مكون StatCard المحسن: يستخدم memo لمنع إعادة الرندر غير الضروري
 */
export const StatCard: React.FC<StatCardProps> = memo(({ 
  title, value, currency, colorClass, icon, onClick, subText 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`vibrant-card p-4 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-500 hover:shadow-2xl active:scale-[0.98] border-b-4 border-transparent hover:border-brandPrimary ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brandPrimary/5 dark:bg-white/5 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform shadow-inner border border-brandPrimary/10">
          {icon}
        </div>
        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <h3 className={`text-xl sm:text-2xl lg:text-3xl font-black tabular-nums tracking-tighter ${colorClass}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase">{currency}</span>
        </div>
        
        {subText && (
          <p className="text-[8px] font-black text-slate-400 mt-2 flex items-center gap-1 opacity-70">
            <span className="w-1 h-1 rounded-full bg-brandSecondary animate-pulse"></span>
            {subText}
          </p>
        )}
      </div>

      {/* خلفية زخرفية متفاعلة */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none rotate-12 scale-150">
         <span className="text-9xl">{icon}</span>
      </div>
    </div>
  );
});
