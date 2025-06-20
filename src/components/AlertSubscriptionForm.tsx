
import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SearchBar from './SearchBar';

const AlertSubscriptionForm = () => {
  const [email, setEmail] = useState('');
  const [commune, setCommune] = useState('');
  const [consentRgpd, setConsentRgpd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleCommuneSelect = (selectedCommune: string) => {
    setCommune(selectedCommune);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !commune || !consentRgpd) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et accepter les conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('alertes_utilisateurs')
        .insert([
          {
            email: email.trim(),
            commune: commune.trim(),
            consent_rgpd: consentRgpd,
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Abonnement existant",
            description: "Vous êtes déjà abonné(e) aux alertes pour cette commune.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast({
          title: "Abonnement confirmé !",
          description: "Merci, vous serez alerté(e) par email en cas de problème de qualité de l'eau dans votre commune.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="mb-8 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-green-800">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Abonnement confirmé !</h3>
              <p className="text-sm">
                Merci, vous serez alerté(e) par email en cas de problème de qualité de l'eau dans votre commune.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <Bell className="w-6 h-6" />
          <span>Abonnement aux alertes locales de qualité de l'eau</span>
        </CardTitle>
        <p className="text-sm text-blue-700">
          Recevez un email automatique en cas de contamination ou pollution de l'eau dans votre commune.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="commune" className="block text-sm font-medium text-gray-700 mb-1">
              Commune *
            </label>
            <SearchBar
              onCitySelect={handleCommuneSelect}
              placeholder="Recherchez votre commune..."
            />
            {commune && (
              <p className="text-xs text-green-600 mt-1">
                Commune sélectionnée : {commune}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentRgpd}
              onChange={(e) => setConsentRgpd(e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              J'accepte de recevoir des alertes par email et j'ai lu la{' '}
              <a href="/mentions-legales" className="text-blue-600 hover:underline">
                politique de confidentialité
              </a>{' '}
              (obligatoire) *
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !email || !commune || !consentRgpd}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Inscription en cours...' : 'S\'abonner aux alertes'}
          </Button>

          <div className="flex items-start space-x-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Vos données sont traitées conformément au RGPD. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AlertSubscriptionForm;
