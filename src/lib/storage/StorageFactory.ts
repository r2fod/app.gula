import { StorageAdapter } from "./StorageAdapter";
import { SupabaseAdapter } from "./SupabaseAdapter";
import { LocalStorageAdapter } from "./LocalStorageAdapter";

export class StorageFactory {
  private static supabaseInstance: SupabaseAdapter | null = null;
  private static localStorageInstance: LocalStorageAdapter | null = null;

  static getAdapter(isDemo: boolean, userId?: string): StorageAdapter {
    if (isDemo) {
      if (!this.localStorageInstance) {
        this.localStorageInstance = new LocalStorageAdapter();
      }
      return this.localStorageInstance;
    } else {
      if (!this.supabaseInstance) {
        this.supabaseInstance = new SupabaseAdapter(userId);
      }
      return this.supabaseInstance;
    }
  }

  static reset(): void {
    this.supabaseInstance = null;
    this.localStorageInstance = null;
  }
}
