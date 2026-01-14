export interface Staff {
  id?: string;
  event_id?: string;
  role: string;
  quantity: number;
  hourlyRate: number;
  hours: number;
  totalCost: number;
  notes?: string;
  created_at?: string;
}
