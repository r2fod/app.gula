import { supabase } from '@/integrations/supabase/client';
import { CreateInvitationParams, UserInvitation, InvitationValidation } from '@/types/invitation';
import { logger } from '@/lib/logger';

/**
 * Servicio para gestionar invitaciones de usuarios
 */
export class InvitationService {
  /**
   * Genera un token único para la invitación
   */
  private static generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Crea una nueva invitación
   */
  static async createInvitation(params: CreateInvitationParams): Promise<UserInvitation> {
    const { email, role, department_id, expires_in_hours = 48 } = params;

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expires_in_hours);

    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('user_invitations')
      .insert({
        email,
        role,
        department: department_id,
        token,
        invited_by: currentUser.user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creando invitación:', error);
      throw error;
    }

    logger.info('Invitación creada:', { email, role });
    return data as UserInvitation;
  }

  /**
   * Valida un token de invitación
   */
  static async validateToken(token: string): Promise<InvitationValidation> {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .single();

    if (error || !data) {
      return {
        valid: false,
        error: 'Invitación no encontrada o ya utilizada',
      };
    }

    const invitation = data as UserInvitation;
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);

    if (now > expiresAt) {
      return {
        valid: false,
        error: 'La invitación ha expirado',
      };
    }

    return {
      valid: true,
      invitation,
    };
  }

  /**
   * Marca una invitación como utilizada
   */
  static async markAsUsed(token: string): Promise<void> {
    const { error } = await supabase
      .from('user_invitations')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (error) {
      logger.error('Error marcando invitación como usada:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las invitaciones pendientes
   */
  static async getPendingInvitations(): Promise<UserInvitation[]> {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error obteniendo invitaciones:', error);
      throw error;
    }

    return (data as UserInvitation[]) || [];
  }

  /**
   * Cancela una invitación
   */
  static async cancelInvitation(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_invitations')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error cancelando invitación:', error);
      throw error;
    }

    logger.info('Invitación cancelada:', { id });
  }

  /**
   * Reenvía una invitación (crea una nueva con el mismo email)
   */
  static async resendInvitation(invitationId: string): Promise<UserInvitation> {
    const { data: oldInvitation, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (error || !oldInvitation) {
      throw new Error('Invitación no encontrada');
    }

    await this.cancelInvitation(invitationId);

    return this.createInvitation({
      email: oldInvitation.email,
      role: oldInvitation.role,
      department_id: oldInvitation.department,
    });
  }

  /**
   * Genera el link de invitación
   */
  static getInvitationLink(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth?invitation=${token}`;
  }
}
