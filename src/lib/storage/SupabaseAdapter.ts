import { createClient } from "@supabase/supabase-js";
import { StorageAdapter } from "./StorageAdapter";
import { Database } from "@/integrations/supabase/types";

export class SupabaseAdapter implements StorageAdapter {
  private supabase;

  constructor(userId?: string) {
    this.supabase = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async get<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    let query = this.supabase.from(table as any).select("*");

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as T[]) || [];
  }

  async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(table as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as T;
  }

  async insert<T>(table: string, record: Omit<T, "id">): Promise<T> {
    const { data, error } = await this.supabase
      .from(table as any)
      .insert(record as any)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async insertMany<T>(table: string, records: Omit<T, "id">[]): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(table as any)
      .insert(records as any)
      .select();

    if (error) throw error;
    return (data as T[]) || [];
  }

  async update<T>(table: string, id: string, record: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(table as any)
      .update(record as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async upsert<T>(table: string, record: T): Promise<T> {
    const { data, error } = await this.supabase
      .from(table as any)
      .upsert(record as any)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase.from(table as any).delete().eq("id", id);

    if (error) throw error;
  }

  async deleteMany(table: string, ids: string[]): Promise<void> {
    const { error } = await this.supabase.from(table as any).delete().in("id", ids);

    if (error) throw error;
  }

  async deleteWhere(table: string, filters: Record<string, any>): Promise<void> {
    let query = this.supabase.from(table as any).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;

    if (error) throw error;
  }

  async transaction<T>(operations: () => Promise<T>): Promise<T> {
    return await operations();
  }

  async count(table: string, filters?: Record<string, any>): Promise<number> {
    let query = this.supabase
      .from(table as any)
      .select("*", { count: "exact", head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }

  async exists(table: string, filters: Record<string, any>): Promise<boolean> {
    const count = await this.count(table, filters);
    return count > 0;
  }
}
