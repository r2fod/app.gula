import { describe, it, expect } from 'vitest';
import { logger, createLogger } from '@/lib/logger';

describe('Logger', () => {
  describe('logger básico', () => {
    it('debe existir y tener métodos principales', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('debe permitir crear logger con prefijo', () => {
      const customLogger = createLogger('TEST');
      expect(customLogger).toBeDefined();
      expect(customLogger.info).toBeDefined();
    });
  });

  describe('métodos de logging', () => {
    it('no debe lanzar errores al llamar info', () => {
      expect(() => logger.info('Test message')).not.toThrow();
    });

    it('no debe lanzar errores al llamar warn', () => {
      expect(() => logger.warn('Warning message')).not.toThrow();
    });

    it('no debe lanzar errores al llamar error', () => {
      expect(() => logger.error('Error message')).not.toThrow();
    });

    it('no debe lanzar errores al llamar debug', () => {
      expect(() => logger.debug('Debug message')).not.toThrow();
    });
  });

  describe('métodos de agrupación', () => {
    it('debe tener método group', () => {
      expect(logger.group).toBeDefined();
      expect(() => logger.group('Test Group')).not.toThrow();
    });

    it('debe tener método groupEnd', () => {
      expect(logger.groupEnd).toBeDefined();
      expect(() => logger.groupEnd()).not.toThrow();
    });

    it('debe tener método table', () => {
      expect(logger.table).toBeDefined();
      expect(() => logger.table({ test: 'data' })).not.toThrow();
    });
  });
});
