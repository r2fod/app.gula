import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X, Edit, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EventInfoProps {
  eventId: string;
}

interface EventFeatures {
  lemonade_corner: boolean;
  beer_corner: boolean;
  cheese_corner: boolean;
  ham_cutter: boolean;
  cocktail_bar: boolean;
  drinks_bar: boolean;
  extra_bar_hours: boolean;
  cake: boolean;
  candy_bar: boolean;
}

const EventInfo = ({ eventId }: EventInfoProps) => {
  const [features, setFeatures] = useState<EventFeatures | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventFeatures>({
    lemonade_corner: false,
    beer_corner: false,
    cheese_corner: false,
    ham_cutter: false,
    cocktail_bar: false,
    drinks_bar: false,
    extra_bar_hours: false,
    cake: false,
    candy_bar: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFeatures();
  }, [eventId]);

  const fetchFeatures = async () => {
    const { data } = await supabase
      .from("event_features")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (data) {
      setFeatures(data);
      setFormData(data);
    }
  };

  const handleSave = async () => {
    const { data: existing } = await supabase
      .from("event_features")
      .select("id")
      .eq("event_id", eventId)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("event_features")
        .update(formData)
        .eq("event_id", eventId));
    } else {
      ({ error } = await supabase
        .from("event_features")
        .insert({ ...formData, event_id: eventId }));
    }

    if (!error) {
      toast({ title: "Guardado", description: "Características actualizadas" });
      setIsEditing(false);
      fetchFeatures();
    }
  };

  const summary = [
    { key: "lemonade_corner", label: "Corner Limonada y Agua" },
    { key: "beer_corner", label: "Corner Cervezas y Vermut" },
    { key: "cheese_corner", label: "Corner Queso" },
    { key: "ham_cutter", label: "Cortador Jamón" },
    { key: "cocktail_bar", label: "Barra Libre Cocktail" },
    { key: "drinks_bar", label: "Barra Libre Copas" },
    { key: "extra_bar_hours", label: "Hora Extra Barra Libre" },
    { key: "cake", label: "Tarta" },
    { key: "candy_bar", label: "Candy Bar" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Resumen del Evento</h2>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setFormData(features || formData); }}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
      <Card className="bg-section-info border-none shadow-soft">
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.map((item) => (
              <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                {isEditing ? (
                  <Switch
                    checked={formData[item.key as keyof EventFeatures]}
                    onCheckedChange={(checked) => setFormData({ ...formData, [item.key]: checked })}
                  />
                ) : (
                  <div className={`mt-0.5 ${features?.[item.key as keyof EventFeatures] ? 'text-green-600' : 'text-red-500'}`}>
                    {features?.[item.key as keyof EventFeatures] ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-foreground">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default EventInfo;
