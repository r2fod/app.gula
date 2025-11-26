import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EventHeader = () => {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge variant="secondary" className="mb-4">
              Orden de Evento
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Boda - Molí Ballestar</h1>
            <div className="flex flex-wrap gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">1 de Noviembre, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">Molí Ballestar</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
            <div className="text-sm text-primary-foreground/80 mb-1">Total Invitados</div>
            <div className="text-4xl font-bold">126</div>
            <div className="text-sm text-primary-foreground/80 mt-1">113 + 10 Niños + 3 Staff</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EventHeader;
