
import React, { memo, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  category: 'core' | 'finance' | 'admin';
}

const Sidebar: React.FC = memo(() => {
  const { currentPage, navigate, logoutAction, user, isSidebarCollapsed, toggleSidebar, theme } = useApp();

  const navigationConfig: NavItem[] = useMemo(() => [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠', category: 'core' },
    { id: 'sales', label: 'المبيعات', icon: '💰', category: 'core' },
    { id: 'purchases', label: 'المشتريات', icon: '📦', category: 'core' },
    { id: 'categories', label: 'المخزون', icon: '🌿', category: 'core' },
    
    { id: 'vouchers', label: 'السندات المالية', icon: '📥', category: 'finance' },
    { id: 'debts', label: 'كشف الميزانية', icon: '⚖️', category: 'finance' },
    { id: 'expenses', label: 'المصاريف التشغيلية', icon: '💸', category: 'finance' },
    
    { id: 'customers', label: 'دليل العملاء', icon: '👥', category: 'admin' },
    { id: 'suppliers', label: 'دليل الموردين', icon: '🚛', category: 'admin' },
    { id: 'reports', label: 'تقارير الأداء', icon: '📊', category: 'admin' },
    { id: 'activity-log', label: 'سجل الرقابة', icon: '🛡️', category: 'admin' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', category: 'admin' },
  ], []);

  const renderNavGroup = (category: string, title: string) => {
    const items = navigationConfig.filter(item => item.category === category);
    return (
      <div className="space-y-1 mb-6">
        {!isSidebarCollapsed && (
          <h4 className="px-6 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{title}</h4>
        )}
        {items.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-6 rounded-[1.5rem] font-black transition-all duration-300 ${
                isSidebarCollapsed ? 'justify-center p-4' : 'px-6 py-4 text-sm'
              } ${
                isActive
                  ? 'bg-brandPrimary text-white shadow-xl translate-x-[-8px]'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brandPrimary'
              }`}
            >
              <span className={`${isSidebarCollapsed ? 'text-3xl' : 'text-2xl'}`}>{item.icon}</span>
              {!isSidebarCollapsed && <span className="flex-1 text-right">{item.label}</span>}
              {!isSidebarCollapsed && isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm"></div>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside 
      className={`hidden lg:flex flex-col h-screen sticky top-0 right-0 z-50 transition-all duration-500 overflow-y-auto no-scrollbar shadow-2xl border-l ${
        isSidebarCollapsed ? 'w-24' : 'w-80'
      } ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}
    >
      <button 
        onClick={toggleSidebar}
        className="absolute left-4 top-10 w-10 h-10 bg-brandPrimary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white dark:border-slate-800"
      >
        <span className={`transition-transform duration-500 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}>←</span>
      </button>

      <div className={`p-8 flex flex-col h-full ${isSidebarCollapsed ? 'items-center' : ''}`}>
        {/* Logo Section */}
        <div className="flex items-center gap-6 mb-16 group cursor-pointer" onClick={() => navigate('dashboard')}>
          <div className={`rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/20 transition-all ${
            isSidebarCollapsed ? 'w-14 h-14 text-2xl' : 'w-18 h-18 text-3xl'
          } bg-brandPrimary`}>🌿</div>
          {!isSidebarCollapsed && (
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-brandPrimary dark:text-white">الشويع الذكي</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">نظام إدارة الوكالات</p>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1">
          {renderNavGroup('core', 'العمليات الأساسية')}
          {renderNavGroup('finance', 'المالية والحسابات')}
          {renderNavGroup('admin', 'الإدارة والرقابة')}
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                {user?.full_name?.[0] || 'A'}
              </div>
              <div className="text-right flex-1 min-w-0">
                <p className="text-sm font-black truncate">{user?.full_name || 'المدير'}</p>
                <p className="text-[10px] text-slate-400 truncate italic">Administrator</p>
              </div>
            </div>
          )}
          <button 
            onClick={logoutAction} 
            className={`w-full flex items-center gap-6 rounded-2xl font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all ${
              isSidebarCollapsed ? 'justify-center p-4' : 'px-6 py-4 text-sm'
            }`}
          >
            <span className="text-2xl">🚪</span>
            {!isSidebarCollapsed && <span className="flex-1 text-right">خروج آمن</span>}
          </button>
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;
