
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

export const StatCard: React.FC<StatCardProps> = memo(({ title, value, currency, colorClass, icon, onClick, subText }) => (
  <div 
    onClick={onClick}
    className="vibrant-card p-6 flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer border-b-8 border-b-transparent hover:border-b-brandPrimary transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-14 h-14 rounded-2xl bg-brandBgLight dark:bg-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner border border-brandPrimary/10">
        {icon}
      </div>
      <span className="text-[10px] font-black text-brandPrimary/50 dark:text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
    
    <div>
      <div className="flex items-baseline gap-1">
        <h3 className={`text-2xl lg:text-3xl font-black tabular-nums tracking-tighter ${colorClass}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{currency}</span>
      </div>
      
      {subText && (
        <p className="text-[9px] font-black text-slate-400 mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brandSecondary animate-pulse"></span>
          {subText}
        </p>
      )}
    </div>

    {/* زخرفة خلفية ذكية */}
    <div className="absolute -right-6 -bottom-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none rotate-12">
       <span className="text-9xl">{icon}</span>
    </div>
  </div>
));
