
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Voucher, Expense, Waste, ExchangeRates, ExpenseTemplate } from '../types';
import { dataService } from '../services/dataService';
import { useUI } from './UIContext';
import { useInventory } from './InventoryContext';
import { useAuth } from './AuthContext';
import { logger } from '../services/loggerService';
import { voucherSchema, expenseSchema, wasteSchema } from '../schemas';

const FinanceContext = createContext<any>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, triggerFeedback, isOnline } = useUI();
  const { setCategories } = useInventory();
  const { user } = useAuth();
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseTemplates, setExpenseTemplates] = useState<ExpenseTemplate[]>([]);
  const [wasteRecords, setWasteRecords] = useState<Waste[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ SAR_TO_YER: 430, OMR_TO_YER: 425 });
  const [expenseCategories] = useState<string[]>(['نثرية', 'كهرباء', 'إيجار', 'غداء', 'حوافز']);

  const addVoucher = useCallback(async (v: any) => {
    if (!user?.id) throw new Error("User session required");
    
    const validation = voucherSchema.safeParse(v);
    if (!validation.success) throw new Error(validation.error.errors[0].message);

    const tempId = v.id || crypto.randomUUID();
    const isEditing = !!v.id;
    const optimisticVoucher = { ...v, id: tempId, created_at: new Date().toISOString() };
    
    setVouchers(prev => [optimisticVoucher, ...prev.filter(item => item.id !== tempId)]);

    if (v.type === 'قبض') triggerFeedback('celebration');

    try {
      const saved = await dataService.saveVoucher(v);
      setVouchers(prev => prev.map(item => item.id === tempId ? saved : item));
      dataService.logActivity(user.id, isEditing ? "تعديل سند" : "إضافة سند", `${saved.person_name} - ${saved.amount} ${saved.currency}`, 'voucher');
    } catch (e: any) {
      if (isOnline) setVouchers(prev => prev.filter(item => item.id !== tempId));
      throw e;
    }
  }, [user, triggerFeedback, isOnline]);

  const addExpense = useCallback(async (e: any) => {
    if (!user?.id) throw new Error("User session required");
    
    const validation = expenseSchema.safeParse(e);
    if (!validation.success) throw new Error(validation.error.errors[0].message);

    const tempId = e.id || crypto.randomUUID();
    const isEditing = !!e.id;
    const optimisticExp = { ...e, id: tempId, date: e.date || new Date().toISOString() };
    
    setExpenses(prev => [optimisticExp, ...prev.filter(item => item.id !== tempId)]);

    try {
      const saved = await dataService.saveExpense(e);
      setExpenses(prev => prev.map(item => item.id === tempId ? saved : item));
      dataService.logActivity(user.id, isEditing ? "تعديل مصروف" : "إضافة مصروف", `${saved.title} - ${saved.amount}`, 'expense');
    } catch (err: any) {
      if (isOnline) setExpenses(prev => prev.filter(item => item.id !== tempId));
      throw err;
    }
  }, [user, isOnline]);

  const addWaste = useCallback(async (w: any) => {
    const validation = wasteSchema.safeParse(w);
    if (!validation.success) throw new Error(validation.error.errors[0].message);

    const saved = await dataService.saveWaste(w);
    setWasteRecords(prev => [saved, ...prev]);
    // تحديث المخزون يتم استدعاؤه من الـ UI أو عبر الـ hook المساعد لضمان التوافق
    return saved;
  }, []);

  const value = useMemo(() => ({
    vouchers, setVouchers, expenses, setExpenses, expenseTemplates, setExpenseTemplates,
    wasteRecords, setWasteRecords, exchangeRates, setExchangeRates, expenseCategories,
    addVoucher, addExpense, addWaste,
    updateExchangeRates: async (rates: ExchangeRates) => {
      setExchangeRates(rates);
      if (user?.id) await dataService.updateSettings(user.id, { exchange_rates: rates });
    }
  }), [vouchers, expenses, expenseTemplates, wasteRecords, exchangeRates, expenseCategories, addVoucher, addExpense, addWaste, user?.id]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => useContext(FinanceContext);
