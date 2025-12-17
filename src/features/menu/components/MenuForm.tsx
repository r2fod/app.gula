import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Image, Save } from "lucide-react";
import { MenuItemList, MenuItem } from "./MenuItemList";
import { MENU_TYPES } from "./MenuList";
import type { Menu } from "./MenuManager";
import { menuSchema, dishSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

interface MenuFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Menu | null;
  onSave: (data: any, file: File | null) => Promise<void>;
}

// Formulario principal para crear o editar un menú.
// Gestiona el estado del formulario, la validación con Zod, y la subida de archivos.
// - open: Estado del diálogo
// - onSave: Callback para guardar datos
export function MenuForm({ open, onOpenChange, initialData, onSave }: MenuFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    menu_type: "cocktail",
    items: [] as MenuItem[],
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description || "",
          menu_type: initialData.menu_type,
          items: initialData.items || [],
        });
      } else {
        setFormData({ name: "", description: "", menu_type: "cocktail", items: [] });
      }
      setFile(null);
    }
  }, [open, initialData]);

  // Valida y envía el formulario.
  // Realiza validación de Zod tanto para los datos generales como para cada plato individual.
  const handleSubmit = async () => {
    // Validar datos principales del menú
    const result = menuSchema.safeParse({
      name: formData.name,
      description: formData.description,
      menu_type: formData.menu_type,
    });

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: result.error.errors[0].message,
      });
      return;
    }

    // Validar platos
    for (const item of formData.items) {
      const itemResult = dishSchema.safeParse(item);
      if (!itemResult.success) {
        toast({
          variant: "destructive",
          title: "Error en platos",
          description: `El plato "${item.name}" tiene errores: ${itemResult.error.errors[0].message}`,
        });
        return;
      }
    }

    await onSave(formData, file);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Menú" : "Crear Nuevo Menú"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="items">Platos</TabsTrigger>
              <TabsTrigger value="file">Archivo</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del menú *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Menú Primavera 2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de menú</Label>
                <Select value={formData.menu_type} onValueChange={(v) => setFormData({ ...formData, menu_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del menú..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <MenuItemList
                items={formData.items}
                onChange={(items) => setFormData({ ...formData, items })}
              />
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="menu-file"
                />
                <label htmlFor="menu-file" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : "Arrastra un archivo PDF o imagen, o haz clic para seleccionar"}
                  </p>
                </label>
              </div>
              {initialData?.file_url && (
                <div className="flex items-center gap-2 text-sm mt-4">
                  {initialData.file_type === 'pdf' ? <FileText className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                  <span>Archivo actual disponible</span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!formData.name}>
            <Save className="h-4 w-4 mr-1" /> Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
