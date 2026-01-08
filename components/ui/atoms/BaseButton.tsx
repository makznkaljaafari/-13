
import React, { memo } from 'react';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'vibrant';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  loading?: boolean;
}

/**
 * مكون الأزرار الأساسي: يستخدم memo ويوحد لغة التصميم في النظام
 */
export const BaseButton: React.FC<BaseButtonProps> = memo(({ 
  children, variant = 'primary', size = 'md', icon, loading, className = '', ...props 
}) => {
  const baseStyles = "relative flex items-center justify-center gap-3 font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-[1.2rem] shadow-lg border-b-4 overflow-hidden group";
  
  const variants = {
    primary: "bg-brandPrimary text-white hover:bg-blue-800 border-blue-950 shadow-blue-500/20",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-900 shadow-emerald-500/20",
    danger: "bg-rose-500 text-white hover:bg-rose-600 border-rose-800 shadow-rose-500/20",
    vibrant: "bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-indigo-900 shadow-indigo-500/20",
    secondary: "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 border-slate-300 dark:border-white/10 shadow-none",
    ghost: "bg-transparent border-2 border-slate-200 dark:border-white/10 text-slate-500 hover:border-brandPrimary hover:text-brandPrimary border-b-2"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-4 text-xs lg:text-sm",
    lg: "px-10 py-5 text-sm lg:text-lg",
    xl: "px-12 py-6 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-3">
           <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
           <span className="opacity-70">جاري المعالجة...</span>
        </div>
      ) : (
        <>
          {icon && <span className="text-xl group-hover:rotate-12 transition-transform">{icon}</span>}
          <span className="truncate tracking-tight">{children}</span>
        </>
      )}
      
      {/* تأثير لمعان (Shine) عند الحوم */}
      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg] pointer-events-none"></div>
    </button>
  );
});
