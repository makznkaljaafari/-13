
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // إخفاء شاشة التحميل تدريجياً بعد رندر المكونات الأساسية
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        if (typeof (window as any).forceHideSpinner === 'function') {
          (window as any).forceHideSpinner();
        }
      }, 1000);
    });
  } catch (error) {
    console.error("Critical Startup Error:", error);
    if (typeof (window as any).forceHideSpinner === 'function') {
      (window as any).forceHideSpinner();
    }
  }
}

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
