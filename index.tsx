
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// إخفاء السبنر فوراً عند بدء تنفيذ السكريبت
const htmlSpinner = document.getElementById('html-loading-spinner');
if (htmlSpinner) {
  htmlSpinner.style.display = 'none';
}

// تسجيل الـ Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => console.log('✅ Al-Shwaia Smart SW Registered'))
      .catch(err => console.warn('⚠️ SW Registration skipped:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical Error: Root element not found.");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
