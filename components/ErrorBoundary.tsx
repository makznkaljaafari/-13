import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

/**
 * مكون ErrorBoundary لمعالجة الأخطاء غير المتوقعة في التطبيق.
 * تم تحديثه لضمان التعرف الصحيح على الخصائص المورثة (setState, props) في TypeScript.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // تهيئة الحالة بشكل صريح لضمان وراثة النوع
  public state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
    errorInfo: undefined
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // استخدام ErrorInfo من React لضمان صحة أنواع المدخلات
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    // Fix: Using setState inherited from React.Component
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // إعادة تعيين الحالة للسماح للمستخدم بإعادة تشغيل التطبيق
    // Fix: Using setState inherited from React.Component
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/'; 
  };

  render() {
    // التحقق من وجود خطأ في الحالة المورثة
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-right" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-rose-500/20 text-center space-y-6">
            <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-6xl mx-auto animate-bounce">⚠️</div>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">عذراً، حدث خطأ تقني</h1>
            
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                واجه النظام مشكلة غير متوقعة أثناء معالجة البيانات. لا تقلق، بياناتك سحابية وآمنة.
              </p>
              {this.state.error && (
                <p className="text-[10px] font-mono text-rose-500 mt-2 opacity-60">
                  Code: {this.state.error.name} | {this.state.error.message.substring(0, 50)}...
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReset}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span>إعادة تشغيل النظام</span>
                <span>🔄</span>
              </button>
              
              <button 
                onClick={() => window.history.back()}
                className="w-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 p-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
              >
                العودة للصفحة السابقة
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold italic pt-4">إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني.</p>
          </div>
        </div>
      );
    }

    // Fix: Accessing children from props inherited from React.Component
    return this.props.children;
  }
}

export default ErrorBoundary;