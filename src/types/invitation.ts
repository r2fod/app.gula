import { UserRole } from '@/contexts/RoleContext';

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  department?: string;
  token: string;
  invited_by?: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationParams {
  email: string;
  role: UserRole;
  department_id?: string;
  expires_in_hours?: number;
}

export interface InvitationValidation {
  valid: boolean;
  invitation?: UserInvitation;
  error?: string;
}
