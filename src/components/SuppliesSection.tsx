import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";

const SuppliesSection = () => {
  const supplies = [
    { item: "Vaso Agua", type: "Nuestro", quantity: 595 },
    { item: "Copa Vino", type: "Nuestro", quantity: 714 },
    { item: "Copa Cava", type: "Nuestro", quantity: 374 },
    { item: "Vaso Cubata", type: "Nuestro", quantity: 990 },
    { item: "Vaso Chupito", type: "Nuestro", quantity: 200 },
    { item: "Plato Mediano", type: "Plato Verde", quantity: 310 },
    { item: "Plato Grande", type: "Plato Relieve", quantity: 310 },
    { item: "Plato Postre", type: "Plato Verde", quantity: 310 },
    { item: "Tenedor", type: "", quantity: 340 },
    { item: "Cuchillo", type: "", quantity: 340 },
    { item: "Cuchara", type: "", quantity: 160 },
    { item: "Cuchara Postre", type: "", quantity: 170 },
    { item: "Taza Café con Leche", type: "", quantity: 40 },
    { item: "Plato Café con Leche", type: "", quantity: 40 },
    { item: "Taza Café Solo", type: "", quantity: 120 },
    { item: "Plato Café Solo", type: "", quantity: 120 },
    { item: "Cucharita Café", type: "", quantity: 170 },
    { item: "Jarrita", type: "", quantity: 6.8 },
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground">Cristalería y Menaje</h2>
      <Card className="bg-section-supplies border-none shadow-soft">
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplies.map((supply, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">{supply.item}</div>
                    {supply.type && (
                      <div className="text-sm text-muted-foreground">{supply.type}</div>
                    )}
                  </div>
                </div>
                <div className="text-xl font-bold text-primary">{supply.quantity}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SuppliesSection;
