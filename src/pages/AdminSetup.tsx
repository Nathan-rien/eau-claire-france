import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si déjà admin, rediriger vers /admin
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    setCheckingAdmin(false);
  }, [isAdmin, navigate]);

  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Créer le compte utilisateur
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            is_admin_setup: true
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error("Erreur lors de la création du compte");
      }

      // 2. Se connecter immédiatement
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      // 3. Appeler une edge function pour créer le rôle admin
      const { error: adminError } = await supabase.functions.invoke('admin-create-first-admin', {
        body: { user_id: signUpData.user.id }
      });

      if (adminError) {
        console.error('Erreur création rôle admin:', adminError);
        toast({
          title: "Compte créé mais...",
          description: "Vous devez ajouter manuellement le rôle admin dans Supabase (table user_roles)",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Admin créé avec succès",
          description: "Redirection vers le tableau de bord admin...",
        });
        
        // Attendre un peu que le rôle se propage
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }

    } catch (error: any) {
      console.error('Erreur setup admin:', error);
      
      let errorMessage = "Une erreur s'est produite lors de la création du compte admin.";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Ce compte existe déjà. Connectez-vous via /auth puis contactez un administrateur pour obtenir les droits admin.";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule et chiffre.";
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Configuration Admin InfoEau</CardTitle>
          <CardDescription className="text-base">
            Créez le premier compte administrateur pour accéder au panneau d'administration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {user && !isAdmin && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Vous êtes connecté en tant que <strong>{user.email}</strong> mais vous n'avez pas les droits admin.
                <br />
                <br />
                Pour obtenir les droits admin, exécutez cette commande SQL dans Supabase:
                <pre className="mt-2 p-2 bg-gray-900 text-green-400 text-xs rounded overflow-x-auto">
{`INSERT INTO user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {!user && (
            <form onSubmit={createAdminUser} className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Cette interface crée le premier compte administrateur. Après création, utilisez <code className="bg-gray-100 px-1 rounded">/auth</code> pour vous connecter.
                </AlertDescription>
              </Alert>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email administrateur
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@infoeau.fr"
                  required
                  disabled={loading}
                  className="border-2"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  required
                  minLength={8}
                  disabled={loading}
                  className="border-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 8 caractères avec majuscule, minuscule et chiffre
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-green-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Créer le compte admin
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 text-sm">Alternative manuelle :</h4>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Créer un compte via <a href="/auth" className="text-blue-600 hover:underline">/auth</a></li>
              <li>2. Dans Supabase, aller à Table Editor → user_roles</li>
              <li>3. Insérer une ligne avec votre user_id et role='admin'</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
