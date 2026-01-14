import { StorageAdapter } from "./StorageAdapter";

/**
 * Implementación de StorageAdapter para LocalStorage
 * Usado en modo demo para simular operaciones sin backend
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = "gula_demo") {
    this.prefix = prefix;
  }

  private getKey(table: string, eventId?: string): string {
    return eventId ? `${this.prefix}_${table}_${eventId}` : `${this.prefix}_${table}`;
  }

  private generateId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async get<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    try {
      const eventId = filters?.event_id;
      const key = this.getKey(table, eventId);
      const stored = localStorage.getItem(key);

      if (!stored) return [];

      let data = JSON.parse(stored) as T[];

      // Aplicar filtros adicionales
      if (filters) {
        data = data.filter((item: any) => {
          return Object.entries(filters).every(([key, value]) => item[key] === value);
        });
      }

      return data;
    } catch (error) {
      console.error(`Error getting from localStorage (${table}):`, error);
      return [];
    }
  }

  async getById<T>(table: string, id: string): Promise<T | null> {
    try {
      const data = await this.get<T & { id: string }>(table);
      return data.find((item) => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting by id from localStorage (${table}):`, error);
      return null;
    }
  }

  async insert<T>(table: string, data: Omit<T, "id">): Promise<T> {
    try {
      const eventId = (data as any).event_id;
      const key = this.getKey(table, eventId);
      const stored = await this.get<T>(table, eventId ? { event_id: eventId } : undefined);

      const newItem = {
        ...data,
        id: this.generateId(),
      } as T;

      stored.push(newItem);
      localStorage.setItem(key, JSON.stringify(stored));

      return newItem;
    } catch (error) {
      console.error(`Error inserting into localStorage (${table}):`, error);
      throw error;
    }
  }

  async insertMany<T>(table: string, data: Omit<T, "id">[]): Promise<T[]> {
    try {
      const eventId = (data[0] as any)?.event_id;
      const key = this.getKey(table, eventId);
      const stored = await this.get<T>(table, eventId ? { event_id: eventId } : undefined);

      const newItems = data.map((item) => ({
        ...item,
        id: this.generateId(),
      })) as T[];

      stored.push(...newItems);
      localStorage.setItem(key, JSON.stringify(stored));

      return newItems;
    } catch (error) {
      console.error(`Error inserting many into localStorage (${table}):`, error);
      throw error;
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const eventId = (data as any).event_id;
      const key = this.getKey(table, eventId);
      const stored = await this.get<T & { id: string }>(table, eventId ? { event_id: eventId } : undefined);

      const index = stored.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`Item with id ${id} not found`);

      stored[index] = { ...stored[index], ...data };
      localStorage.setItem(key, JSON.stringify(stored));

      return stored[index];
    } catch (error) {
      console.error(`Error updating localStorage (${table}):`, error);
      throw error;
    }
  }

  async delete(table: string, id: string): Promise<void> {
    try {
      // Buscar en todas las posibles keys (con diferentes eventIds)
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(`${this.prefix}_${table}`));

      for (const key of keys) {
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = stored.filter((item: any) => item.id !== id);

        if (filtered.length !== stored.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          return;
        }
      }
    } catch (error) {
      console.error(`Error deleting from localStorage (${table}):`, error);
      throw error;
    }
  }

  async deleteMany(table: string, ids: string[]): Promise<void> {
    try {
      if (ids.length === 0) return;

      const keys = Object.keys(localStorage).filter((k) => k.startsWith(`${this.prefix}_${table}`));

      for (const key of keys) {
        const stored = JSON.parse(localStorage.getItem(key) || "[]");
        const filtered = stored.filter((item: any) => !ids.includes(item.id));
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (error) {
      console.error(`Error deleting many from localStorage (${table}):`, error);
      throw error;
    }
  }

  async upsert<T>(table: string, data: T): Promise<T> {
    try {
      const id = (data as any).id;

      if (id) {
        // Intentar actualizar
        const existing = await this.getById<T>(table, id);
        if (existing) {
          return await this.update(table, id, data);
        }
      }

      // Si no existe, insertar
      return await this.insert(table, data);
    } catch (error) {
      console.error(`Error upserting into localStorage (${table}):`, error);
      throw error;
    }
  }

  async transaction<T>(operations: () => Promise<T>): Promise<T> {
    // LocalStorage no soporta transacciones reales
    // Ejecutar operaciones secuencialmente
    return await operations();
  }

  /**
   * Limpia todos los datos del modo demo
   */
  clearAll(): void {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(this.prefix));
    keys.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Limpia datos de un evento específico
   */
  clearEvent(eventId: string): void {
    const keys = Object.keys(localStorage).filter((k) => k.includes(`_${eventId}`));
    keys.forEach((key) => localStorage.removeItem(key));
  }
}
