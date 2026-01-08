
import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GlobalSearch } from './molecules/GlobalSearch';

interface LayoutProps {
  title: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  floatingButton?: React.ReactNode;
}

export const PageLayout: React.FC<LayoutProps> = memo(({ title, headerExtra, children, onBack, floatingButton }) => {
  const { navigate, user, theme, toggleTheme } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex flex-col h-full w-full relative">
      <GlobalSearch isOpen={isSearchOpen} onClose={useCallback(() => setIsSearchOpen(false), [])} />

      <div className="z-40 w-full flex flex-col items-center px-4 pt-4 lg:pt-8 shrink-0">
        <header className="w-full max-w-7xl rounded-[2.2rem] shadow-2xl overflow-hidden border-2 border-[var(--color-border-primary)] bg-brandPrimary">
          <div className="flex items-center justify-between px-6 h-20">
            
            <div className="flex items-center gap-4">
              {onBack && (
                <button 
                  onClick={onBack} 
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl text-white transition-all"
                >
                  →
                </button>
              )}
              <div>
                <h1 className="text-lg lg:text-2xl font-black text-white leading-none">{title}</h1>
                <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mt-1 opacity-70">وكالة الشويع للقات</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg text-white"
               >🔍</button>
               <button 
                  onClick={toggleTheme} 
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg text-white"
               >{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl px-4 py-4 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <span className="text-xl">🌿</span>
              <p className="text-sm font-black text-[var(--color-text-primary)]">أهلاً، <span className="text-brandPrimary dark:text-blue-400">{user?.full_name || 'المدير'}</span></p>
           </div>
           <div className="bg-brandPrimary/10 px-4 py-1.5 rounded-full border border-brandPrimary/20">
              <span className="text-[10px] font-black text-brandPrimary dark:text-blue-300 tabular-nums">
                🕒 {currentTime.toLocaleTimeString('ar-YE', {hour:'2-digit', minute:'2-digit'})}
              </span>
           </div>
        </div>
      </div>

      <main className="flex-1 w-full px-4 lg:px-8 pb-32 overflow-y-auto no-scrollbar flex flex-col items-center">
        <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {floatingButton && (
        <div className="fixed bottom-24 right-8 z-[100]">
          {floatingButton}
        </div>
      )}
    </div>
  );
});
