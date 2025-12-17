import { z } from 'zod';

// Beverage validation schema
export const beverageSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.enum(['aperitivo', 'copas', 'refrescos']),
  item_name: z.string().min(1, 'El nombre es requerido').max(100),
  quantity: z.number().int().min(0, 'La cantidad debe ser positiva'),
  unit_price: z.number().min(0, 'El precio debe ser positivo'),
  notes: z.string().max(500).optional().nullable(),
  is_extra: z.boolean().optional().default(false),
  photo_url: z.string().optional().nullable(),
});

export type BeverageInput = z.infer<typeof beverageSchema>;

// Event validation schema
export const eventSchema = z.object({
  venue: z.string().min(1, 'El lugar es requerido'),
  adults: z.number().int().min(0, 'Debe ser un número positivo'),
  children: z.number().int().min(0, 'Debe ser un número positivo'),
  staff: z.number().int().min(0, 'Debe ser un número positivo'),
});

export type EventInput = z.infer<typeof eventSchema>;

// Menu item validation schema
export const menuItemSchema = z.object({
  item_name: z.string().min(1, 'El nombre es requerido'),
  quantity: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;

// Staff validation schema
export const staffSchema = z.object({
  role: z.string().min(1, 'El rol es requerido'),
  staff_count: z.number().int().min(0),
  arrival_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido').optional().nullable(),
  departure_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido').optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type StaffInput = z.infer<typeof staffSchema>;

// Requirement schemas
export const allergySchema = z.object({
  guest_name: z.string().min(1, "El nombre del invitado es requerido"),
  allergy: z.string().min(1, "La alergia es requerida"),
  notes: z.string().optional(),
});

export const furnitureSchema = z.object({
  item_name: z.string().min(1, "El nombre del ítem es requerido"),
  description: z.string().optional(),
});

export const otherRequirementSchema = z.object({
  item_name: z.string().min(1, "El nombre del requisito es requerido"),
  description: z.string().optional(),
});

// Menu schemas
export const dishSchema = z.object({
  name: z.string().min(1, "El nombre del plato es requerido"),
  description: z.string().optional(),
});

export const menuSchema = z.object({
  name: z.string().min(1, "El nombre del menú es requerido"),
  description: z.string().optional(),
  menu_type: z.string().min(1, "El tipo de menú es requerido"),
});
