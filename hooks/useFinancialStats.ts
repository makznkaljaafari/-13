
import { useMemo } from 'react';
import { Sale, Purchase, Expense, QatCategory, Currency } from '../types';

export const useFinancialStats = (
  sales: Sale[],
  purchases: Purchase[],
  expenses: Expense[],
  categories: QatCategory[],
  currency: Currency
) => {
  return useMemo(() => {
    // 1. تصفية العمليات النشطة والعملة المطلوبة
    const activeSales = sales.filter(s => !s.is_returned && s.currency === currency);
    const activePurchases = purchases.filter(p => !p.is_returned && p.currency === currency);
    const activeExpenses = expenses.filter(e => e.currency === currency);

    // 2. حساب المجاميع الأساسية
    const totalSales = activeSales.reduce((sum, s) => sum + s.total, 0);
    const totalPurchases = activePurchases.reduce((sum, p) => sum + p.total, 0);
    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // 3. حساب المؤشرات الربحية
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;
    
    // 4. قيمة المخزون الحالي بسعر البيع
    const stockValue = categories
      .filter(c => c.currency === currency)
      .reduce((sum, cat) => sum + (cat.stock * cat.price), 0);

    // 5. معدلات النمو (مبسطة)
    const salesVolume = activeSales.reduce((sum, s) => sum + s.quantity, 0);

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      grossProfit,
      netProfit,
      stockValue,
      salesVolume,
      activeSales,
      activePurchases,
      activeExpenses,
      currency
    };
  }, [sales, purchases, expenses, categories, currency]);
};
