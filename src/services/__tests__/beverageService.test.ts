import { describe, it, expect } from 'vitest';
import { BeverageService } from '@/services/beverageService';

describe('BeverageService', () => {
  describe('calculateTotalDrinks', () => {
    it('debe calcular correctamente el total de bebidas para 100 invitados y 4 horas', () => {
      const result = BeverageService.calculateTotalDrinks(100, 4);
      expect(result).toBeGreaterThan(0);
      expect(result).toBe(690);
    });

    it('debe aplicar margen de seguridad del 15%', () => {
      const baseCalculation = 100 * 4 * 1.5;
      const withMargin = Math.ceil(baseCalculation * 1.15);
      const result = BeverageService.calculateTotalDrinks(100, 4);
      expect(result).toBe(withMargin);
    });
  });

  describe('generateDefaultBeverages', () => {
    it('debe generar bebidas por defecto con parámetros válidos', () => {
      const params = {
        totalGuests: 100,
        barHours: 4,
      };
      const result = BeverageService.generateDefaultBeverages(params);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('category');
      expect(result[0]).toHaveProperty('item');
      expect(result[0]).toHaveProperty('quantity');
    });

    it('debe respetar preferencias personalizadas', () => {
      const params = {
        totalGuests: 50,
        barHours: 3,
        preferences: {
          alcoholPercentage: 0.5,
          beerPercentage: 0.6,
        },
      };
      const result = BeverageService.generateDefaultBeverages(params);
      expect(result).toBeDefined();
    });
  });

  describe('calculateTotalCost', () => {
    it('debe calcular el costo total correctamente', () => {
      const beverages = [
        { category: 'Cerveza', item: 'Cerveza', quantity: 100, unit: 'botellas', estimatedCost: 250 },
        { category: 'Vino', item: 'Vino', quantity: 20, unit: 'botellas', estimatedCost: 300 },
      ];
      const total = BeverageService.calculateTotalCost(beverages);
      expect(total).toBe(550);
    });

    it('debe manejar bebidas sin costo estimado', () => {
      const beverages = [
        { category: 'Agua', item: 'Agua', quantity: 50, unit: 'botellas' },
      ];
      const total = BeverageService.calculateTotalCost(beverages);
      expect(total).toBe(0);
    });
  });

  describe('validateBeverage', () => {
    it('debe validar bebida correcta', () => {
      const beverage = {
        category: 'Cerveza',
        item: 'Cerveza Nacional',
        quantity: 100,
        unit: 'botellas',
      };
      const errors = BeverageService.validateBeverage(beverage);
      expect(errors).toHaveLength(0);
    });

    it('debe detectar errores en bebida inválida', () => {
      const beverage = {
        category: '',
        item: '',
        quantity: -5,
      };
      const errors = BeverageService.validateBeverage(beverage);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
