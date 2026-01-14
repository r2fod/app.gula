/**
 * Storage Adapter Interface
 * Abstracción para diferentes tipos de almacenamiento (Supabase, LocalStorage, IndexedDB)
 */

export interface StorageAdapter {
  /**
   * Obtiene datos de una tabla/colección
   */
  get<T>(table: string, filters?: Record<string, any>): Promise<T[]>;

  /**
   * Obtiene un único registro por ID
   */
  getById<T>(table: string, id: string): Promise<T | null>;

  /**
   * Inserta un nuevo registro
   */
  insert<T>(table: string, data: Omit<T, 'id'>): Promise<T>;

  /**
   * Inserta múltiples registros
   */
  insertMany<T>(table: string, data: Omit<T, 'id'>[]): Promise<T[]>;

  /**
   * Actualiza un registro existente
   */
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Elimina un registro
   */
  delete(table: string, id: string): Promise<void>;

  /**
   * Elimina múltiples registros
   */
  deleteMany(table: string, ids: string[]): Promise<void>;

  /**
   * Ejecuta una operación de upsert (insert o update)
   */
  upsert<T>(table: string, data: T): Promise<T>;

  /**
   * Ejecuta múltiples operaciones en una transacción
   */
  transaction<T>(operations: () => Promise<T>): Promise<T>;
}

/**
 * Opciones de configuración para el storage
 */
export interface StorageConfig {
  mode: 'supabase' | 'localStorage' | 'indexedDB';
  userId?: string;
  eventId?: string;
}

/**
 * Resultado de operaciones con metadatos
 */
export interface StorageResult<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}
