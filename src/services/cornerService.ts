import { Corner } from "@/types/corner";

export interface CornerCalculationParams {
  totalGuests: number;
  venueSize?: "small" | "medium" | "large";
  eventStyle?: "formal" | "casual" | "interactive";
}

export class CornerService {
  private static readonly GUEST_RATIOS = {
    small: 50,
    medium: 75,
    large: 100,
  };

  static generateDefaultCorners(params: CornerCalculationParams): Corner[] {
    const { totalGuests, venueSize = "medium", eventStyle = "casual" } = params;
    const ratio = this.GUEST_RATIOS[venueSize];

    const photoBoothGuests = Math.ceil(totalGuests * 0.6);
    const dessertGuests = Math.ceil(totalGuests * 0.8);
    const loungeGuests = Math.ceil(totalGuests * 0.4);

    const corners: Corner[] = [
      {
        name: "Photo Booth",
        description: "Cabina de fotos con props y fondos temáticos",
        estimatedGuests: photoBoothGuests,
        setupCost: 300,
        notes: "Incluye impresión instantánea",
      },
      {
        name: "Mesa de Postres",
        description: "Variedad de postres y dulces",
        estimatedGuests: dessertGuests,
        setupCost: 250,
        notes: "Decoración incluida",
      },
    ];

    if (eventStyle === "interactive" || totalGuests > 100) {
      corners.push({
        name: "Zona Lounge",
        description: "Área de descanso con sofás y mesas bajas",
        estimatedGuests: loungeGuests,
        setupCost: 400,
        notes: "Mobiliario premium",
      });
    }

    return corners;
  }

  static calculateTotalCost(corners: Corner[]): number {
    return corners.reduce((sum, corner) => sum + (corner.setupCost || 0), 0);
  }

  static calculateTotalCapacity(corners: Corner[]): number {
    return corners.reduce(
      (sum, corner) => sum + (corner.estimatedGuests || 0),
      0
    );
  }

  static validateCorner(corner: Partial<Corner>): string[] {
    const errors: string[] = [];

    if (!corner.name?.trim()) {
      errors.push("El nombre es requerido");
    }

    if (!corner.description?.trim()) {
      errors.push("La descripción es requerida");
    }

    if (
      corner.estimatedGuests !== undefined &&
      corner.estimatedGuests < 0
    ) {
      errors.push("Los invitados estimados no pueden ser negativos");
    }

    if (corner.setupCost !== undefined && corner.setupCost < 0) {
      errors.push("El costo no puede ser negativo");
    }

    return errors;
  }
}
