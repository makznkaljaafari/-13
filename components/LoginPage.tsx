
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useIsMounted } from '../hooks/useIsMounted';

const LoginPage: React.FC = () => {
  const { loginAction, registerAction, resetPasswordAction } = useAuth();
  const { theme, addNotification } = useUI();
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    agencyName: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState('');
  const isComponentMounted = useIsMounted();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير، رزقكم الله من واسع فضله ☀️');
    else setGreeting('مساء الخير، أهلاً بك في نظامك الذكي ✨');
    
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const emailToUse = formData.email.includes('@') ? formData.email : `${formData.email}@alshwaia.com`;

    try {
      if (isRegister) {
        await registerAction({
          agencyName: formData.agencyName,
          fullName: formData.fullName,
          email: emailToUse,
          password: formData.password
        });
      } else {
        await loginAction(emailToUse, formData.password);
        if (rememberMe) {
          localStorage.setItem('remembered_email', formData.email);
        } else {
          localStorage.removeItem('remembered_email');
        }
      }
    } catch (err: any) {
      if (!isComponentMounted()) return;
      const msg = err?.message || 'عذراً، تأكد من البيانات المدخلة أو جودة الاتصال';
      setError(msg);
    } finally {
      if (!isComponentMounted()) return;
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0f7ff] relative overflow-hidden">
      {/* خلفية ملونة بدلاً من الأبيض */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-400 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#1e40af] rounded-[2.5rem] flex items-center justify-center text-5xl sm:text-7xl shadow-2xl mx-auto border-4 border-[#dbeafe] text-white">
            🌿
          </div>
          <h1 className="text-4xl font-black text-[#001a41] mt-6 tracking-tighter">الشويع للقات</h1>
          <p className="font-bold text-[#1e40af] mt-2 opacity-80">{greeting}</p>
        </div>

        <div className="bg-[#dbeafe] p-6 sm:p-10 rounded-[3rem] shadow-2xl border-2 border-[#3b82f6]">
          <div className="bg-[#bfdbfe] p-1.5 rounded-2xl mb-8 flex border border-[#3b82f6]">
            <button 
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${!isRegister ? 'bg-[#1e40af] text-white shadow-lg' : 'text-[#1e40af]'}`}
            >دخول</button>
            <button 
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${isRegister ? 'bg-[#1e40af] text-white shadow-lg' : 'text-[#1e40af]'}`}
            >جديد</button>
          </div>

          <form onSubmit={handleAction} className="space-y-4">
            {error && <div className="p-4 rounded-xl text-[11px] font-black text-center bg-rose-100 border border-rose-300 text-rose-800">{error}</div>}

            {isRegister && (
              <input 
                type="text" 
                className="w-full rounded-xl p-4 font-black outline-none border-2 border-transparent focus:border-[#1e40af] bg-blue-50 text-[#001a41]"
                placeholder="اسم الوكالة"
                value={formData.agencyName}
                onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                required
              />
            )}
            
            <input 
              type="text" 
              className="w-full rounded-xl p-4 font-black outline-none border-2 border-transparent focus:border-[#1e40af] bg-blue-50 text-[#001a41]"
              placeholder="رقم الهاتف أو البريد"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />

            <input 
              type="password" 
              className="w-full rounded-xl p-4 font-black outline-none border-2 border-transparent focus:border-[#1e40af] bg-blue-50 text-[#001a41]"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white p-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 border-b-4 border-[#1e1b4b]"
            >
              {isLoading ? 'جاري التحميل...' : (isRegister ? 'فتح حساب' : 'دخول آمن')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
