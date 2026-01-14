export interface Rental {
  id?: string;
  event_id?: string;
  item: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  notes?: string;
  created_at?: string;
}
