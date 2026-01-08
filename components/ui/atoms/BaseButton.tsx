
import React from 'react';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'vibrant';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  loading?: boolean;
}

export const BaseButton: React.FC<BaseButtonProps> = ({ 
  children, variant = 'primary', size = 'md', icon, loading, className, ...props 
}) => {
  const baseStyles = "relative flex items-center justify-center gap-3 font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-2xl shadow-lg border-b-4 overflow-hidden";
  
  const variants = {
    primary: "bg-brandPrimary text-white hover:bg-blue-700 border-blue-900 shadow-blue-500/20",
    success: "bg-brandSuccess text-white hover:bg-emerald-700 border-emerald-900 shadow-emerald-500/20",
    danger: "bg-brandDanger text-white hover:bg-rose-700 border-rose-900 shadow-rose-500/20",
    vibrant: "bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-indigo-900",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 shadow-none",
    ghost: "bg-transparent border-2 border-slate-200 text-slate-500 hover:border-brandPrimary hover:text-brandPrimary border-b-2"
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
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          {icon && <span className="text-xl">{icon}</span>}
          <span className="truncate">{children}</span>
        </>
      )}
    </button>
  );
};
