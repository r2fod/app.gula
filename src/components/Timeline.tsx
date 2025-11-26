import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

const Timeline = () => {
  const events = [
    { time: "17:45", label: "Llegada de Invitados" },
    { time: "18:00", label: "Ceremonia" },
    { time: "18:30", label: "Inicio Barra Libre" },
    { time: "19:30", label: "Inicio Cocktail" },
    { time: "21:00", label: "Inicio Banquete" },
    { time: "02:00", label: "Fin Barra Libre", note: "8 horas totales" },
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground">Horarios</h2>
      <Card className="bg-section-info border-none shadow-soft">
        <div className="p-6">
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {event.time}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-foreground">{event.label}</div>
                  {event.note && (
                    <div className="text-sm text-muted-foreground">{event.note}</div>
                  )}
                </div>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default Timeline;
