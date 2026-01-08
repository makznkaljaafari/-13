
import React, { memo } from 'react';
import { useApp } from '../context/AppContext';

const BottomNav: React.FC = memo(() => {
  const { currentPage, navigate, resolvedTheme } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'sales', label: 'المبيعات', icon: '💰' },
    { id: 'add-sale', label: 'إضافة', icon: '＋', primary: true },
    { id: 'ai-advisor', label: 'الذكاء', icon: '🤖' },
    { id: 'customers', label: 'العملاء', icon: '👥' },
  ];

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-safe pointer-events-none lg:hidden">
      <nav 
        className={`w-full max-w-md h-16 flex justify-around items-center rounded-t-[2.5rem] shadow-[0_-15px_50px_-10px_rgba(0,0,0,0.3)] pointer-events-auto border-t-2 ${
          isDark 
            ? 'bg-[#0f172a] border-slate-800' 
            : 'bg-white border-slate-100'
        }`} 
        aria-label="شريط التنقل الرئيسي"
      >
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          
          return (
            <button 
              key={item.id}
              onClick={() => navigate(item.id as any)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center transition-all relative flex-1 h-full ${
                item.primary ? 'pb-0' : 'active:scale-90'
              }`}
            >
              {item.primary ? (
                <div className="relative -top-7">
                  <div 
                    className="w-16 h-16 bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] rounded-[1.8rem] flex items-center justify-center text-4xl text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.6)] border-4 border-white dark:border-[#0f172a] transform transition-transform active:scale-90"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center pt-1 transition-all duration-300">
                  <span 
                    className={`text-2xl mb-0.5 transition-all duration-300 ${
                      isActive 
                        ? 'scale-110 grayscale-0 opacity-100 translate-y-[-2px]' 
                        : 'grayscale-[0.5] opacity-40'
                    }`} 
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span 
                    className={`text-[9px] font-[900] tracking-tight uppercase transition-colors duration-300 ${
                      isActive 
                        ? (isDark ? 'text-blue-400' : 'text-[#1e3a8a]') 
                        : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                  
                  {/* مؤشر النشاط السفلي - خط أنيق */}
                  {isActive && (
                    <div 
                      className={`absolute bottom-1 w-6 h-1 rounded-full animate-in fade-in zoom-in duration-300 ${
                        isDark ? 'bg-blue-400' : 'bg-[#1e3a8a]'
                      }`} 
                      aria-hidden="true"
                    ></div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
});

export default BottomNav;
