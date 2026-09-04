import { useState, useCallback, useEffect } from "react";
import { localDb } from "@/lib/db/localDb";

export function useDataSync() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Basic offline/online listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  /**
   * Sync data fetched from Supabase directly into Dexie local storage.
   */
  const cacheDataLocally = async (tableName: keyof typeof localDb, data: any[]) => {
    if (!data || data.length === 0) return;
    try {
      // @ts-ignore - Dynamic table access
      const table = localDb[tableName];
      if (table) {
        await table.bulkPut(data);
      }
    } catch (err) {
      console.error(`Failed to cache ${tableName} locally:`, err);
    }
  };

  /**
   * Wrapper for fetching data. It attempts the online query first,
   * falls back to the local database if network fails.
   * 
   * @param tableName The name of the Dexie table (e.g. 'jobs', 'applications')
   * @param onlineFetchPromise The Supabase query promise
   */
  const fetchWithFallback = useCallback(async <T>(
    tableName: keyof typeof localDb,
    onlineFetchPromise: Promise<{ data: T[] | null; error: any }>
  ) => {
    try {
      // Force error if we know we're offline
      if (!navigator.onLine) throw new Error("Offline");

      const { data, error } = await onlineFetchPromise;
      if (error) throw error;
      
      if (data) {
        await cacheDataLocally(tableName, data);
      }
      
      setIsOffline(false);
      return { data: data ?? [], error: null, source: "online" as const };
    } catch (err) {
      console.warn(`[Sync] Online fetch failed for ${tableName}, falling back to local DB.`, err);
      setIsOffline(true);
      
      try {
        // @ts-ignore
        const table = localDb[tableName];
        if (!table) throw new Error(`Table ${tableName} not found in local DB.`);
        
        const localData = await table.toArray();
        return { data: localData as T[], error: null, source: "local" as const };
      } catch (localErr: any) {
        return { data: [], error: localErr, source: "local" as const };
      }
    }
  }, []);

  /**
   * Wrapper for offline writes. Attempts online first. If it fails, saves to Dexie
   * with a 'is_pending_sync: true' flag.
   */
  const writeWithFallback = useCallback(async <T extends { id: string }>(
    tableName: keyof typeof localDb,
    record: T,
    onlineWritePromise: Promise<{ error: any }>
  ) => {
    try {
      if (!navigator.onLine) throw new Error("Offline");
      const { error } = await onlineWritePromise;
      if (error) throw error;
      
      // Update local cache to match
      // @ts-ignore
      await localDb[tableName].put({ ...record, is_pending_sync: false });
      return { success: true, offline: false };
    } catch (err) {
      console.warn(`[Sync] Online write failed for ${tableName}. Saving to local queue.`, err);
      
      // @ts-ignore
      await localDb[tableName].put({ ...record, is_pending_sync: true });
      return { success: true, offline: true };
    }
  }, []);

  return { fetchWithFallback, writeWithFallback, isOffline };
}
