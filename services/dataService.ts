
import { supabase } from './supabaseClient';
import { logger } from './loggerService';
import { indexedDbService } from './indexedDbService';
import { syncService } from './syncService';
import { salesService } from './api/sales';
import { inventoryService } from './api/inventory';
import { userService } from './api/user';
import { financeApiService } from './api/finance';
import { supabaseStorageService } from './supabaseStorageService';
import { cleanPayload } from './api/base';

export const dataService = {
  // Offline Synchronization Controller
  onOfflineQueueCountChange: (count: number) => {},
  
  async updateOfflineQueueCount() {
    const count = await indexedDbService.getQueueCount();
    this.onOfflineQueueCountChange(count);
  },

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
      updateSettings: this.updateSettings.bind(this),
    };

    await syncService.processQueue(uid, actions);
    this.updateOfflineQueueCount();
  },

  // Modules Integration
  ...inventoryService,
  ...salesService,
  ...userService,
  ...financeApiService,

  // Unified Deletion Utility
  async deleteRecord(table: string, id: string, imageUrl?: string) {
    const uid = await this.getUserId();
    if (!uid) throw new Error("Unauthenticated");

    if (imageUrl) {
      try { await supabaseStorageService.deleteImage(imageUrl); } catch (e) { logger.warn("Image deletion skipped during record delete", e); }
    }

    if (!navigator.onLine) {
      await indexedDbService.addOperation({ userId: uid, action: 'deleteRecord', payload: { table, id } });
      this.updateOfflineQueueCount();
      return true;
    }

    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', uid);
    if (error) throw error;
    return true;
  },

  // Tools
  base64ToBytes(base64: string): Uint8Array {
    const bin = window.atob(base64.split(',')[1] || base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
    return bytes;
  },

  async prepareBackupPackage(userId: string): Promise<any> {
    const results = await Promise.all([
      this.getCustomers(true), this.getSuppliers(true), this.getCategories(true),
      this.getSales(true), this.getPurchases(true), this.getVouchers(true),
      this.getExpenses(true), this.getWaste(true)
    ]);

    return {
      timestamp: new Date().toISOString(),
      metadata: { app: "Al-Shwaia Smart System", version: "4.0.0" },
      data: { 
        customers: results[0], suppliers: results[1], categories: results[2], 
        sales: results[3], purchases: results[4], vouchers: results[5], 
        expenses: results[6], waste: results[7] 
      }
    };
  },

  // Fix: Added restoreBackupData to allow system-wide data restoration from a backup package
  async restoreBackupData(userId: string, backup: any) {
    if (!backup || !backup.data) throw new Error("ملف النسخة الاحتياطية غير صالح.");
    const { customers, suppliers, categories, sales, purchases, vouchers, expenses, waste } = backup.data;

    const restore = async (table: string, data: any[]) => {
      if (!data || !Array.isArray(data) || data.length === 0) return;
      // Use cleanPayload to remove metadata/temporary fields before saving to cloud
      const { error } = await supabase.from(table).upsert(
        data.map(item => ({ ...cleanPayload(item), user_id: userId })),
        { onConflict: 'id' }
      );
      if (error) throw error;
    };

    try {
      await Promise.all([
        restore('customers', customers),
        restore('suppliers', suppliers),
        restore('categories', categories),
        restore('sales', sales),
        restore('purchases', purchases),
        restore('vouchers', vouchers),
        restore('expenses', expenses),
        restore('waste', waste),
      ]);
      logger.info("Data restoration completed successfully.");
    } catch (err) {
      logger.error("فشل في استعادة البيانات:", err);
      throw err;
    }
  }
};