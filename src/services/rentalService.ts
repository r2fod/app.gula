import { Rental } from "@/types/rental";

export interface RentalCalculationParams {
  totalGuests: number;
  eventDuration: number;
  venueType?: "indoor" | "outdoor" | "mixed";
}

export class RentalService {
  private static readonly ITEMS_PER_GUEST = {
    chairs: 1,
    tables: 0.125,
    tablecloths: 0.125,
    plates: 2,
    glasses: 3,
    cutlery: 3,
  };

  static generateDefaultRentals(params: RentalCalculationParams): Rental[] {
    const { totalGuests, eventDuration, venueType = "indoor" } = params;

    const chairs = Math.ceil(totalGuests * this.ITEMS_PER_GUEST.chairs);
    const tables = Math.ceil(totalGuests * this.ITEMS_PER_GUEST.tables);
    const tablecloths = Math.ceil(
      totalGuests * this.ITEMS_PER_GUEST.tablecloths
    );
    const plates = Math.ceil(totalGuests * this.ITEMS_PER_GUEST.plates);
    const glasses = Math.ceil(totalGuests * this.ITEMS_PER_GUEST.glasses);
    const cutlery = Math.ceil(totalGuests * this.ITEMS_PER_GUEST.cutlery);

    const rentals: Rental[] = [
      {
        item: "Sillas",
        quantity: chairs,
        unitCost: 3,
        totalCost: chairs * 3,
        supplier: "Renta de Mobiliario",
      },
      {
        item: "Mesas Redondas (8 personas)",
        quantity: tables,
        unitCost: 15,
        totalCost: tables * 15,
        supplier: "Renta de Mobiliario",
      },
      {
        item: "Manteles",
        quantity: tablecloths,
        unitCost: 8,
        totalCost: tablecloths * 8,
        supplier: "Renta de Lencería",
      },
      {
        item: "Platos (set completo)",
        quantity: plates,
        unitCost: 2,
        totalCost: plates * 2,
        supplier: "Renta de Vajilla",
      },
      {
        item: "Copas y Vasos",
        quantity: glasses,
        unitCost: 1.5,
        totalCost: glasses * 1.5,
        supplier: "Renta de Vajilla",
      },
      {
        item: "Cubiertos (set completo)",
        quantity: cutlery,
        unitCost: 1,
        totalCost: cutlery * 1,
        supplier: "Renta de Vajilla",
      },
    ];

    if (venueType === "outdoor" || venueType === "mixed") {
      const tentSize = Math.ceil(totalGuests / 50);
      rentals.push({
        item: "Carpas/Toldos",
        quantity: tentSize,
        unitCost: 500,
        totalCost: tentSize * 500,
        supplier: "Renta de Carpas",
      });
    }

    return rentals;
  }

  static calculateTotalCost(rentals: Rental[]): number {
    return rentals.reduce((sum, rental) => sum + (rental.totalCost || 0), 0);
  }

  static recalculateCost(rental: Rental): Rental {
    return {
      ...rental,
      totalCost: rental.quantity * rental.unitCost,
    };
  }

  static groupBySupplier(rentals: Rental[]): Record<string, Rental[]> {
    return rentals.reduce((acc, rental) => {
      const supplier = rental.supplier || "Sin proveedor";
      if (!acc[supplier]) {
        acc[supplier] = [];
      }
      acc[supplier].push(rental);
      return acc;
    }, {} as Record<string, Rental[]>);
  }

  static calculateSupplierCosts(
    rentals: Rental[]
  ): Record<string, number> {
    const grouped = this.groupBySupplier(rentals);
    return Object.entries(grouped).reduce((acc, [supplier, items]) => {
      acc[supplier] = this.calculateTotalCost(items);
      return acc;
    }, {} as Record<string, number>);
  }

  static validateRental(rental: Partial<Rental>): string[] {
    const errors: string[] = [];

    if (!rental.item?.trim()) {
      errors.push("El item es requerido");
    }

    if (!rental.quantity || rental.quantity <= 0) {
      errors.push("La cantidad debe ser mayor a 0");
    }

    if (!rental.unitCost || rental.unitCost < 0) {
      errors.push("El costo unitario no puede ser negativo");
    }

    return errors;
  }
}
