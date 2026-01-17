export type SupabaseFilterOperator = 
  | 'eq' 
  | 'neq' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'like' 
  | 'ilike'
  | 'in' 
  | 'is' 
  | 'contains';

export interface SupabaseFilter {
  column: string;
  operator: SupabaseFilterOperator;
  value: string | number | boolean | null | Array<string | number>;
}

export interface SupabaseQueryOptions {
  filters?: SupabaseFilter[];
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  offset?: number;
  select?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface SupabaseInsertOptions {
  returning?: boolean;
  onConflict?: string;
}

export interface SupabaseUpdateOptions {
  returning?: boolean;
}

export interface SupabaseDeleteOptions {
  returning?: boolean;
}
