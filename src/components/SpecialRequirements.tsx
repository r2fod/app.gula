import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Armchair, Flower, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SpecialRequirementsProps {
  eventId: string;
}

interface Allergy {
  id?: string;
  guest_name: string;
  allergy: string;
  notes: string;
}

interface Furniture {
  id?: string;
  item_name: string;
  description: string;
}

interface OtherReq {
  id?: string;
  item_name: string;
  description: string;
}

const SpecialRequirements = ({ eventId }: SpecialRequirementsProps) => {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [other, setOther] = useState<OtherReq[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [allergyData, setAllergyData] = useState<Allergy[]>([]);
  const [furnitureData, setFurnitureData] = useState<Furniture[]>([]);
  const [otherData, setOtherData] = useState<OtherReq[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllergies();
    fetchFurniture();
    fetchOther();
  }, [eventId]);

  const fetchAllergies = async () => {
    const { data } = await supabase.from("allergies").select("*").eq("event_id", eventId);
    if (data) { setAllergies(data); setAllergyData(data); }
  };

  const fetchFurniture = async () => {
    const { data } = await supabase.from("furniture").select("*").eq("event_id", eventId);
    if (data) { setFurniture(data); setFurnitureData(data); }
  };

  const fetchOther = async () => {
    const { data } = await supabase.from("other_requirements").select("*").eq("event_id", eventId);
    if (data) { setOther(data); setOtherData(data); }
  };

  const handleSave = async () => {
    // Save allergies
    const allergyIds = allergyData.filter(a => a.id).map(a => a.id);
    const toDeleteAllergies = allergies.filter(a => a.id && !allergyIds.includes(a.id));
    if (toDeleteAllergies.length > 0) {
      await supabase.from("allergies").delete().in("id", toDeleteAllergies.map(a => a.id!));
    }
    for (const item of allergyData) {
      if (item.id) {
        await supabase.from("allergies").update(item).eq("id", item.id);
      } else {
        await supabase.from("allergies").insert({ ...item, event_id: eventId });
      }
    }

    // Save furniture
    const furnitureIds = furnitureData.filter(f => f.id).map(f => f.id);
    const toDeleteFurniture = furniture.filter(f => f.id && !furnitureIds.includes(f.id));
    if (toDeleteFurniture.length > 0) {
      await supabase.from("furniture").delete().in("id", toDeleteFurniture.map(f => f.id!));
    }
    for (const item of furnitureData) {
      if (item.id) {
        await supabase.from("furniture").update(item).eq("id", item.id);
      } else {
        await supabase.from("furniture").insert({ ...item, event_id: eventId });
      }
    }

    // Save other
    const otherIds = otherData.filter(o => o.id).map(o => o.id);
    const toDeleteOther = other.filter(o => o.id && !otherIds.includes(o.id));
    if (toDeleteOther.length > 0) {
      await supabase.from("other_requirements").delete().in("id", toDeleteOther.map(o => o.id!));
    }
    for (const item of otherData) {
      if (item.id) {
        await supabase.from("other_requirements").update(item).eq("id", item.id);
      } else {
        await supabase.from("other_requirements").insert({ ...item, event_id: eventId });
      }
    }

    toast({ title: "Guardado", description: "Requisitos actualizados" });
    setIsEditing(false);
    fetchAllergies();
    fetchFurniture();
    fetchOther();
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Requisitos Especiales</h2>
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
            <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setAllergyData(allergies); setFurnitureData(furniture); setOtherData(other); }}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="allergies" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="allergies"><AlertCircle className="w-4 h-4 mr-2" />Alergias</TabsTrigger>
          <TabsTrigger value="furniture"><Armchair className="w-4 h-4 mr-2" />Mobiliario</TabsTrigger>
          <TabsTrigger value="other"><Flower className="w-4 h-4 mr-2" />Otros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="allergies">
          <Card className="bg-section-special border-none shadow-soft">
            <div className="p-6">
              <Alert className="mb-6 bg-destructive/10 border-destructive/30">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive font-semibold">
                  Importante: Revisar alergias antes del servicio
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {(isEditing ? allergyData : allergies).map((person, index) => (
                  <div key={person.id || index} className="p-4 rounded-lg bg-background/50 border-l-4 border-destructive/50">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input placeholder="Nombre" value={person.guest_name} onChange={(e) => {
                            const updated = [...allergyData];
                            updated[index] = { ...updated[index], guest_name: e.target.value };
                            setAllergyData(updated);
                          }} />
                          <Button size="icon" variant="destructive" onClick={() => setAllergyData(allergyData.filter((_, i) => i !== index))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input placeholder="Alergia" value={person.allergy} onChange={(e) => {
                          const updated = [...allergyData];
                          updated[index] = { ...updated[index], allergy: e.target.value };
                          setAllergyData(updated);
                        }} />
                        <Textarea placeholder="Notas" value={person.notes} onChange={(e) => {
                          const updated = [...allergyData];
                          updated[index] = { ...updated[index], notes: e.target.value };
                          setAllergyData(updated);
                        }} />
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-foreground mb-1">{person.guest_name}</div>
                        <div className="text-destructive font-semibold">{person.allergy}</div>
                        {person.notes && <div className="text-sm text-muted-foreground mt-2">{person.notes}</div>}
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button onClick={() => setAllergyData([...allergyData, { guest_name: "", allergy: "", notes: "" }])} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Alergia
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="furniture">
          <Card className="bg-section-special border-none shadow-soft">
            <div className="p-6">
              <div className="space-y-4">
                {(isEditing ? furnitureData : furniture).map((item, index) => (
                  <div key={item.id || index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input placeholder="Ítem" value={item.item_name} onChange={(e) => {
                            const updated = [...furnitureData];
                            updated[index] = { ...updated[index], item_name: e.target.value };
                            setFurnitureData(updated);
                          }} />
                          <Button size="icon" variant="destructive" onClick={() => setFurnitureData(furnitureData.filter((_, i) => i !== index))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea placeholder="Descripción" value={item.description} onChange={(e) => {
                          const updated = [...furnitureData];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setFurnitureData(updated);
                        }} />
                      </div>
                    ) : (
                      <>
                        <Armchair className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-bold text-foreground mb-1">{item.item_name}</div>
                          <div className="text-muted-foreground">{item.description}</div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button onClick={() => setFurnitureData([...furnitureData, { item_name: "", description: "" }])} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Mobiliario
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="other">
          <Card className="bg-section-special border-none shadow-soft">
            <div className="p-6 space-y-4">
              {(isEditing ? otherData : other).map((item, index) => (
                <div key={item.id || index} className="p-4 rounded-lg bg-background/50">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Ítem" value={item.item_name} onChange={(e) => {
                          const updated = [...otherData];
                          updated[index] = { ...updated[index], item_name: e.target.value };
                          setOtherData(updated);
                        }} />
                        <Button size="icon" variant="destructive" onClick={() => setOtherData(otherData.filter((_, i) => i !== index))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea placeholder="Descripción" value={item.description} onChange={(e) => {
                        const updated = [...otherData];
                        updated[index] = { ...updated[index], description: e.target.value };
                        setOtherData(updated);
                      }} />
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-foreground mb-2">{item.item_name}</div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button onClick={() => setOtherData([...otherData, { item_name: "", description: "" }])} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Requisito
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default SpecialRequirements;
