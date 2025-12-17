import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye, UtensilsCrossed } from "lucide-react";
import type { Menu } from "./MenuManager";

interface MenuListProps {
  menus: Menu[];
  isLoading: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onPreview: (url: string) => void;
}

export const MENU_TYPES = [
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'banquete', label: 'Banquete' },
  { value: 'postre', label: 'Postres' },
  { value: 'infantil', label: 'Menú Infantil' },
  { value: 'especial', label: 'Menú Especial' },
];

// Visualiza la colección de menús creados.
// Renderiza una cuadrícula (Grid) de tarjetas, cada una representando un menú con sus opciones.
export function MenuList({ menus, isLoading, onEdit, onDelete, onPreview }: MenuListProps) {
  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">Cargando menús...</p>;
  }

  if (menus.length === 0) {
    return (
      <div className="text-center py-8">
        <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No hay menús creados</p>
        <p className="text-sm text-muted-foreground">Crea tu primer menú para empezar</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <Card key={menu.id} className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{menu.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                  {MENU_TYPES.find(t => t.value === menu.menu_type)?.label}
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(menu)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(menu.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {menu.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{menu.description}</p>
            )}

            {menu.items && menu.items.length > 0 && (
              <p className="text-xs text-muted-foreground">{menu.items.length} platos</p>
            )}

            {menu.file_url && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onPreview(menu.file_url!)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver {menu.file_type === 'pdf' ? 'PDF' : 'imagen'}
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
