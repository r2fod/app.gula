import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Armchair, Flower, Table } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SpecialRequirements = () => {
  const allergies = [
    { name: "Gloria (staff fotógrafa)", allergy: "Coco", notes: "" },
    { name: "Pili (mesa 2)", allergy: "Cebolla y canela", notes: "Como principal come el bacalao de la carta" },
    { name: "Teresa (mesa 6)", allergy: "Carne", notes: "Como principal come el bacalao de la carta" },
    { name: "Víctor (mesa 6)", allergy: "Pimiento", notes: "" },
    { name: "Ainhoa (mesa 6)", allergy: "Gluten", notes: "" },
    { name: "Alba (mesa 7)", allergy: "Plátano", notes: "" },
    { name: "2 embarazadas", allergy: "Alimentos crudos", notes: "Alternativa a canapés con ingredientes crudos" },
  ];

  const furniture = [
    { item: "Ceremonia", description: "Solo montamos sillas. Sofá de Belinda, flores los novios" },
    { item: "Cocktail", description: "8 mesas altas, 2 mesas bajas con 6 sillas cada una" },
    { item: "Mesa Entrada", description: "Para regalitos - donde higuera" },
    { item: "Mesa Ilustradora", description: "Para chica que dibuja - en el cocktail" },
    { item: "Mesa Candy Bar", description: "Cliente trae, montamos nosotros - al lado DJ" },
    { item: "Mesa Puros", description: "Mesa pequeña cuadrada - al lado DJ" },
    { item: "Mesa Glitter", description: "Mesa pequeña cuadrada - al lado DJ" },
    { item: "Estructura Metálica", description: "Para corner queso (Fulanita)" },
    { item: "Gueridones", description: "2 mesas" },
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground">Requisitos Especiales</h2>
      
      <Tabs defaultValue="allergies" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="allergies">
            <AlertCircle className="w-4 h-4 mr-2" />
            Alergias
          </TabsTrigger>
          <TabsTrigger value="furniture">
            <Table className="w-4 h-4 mr-2" />
            Mobiliario
          </TabsTrigger>
          <TabsTrigger value="other">
            <Flower className="w-4 h-4 mr-2" />
            Otros
          </TabsTrigger>
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
                {allergies.map((person, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background/50 border-l-4 border-destructive/50">
                    <div className="font-bold text-foreground mb-1">{person.name}</div>
                    <div className="text-destructive font-semibold">{person.allergy}</div>
                    {person.notes && (
                      <div className="text-sm text-muted-foreground mt-2">{person.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="furniture">
          <Card className="bg-section-special border-none shadow-soft">
            <div className="p-6">
              <div className="space-y-4">
                {furniture.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50">
                    <Armchair className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-foreground mb-1">{item.item}</div>
                      <div className="text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="other">
          <Card className="bg-section-special border-none shadow-soft">
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="font-bold text-foreground mb-2">Mantelería</div>
                <div className="text-muted-foreground">Beige</div>
              </div>
              
              <div className="p-4 rounded-lg bg-background/50">
                <div className="font-bold text-foreground mb-2">Minutas</div>
                <div className="text-muted-foreground">15 ud del cocktail y 120 ud para la mesa</div>
              </div>
              
              <div className="p-4 rounded-lg bg-background/50">
                <div className="font-bold text-foreground mb-2">Flores</div>
                <div className="text-muted-foreground">Solo las de cocktail. Ceremonia y banquete las traen ellos</div>
                <div className="text-sm text-primary mt-1">Fulanita avisada</div>
              </div>
              
              <div className="p-4 rounded-lg bg-background/50">
                <div className="font-bold text-foreground mb-2">Trona</div>
                <div className="text-muted-foreground">NO - Silla reforzada para suegro (coger del Molí)</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default SpecialRequirements;
