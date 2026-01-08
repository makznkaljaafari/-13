
import React, { useEffect, useRef } from 'react';
import { UIProvider, useUI } from './UIContext';
import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider, useData } from './DataContext';
import { InventoryProvider } from './InventoryContext';
import { BusinessProvider } from './BusinessContext';
import { FinanceProvider } from './FinanceContext';
import { SystemProvider } from './SystemContext';
import { supabase } from '../services/supabaseClient';

const SyncManager: React.FC = () => {
  const { setIsLoggedIn, setUser, setIsCheckingSession } = useAuth();
  const { loadAllData } = useData();
  const { navigate, currentPage, addNotification } = useUI();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let isMounted = true;
    
    // تقليل وقت الانتظار ليكون أسرع في الاستجابة
    const authTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn("Auth check timed out, forcing UI unlock.");
        setIsCheckingSession(false);
      }
    }, 6000);

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (session && !error) {
          setIsLoggedIn(true);
          // تحميل البيانات في الخلفية لعدم تعطيل الواجهة
          loadAllData(session.user.id, true);
          if (currentPage === 'login') navigate('dashboard');
        } else {
          setIsLoggedIn(false);
          if (currentPage !== 'login') navigate('login');
        }
      } catch (err: any) {
        console.error("Auth Initialization Failed:", err);
        if (isMounted) setIsLoggedIn(false);
      } finally {
        if (isMounted) {
          clearTimeout(authTimeout);
          setIsCheckingSession(false);
          // استدعاء دالة إخفاء السبنر من index.html للتأكيد
          if ((window as any).forceHideSpinner) (window as any).forceHideSpinner();
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session) {
        setIsLoggedIn(true);
        loadAllData(session.user.id, true);
        if (currentPage === 'login') navigate('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUser(null);
        navigate('login');
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, [loadAllData, navigate, setIsLoggedIn, setUser, setIsCheckingSession, currentPage, addNotification]);

  return null;
};

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <InventoryProvider>
          <BusinessProvider>
            <FinanceProvider>
              <SystemProvider>
                <DataProvider>
                  <SyncManager />
                  {children}
                </DataProvider>
              </SystemProvider>
            </FinanceProvider>
          </BusinessProvider>
        </InventoryProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export const useApp = () => {
  const ui = useUI();
  const auth = useAuth();
  const data = useData();
  return { ...ui, ...auth, ...data };
};
