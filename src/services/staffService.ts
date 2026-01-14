import { Staff } from "../types/staff";

export interface StaffCalculationParams {
  totalGuests: number;
  eventDuration: number;
  eventType?: "formal" | "casual" | "cocktail";
}

export class StaffService {
  private static readonly RATIOS = {
    formal: {
      waiters: 15,
      bartenders: 50,
      kitchen: 20,
      security: 100,
      cleaning: 50,
    },
    casual: {
      waiters: 20,
      bartenders: 60,
      kitchen: 25,
      security: 150,
      cleaning: 75,
    },
    cocktail: {
      waiters: 25,
      bartenders: 40,
      kitchen: 30,
      security: 100,
      cleaning: 60,
    },
  };

  static calculateStaffNeeds(params: StaffCalculationParams): Staff[] {
    const { totalGuests, eventDuration, eventType = "casual" } = params;
    const ratios = this.RATIOS[eventType];

    const waiters = Math.ceil(totalGuests / ratios.waiters);
    const bartenders = Math.ceil(totalGuests / ratios.bartenders);
    const kitchen = Math.ceil(totalGuests / ratios.kitchen);
    const security = Math.ceil(totalGuests / ratios.security);
    const cleaning = Math.ceil(totalGuests / ratios.cleaning);

    const hourlyRate = {
      waiter: 15,
      bartender: 18,
      kitchen: 20,
      security: 12,
      cleaning: 10,
    };

    return [
      {
        role: "Meseros",
        quantity: waiters,
        hourlyRate: hourlyRate.waiter,
        hours: eventDuration,
        totalCost: waiters * hourlyRate.waiter * eventDuration,
      },
      {
        role: "Bartenders",
        quantity: bartenders,
        hourlyRate: hourlyRate.bartender,
        hours: eventDuration,
        totalCost: bartenders * hourlyRate.bartender * eventDuration,
      },
      {
        role: "Personal de Cocina",
        quantity: kitchen,
        hourlyRate: hourlyRate.kitchen,
        hours: eventDuration,
        totalCost: kitchen * hourlyRate.kitchen * eventDuration,
      },
      {
        role: "Seguridad",
        quantity: security,
        hourlyRate: hourlyRate.security,
        hours: eventDuration,
        totalCost: security * hourlyRate.security * eventDuration,
      },
      {
        role: "Limpieza",
        quantity: cleaning,
        hourlyRate: hourlyRate.cleaning,
        hours: eventDuration,
        totalCost: cleaning * hourlyRate.cleaning * eventDuration,
      },
    ];
  }

  static calculateTotalCost(staff: Staff[]): number {
    return staff.reduce((sum, s) => sum + (s.totalCost || 0), 0);
  }

  static recalculateCost(staff: Staff): Staff {
    return {
      ...staff,
      totalCost: staff.quantity * staff.hourlyRate * staff.hours,
    };
  }

  static validateStaff(staff: Partial<Staff>): string[] {
    const errors: string[] = [];

    if (!staff.role?.trim()) {
      errors.push("El rol es requerido");
    }

    if (!staff.quantity || staff.quantity <= 0) {
      errors.push("La cantidad debe ser mayor a 0");
    }

    if (!staff.hourlyRate || staff.hourlyRate <= 0) {
      errors.push("La tarifa por hora debe ser mayor a 0");
    }

    if (!staff.hours || staff.hours <= 0) {
      errors.push("Las horas deben ser mayores a 0");
    }

    return errors;
  }
}
