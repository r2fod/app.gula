import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Upload, FileText, Image, Trash2, Eye, Edit2, X, Save, UtensilsCrossed } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface MenuItem {
  name: string;
  description?: string;
}

interface Menu {
  id: string;
  name: string;
  description: string | null;
  menu_type: string;
  file_url: string | null;
  file_type: string | null;
  items: MenuItem[];
  is_active: boolean;
  created_at: string;
}

const MENU_TYPES = [
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'banquete', label: 'Banquete' },
  { value: 'postre', label: 'Postres' },
  { value: 'infantil', label: 'Menú Infantil' },
  { value: 'especial', label: 'Menú Especial' },
];

export default function MenuManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    menu_type: "cocktail",
    items: [] as MenuItem[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [newItem, setNewItem] = useState({ name: "", description: "" });

  useEffect(() => {
    if (user) fetchMenus();
  }, [user]);

  const fetchMenus = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Parse items from JSONB
      const parsedMenus = data.map(menu => ({
        ...menu,
        items: Array.isArray(menu.items) ? (menu.items as unknown as MenuItem[]) : [],
      })) as Menu[];
      setMenus(parsedMenus);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (menuId: string, file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${user?.id}/${menuId}.${fileExt}`;

    const { error } = await supabase.storage
      .from('menus')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('menus')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !formData.name) return;

    try {
      let fileUrl = editingMenu?.file_url || null;
      let fileType = editingMenu?.file_type || null;
      const menuId = editingMenu?.id || crypto.randomUUID();

      // Upload file if provided
      if (file) {
        fileUrl = await handleFileUpload(menuId, file);
        fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      }

      const menuData = {
        id: menuId,
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        menu_type: formData.menu_type,
        file_url: fileUrl,
        file_type: fileType,
        items: formData.items as unknown as Json,
        is_active: true,
      };

      if (editingMenu) {
        const { error } = await supabase
          .from("menus")
          .update(menuData)
          .eq("id", editingMenu.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("menus")
          .insert([menuData]);
        if (error) throw error;
      }

      toast({ title: editingMenu ? "Menú actualizado" : "Menú creado" });
      resetForm();
      setIsDialogOpen(false);
      fetchMenus();
    } catch (error) {
      console.error("Save error:", error);
      toast({ variant: "destructive", title: "Error al guardar el menú" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (!error) {
      toast({ title: "Menú eliminado" });
      fetchMenus();
    }
  };

  const addItem = () => {
    if (!newItem.name) return;
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem }],
    });
    setNewItem({ name: "", description: "" });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", menu_type: "cocktail", items: [] });
    setFile(null);
    setEditingMenu(null);
  };

  const openEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      description: menu.description || "",
      menu_type: menu.menu_type,
      items: menu.items || [],
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Gestión de Menús
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nuevo Menú
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingMenu ? "Editar Menú" : "Crear Nuevo Menú"}</DialogTitle>
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
                  
                  {formData.items.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {formData.items.map((item, index) => (
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
                  {editingMenu?.file_url && (
                    <div className="flex items-center gap-2 text-sm">
                      {editingMenu.file_type === 'pdf' ? <FileText className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                      <span>Archivo actual disponible</span>
                      <Button variant="link" size="sm" onClick={() => setPreviewUrl(editingMenu.file_url)}>
                        Ver
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!formData.name}>
                <Save className="h-4 w-4 mr-1" /> Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando menús...</p>
        ) : menus.length === 0 ? (
          <div className="text-center py-8">
            <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay menús creados</p>
            <p className="text-sm text-muted-foreground">Crea tu primer menú para empezar</p>
          </div>
        ) : (
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(menu)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(menu.id)}>
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
                      onClick={() => setPreviewUrl(menu.file_url)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver {menu.file_type === 'pdf' ? 'PDF' : 'imagen'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            previewUrl.includes('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[70vh]" />
            ) : (
              <img src={previewUrl} alt="Menu preview" className="max-w-full max-h-[70vh] object-contain mx-auto" />
            )
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
