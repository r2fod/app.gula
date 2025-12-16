import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, UtensilsCrossed } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { MenuList } from "./menu/MenuList";
import { MenuForm } from "./menu/MenuForm";
import { MenuItem } from "./menu/MenuItemList";

export type { MenuItem };

export interface Menu {
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

export default function MenuManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleSave = async (formData: any, file: File | null) => {
    if (!user) return;

    try {
      let fileUrl = editingMenu?.file_url || null;
      let fileType = editingMenu?.file_type || null;
      const menuId = editingMenu?.id || crypto.randomUUID();

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

  const openCreate = () => {
    setEditingMenu(null);
    setIsDialogOpen(true);
  };

  const openEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Gestión de Menús
        </CardTitle>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Menú
        </Button>
      </CardHeader>

      <CardContent>
        <MenuList
          menus={menus}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={handleDelete}
          onPreview={setPreviewUrl}
        />
      </CardContent>

      <MenuForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingMenu}
        onSave={handleSave}
      />

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
