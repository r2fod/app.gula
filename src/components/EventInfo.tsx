import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const EventInfo = () => {
  const summary = [
    { label: "Corner Limonada y Agua", value: false },
    { label: "Corner Cervezas y Vermut", value: true },
    { label: "Corner Queso", value: true, note: "Para 80 pax" },
    { label: "Cortador Jamón", value: true, note: "Cliente trae jamón y cortador" },
    { label: "Barra Libre Cocktail", value: true },
    { label: "Barra Libre Copas", value: true },
    { label: "Hora Extra Barra Libre", value: false },
    { label: "Tarta", value: false },
    { label: "Candy Bar", value: false },
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground">Resumen del Evento</h2>
      <Card className="bg-section-info border-none shadow-soft">
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className={`mt-0.5 ${item.value ? 'text-green-600' : 'text-red-500'}`}>
                  {item.value ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{item.label}</div>
                  {item.note && (
                    <div className="text-sm text-muted-foreground mt-1">{item.note}</div>
                  )}
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
