import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/types/invitation';
import { logger } from '@/lib/logger';

/**
 * Servicio para gestionar departamentos
 */
export class DepartmentService {
  /**
   * Obtiene todos los departamentos
   */
  static async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error obteniendo departamentos:', error);
      throw error;
    }

    return (data as Department[]) || [];
  }

  /**
   * Crea un nuevo departamento
   */
  static async create(name: string, description?: string): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      logger.error('Error creando departamento:', error);
      throw error;
    }

    logger.info('Departamento creado:', { name });
    return data as Department;
  }

  /**
   * Actualiza un departamento
   */
  static async update(id: string, name: string, description?: string): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error actualizando departamento:', error);
      throw error;
    }

    logger.info('Departamento actualizado:', { id, name });
    return data as Department;
  }

  /**
   * Elimina un departamento
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error eliminando departamento:', error);
      throw error;
    }

    logger.info('Departamento eliminado:', { id });
  }
}
