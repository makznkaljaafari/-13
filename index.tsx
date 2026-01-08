
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// تسجيل الـ Service Worker بطريقة لا تعيق التحميل الأول
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(err => console.warn('SW registration failed:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical Error: Root element not found.");
}

const root = createRoot(rootElement);

// دالة إخفاء شاشة التحميل
const hideSpinner = () => {
  if ((window as any).forceHideSpinner) {
    (window as any).forceHideSpinner();
  } else {
    const spinner = document.getElementById('html-loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }
};

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // إخفاء السبنر بعد وقت قصير من الرندر لضمان ظهور أول مكون
  setTimeout(hideSpinner, 1500);
} catch (e) {
  console.error("React Error:", e);
  hideSpinner();
}
