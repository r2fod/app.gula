import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Activity,
  Euro,
  Calendar,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export default function Analytics() {
  const { data: metrics, isLoading } = useAnalytics();

  if (isLoading) return <LoadingSpinner />;

  const chartData = metrics?.eventPerformance.map(e => ({
    name: e.name.substring(0, 10),
    margin: e.marginPercent,
    revenue: e.revenue,
    cost: e.cost
  })) || [];

  const totalBreakdown = metrics?.eventPerformance.reduce((acc, e) => ({
    food: acc.food + e.breakdown.food,
    beverage: acc.beverage + e.breakdown.beverage,
    staff: acc.staff + e.breakdown.staff,
    rentals: acc.rentals + e.breakdown.rentals,
  }), { food: 0, beverage: 0, staff: 0, rentals: 0 });

  const pieData = [
    { name: 'Comida', value: totalBreakdown?.food || 0 },
    { name: 'Bebida', value: totalBreakdown?.beverage || 0 },
    { name: 'Personal', value: totalBreakdown?.staff || 0 },
    { name: 'Alquiler', value: totalBreakdown?.rentals || 0 },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/events">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Activity className="w-8 h-8 text-primary" />
                  Rendimiento IA
                </h1>
                <p className="text-muted-foreground mt-1">
                  Análisis financiero y auditoría inteligente de eventos
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const assistantButton = document.querySelector('button.fixed.bottom-6.right-6') as HTMLButtonElement;
                if (assistantButton) assistantButton.click();
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Auditoría IA Completa
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Margen Bruto Total</p>
                    <h3 className="text-3xl font-bold mt-1 text-primary">{metrics?.grossMargin.toLocaleString()}€</h3>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                    <h3 className="text-3xl font-bold mt-1">{metrics?.totalRevenue.toLocaleString()}€</h3>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Euro className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Coste Medio / Evento</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {metrics ? (metrics.totalCost / metrics.eventPerformance.length).toLocaleString() : 0}€
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Márgenes por Evento (%)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="margin" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Distribución de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span>{d.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance List */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Auditoría Detallada por Evento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics?.eventPerformance.map((event) => (
                <Card key={event.id} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${event.status === 'high' ? 'bg-green-500/10 text-green-600' :
                        event.status === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-red-500/10 text-red-600'
                        }`}>
                        {event.status === 'high' ? 'Rentabilidad Alta' :
                          event.status === 'medium' ? 'Riesgo Medio' : 'Bajo Rendimiento'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Ingresos</p>
                        <p className="font-bold">{event.revenue.toLocaleString()}€</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Margen</p>
                        <p className={`font-bold ${event.margin > 1000 ? 'text-green-600' : 'text-foreground'}`}>
                          {event.margin.toLocaleString()}€ ({event.marginPercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>

                    {event.status === 'low' && (
                      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-3">
                        <TrendingDown className="w-5 h-5 text-red-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-red-700">Audit IA Suggestion:</p>
                          <p className="text-xs text-red-600 mt-0.5">
                            Margen crítico detectado. Los costes de Personal superan el 30%. Recomendación: Reducir 2 camareros extra o aumentar PVP.
                          </p>
                        </div>
                      </div>
                    )}

                    {event.status === 'high' && (
                      <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-green-700">Audit IA Case Study:</p>
                          <p className="text-xs text-green-600 mt-0.5">
                            Modelo de éxito. Eficiencia en Food Cost (25%). Replicar estrategia de compras para próximos eventos.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
