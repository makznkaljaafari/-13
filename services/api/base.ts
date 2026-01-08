
import { supabase } from '../supabaseClient';
import { logger } from '../loggerService';
import { indexedDbService } from '../indexedDbService';
import { authService } from '../authService';

export const CACHE_TTL = 30000; 
export const l1Cache: Record<string, { data: any, timestamp: number }> = {};

export const cleanPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;
  const cleaned = { ...payload };
  const keysToRemove = ['image_base64_data', 'image_mime_type', 'image_file_name', 'record_type_for_image', 'tempId', 'originalId', 'created_at', 'updated_at', '_offline'];
  keysToRemove.forEach(key => delete cleaned[key]);
  return cleaned;
};

export async function withRetry<T>(fn: () => Promise<{ data: T | null, error: any }>, key: string, forceFresh = false): Promise<T> {
  if (!forceFresh && l1Cache[key] && (Date.now() - l1Cache[key].timestamp < CACHE_TTL)) {
    return l1Cache[key].data as T;
  }
  
  // نحاول دائماً الاتصال بالسحابة أولاً، ونتعامل مع الخطأ بمرونة
  try {
    const { data, error } = await fn();
    if (!error && data !== null) {
      l1Cache[key] = { data, timestamp: Date.now() };
      indexedDbService.saveData(key, data).catch(() => {});
      return data;
    }
    if (error) throw error;
  } catch (err: any) {
    const isNetworkError = err.name === 'TypeError' || err.message?.toLowerCase().includes('fetch') || !navigator.onLine;
    
    if (!isNetworkError) {
      logger.warn(`Cloud fetch error for ${key}:`, err);
    } else {
      logger.info(`Offline mode or network error for ${key}. Falling back to cache.`);
    }
  }
  
  // السقوط الآمن (Fallback) للبيانات المحلية في حال فشل الشبكة
  const localData = await indexedDbService.getData(key);
  return (localData || []) as T;
}

export const baseService = {
  async getUserId() {
    return authService.getUserId();
  },

  async queueOffline(uid: string, action: string, payload: any) {
    const tempId = payload.id || crypto.randomUUID();
    await indexedDbService.addOperation({ 
      userId: uid, 
      action: action as any, 
      tempId, 
      payload: { ...payload, id: tempId, user_id: uid } 
    });
    return { ...payload, id: tempId, created_at: new Date().toISOString(), _offline: true };
  },

  async safeUpsert(table: string, payload: any, actionName: string, skipQueue = false) {
    const uid = await this.getUserId();
    if (!uid) throw new Error("Unauthenticated");

    try {
      if (!navigator.onLine && !skipQueue) {
        return await this.queueOffline(uid, actionName, payload);
      }

      const { data, error } = await supabase.from(table).upsert({ ...cleanPayload(payload), user_id: uid }).select().single();
      if (error) throw error;
      return data;
    } catch (e: any) {
      const isNetworkError = e.name === 'TypeError' || e.message?.toLowerCase().includes('fetch') || !navigator.onLine;
      
      if (isNetworkError && !skipQueue) {
        logger.info(`Request to ${table} failed due to network. Queuing offline...`);
        return await this.queueOffline(uid, actionName, payload);
      }
      
      logger.error(`SafeUpsert Error in ${table}:`, e);
      throw e;
    }
  }
};
