
import { supabase } from './supabaseClient';
import { logger } from './loggerService';
import { indexedDbService } from './indexedDbService';
import { syncService } from './syncService';
import { baseService, cleanPayload } from './api/base';
import { salesService } from './api/sales';
import { inventoryService } from './api/inventory';
import { userService } from './api/user';
import { financeApiService } from './api/finance';

export const dataService = {
  onOfflineQueueCountChange: (count: number) => {},
  
  async updateOfflineQueueCount() {
    const count = await indexedDbService.getQueueCount();
    this.onOfflineQueueCountChange(count);
  },

  // Auth & Profile
  getUserId: userService.getUserId,
  ensureUserExists: userService.ensureUserExists,
  getFullProfile: userService.getFullProfile,
  updateProfile: userService.updateProfile,
  updateSettings: userService.updateSettings,

  // Global Sync logic remains central
  async processOfflineQueue() {
    const uid = await this.getUserId();
    if (!uid) return;
    
    const actions = {
      saveSale: this.saveSale.bind(this),
      savePurchase: this.savePurchase.bind(this),
      saveCustomer: this.saveCustomer.bind(this),
      saveSupplier: this.saveSupplier.bind(this),
      saveVoucher: this.saveVoucher.bind(this),
      saveExpense: this.saveExpense.bind(this),
      saveCategory: this.saveCategory.bind(this),
      deleteRecord: this.deleteRecord.bind(this),
      returnSale: this.returnSale.bind(this),
      returnPurchase: this.returnPurchase.bind(this),
      updateSettings: this.updateSettings.bind(this),
      saveWaste: this.saveWaste.bind(this),
      saveOpeningBalance: this.saveOpeningBalance.bind(this),
      saveExpenseTemplate: this.saveExpenseTemplate.bind(this),
      saveNotification: this.saveNotification.bind(this)
    };

    await syncService.processQueue(uid, actions);
    this.updateOfflineQueueCount();
  },

  // Inventory
  getCategories: inventoryService.getCategories,
  getWaste: inventoryService.getWaste,
  saveCategory: inventoryService.saveCategory,
  saveWaste: inventoryService.saveWaste,

  // Sales & Business
  getSales: salesService.getSales,
  getPurchases: salesService.getPurchases,
  saveSale: salesService.saveSale,
  savePurchase: salesService.savePurchase,
  returnSale: salesService.returnSale,
  returnPurchase: salesService.returnPurchase,

  // CRM
  getCustomers: userService.getCustomers,
  getSuppliers: userService.getSuppliers,
  saveCustomer: userService.saveCustomer,
  saveSupplier: userService.saveSupplier,

  // Finance
  getVouchers: financeApiService.getVouchers,
  getExpenses: financeApiService.getExpenses,
  getExpenseTemplates: financeApiService.getExpenseTemplates,
  saveVoucher: financeApiService.saveVoucher,
  saveExpense: financeApiService.saveExpense,
  saveExpenseTemplate: financeApiService.saveExpenseTemplate,
  saveOpeningBalance: financeApiService.saveOpeningBalance,

  // Notifications & Logging
  getNotifications: userService.getNotifications,
  getActivityLogs: userService.getActivityLogs,
  saveNotification: userService.saveNotification,
  markAllNotificationsRead: userService.markAllNotificationsRead,
  deleteAllNotificationsOlderThan: userService.deleteAllNotificationsOlderThan,
  logActivity: userService.logActivity,

  // Core Utilities
  async deleteRecord(table: string, id: string, imageUrl?: string, recordTypeForImage?: string, skipQueue = false) {
    const uid = await this.getUserId();
    if (!uid) throw new Error("Unauthenticated");

    if (!navigator.onLine && !skipQueue) {
      await indexedDbService.addOperation({ userId: uid!, action: 'deleteRecord', tableName: table, originalId: id, payload: { id, imageUrl, record_type_for_image: recordTypeForImage } });
      this.updateOfflineQueueCount();
      return true;
    }
    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', uid);
    if (error) throw error;
    return true;
  },

  base64ToBytes(base64: string): Uint8Array {
    const binary_string = window.atob(base64.split(',')[1] || base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binary_string.charCodeAt(i); }
    return bytes;
  },

  async prepareBackupPackage(userId: string, currentData?: any): Promise<any> {
    if (!userId) throw new Error("User ID required for backup");
    const backup = {
      timestamp: new Date().toISOString(),
      metadata: { app: "Al-Shwaia Smart System", version: "3.1.0" },
      userProfile: currentData?.profile || await this.getFullProfile(userId),
      customers: currentData?.customers || await this.getCustomers(true),
      suppliers: currentData?.suppliers || await this.getSuppliers(true),
      categories: currentData?.categories || await this.getCategories(true),
      sales: currentData?.sales || await this.getSales(true),
      purchases: currentData?.purchases || await this.getPurchases(true),
      vouchers: currentData?.vouchers || await this.getVouchers(true),
      expenses: currentData?.expenses || await this.getExpenses(true),
      waste: currentData?.waste || await this.getWaste(true),
      notifications: currentData?.notifications || await this.getNotifications(true),
      expenseTemplates: currentData?.expenseTemplates || await this.getExpenseTemplates(true),
    };
    return backup;
  },

  async restoreBackupData(userId: string, backup: any): Promise<void> {
    if (!userId) throw new Error("User ID required for restoration");
    
    const collections = [
      { key: 'customers', table: 'customers' },
      { key: 'suppliers', table: 'suppliers' },
      { key: 'categories', table: 'categories' },
      { key: 'sales', table: 'sales' },
      { key: 'purchases', table: 'purchases' },
      { key: 'vouchers', table: 'vouchers' },
      { key: 'expenses', table: 'expenses' },
      { key: 'waste', table: 'waste' },
      { key: 'expenseTemplates', table: 'expense_templates' }
    ];

    for (const collection of collections) {
      const data = backup[collection.key];
      if (Array.isArray(data) && data.length > 0) {
        logger.info(`Restoring ${data.length} records for ${collection.table}...`);
        
        const cleanedData = data.map(item => ({
          ...cleanPayload(item),
          user_id: userId
        }));

        const chunkSize = 50;
        for (let i = 0; i < cleanedData.length; i += chunkSize) {
          const chunk = cleanedData.slice(i, i + chunkSize);
          const { error } = await supabase.from(collection.table).upsert(chunk);
          if (error) {
            logger.error(`Error restoring chunk for ${collection.table}:`, error);
          }
        }
      }
    }
  }
};
