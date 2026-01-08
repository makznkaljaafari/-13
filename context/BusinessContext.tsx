
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Customer, Supplier, Sale, Purchase } from '../types';
import { dataService } from '../services/dataService';
import { useUI } from './UIContext';
import { useInventory } from './InventoryContext';
import { useAuth } from './AuthContext';
import { logger } from '../services/loggerService';
import { saleSchema, purchaseSchema, customerSchema, supplierSchema } from '../schemas';

const BusinessContext = createContext<any>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification, triggerFeedback, isOnline } = useUI();
  const { setCategories, categories } = useInventory();
  const { user } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // تحسين: دالة تنسيق القيم أصبحت ثابتة المرجع لتقليل إعادة الرندر
  const formatValue = useCallback((val: number | string) => {
    const precision = user?.accounting_settings?.decimal_precision ?? 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : parseFloat(num.toFixed(precision));
  }, [user?.accounting_settings?.decimal_precision]);

  const updateInternalStock = useCallback((qatType: string, change: number) => {
    setCategories((prev: any[]) => prev.map((cat: any) => 
      cat.name === qatType ? { ...cat, stock: formatValue(Number(cat.stock) + change) } : cat
    ));
  }, [setCategories, formatValue]);

  // تحسين: توحيد منطق الحفظ لتقليل التكرار البرمجي
  const processTransaction = useCallback(async (
    data: any, 
    schema: any, 
    type: 'sale' | 'purchase',
    saveFn: (d: any) => Promise<any>,
    logAction: string
  ) => {
    if (!user?.id) throw new Error("Unauthenticated");
    
    const validation = schema.safeParse(data);
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || "بيانات غير صالحة";
      addNotification("خطأ في البيانات ❌", errorMsg, "warning");
      throw new Error(errorMsg);
    }

    const isEditing = !!data.id;
    const list = type === 'sale' ? sales : purchases;
    const setter = type === 'sale' ? setSales : setPurchases;
    const oldRecord = isEditing ? list.find((r: any) => r.id === data.id) : null;
    
    // حساب فرق المخزون
    const changeQty = type === 'sale' 
      ? data.quantity - (oldRecord?.quantity || 0)
      : (oldRecord?.quantity || 0) - data.quantity;

    // فحص المخزون للمبيعات فقط
    if (type === 'sale' && !(user?.accounting_settings?.allow_negative_stock)) {
      const category = categories.find((c: any) => c.name === data.qat_type);
      if (category && category.stock < changeQty) {
        addNotification("المخزون غير كافٍ ✋", `المتوفر من ${data.qat_type} هو ${category.stock} حبة فقط.`, "warning");
        throw new Error("Insufficient stock");
      }
    }

    const tempId = data.id || crypto.randomUUID();
    const finalData = { ...data, id: tempId, total: formatValue(Number(data.quantity) * Number(data.unit_price)) };
    
    // التحديث المتفائل للواجهة
    setter((prev: any[]) => {
      const idx = prev.findIndex(item => item.id === tempId);
      return idx > -1 ? prev.map(item => item.id === tempId ? finalData : item) : [finalData, ...prev];
    });

    // تحديث المخزون داخلياً (تغيير الإشارة حسب النوع)
    updateInternalStock(data.qat_type, type === 'sale' ? -changeQty : -changeQty);

    try {
      const saved = await saveFn(finalData);
      setter((prev: any[]) => prev.map(item => item.id === tempId ? saved : item));
      if (type === 'sale') triggerFeedback(data.status === 'نقدي' ? 'celebration' : 'debt');
      dataService.logActivity(user.id, `${isEditing ? 'تعديل' : 'إضافة'} ${logAction}`, `${data.qat_type}`, type);
      return saved;
    } catch (e: any) {
      if (isOnline) {
        setter((prev: any[]) => isEditing ? (oldRecord ? prev.map(r => r.id === data.id ? oldRecord : r) : prev) : prev.filter(item => item.id !== tempId));
        updateInternalStock(data.qat_type, type === 'sale' ? changeQty : changeQty);
      }
      throw e;
    }
  }, [user, categories, sales, purchases, formatValue, updateInternalStock, addNotification, triggerFeedback, isOnline]);

  const addSale = useCallback((s: any) => 
    processTransaction(s, saleSchema, 'sale', dataService.saveSale.bind(dataService), "بيع"),
  [processTransaction]);

  const addPurchase = useCallback((p: any) => 
    processTransaction(p, purchaseSchema, 'purchase', dataService.savePurchase.bind(dataService), "شراء"),
  [processTransaction]);

  const addCustomer = useCallback(async (c: any) => {
    const validation = customerSchema.safeParse(c);
    if (!validation.success) throw new Error(validation.error.errors[0].message);
    const saved = await dataService.saveCustomer(c);
    setCustomers(prev => {
        const exists = prev.find(item => item.id === saved.id);
        return exists ? prev.map(item => item.id === saved.id ? saved : item) : [saved, ...prev];
    });
    return saved;
  }, []);

  const addSupplier = useCallback(async (s: any) => {
    const validation = supplierSchema.safeParse(s);
    if (!validation.success) throw new Error(validation.error.errors[0].message);
    const saved = await dataService.saveSupplier(s);
    setSuppliers(prev => {
        const exists = prev.find(item => item.id === saved.id);
        return exists ? prev.map(item => item.id === saved.id ? saved : item) : [saved, ...prev];
    });
    return saved;
  }, []);

  const value = useMemo(() => ({
    customers, setCustomers, suppliers, setSuppliers, sales, setSales, purchases, setPurchases,
    addSale, addPurchase, addCustomer, addSupplier, formatValue, updateInternalStock,
    returnSale: async (id: string) => {
       await dataService.returnSale(id);
       const sale = sales.find(s => s.id === id);
       if (sale) updateInternalStock(sale.qat_type, sale.quantity);
       setSales(prev => prev.map(s => s.id === id ? { ...s, is_returned: true, returned_at: new Date().toISOString() } : s));
    },
    deleteSale: async (id: string) => {
       const sale = sales.find(s => s.id === id);
       await dataService.deleteRecord('sales', id);
       if (sale && !sale.is_returned) updateInternalStock(sale.qat_type, sale.quantity);
       setSales(prev => prev.filter(s => s.id !== id));
    },
    deletePurchase: async (id: string) => {
       const purchase = purchases.find(p => p.id === id);
       await dataService.deleteRecord('purchases', id);
       if (purchase && !purchase.is_returned) updateInternalStock(purchase.qat_type, -purchase.quantity);
       setPurchases(prev => prev.filter(p => p.id !== id));
    },
    deleteCustomer: async (id: string) => {
       await dataService.deleteRecord('customers', id);
       setCustomers(prev => prev.filter(c => c.id !== id));
    },
    deleteSupplier: async (id: string) => {
       await dataService.deleteRecord('suppliers', id);
       setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  }), [customers, suppliers, sales, purchases, addSale, addPurchase, addCustomer, addSupplier, formatValue, updateInternalStock]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};

export const useBusiness = () => useContext(BusinessContext);
