
import React, { memo } from 'react';

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  icon?: string;
  error?: string;
  as?: 'input' | 'textarea';
}

/**
 * مكون المدخلات الأساسي المحسن: يستخدم memo ويدعم التنسيقات الموحدة
 */
export const BaseInput: React.FC<BaseInputProps> = memo(({ 
  label, icon, error, as = 'input', className = '', ...props 
}) => {
  const InputTag = as as any;
  
  const baseClasses = `
    w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 font-bold text-sm outline-none border-2 transition-all duration-300
    ${error ? 'border-rose-500' : 'border-transparent focus:border-brandPrimary focus:bg-white dark:focus:bg-slate-900 shadow-inner focus:shadow-xl'} 
    ${icon ? 'pr-12' : ''} 
    ${className}
  `.trim();

  return (
    <div className="space-y-1.5 w-full group">
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 group-focus-within:text-brandPrimary transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <InputTag className={baseClasses} {...props} />
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl transition-all group-focus-within:opacity-100 group-focus-within:scale-110 group-focus-within:text-brandPrimary">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-[9px] font-black text-rose-500 px-2 italic animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});
