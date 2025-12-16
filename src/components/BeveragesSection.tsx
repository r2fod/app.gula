import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Plus, Trash2, Wine, Beer, GlassWater, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface BeveragesSectionProps {
  eventId: string;
  totalGuests: number;
}

interface Beverage {
  id?: string;
  category: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  is_extra?: boolean;
}

// Bebidas predefinidas con ratio por PAX y precios sin IVA (del Excel)
// Los ratios de copas y refrescos son por hora de barra libre
const DEFAULT_BEVERAGES: { category: string; item_name: string; ratio_per_pax: number; unit_price: number; per_bar_hour?: boolean }[] = [
  // APERITIVO/COMIDA - estos NO dependen de horas de barra
  { category: 'aperitivo', item_name: 'Nebla Verdejo', ratio_per_pax: 0.40, unit_price: 5.22 },
  { category: 'aperitivo', item_name: 'Raiza Rioja Tinto', ratio_per_pax: 0.29, unit_price: 4.33 },
  { category: 'aperitivo', item_name: 'Botella Cava', ratio_per_pax: 0.13, unit_price: 3.59 },
  { category: 'aperitivo', item_name: 'Agua Solán de Cabras 1.5L', ratio_per_pax: 1.00, unit_price: 0.65 },
  { category: 'aperitivo', item_name: 'Agua con gas', ratio_per_pax: 0.25, unit_price: 0.789 },
  { category: 'aperitivo', item_name: 'Botellín cerveza', ratio_per_pax: 3.50, unit_price: 0.49 },
  { category: 'aperitivo', item_name: 'Cerveza 0,0', ratio_per_pax: 0.15, unit_price: 0.89 },
  { category: 'aperitivo', item_name: 'Cerveza sin gluten', ratio_per_pax: 0.05, unit_price: 1.14 },
  { category: 'aperitivo', item_name: 'Coca-Cola', ratio_per_pax: 0.25, unit_price: 0.569 },
  { category: 'aperitivo', item_name: 'Coca-Cola Zero', ratio_per_pax: 0.25, unit_price: 0.5629 },
  { category: 'aperitivo', item_name: 'Aquarius', ratio_per_pax: 0.30, unit_price: 0.6629 },
  { category: 'aperitivo', item_name: 'Nestea', ratio_per_pax: 0.20, unit_price: 0.715 },
  { category: 'aperitivo', item_name: 'Fanta Naranja', ratio_per_pax: 0.30, unit_price: 0.528 },
  { category: 'aperitivo', item_name: 'Fanta Limón', ratio_per_pax: 0.30, unit_price: 0.528 },
  { category: 'aperitivo', item_name: 'Vermut Izaguirre Rojo', ratio_per_pax: 0.07, unit_price: 6.30 },
  { category: 'aperitivo', item_name: 'Vermut Izaguirre Blanco', ratio_per_pax: 0.03, unit_price: 6.30 },
  // BARRA COPAS - Licores (estos SÍ dependen de horas de barra)
  { category: 'copas', item_name: 'Ginebra Tanqueray', ratio_per_pax: 0.035, unit_price: 12.18, per_bar_hour: true },
  { category: 'copas', item_name: 'Ginebra Seagrams', ratio_per_pax: 0.035, unit_price: 13.05, per_bar_hour: true },
  { category: 'copas', item_name: 'Ginebra Larios', ratio_per_pax: 0.01, unit_price: 10.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Puerto de Indias', ratio_per_pax: 0.015, unit_price: 13.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Ron Barceló', ratio_per_pax: 0.03, unit_price: 12.00, per_bar_hour: true },
  { category: 'copas', item_name: 'Ron Brugal', ratio_per_pax: 0.03, unit_price: 11.15, per_bar_hour: true },
  { category: 'copas', item_name: 'Ballentines', ratio_per_pax: 0.035, unit_price: 11.20, per_bar_hour: true },
  { category: 'copas', item_name: 'Vodka', ratio_per_pax: 0.02, unit_price: 10.90, per_bar_hour: true },
  { category: 'copas', item_name: 'Tequila', ratio_per_pax: 0.005, unit_price: 12.87, per_bar_hour: true },
  { category: 'copas', item_name: 'Tequila Rosa', ratio_per_pax: 0.01, unit_price: 6.70, per_bar_hour: true },
  { category: 'copas', item_name: 'Cazalla', ratio_per_pax: 0.005, unit_price: 8.45, per_bar_hour: true },
  { category: 'copas', item_name: 'Baileys', ratio_per_pax: 0.005, unit_price: 10.20, per_bar_hour: true },
  { category: 'copas', item_name: 'Mistela', ratio_per_pax: 0.005, unit_price: 3.12, per_bar_hour: true },
  { category: 'copas', item_name: 'Tónica', ratio_per_pax: 0.28, unit_price: 2.01, per_bar_hour: true },
  { category: 'copas', item_name: 'Hielo', ratio_per_pax: 0.335, unit_price: 0.763, per_bar_hour: true },
  // REFRESCOS (Barra Copas)
  { category: 'refrescos', item_name: 'Seven Up Lata', ratio_per_pax: 0.125, unit_price: 0.972, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Agua con gas (Copas)', ratio_per_pax: 0.125, unit_price: 0.80, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Coca-Cola (Copas)', ratio_per_pax: 0.35, unit_price: 0.569, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Coca-Cola Zero (Copas)', ratio_per_pax: 0.30, unit_price: 0.5629, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Fanta Naranja (Copas)', ratio_per_pax: 0.25, unit_price: 0.528, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Fanta Limón (Copas)', ratio_per_pax: 0.25, unit_price: 0.528, per_bar_hour: true },
  { category: 'refrescos', item_name: 'Limones', ratio_per_pax: 0.025, unit_price: 2.50, per_bar_hour: true },
];

// Función para inferir el tipo de bebida desde el nombre
const getBeverageType = (itemName: string): string => {
  const name = itemName.toLowerCase();

  // Vinos
  if (name.includes('verdejo') || name.includes('rioja') || name.includes('cava')) {
    return 'Vinos';
  }
  // Agua
  if (name.includes('agua') || name.includes('solán')) {
    return 'Agua';
  }
  // Cervezas
  if (name.includes('cerveza') || name.includes('botellín')) {
    return 'Cervezas';
  }
  // Vermut
  if (name.includes('vermut')) {
    return 'Vermut';
  }
  // Ginebra
  if (name.includes('ginebra') || name.includes('puerto de indias')) {
    return 'Ginebra';
  }
  // Ron
  if (name.includes('ron ')) {
    return 'Ron';
  }
  // Whisky
  if (name.includes('ballentines') || name.includes('whisky')) {
    return 'Whisky';
  }
  // Vodka
  if (name.includes('vodka')) {
    return 'Vodka';
  }
  // Tequila
  if (name.includes('tequila')) {
    return 'Tequila';
  }
  // Otros Licores
  if (name.includes('cazalla') || name.includes('baileys') || name.includes('mistela')) {
    return 'Otros Licores';
  }
  // Mixers
  if (name.includes('tónica') || name.includes('hielo')) {
    return 'Mixers';
  }
  // Refrescos
  if (name.includes('coca') || name.includes('fanta') || name.includes('aquarius') ||
    name.includes('nestea') || name.includes('seven') || name.includes('limones')) {
    return 'Refrescos';
  }

  return 'Otros';
};

const CATEGORIES = [
  { key: 'aperitivo', label: 'Aperitivo/Comida', icon: Wine },
  { key: 'copas', label: 'Barra Copas', icon: GlassWater },
  { key: 'refrescos', label: 'Refrescos', icon: Beer },
];



export default function BeveragesSection({ eventId, totalGuests }: BeveragesSectionProps) {
  const { toast } = useToast();
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Beverage[]>([]);
  const [barHours, setBarHours] = useState<number>(2); // Default 2 hours

  useEffect(() => {
    fetchBeverages();
    fetchBarHours();

    // Suscripción en tiempo real para beverages
    const beveragesChannel = supabase
      .channel(`beverages-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beverages',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          console.log('🔄 Cambio detectado en beverages, recargando...');
          fetchBeverages();
        }
      )
      .subscribe();

    // Suscripción en tiempo real para event_timings
    const timingsChannel = supabase
      .channel(`timings-realtime-${eventId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'event_timings',
          filter: `event_id=eq.${eventId}`
        },
        async (payload) => {
          console.log('🔔 REALTIME UPDATE DETECTADO en event_timings');
          console.log('Payload completo:', JSON.stringify(payload, null, 2));

          // Esperar un momento para que la BD se actualice completamente
          await new Promise(resolve => setTimeout(resolve, 100));

          // Obtener los datos actualizados directamente de la BD
          const { data: timingData, error: timingError } = await supabase
            .from("event_timings")
            .select("bar_hours, bar_start, bar_end")
            .eq("event_id", eventId)
            .single();

          console.log('📊 Datos obtenidos de BD:', timingData, 'Error:', timingError);

          if (!timingData) {
            console.log('⚠️ No se encontraron datos de timing');
            return;
          }

          let newBarHours = 2;

          if (timingData.bar_hours) {
            newBarHours = timingData.bar_hours;
            console.log('✅ Usando bar_hours directo:', newBarHours);
          } else if (timingData.bar_start && timingData.bar_end) {
            const start = timingData.bar_start.split(':');
            const end = timingData.bar_end.split(':');
            const startHours = parseInt(start[0]) + parseInt(start[1]) / 60;
            let endHours = parseInt(end[0]) + parseInt(end[1]) / 60;
            if (endHours < startHours) endHours += 24;
            newBarHours = Math.max(1, Math.round(endHours - startHours));
            console.log('🧮 Calculado desde horarios:', newBarHours);
          }

          console.log('📊 ACTUALIZANDO barHours a:', newBarHours);
          setBarHours(newBarHours);

          // Recalcular bebidas
          const { data: currentBeverages } = await supabase
            .from("beverages")
            .select("*")
            .eq("event_id", eventId);

          if (currentBeverages && currentBeverages.length > 0) {
            console.log('🔄 Recalculando', currentBeverages.length, 'bebidas...');
            const updated = currentBeverages.map(item => {
              const defaultItem = DEFAULT_BEVERAGES.find(d => d.item_name === item.item_name && d.category === item.category);
              if (defaultItem && !item.is_extra) {
                const newQuantity = defaultItem.per_bar_hour
                  ? Math.ceil(defaultItem.ratio_per_pax * totalGuests * newBarHours)
                  : Math.ceil(defaultItem.ratio_per_pax * totalGuests);
                if (item.quantity !== newQuantity) {
                  console.log(`  ✏️ ${item.item_name}: ${item.quantity} → ${newQuantity} (per_bar_hour: ${defaultItem.per_bar_hour})`);
                }
                return { ...item, quantity: newQuantity };
              }
              return item;
            });

            const recordsToUpdate = updated.map(item => ({
              event_id: eventId,
              category: item.category,
              // subtype: item.subtype || null, // TEMPORAL: Comentado hasta aplicar migración
              item_name: item.item_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: item.notes,
              is_extra: item.is_extra || false,
            }));

            await supabase.from("beverages").delete().eq("event_id", eventId);
            await supabase.from("beverages").insert(recordsToUpdate);
            console.log('✅ Bebidas recalculadas y guardadas en BD');

            // Actualizar el estado local también
            setBeverages(updated);
            setFormData(updated);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Estado suscripción event_timings:', status);
        if (err) console.error('❌ Error en suscripción:', err);
      });

    return () => {
      console.log('🧹 Limpiando suscripciones...');
      supabase.removeChannel(beveragesChannel);
      supabase.removeChannel(timingsChannel);
    };
  }, [eventId, totalGuests]);

  // Polling optimizado: solo cuando el componente está visible y activo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const pollBarHours = async () => {
      // Solo hacer polling si no estamos editando
      if (isEditing) return;

      const { data } = await supabase
        .from("event_timings")
        .select("bar_hours, bar_start, bar_end")
        .eq("event_id", eventId)
        .single();

      if (data) {
        let newBarHours = 2;

        if (data.bar_hours) {
          newBarHours = data.bar_hours;
        } else if (data.bar_start && data.bar_end) {
          const start = data.bar_start.split(':');
          const end = data.bar_end.split(':');
          const startHours = parseInt(start[0]) + parseInt(start[1]) / 60;
          let endHours = parseInt(end[0]) + parseInt(end[1]) / 60;
          if (endHours < startHours) endHours += 24;
          newBarHours = Math.max(1, Math.round(endHours - startHours));
        }

        // Si cambió bar_hours, recalcular
        if (newBarHours !== barHours) {
          console.log('🔄 Polling detectó cambio en bar_hours:', barHours, '→', newBarHours);
          setBarHours(newBarHours);

          // Recalcular bebidas
          const { data: currentBeverages } = await supabase
            .from("beverages")
            .select("*")
            .eq("event_id", eventId);

          if (currentBeverages && currentBeverages.length > 0) {
            const updated = currentBeverages.map(item => {
              const defaultItem = DEFAULT_BEVERAGES.find(d => d.item_name === item.item_name && d.category === item.category);
              if (defaultItem && !item.is_extra) {
                const newQuantity = defaultItem.per_bar_hour
                  ? Math.ceil(defaultItem.ratio_per_pax * totalGuests * newBarHours)
                  : Math.ceil(defaultItem.ratio_per_pax * totalGuests);

                console.log(`  📊 ${item.item_name}: ${item.quantity} → ${newQuantity} (per_bar_hour: ${defaultItem.per_bar_hour})`);
                return { ...item, quantity: newQuantity };
              }
              return item;
            });

            const recordsToUpdate = updated.map(item => ({
              event_id: eventId,
              category: item.category,
              // subtype: item.subtype || null, // TEMPORAL: Comentado hasta aplicar migración
              item_name: item.item_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: item.notes,
              is_extra: item.is_extra || false,
            }));

            await supabase.from("beverages").delete().eq("event_id", eventId);
            await supabase.from("beverages").insert(recordsToUpdate);
            console.log('✅ Bebidas recalculadas por polling');

            setBeverages(updated);
            setFormData(updated);
          }
        }
      }
    };

    // Verificar si el documento está visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausar polling cuando la pestaña no está visible
        if (interval) {
          clearInterval(interval);
          interval = null;
          console.log('⏸️ Polling pausado (pestaña oculta)');
        }
      } else {
        // Reanudar polling cuando la pestaña vuelve a estar visible
        if (!interval) {
          interval = setInterval(pollBarHours, 5000); // Aumentado a 5 segundos
          console.log('▶️ Polling reanudado (pestaña visible)');
        }
      }
    };

    // Iniciar polling solo si la pestaña está visible
    if (!document.hidden) {
      interval = setInterval(pollBarHours, 5000); // 5 segundos en lugar de 3
    }

    // Escuchar cambios de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [eventId, totalGuests, barHours, isEditing]);

  // Recalcular cuando cambia totalGuests
  useEffect(() => {
    const recalculateForGuests = async () => {
      if (beverages.length > 0 && !isEditing && barHours > 0) {
        console.log('🔍 Recalculando por cambio en totalGuests:', totalGuests);

        const updated = beverages.map(item => {
          const defaultItem = DEFAULT_BEVERAGES.find(d => d.item_name === item.item_name && d.category === item.category);
          if (defaultItem && !item.is_extra) {
            const newQuantity = calculateQuantity(defaultItem);
            console.log(`  📊 ${item.item_name}: ${item.quantity} → ${newQuantity} (ratio: ${defaultItem.ratio_per_pax}, pax: ${totalGuests}, hours: ${barHours}, per_bar_hour: ${defaultItem.per_bar_hour})`);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        const hasChanges = updated.some((item, idx) => item.quantity !== beverages[idx].quantity);
        if (hasChanges) {
          console.log('✅ Detectados cambios, guardando...');
          const recordsToUpdate = updated.map(item => ({
            event_id: eventId,
            category: item.category,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes,
            is_extra: item.is_extra || false,
          }));

          try {
            const recordsToUpdateWithSubtype = updated.map(item => ({
              event_id: eventId,
              category: item.category,
              // subtype: item.subtype || null, // TEMPORAL: Comentado hasta aplicar migración
              item_name: item.item_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: item.notes,
              is_extra: item.is_extra || false,
            }));

            await supabase.from("beverages").delete().eq("event_id", eventId);
            await supabase.from("beverages").insert(recordsToUpdateWithSubtype);
            console.log('✅ Bebidas actualizadas por cambio en PAX');

            // Actualizar el estado local para que se vea inmediatamente
            setBeverages(updated);
            setFormData(updated);
          } catch (error) {
            console.error('❌ Error actualizando bebidas:', error);
          }
        } else {
          console.log('ℹ️ No hay cambios en las cantidades');
        }
      }
    };

    recalculateForGuests();
  }, [totalGuests]);

  const fetchBeverages = async () => {
    const { data, error } = await supabase
      .from("beverages")
      .select("*")
      .eq("event_id", eventId)
      .order("category", { ascending: true });

    if (!error && data) {
      setBeverages(data);
      setFormData(data);
    }
  };

  const fetchBarHours = async () => {
    const { data, error } = await supabase
      .from("event_timings")
      .select("bar_hours, bar_start, bar_end")
      .eq("event_id", eventId)
      .single();

    console.log("📊 Datos de event_timings:", data);

    if (!error && data) {
      if (data.bar_hours) {
        console.log("✅ Usando bar_hours directo:", data.bar_hours);
        setBarHours(data.bar_hours);
      } else if (data.bar_start && data.bar_end) {
        // Calculate hours from times
        const start = data.bar_start.split(':');
        const end = data.bar_end.split(':');
        const startHours = parseInt(start[0]) + parseInt(start[1]) / 60;
        let endHours = parseInt(end[0]) + parseInt(end[1]) / 60;
        // Handle midnight crossing
        if (endHours < startHours) endHours += 24;
        const calculatedHours = Math.max(1, Math.round(endHours - startHours));
        console.log("🧮 Calculado desde horarios:", calculatedHours, "| Inicio:", data.bar_start, "| Fin:", data.bar_end);
        setBarHours(calculatedHours);
      } else {
        console.log("⚠️ No hay datos de barra, usando default: 2 horas");
      }
    }
  };

  // Calculate quantity based on whether item depends on bar hours
  const calculateQuantity = (item: { ratio_per_pax: number; per_bar_hour?: boolean }) => {
    if (item.per_bar_hour) {
      return Math.ceil(item.ratio_per_pax * totalGuests * barHours);
    }
    return Math.ceil(item.ratio_per_pax * totalGuests);
  };

  // Generar bebidas predeterminadas basadas en PAX y horas de barra
  const generateDefaultBeverages = () => {
    const defaultItems: Beverage[] = DEFAULT_BEVERAGES.map(item => ({
      category: item.category,
      item_name: item.item_name,
      quantity: calculateQuantity(item),
      unit_price: item.unit_price,
      is_extra: false,
    }));
    setFormData(defaultItems);
    toast({
      title: "Bebidas generadas",
      description: `Cantidades calculadas para ${totalGuests} invitados y ${barHours}h de barra libre`
    });
  };

  // Recalcular cantidades según PAX y horas de barra actuales
  const recalculateQuantities = () => {
    const updated = formData.map(item => {
      const defaultItem = DEFAULT_BEVERAGES.find(d => d.item_name === item.item_name && d.category === item.category);
      if (defaultItem && !item.is_extra) {
        return { ...item, quantity: calculateQuantity(defaultItem) };
      }
      return item;
    });
    setFormData(updated);
    toast({
      title: "Cantidades recalculadas",
      description: `Actualizado para ${totalGuests} PAX y ${barHours}h de barra`
    });
  };

  const handleSave = async () => {
    try {
      // Delete existing beverages for this event
      const { error: deleteError } = await supabase
        .from("beverages")
        .delete()
        .eq("event_id", eventId);

      if (deleteError) {
        console.error('Error deleting beverages:', deleteError);
        toast({ title: "Error", description: "No se pudieron eliminar las bebidas existentes", variant: "destructive" });
        return;
      }

      // Insert all beverages
      if (formData.length > 0) {
        const recordsToInsert = formData.map(item => ({
          event_id: eventId,
          category: item.category,
          // subtype: item.subtype || null, // TEMPORAL: Comentado hasta aplicar migración
          item_name: item.item_name,
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0,
          notes: item.notes || null,
          is_extra: item.is_extra || false,
        }));

        const { error: insertError } = await supabase
          .from("beverages")
          .insert(recordsToInsert);

        if (insertError) {
          console.error('Error inserting beverages:', insertError);
          toast({ title: "Error", description: "No se pudieron guardar las bebidas", variant: "destructive" });
          return;
        }
      }

      toast({ title: "Bebidas guardadas" });
      setIsEditing(false);
      fetchBeverages();
    } catch (err) {
      console.error('Error saving beverages:', err);
      toast({ title: "Error", description: "Error al guardar las bebidas", variant: "destructive" });
    }
  };

  const addItem = (category: string) => {
    setFormData([...formData, { category, item_name: "", quantity: 0, unit_price: 0, is_extra: true }]);
  };

  const removeItem = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Beverage, value: any) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  const calculateTotal = (category: string) => {
    return formData
      .filter(b => b.category === category)
      .reduce((sum, b) => sum + (b.quantity * b.unit_price), 0);
  };

  const calculatePricePerPerson = (category: string) => {
    const total = calculateTotal(category);
    return totalGuests > 0 ? (total / totalGuests).toFixed(2) : "0.00";
  };

  const calculateGrandTotal = () => {
    return formData.reduce((sum, b) => sum + (b.quantity * b.unit_price), 0);
  };

  const renderItems = (category: string) => {
    const items = formData.filter(b => b.category === category);

    if (!isEditing && items.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm mb-3">No hay bebidas configuradas</p>
          <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); generateDefaultBeverages(); }}>
            <Plus className="h-4 w-4 mr-1" /> Generar bebidas según PAX
          </Button>
        </div>
      );
    }

    // Agrupar por tipo de bebida (visual, no en BD)
    const groupedByType = items.reduce((acc, item) => {
      const type = getBeverageType(item.item_name);
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedByType).map(([type, typeItems]) => (
          <div key={type} className="space-y-2">
            {/* Tipo Header */}
            <h3 className="text-sm font-semibold text-primary border-b border-primary/30 pb-1">
              {type}
            </h3>

            {/* Header de columnas (solo en modo edición) */}
            {isEditing && (
              <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
                <span className="col-span-4">Nombre</span>
                <span className="col-span-2">Cantidad</span>
                <span className="col-span-2">€/ud</span>
                <span className="col-span-2">Total</span>
                <span className="col-span-1">Extra</span>
                <span className="col-span-1"></span>
              </div>
            )}

            {/* Items del tipo */}
            {typeItems.map((item, idx) => {
              const globalIndex = formData.findIndex(b => b === item);
              const total = item.quantity * item.unit_price;

              return isEditing ? (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-4 h-8 text-sm"
                    placeholder="Nombre"
                    value={item.item_name}
                    onChange={(e) => updateItem(globalIndex, "item_name", e.target.value)}
                  />
                  <Input
                    className="col-span-2 h-8 text-sm"
                    type="number"
                    placeholder="Cant."
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(globalIndex, "quantity", parseInt(e.target.value) || 0)}
                  />
                  <Input
                    className="col-span-2 h-8 text-sm"
                    type="number"
                    step="0.01"
                    placeholder="€/ud"
                    value={item.unit_price || ""}
                    onChange={(e) => updateItem(globalIndex, "unit_price", parseFloat(e.target.value) || 0)}
                  />
                  <span className="col-span-2 text-sm font-medium">{total.toFixed(2)}€</span>
                  <div className="col-span-1 flex justify-center">
                    <Checkbox
                      checked={item.is_extra || false}
                      onCheckedChange={(checked) => updateItem(globalIndex, "is_extra", checked)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="col-span-1 h-8 w-8"
                    onClick={() => removeItem(globalIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div key={idx} className={`flex justify-between items-center py-2 border-b border-border last:border-0 ${item.is_extra ? 'bg-primary/5 px-2 rounded' : ''}`}>
                  <span className="font-medium text-sm">
                    {item.item_name}
                    {item.is_extra && <span className="ml-2 text-xs text-primary">(Extra)</span>}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="w-16 text-right">{item.quantity} ud</span>
                    <span className="w-16 text-right text-muted-foreground">{item.unit_price.toFixed(2)}€/ud</span>
                    <span className="w-20 text-right font-semibold">{total.toFixed(2)}€</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {isEditing && (
          <Button variant="outline" size="sm" onClick={() => addItem(category)} className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> Añadir item
          </Button>
        )}

        {items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm font-semibold">
            <span>Total {CATEGORIES.find(c => c.key === category)?.label}</span>
            <div className="flex gap-4">
              <span>{calculateTotal(category).toFixed(2)}€</span>
              <span className="text-primary">{calculatePricePerPerson(category)}€/pax</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-section-supplies">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wine className="h-5 w-5 text-primary" />
          Bebidas y Barra Libre
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({barHours}h barra)
          </span>
          {formData.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              | Total: {calculateGrandTotal().toFixed(2)}€ - {totalGuests > 0 ? (calculateGrandTotal() / totalGuests).toFixed(2) : '0.00'}€/pax
            </span>
          )}
        </CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              {formData.length > 0 && (
                <Button size="sm" variant="outline" onClick={recalculateQuantities} title="Recalcular según PAX y horas">
                  <RefreshCw className="h-4 w-4 mr-1" /> Recalcular
                </Button>
              )}
              {formData.length === 0 && (
                <Button size="sm" variant="outline" onClick={generateDefaultBeverages}>
                  <Plus className="h-4 w-4 mr-1" /> Generar por defecto
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setFormData(beverages); }}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" /> Guardar
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-1" /> Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aperitivo">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CATEGORIES.map(cat => (
            <TabsContent key={cat.key} value={cat.key}>
              {renderItems(cat.key)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
