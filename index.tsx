
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

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

// وظيفة لإخفاء السبنر بعد أن يصبح التطبيق جاهزاً
const hideLoadingSpinner = () => {
  const htmlSpinner = document.getElementById('html-loading-spinner');
  if (htmlSpinner) {
    htmlSpinner.style.opacity = '0';
    setTimeout(() => {
      htmlSpinner.style.display = 'none';
    }, 500);
  }
};

// تنفيذ الرندر ثم إخفاء السبنر
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // إخفاء بسيط بعد ثانية لضمان أن المكونات الأساسية بدأت بالتحميل
  setTimeout(hideLoadingSpinner, 1000);
} catch (e) {
  console.error("React Render Failed:", e);
}
