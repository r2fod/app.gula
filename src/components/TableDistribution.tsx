import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

const TableDistribution = () => {
  const tables = [
    { name: "Presidencial", pax: 2, description: "" },
    { name: "Mesa 1", pax: 19, description: "Familia Gema - Mesa alargada" },
    { name: "Mesa 2", pax: 8, description: "Amigos y familia Gema - Mesa redonda" },
    { name: "Mesa 3", pax: 11, description: "Primos Gema - Mesa redonda" },
    { name: "Mesa 4", pax: 14, description: "Amigos Gema - Mesa redonda" },
    { name: "Mesa 5", pax: 9, description: "Amigos - Mesa redonda" },
    { name: "Mesa 6", pax: 12, description: "Familia novio - Mesa redonda" },
    { name: "Mesa 7", pax: 9, description: "Amigos novio - Mesa redonda" },
    { name: "Mesa 8", pax: 9, description: "Amigos - Mesa redonda" },
    { name: "Mesa 9", pax: 8, description: "Amigos - Mesa redonda" },
    { name: "Mesa 10", pax: 9, description: "Amigos - Mesa redonda" },
    { name: "Mesa 11", pax: 10, description: "Amigos - Mesa redonda" },
    { name: "Mesa 12", pax: 3, description: "Amigos - Mesa redonda" },
  ];

  const totalPax = tables.reduce((sum, table) => sum + table.pax, 0);

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-foreground">Distribución de Mesas</h2>
      <Card className="bg-section-staff border-none shadow-soft">
        <div className="p-6">
          <div className="mb-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">Total de Invitados en Mesas</span>
            </div>
            <span className="text-2xl font-bold text-primary">{totalPax}</span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table, index) => (
              <div key={index} className="p-4 rounded-lg bg-background/50 border-l-4 border-primary/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-lg text-foreground">{table.name}</div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">{table.pax}</span>
                  </div>
                </div>
                {table.description && (
                  <div className="text-sm text-muted-foreground">{table.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default TableDistribution;
