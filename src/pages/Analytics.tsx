import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

/**
 * Variantes para entrada escalonada de elementos en Analytics.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5 }
  }
};
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
      <div className="min-h-screen">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-8 max-w-7xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10">
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
              className="gap-2 w-full md:w-auto hover:bg-primary/15 border-primary/20"
              onClick={() => {
                const assistantButton = document.querySelector('button.fixed.bottom-6.right-6') as HTMLButtonElement;
                if (assistantButton) assistantButton.click();
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Auditoría IA Completa
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div variants={itemVariants}>
              <Card className="bg-card/50 backdrop-blur border-primary/20 hover:shadow-medium transition-all">
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
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-soft transition-all">
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
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-soft transition-all">
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
            </motion.div>
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Activity className="w-5 h-5 text-primary" />
                  Márgenes por Evento (%)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={10}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        fontSize={10}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                      />
                      <Bar dataKey="margin" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <PieChart className="w-5 h-5 text-primary" />
                  Distribución de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-6 flex flex-col">
                {/* Contenedor de la gráfica con altura fija dedicada */}
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          backgroundColor: 'hsl(var(--background))'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Leyenda que ahora fluye naturalmente debajo sin recortes */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 px-2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2.5 transition-all hover:scale-105">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-[11px] md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {d.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Performance List */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Auditoría Detallada por Evento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics?.eventPerformance.map((event) => (
                <Card key={event.id} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase shrink-0 ${event.status === 'high' ? 'bg-green-500/10 text-green-600' :
                        event.status === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-red-500/10 text-red-600'
                        }`}>
                        {event.status === 'high' ? 'Alta' :
                          event.status === 'medium' ? 'Media' : 'Baja'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-muted/50 rounded-lg group-hover:bg-primary/5 transition-colors">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ingresos</p>
                        <p className="font-bold text-sm md:text-base">{event.revenue.toLocaleString()}€</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg group-hover:bg-primary/5 transition-colors">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Margen</p>
                        <p className={`font-bold text-sm md:text-base ${event.margin > 1000 ? 'text-green-600' : 'text-foreground'}`}>
                          {event.margin.toLocaleString()}€ ({event.marginPercent.toFixed(1)}%)
                        </p>
                      </div>
                    </div>

                    {event.status === 'low' && (
                      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-3">
                        <TrendingDown className="w-5 h-5 text-red-600 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-red-700 uppercase">Audit IA Suggestion:</p>
                          <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">
                            Margen crítico. Reducir staff o aumentar PVP.
                          </p>
                        </div>
                      </div>
                    )}

                    {event.status === 'high' && (
                      <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-green-700 uppercase">Audit IA Case Study:</p>
                          <p className="text-[11px] text-green-600 mt-0.5 leading-relaxed">
                            Eficiencia óptima. Replicar modelo de costes.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
