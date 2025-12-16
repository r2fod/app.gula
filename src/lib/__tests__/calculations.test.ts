import { describe, it, expect } from 'vitest';
import { getBeverageType } from '../calculations';

describe('getBeverageType', () => {
  it('should categorize wines correctly', () => {
    expect(getBeverageType('Nebla Verdejo')).toBe('Vinos');
    expect(getBeverageType('Raiza Rioja Tinto')).toBe('Vinos');
    expect(getBeverageType('Botella Cava')).toBe('Vinos');
  });

  it('should categorize beers correctly', () => {
    expect(getBeverageType('Botellín cerveza')).toBe('Cervezas');
    expect(getBeverageType('Cerveza 0,0')).toBe('Cervezas');
  });

  it('should categorize soft drinks correctly', () => {
    expect(getBeverageType('Coca-Cola')).toBe('Refrescos');
    expect(getBeverageType('Fanta Naranja')).toBe('Refrescos');
    expect(getBeverageType('Nestea')).toBe('Refrescos');
    expect(getBeverageType('Limones')).toBe('Refrescos');
  });

  it('should categorize spirits correctly', () => {
    expect(getBeverageType('Ginebra Tanqueray')).toBe('Ginebra');
    expect(getBeverageType('Ron Barceló')).toBe('Ron');
    expect(getBeverageType('Ballentines')).toBe('Whisky');
    expect(getBeverageType('Vodka Absolut')).toBe('Vodka');
    expect(getBeverageType('Tequila')).toBe('Tequila');
  });

  it('should return "Otros" for unknown items', () => {
    expect(getBeverageType('Bebida Desconocida')).toBe('Otros');
  });

  it('scroll be case insensitive', () => {
    expect(getBeverageType('COCA-COLA')).toBe('Refrescos');
  });
});
