import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Wine,
  Beer,
  GlassWater,
  RefreshCw,
  ImagePlus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useBeverages, Beverage } from "@/features/events/hooks/useBeverages";
import { getBeverageType } from "@/lib/calculations";
import { useAuth } from "@/contexts/AuthContext";

interface BeveragesSectionProps {
  eventId: string;
  totalGuests: number;
}

const CATEGORIES = [
  { key: "aperitivo", label: "Aperitivo/Comida", icon: Wine },
  { key: "copas", label: "Barra Copas", icon: GlassWater },
  { key: "refrescos", label: "Refrescos", icon: Beer },
];

export default function BeveragesSection({
  eventId,
  totalGuests,
}: BeveragesSectionProps) {
  const { isDemo } = useAuth();
  const { toast } = useToast();
  const {
    beverages,
    formData,
    setFormData,
    loading,
    barHours,
    isEditing,
    setIsEditing,
    uploadingIndex,
    generateDefaultBeverages,
    recalculateQuantities,
    handleSave,
    handlePhotoUpload,
  } = useBeverages(eventId, totalGuests);

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const addItem = (category: string) => {
    setFormData([
      ...formData,
      { category, item_name: "", quantity: 0, unit_price: 0, is_extra: true },
    ]);
  };

  const removeItem = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Beverage, value: any) => {
    const updated = [...formData];

    // Smart Extra Logic
    if (field === "is_extra") {
      if (value === true) {
        // Añadir 10% de la cantidad actual
        const currentQuantity = updated[index].quantity || 0;
        const extraAmount = Math.max(1, Math.ceil(currentQuantity * 0.1));
        updated[index].quantity = currentQuantity + extraAmount;
        updated[index].is_extra = true;
        updated[index].notes = `${updated[index].notes || ""
          }|BASE:${currentQuantity}`.trim();
        toast({
          title: "Cantidad extra añadida",
          description: `Se han añadido ${extraAmount} unidades extra (10% de ${currentQuantity}).`,
        });
      } else {
        // Restaurar cantidad base desde notes
        const notes = updated[index].notes || "";
        const baseMatch = notes.match(/\|BASE:(\d+)/);
        if (baseMatch) {
          updated[index].quantity = parseInt(baseMatch[1]);
          updated[index].notes = notes.replace(/\|BASE:\d+/, "").trim();
        } else {
          // Fallback: dividir por 1.10
          const currentQuantity = updated[index].quantity || 0;
          updated[index].quantity = Math.max(
            0,
            Math.round(currentQuantity / 1.1)
          );
        }
        updated[index].is_extra = false;
        toast({
          title: "Cantidad extra eliminada",
          description: `Se ha restaurado la cantidad base.`,
        });
      }
      setFormData(updated);
      return;
    }

    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const calculateTotal = (category: string) => {
    return formData
      .filter((b) => b.category === category)
      .reduce((sum, b) => sum + b.quantity * b.unit_price, 0);
  };

  const calculatePricePerPerson = (category: string) => {
    const total = calculateTotal(category);
    return totalGuests > 0 ? (total / totalGuests).toFixed(2) : "0.00";
  };

  const calculateGrandTotal = () => {
    return formData.reduce((sum, b) => sum + b.quantity * b.unit_price, 0);
  };

  const calculateGrandTotalPerPerson = () => {
    const total = calculateGrandTotal();
    return totalGuests > 0 ? (total / totalGuests).toFixed(2) : "0.00";
  };

  const renderItems = (category: string) => {
    const items = formData.filter((b) => b.category === category);

    if (!isEditing && items.length === 0) {
      return (
        <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25">
          <Wine className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm mb-4">
            No hay bebidas configuradas para este servicio
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              generateDefaultBeverages();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generar bebidas según PAX
          </Button>
        </div>
      );
    }

    const groupedByType = items.reduce((acc, item) => {
      const type = getBeverageType(item.item_name);
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    return (
      <div className="space-y-8">
        {Object.entries(groupedByType).map(([type, typeItems]) => (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
              <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
                {type}
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {typeItems.length} items
              </span>
            </div>

            <div
              className={`rounded-md border ${isEditing ? "bg-background" : "bg-muted/10"
                } overflow-x-auto`}
            >
              <Table className="min-w-[600px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right w-[100px]">
                      Cant.
                    </TableHead>
                    <TableHead className="text-right w-[140px]">
                      Precio (€)
                    </TableHead>
                    <TableHead className="text-right w-[140px]">
                      Total
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      Tipo
                    </TableHead>
                    {isEditing && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeItems.map((item, idx) => {
                    const globalIndex = formData.findIndex((b) => b === item);
                    const total = item.quantity * item.unit_price;

                    return (
                      <TableRow
                        key={idx}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Foto */}
                        <TableCell className="p-2 align-middle">
                          <div className="flex justify-center items-center">
                            {item.photo_url ? (
                              <div className="relative group/img">
                                <img
                                  src={item.photo_url}
                                  alt={item.item_name}
                                  className={`w-10 h-10 rounded-lg object-cover border border-border/60 shadow-sm ${isEditing
                                    ? "cursor-pointer group-hover/img:opacity-75 transition-opacity"
                                    : ""
                                    }`}
                                  onClick={
                                    isEditing
                                      ? () =>
                                        fileInputRefs.current[
                                          globalIndex
                                        ]?.click()
                                      : undefined
                                  }
                                />
                                {isEditing && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                                    <ImagePlus className="w-5 h-5 text-white drop-shadow-md" />
                                  </div>
                                )}
                              </div>
                            ) : isEditing ? (
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-10 w-10 border-dashed text-muted-foreground/50 hover:text-primary hover:bg-primary/5 hover:border-primary/50 transition-all rounded-lg"
                                onClick={() =>
                                  fileInputRefs.current[globalIndex]?.click()
                                }
                                disabled={uploadingIndex === globalIndex}
                                title="Subir imagen"
                              >
                                {uploadingIndex === globalIndex ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ImagePlus className="w-4 h-4" />
                                )}
                              </Button>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center opacity-60">
                                <Wine className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={(el) =>
                                (fileInputRefs.current[globalIndex] = el)
                              }
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(globalIndex, file);
                              }}
                            />
                          </div>
                        </TableCell>

                        {/* Nombre */}
                        <TableCell>
                          {isEditing ? (
                            <Input
                              className="h-9 font-medium"
                              placeholder="Nombre de la bebida"
                              value={item.item_name}
                              onChange={(e) =>
                                updateItem(
                                  globalIndex,
                                  "item_name",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <span className="font-medium text-foreground">
                              {item.item_name}
                            </span>
                          )}
                        </TableCell>

                        {/* Cantidad */}
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              className="h-9 text-right font-mono"
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) =>
                                updateItem(
                                  globalIndex,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          ) : (
                            <span className="font-mono text-foreground/90 font-medium tabular-nums">
                              {item.quantity}
                            </span>
                          )}
                        </TableCell>

                        {/* Precio */}
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="relative">
                              <Input
                                className="h-9 text-right pr-6 font-mono"
                                type="number"
                                step="0.01"
                                value={item.unit_price || ""}
                                onChange={(e) =>
                                  updateItem(
                                    globalIndex,
                                    "unit_price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                              <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">
                                €
                              </span>
                            </div>
                          ) : (
                            <div className="font-mono text-muted-foreground text-sm tabular-nums">
                              {item.unit_price.toFixed(2)} €
                            </div>
                          )}
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right">
                          <span className="font-mono font-semibold text-foreground tabular-nums">
                            {total.toFixed(2)} €
                          </span>
                        </TableCell>

                        {/* Extra */}
                        <TableCell className="text-center align-middle">
                          {isEditing ? (
                            <div className="flex justify-center items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Extra?
                              </span>
                              <Checkbox
                                checked={item.is_extra || false}
                                onCheckedChange={(checked) =>
                                  updateItem(globalIndex, "is_extra", checked)
                                }
                              />
                            </div>
                          ) : item.is_extra ? (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            >
                              Extra
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400"
                            >
                              Base
                            </Badge>
                          )}
                        </TableCell>

                        {/* Acciones */}
                        {isEditing && (
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                              onClick={() => removeItem(globalIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem(category)}
            disabled={isDemo}
            className="w-full border-dashed hover:border-primary hover:text-primary transition-all"
          >
            <Plus className="h-4 w-4 mr-2" /> Añadir Nueva Bebida a{" "}
            {CATEGORIES.find((c) => c.key === category)?.label}
          </Button>
        )}

        {items.length > 0 && (
          <div className="bg-muted/30 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center text-sm border border-border/50">
            <span className="font-medium text-muted-foreground">
              Resumen {CATEGORIES.find((c) => c.key === category)?.label}
            </span>
            <div className="flex gap-8 items-center mt-2 sm:mt-0">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">
                  Coste Total
                </span>
                <span className="text-lg font-bold text-primary">
                  {calculateTotal(category).toFixed(2)} €
                </span>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">
                  Por Persona
                </span>
                <span className="font-semibold">
                  {calculatePricePerPerson(category)} €/pax
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse text-muted-foreground">
        Cargando datos de bebidas...
      </div>
    );
  }

  return (
    <Card className="bg-section-supplies border-none shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Wine className="h-5 w-5 text-primary" />
              Bebidas y Barra Libre
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                {barHours}h barra libre
              </span>
              <span>•</span>
              <span>{totalGuests} invitados</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4 bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Total
                </p>
                <p className="text-lg font-bold text-primary tabular-nums leading-none">
                  {calculateGrandTotal().toFixed(2)} €
                </p>
              </div>
              <div className="h-6 w-px bg-border hidden sm:block"></div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Por Pax
                </p>
                <p className="text-sm font-semibold text-foreground/80 tabular-nums leading-none">
                  {calculateGrandTotalPerPerson()} €
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  {formData.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={recalculateQuantities}
                      title="Recalcular cantidades basado en nuevos PAX"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Recalcular
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(beverages);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSave()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={isDemo}
                  title={isDemo ? "No disponible en modo demo" : ""}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Editar Bebidas
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="aperitivo" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-muted/50 rounded-lg">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.key}
                value={cat.key}
                className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <cat.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent
              key={cat.key}
              value={cat.key}
              className="mt-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
            >
              {renderItems(cat.key)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
