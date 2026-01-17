import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signIn, signUp, resetPassword, updatePassword } from "@/lib/supabase";
import { InvitationService } from "@/services/invitationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !searchParams.get('reset')) {
      navigate("/events");
    }
    // Check if this is a password reset callback
    if (searchParams.get('reset') === 'true') {
      setIsResettingPassword(true);
    }

    const token = searchParams.get('invitation');
    if (token) {
      validateInvitation(token);
    }
  }, [user, navigate, searchParams]);

  const validateInvitation = async (token: string) => {
    const validation = await InvitationService.validateToken(token);
    if (validation.valid && validation.invitation) {
      setInvitationToken(token);
      setInvitationValid(true);
      setInvitationEmail(validation.invitation.email);
      setEmail(validation.invitation.email);
      toast({
        title: "✅ Invitación válida",
        description: `Bienvenido! Completa tu registro para ${validation.invitation.email}`,
      });
    } else {
      toast({
        title: "❌ Invitación inválida",
        description: validation.error || "La invitación no es válida o ha expirado",
        variant: "destructive",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/events");
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu nombre completo",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!invitationToken) {
      toast({
        title: "Error",
        description: "Necesitas una invitación válida para registrarte",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await InvitationService.markAsUsed(invitationToken);

      toast({
        title: "¡Cuenta creada!",
        description: "Por favor revisa tu email para confirmar tu cuenta",
      });
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña",
      });
      setShowResetForm(false);
    }

    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await updatePassword(newPassword);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente",
      });
      setIsResettingPassword(false);
      navigate("/events");
    }

    setLoading(false);
  };

  // Password reset update form
  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-section-info to-section-menu p-4">
        <Card className="w-full max-w-md p-8 shadow-medium">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Nueva Contraseña</h1>
          <p className="text-center text-muted-foreground mb-8">
            Ingresa tu nueva contraseña
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Contraseña
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Password reset request form
  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-section-info to-section-menu p-4">
        <Card className="w-full max-w-md p-8 shadow-medium">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Recuperar Contraseña</h1>
          <p className="text-center text-muted-foreground mb-8">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar enlace de recuperación
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setShowResetForm(false)}
            >
              Volver al inicio de sesión
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4">
      <Card className="w-full max-w-md p-4 md:p-8 shadow-medium">
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Gestión de Eventos</h1>
        <p className="text-center text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
          Organiza y gestiona tus eventos profesionales
        </p>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8">
            <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={() => setShowResetForm(true)}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            {invitationValid && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Invitación válida para: <strong>{invitationEmail}</strong>
                </AlertDescription>
              </Alert>
            )}

            {!invitationToken && (
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Necesitas una invitación para registrarte. Contacta con un administrador.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nombre Completo</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading || !invitationToken}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || invitationToken !== null}
                  readOnly={invitationToken !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || !invitationToken}
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !invitationToken}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
