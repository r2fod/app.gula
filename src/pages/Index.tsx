import EventHeader from "@/components/EventHeader";
import EventInfo from "@/components/EventInfo";
import Timeline from "@/components/Timeline";
import MenuSection from "@/components/MenuSection";
import SuppliesSection from "@/components/SuppliesSection";
import SpecialRequirements from "@/components/SpecialRequirements";
import TableDistribution from "@/components/TableDistribution";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <EventHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <EventInfo />
        <Timeline />
        <MenuSection />
        <SuppliesSection />
        <SpecialRequirements />
        <TableDistribution />
      </main>
      
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Orden de Evento - Sistema de Gestión de Eventos</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
