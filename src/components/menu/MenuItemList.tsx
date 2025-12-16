import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export interface MenuItem {
  name: string;
  description?: string;
}

interface MenuItemListProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}

export function MenuItemList({ items, onChange }: MenuItemListProps) {
  const [newItem, setNewItem] = useState({ name: "", description: "" });

  const addItem = () => {
    if (!newItem.name) return;
    onChange([...items, { ...newItem }]);
    setNewItem({ name: "", description: "" });
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nombre del plato"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="flex-1"
        />
        <Input
          placeholder="Descripción (opcional)"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className="flex-1"
        />
        <Button type="button" onClick={addItem} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay platos añadidos. Añade platos manualmente o sube un archivo.
        </p>
      )}
    </div>
  );
}
