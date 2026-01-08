
import { supabase } from '../supabaseClient';
import { logger } from '../loggerService';
import { indexedDbService } from '../indexedDbService';
import { authService } from '../authService';

export const CACHE_TTL = 30000; 
export const l1Cache: Record<string, { data: any, timestamp: number }> = {};

/**
 * تنظيف البيانات من الحقول المؤقتة قبل الإرسال للسيرفر
 */
export const cleanPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;
  const cleaned = { ...payload };
  const keysToRemove = [
    'image_base64_data', 'image_mime_type', 'image_file_name', 
    'record_type_for_image', 'tempId', 'originalId', 
    'created_at', 'updated_at', '_offline'
  ];
  keysToRemove.forEach(key => delete cleaned[key]);
  return cleaned;
};

/**
 * دالة التفافية للتعامل مع طلبات السحابة مع دعم السقوط الآمن للكاش
 */
export async function withRetry<T>(fn: () => Promise<{ data: T | null, error: any }>, key: string, forceFresh = false): Promise<T> {
  // 1. فحص الكاش السريع (L1)
  if (!forceFresh && l1Cache[key] && (Date.now() - l1Cache[key].timestamp < CACHE_TTL)) {
    return l1Cache[key].data as T;
  }
  
  try {
    // 2. محاولة جلب البيانات من Supabase
    const { data, error } = await fn();
    if (!error && data !== null) {
      l1Cache[key] = { data, timestamp: Date.now() };
      // تحديث IndexedDB في الخلفية
      indexedDbService.saveData(key, data).catch(e => logger.warn(`Cache persistence failed for ${key}`, e));
      return data;
    }
    if (error) throw error;
  } catch (err: any) {
    const isNetworkError = err.name === 'TypeError' || err.message?.toLowerCase().includes('fetch') || !navigator.onLine;
    
    if (isNetworkError) {
      logger.info(`Offline mode for ${key}. Falling back to IndexedDB.`);
    } else {
      logger.error(`Cloud fetch error for ${key}:`, err);
    }
  }
  
  // 3. السقوط الآمن (Fallback) للبيانات المحلية
  const localData = await indexedDbService.getData(key);
  return (localData || []) as T;
}

export const baseService = {
  async getUserId() {
    return authService.getUserId();
  },

  /**
   * إضافة العملية لطابور الانتظار عند فقدان الاتصال
   */
  async queueOffline(uid: string, action: string, payload: any) {
    const tempId = payload.id || crypto.randomUUID();
    const offlineRecord = { 
      ...payload, 
      id: tempId, 
      user_id: uid, 
      _offline: true,
      created_at: new Date().toISOString() 
    };

    await indexedDbService.addOperation({ 
      userId: uid, 
      action: action as any, 
      tempId, 
      payload: offlineRecord
    });

    return offlineRecord;
  },

  /**
   * دالة موحدة للحفظ الذكي (سحابي/محلي) مع تنظيف البيانات
   */
  async safeUpsert(table: string, payload: any, actionName: string, skipQueue = false) {
    const uid = await this.getUserId();
    if (!uid) throw new Error("Unauthenticated user session");

    const cleanedData = { ...cleanPayload(payload), user_id: uid };

    try {
      if (!navigator.onLine && !skipQueue) {
        return await this.queueOffline(uid, actionName, payload);
      }

      const { data, error } = await supabase
        .from(table)
        .upsert(cleanedData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        // إذا كان الخطأ بسبب الشبكة رغم أن المتصفح يقول أونلاين
        if (error.message?.includes('fetch') || error.code === 'PGRST101') {
          return await this.queueOffline(uid, actionName, payload);
        }
        throw error;
      }
      return data;
    } catch (e: any) {
      logger.error(`SafeUpsert critical failure in ${table}:`, e);
      // محاولة أخيرة للحفظ محلياً لضمان عدم ضياع عمل المستخدم
      if (!skipQueue) return await this.queueOffline(uid, actionName, payload);
      throw e;
    }
  }
};
