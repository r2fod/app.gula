export interface Beverage {
  id?: string;
  event_id?: string;
  name?: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit?: number;
  totalCost?: number;
  image?: string;
  notes?: string;
  created_at?: string;
  item?: string;
  estimatedCost?: number;
}