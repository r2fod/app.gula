import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Wine, Cake, Baby } from "lucide-react";

const MenuSection = () => {
  const cocktail = [
    "Gyoza de pato frita pollo hoisin de arándanos",
    "Flor de calabacín, queso de cabra, pesto y miel",
    "Langostino rebozado con mayonesa de chile habanero",
    "Gilda de cecina, queso, piparra",
    "Sardina ahumada con titaina del cabañal y germinado de cebolla",
    "Croqueta de pollo con salsa de boletus",
    "Burger de ternera con queso chedar y salsa de tomate seco y rúcula (en pan bao)",
    "Buñuelo de bacalao con cremoso de membrillo",
    "Tartar de salmón, crema de aguacate y mayonesa de wasabi",
    "Mini pita de panceta a baja temperatura, mole, cilantro y lima",
    "Financier de alguila laqueada con tamarindo y miel (+1€/pp)",
    "Royal de cordero, hoja de roble, brie y bearnesa",
    "Fartón artesano relleno de pato pekín con cebolleta china",
    "Minitaco cochinita pibil con guacamole"
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground">Menú</h2>
      
      <Tabs defaultValue="cocktail" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="cocktail">
            <Wine className="w-4 h-4 mr-2" />
            Cocktail
          </TabsTrigger>
          <TabsTrigger value="banquet">
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Banquete
          </TabsTrigger>
          <TabsTrigger value="dessert">
            <Cake className="w-4 h-4 mr-2" />
            Postres
          </TabsTrigger>
          <TabsTrigger value="children">
            <Baby className="w-4 h-4 mr-2" />
            Infantil
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cocktail">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6">
              <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-semibold text-primary">170 canapés por persona</p>
              </div>
              <ul className="space-y-3">
                {cocktail.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="banquet">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Segundo Plato</h3>
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-foreground">Carrillera de ternera a la Bourgignon sobre parmentier trufada y cherrys confitados</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Sorbete</h3>
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-foreground">Melón al cava y ras el hanout</p>
                  <p className="text-sm text-muted-foreground mt-2">* La novia y embarazadas: sorbete sin alcohol</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Resopón</h3>
                <div className="p-4 rounded-lg bg-background/50">
                  <p className="text-foreground">Medias lunas de jamón serrano / jamón york y queso / tortilla de patata</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="dessert">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                <p className="font-semibold text-amber-900 dark:text-amber-200">Media ración de cada postre por plato - todos prueban ambos</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-bold text-foreground mb-2">Postre 1</h4>
                  <p className="text-foreground">Torrija de horchata con helado de canela</p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-bold text-foreground mb-2">Postre 2</h4>
                  <p className="text-foreground">Cheesecake con Lotus</p>
                  <p className="text-sm text-muted-foreground mt-2">* Usar plato grande</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="children">
          <Card className="bg-section-menu border-none shadow-soft">
            <div className="p-6">
              <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-semibold text-primary">Servir cena a las 20:00-20:30</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-bold text-foreground mb-2">Primero</h4>
                  <p className="text-foreground">Croquetas y nuggets</p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-bold text-foreground mb-2">Segundo</h4>
                  <p className="text-foreground">Pollo con patatas</p>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50">
                  <h4 className="font-bold text-foreground mb-2">Postre</h4>
                  <p className="text-foreground">Brownie</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default MenuSection;
