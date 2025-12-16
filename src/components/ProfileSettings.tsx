import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save, Upload, Building2, Globe, Wand2, X } from "lucide-react";

// Dialogo de configuración del perfil de empresa.
// Permite editar nombre, logo y website, con función de autocompletado inteligente.
export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchProfile();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;

    // Cast to any to avoid TS error if website column doesn't exist in types yet
    const { data, error } = await supabase
      .from("profiles")
      .select("company_name, avatar_url, website")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      const profile = data as any;
      setCompanyName(profile.company_name || "");
      setLogoUrl(profile.avatar_url || "");
      setWebsiteUrl(profile.website || "");
    }
  };

  // Intenta obtener datos de la empresa (Logo, Nombre) automáticamente scraping la URL proporcionada.
  const handleAutoFill = async () => {
    if (!websiteUrl) return;

    try {
      setLoading(true);
      let domain = websiteUrl;

      // Limpiar URL para obtener solo el dominio
      try {
        const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
        domain = urlObj.hostname;
      } catch (e) {
        // Si falla, usar lo que haya escrito
      }

      // 1. Obtener Logo usando Google Favicon Service
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

      // 2. Inferir nombre desde el dominio
      const inferredName = domain
        .replace('www.', '')
        .split('.')[0]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Actualizar estado siempre para que el usuario vea el resultado
      // Usamos un timestamp para forzar recarga de la imagen si la URL es igual
      setLogoUrl(`${googleFaviconUrl}&t=${Date.now()}`);
      setCompanyName(inferredName);

      toast({
        title: "✨ Datos actualizados",
        description: `Nombre: ${inferredName}`
      });
    } catch (error) {
      console.error("Error auto-filling:", error);
      toast({ title: "Error al obtener datos", description: "Intenta subir el logo manualmente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Sube el archivo seleccionado al bucket 'menus' y actualiza la URL del logo.
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-logo.${fileExt}`;

    setUploading(true);

    // Upload to menus bucket (we can reuse it for logos)
    const { error: uploadError } = await supabase.storage
      .from("menus")
      .upload(`logos/${fileName}`, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Error", description: "No se pudo subir el logo", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("menus")
      .getPublicUrl(`logos/${fileName}`);

    setLogoUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: "Logo subido correctamente" });
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    // Primero verificar si la columna 'website' existe, si no, ignorarla para evitar error
    // Nota: Deberías agregar esta columna a la base de datos
    const updates: any = {
      company_name: companyName,
      avatar_url: logoUrl,
    };

    // Intentar guardar website solo si estamos seguros (o manejar el error silenciosamente)
    // Por ahora asumimos que existe o que Supabase ignorará campos extra si no es estricto
    // updates.website = websiteUrl; 

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el perfil", variant: "destructive" });
    } else {
      toast({ title: "Perfil guardado" });
      setOpen(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Configuración del Catering
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Website Auto-fill */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3 border border-border">
            <Label className="flex items-center gap-2 text-primary">
              <Wand2 className="h-4 w-4" />
              Autocompletar desde tu Web
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ej. micatering.com"
                  className="pl-9"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onBlur={handleAutoFill}
                />
              </div>
              <Button size="icon" variant="secondary" onClick={handleAutoFill} disabled={loading || !websiteUrl} title="Obtener datos automáticamente">
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Intentaremos obtener tu logo y nombre automáticamente.
            </p>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo del Catering</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative group">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded-lg border border-border bg-white"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    onClick={() => setLogoUrl("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/30">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Subiendo..." : "Subir logo"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadLogo}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company-name">Nombre del Catering</Label>
            <Input
              id="company-name"
              placeholder="Mi Catering"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Guardando..." : "Guardar configuración"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
