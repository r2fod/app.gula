import { useConsolidatedOrder, SupplierOrder, ConsolidatedItem } from "../hooks/useConsolidatedOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, FileSpreadsheet, Send, Mail } from "lucide-react";
import { generatePDF, generateExcel, generateWhatsAppLink, generateEmailLink } from "@/lib/exportService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatCurrency } from "@/lib/utils"; // Assuming utils exists, if not we will fix

interface PurchaseOrderPanelProps {
  eventId: string;
}

export const PurchaseOrderPanel = ({ eventId }: PurchaseOrderPanelProps) => {
  const { data: orders, isLoading, error } = useConsolidatedOrder(eventId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error al cargar pedidos: {String(error)}</div>;
  if (!orders || orders.length === 0) return <div>No hay datos de compras para este evento.</div>;

  const handleExportPDF = (order: SupplierOrder) => {
    const columns = ["Ingrediente", "Cantidad", "Unidad", "Coste Total"];
    const data = order.items.map(i => [
      i.ingredient_name,
      i.total_quantity.toFixed(2),
      i.unit,
      `${i.total_cost.toFixed(2)}€`
    ]);
    generatePDF(`Pedido a: ${order.supplier}`, columns, data, `pedido_${order.supplier}_${eventId}`);
  };

  const handleExportExcel = (order: SupplierOrder) => {
    const data = order.items.map(i => ({
      Ingrediente: i.ingredient_name,
      Cantidad: i.total_quantity,
      Unidad: i.unit,
      "Coste Unitario": i.unit_cost,
      "Coste Total": i.total_cost,
      Merma: `${i.waste_percentage}%`
    }));
    generateExcel(data, "Pedido", `pedido_${order.supplier}`);
  };

  const handleWhatsApp = (order: SupplierOrder) => {
    const header = `*Pedido para ${order.supplier}*\n\n`;
    const body = order.items.map(i => `- ${i.total_quantity} ${i.unit} de ${i.ingredient_name}`).join("\n");
    const link = generateWhatsAppLink("", header + body); // User will fill phone
    window.open(link, '_blank');
  };

  const handleEmail = (order: SupplierOrder) => {
    const subject = `PedidoGula: ${order.supplier}`;
    const body = `Hola,\n\nAdjunto lista de pedido:\n\n` +
      order.items.map(i => `- ${i.total_quantity} ${i.unit} de ${i.ingredient_name}`).join("\n") +
      `\n\nGracias.`;
    window.location.href = generateEmailLink("", subject, body);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestión de Compras y Pedidos</CardTitle>
        <CardDescription>Genera listados de compra agrupados por proveedor.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={orders[0]?.supplier || "todos"} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2">
            {orders.map((order) => (
              <TabsTrigger key={order.supplier} value={order.supplier}>
                {order.supplier} ({formatCurrency(order.total_supplier_cost)})
              </TabsTrigger>
            ))}
          </TabsList>

          {orders.map((order) => (
            <TabsContent key={order.supplier} value={order.supplier}>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleExportPDF(order)}>
                    <FileDown className="mr-2 h-4 w-4" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportExcel(order)}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleWhatsApp(order)}>
                    <Send className="mr-2 h-4 w-4" /> WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEmail(order)}>
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Coste Total</TableHead>
                        <TableHead>Merma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.ingredient_name}>
                          <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                          <TableCell>{item.total_quantity.toFixed(2)} {item.unit}</TableCell>
                          <TableCell>{formatCurrency(item.total_cost)}</TableCell>
                          <TableCell>
                            {item.waste_percentage > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Merma {item.waste_percentage}%
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-right font-bold text-lg">
                  Total Proveedor: {formatCurrency(order.total_supplier_cost)}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
