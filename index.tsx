
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// وظيفة إخفاء شاشة التحميل بأمان
const hideSpinner = () => {
  if (typeof (window as any).forceHideSpinner === 'function') {
    (window as any).forceHideSpinner();
  } else {
    const spinner = document.getElementById('html-loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }
};

const initApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical: Root element missing!");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // إخفاء السبنر بعد استقرار الواجهة قليلاً
    setTimeout(hideSpinner, 1000);
  } catch (e) {
    console.error("React Mounting Error:", e);
    hideSpinner();
  }
};

// تسجيل الـ Service Worker في الخلفية
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// البدء عند جاهزية المستند
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}
