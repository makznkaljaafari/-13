
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// تسجيل الـ Service Worker لتمكين ميزات PWA والعمل دون اتصال
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // استخدام مسار نسبي لتجنب مشاكل الـ Origin في بيئات المعاينة
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => {
        console.log('✅ Al-Shwaia Smart SW Registered');
        
        // تحديث التطبيق فوراً عند وجود نسخة جديدة
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New version available, reloading...');
                window.location.reload();
              }
            };
          }
        };
      })
      .catch(err => console.warn('⚠️ SW Registration skipped or failed (Normal in some preview environments):', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical Error: Root element not found.");
}

// إخفاء مؤشر تحميل HTML الأساسي بمجرد جاهزية React
const htmlSpinner = document.getElementById('html-loading-spinner');
if (htmlSpinner) {
  htmlSpinner.style.display = 'none';
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
