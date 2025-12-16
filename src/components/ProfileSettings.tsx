import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save, Upload, Building2 } from "lucide-react";

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchProfile();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("company_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setCompanyName(data.company_name || "");
      setLogoUrl(data.avatar_url || "");
    }
  };

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
    
    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyName,
        avatar_url: logoUrl,
      })
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
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo del Catering</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain rounded-lg border border-border"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
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
