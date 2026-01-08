
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// وظيفة إخفاء السبنر بأمان
const hideLoadingScreen = () => {
  if (typeof (window as any).forceHideSpinner === 'function') {
    (window as any).forceHideSpinner();
  } else {
    const el = document.getElementById('html-loading-spinner');
    if (el) el.style.display = 'none';
  }
};

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // إخفاء شاشة التحميل بعد استقرار التطبيق في الذاكرة
    setTimeout(hideLoadingScreen, 1200);
  } catch (error) {
    console.error("Failed to mount React application:", error);
    hideLoadingScreen();
  }
}

// تسجيل Service Worker في الخلفية لتحسين الأداء
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
