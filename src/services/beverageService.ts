import { Beverage } from "../types/beverage";

export interface BeverageCalculationParams {
  totalGuests: number;
  barHours: number;
  preferences?: {
    alcoholPercentage?: number;
    beerPercentage?: number;
    winePercentage?: number;
    cocktailPercentage?: number;
  };
}

export class BeverageService {
  private static readonly DRINKS_PER_PERSON_PER_HOUR = 1.5;
  private static readonly SAFETY_MARGIN = 1.15;

  static calculateTotalDrinks(guests: number, hours: number): number {
    return Math.ceil(
      guests * hours * this.DRINKS_PER_PERSON_PER_HOUR * this.SAFETY_MARGIN
    );
  }

  static generateDefaultBeverages(
    params: BeverageCalculationParams
  ): Beverage[] {
    const { totalGuests, barHours, preferences = {} } = params;

    const {
      alcoholPercentage = 0.7,
      beerPercentage = 0.4,
      winePercentage = 0.3,
      cocktailPercentage = 0.3,
    } = preferences;

    const totalDrinks = this.calculateTotalDrinks(totalGuests, barHours);
    const alcoholicDrinks = Math.ceil(totalDrinks * alcoholPercentage);
    const nonAlcoholicDrinks = totalDrinks - alcoholicDrinks;

    const beerBottles = Math.ceil(alcoholicDrinks * beerPercentage);
    const wineBottles = Math.ceil((alcoholicDrinks * winePercentage) / 5);
    const cocktails = Math.ceil(alcoholicDrinks * cocktailPercentage);

    const softDrinks = Math.ceil(nonAlcoholicDrinks * 0.6);
    const water = Math.ceil(nonAlcoholicDrinks * 0.4);

    return [
      {
        category: "Cerveza",
        item: "Cerveza Nacional",
        quantity: beerBottles,
        unit: "botellas",
        estimatedCost: beerBottles * 2.5,
      },
      {
        category: "Vino",
        item: "Vino Tinto/Blanco",
        quantity: wineBottles,
        unit: "botellas",
        estimatedCost: wineBottles * 15,
      },
      {
        category: "Cócteles",
        item: "Ingredientes para Cócteles",
        quantity: cocktails,
        unit: "porciones",
        estimatedCost: cocktails * 5,
      },
      {
        category: "Refrescos",
        item: "Refrescos Variados",
        quantity: softDrinks,
        unit: "latas",
        estimatedCost: softDrinks * 1.5,
      },
      {
        category: "Agua",
        item: "Agua Embotellada",
        quantity: water,
        unit: "botellas",
        estimatedCost: water * 1,
      },
    ];
  }

  static calculateTotalCost(beverages: Beverage[]): number {
    return beverages.reduce((sum, bev) => sum + (bev.estimatedCost || 0), 0);
  }

  static validateBeverage(beverage: Partial<Beverage>): string[] {
    const errors: string[] = [];

    if (!beverage.category?.trim()) {
      errors.push("La categoría es requerida");
    }

    if (!beverage.item?.trim()) {
      errors.push("El item es requerido");
    }

    if (!beverage.quantity || beverage.quantity <= 0) {
      errors.push("La cantidad debe ser mayor a 0");
    }

    if (!beverage.unit?.trim()) {
      errors.push("La unidad es requerida");
    }

    return errors;
  }
}
