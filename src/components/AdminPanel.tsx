import { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { InvitationService } from '@/services/invitationService';
import { DepartmentService } from '@/services/departmentService';
import { UserInvitation, Department, CreateInvitationParams } from '@/types/invitation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Copy, Trash2, RefreshCw, Users, Building2, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Panel de administración de usuarios, invitaciones y departamentos
 * Solo accesible para administradores
 */
export function AdminPanel() {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);

  // Form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'staff' | 'viewer'>('staff');
  const [inviteDepartment, setInviteDepartment] = useState<string>('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invitationsData, departmentsData] = await Promise.all([
        InvitationService.getPendingInvitations(),
        DepartmentService.getAll(),
      ]);
      setInvitations(invitationsData);
      setDepartments(departmentsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    if (!inviteEmail) {
      toast({
        title: 'Error',
        description: 'El email es requerido',
        variant: 'destructive',
      });
      return;
    }

    try {
      const params: CreateInvitationParams = {
        email: inviteEmail,
        role: inviteRole,
        department_id: inviteDepartment || undefined,
      };

      const invitation = await InvitationService.createInvitation(params);
      const link = InvitationService.getInvitationLink(invitation.token);

      await navigator.clipboard.writeText(link);

      toast({
        title: '✅ Invitación creada',
        description: 'El link ha sido copiado al portapapeles',
      });

      setInviteEmail('');
      setInviteRole('staff');
      setInviteDepartment('');
      setShowInviteDialog(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la invitación',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async (token: string) => {
    const link = InvitationService.getInvitationLink(token);
    await navigator.clipboard.writeText(link);
    toast({
      title: '✅ Link copiado',
      description: 'El link de invitación ha sido copiado',
    });
  };

  const handleCancelInvitation = async (id: string) => {
    try {
      await InvitationService.cancelInvitation(id);
      toast({
        title: '✅ Invitación cancelada',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la invitación',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      const invitation = await InvitationService.resendInvitation(id);
      const link = InvitationService.getInvitationLink(invitation.token);
      await navigator.clipboard.writeText(link);
      
      toast({
        title: '✅ Invitación reenviada',
        description: 'El nuevo link ha sido copiado al portapapeles',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo reenviar la invitación',
        variant: 'destructive',
      });
    }
  };

  const handleCreateDepartment = async () => {
    if (!departmentName) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        variant: 'destructive',
      });
      return;
    }

    try {
      await DepartmentService.create(departmentName, departmentDescription);
      toast({
        title: '✅ Departamento creado',
      });
      setDepartmentName('');
      setDepartmentDescription('');
      setShowDepartmentDialog(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el departamento',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await DepartmentService.delete(id);
      toast({
        title: '✅ Departamento eliminado',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el departamento',
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No tienes permisos para acceder a esta sección
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestiona usuarios, invitaciones y departamentos</p>
      </div>

      <Tabs defaultValue="invitations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invitations">
            <Mail className="w-4 h-4 mr-2" />
            Invitaciones
          </TabsTrigger>
          <TabsTrigger value="departments">
            <Building2 className="w-4 h-4 mr-2" />
            Departamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invitaciones Pendientes</CardTitle>
                  <CardDescription>
                    Invita nuevos usuarios a la plataforma
                  </CardDescription>
                </div>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Invitación
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Invitación</DialogTitle>
                      <DialogDescription>
                        Invita a un nuevo usuario a unirse a la plataforma
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="usuario@ejemplo.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rol</Label>
                        <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="staff">Personal</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Departamento (opcional)</Label>
                        <Select value={inviteDepartment} onValueChange={setInviteDepartment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar departamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin departamento</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateInvitation} className="w-full">
                        Crear Invitación
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">Cargando...</p>
              ) : invitations.length === 0 ? (
                <p className="text-center text-muted-foreground">No hay invitaciones pendientes</p>
              ) : (
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Rol: {invitation.role} • Expira:{' '}
                          {format(new Date(invitation.expires_at), 'PPp', { locale: es })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyLink(invitation.token)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(invitation.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Departamentos</CardTitle>
                  <CardDescription>
                    Organiza tu equipo en departamentos
                  </CardDescription>
                </div>
                <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Departamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Departamento</DialogTitle>
                      <DialogDescription>
                        Crea un nuevo departamento para organizar tu equipo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="dept-name">Nombre</Label>
                        <Input
                          id="dept-name"
                          placeholder="Ej: Cocina, Servicio, Administración"
                          value={departmentName}
                          onChange={(e) => setDepartmentName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dept-desc">Descripción (opcional)</Label>
                        <Input
                          id="dept-desc"
                          placeholder="Descripción del departamento"
                          value={departmentDescription}
                          onChange={(e) => setDepartmentDescription(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCreateDepartment} className="w-full">
                        Crear Departamento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">Cargando...</p>
              ) : departments.length === 0 ? (
                <p className="text-center text-muted-foreground">No hay departamentos creados</p>
              ) : (
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{dept.name}</p>
                        {dept.description && (
                          <p className="text-sm text-muted-foreground">{dept.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDepartment(dept.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
