
import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SearchBar from './SearchBar';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';

const AlertSubscriptionForm = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [commune, setCommune] = useState('');
  const [consentRgpd, setConsentRgpd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const alertSchema = z.object({
    email: z.string()
      .email(t('comp.alertForm.invalidEmail'))
      .max(255, t('comp.alertForm.emailTooLong'))
      .toLowerCase()
      .trim(),
    commune: z.string()
      .min(1, t('comp.alertForm.communeRequired'))
      .max(100, t('comp.alertForm.communeTooLong'))
      .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, t('comp.alertForm.communeInvalidChars'))
      .trim(),
    consent_rgpd: z.boolean().refine(val => val === true, {
      message: t('comp.alertForm.consentRequired')
    })
  });

  const handleCommuneSelect = (selectedCommune: string) => {
    setCommune(selectedCommune);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const validated = alertSchema.safeParse({ 
        email, 
        commune, 
        consent_rgpd: consentRgpd 
      });
      
      if (!validated.success) {
        const firstError = validated.error.errors[0];
        toast({
          title: t('comp.alertForm.validationError'),
          description: firstError.message,
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('comp.alertForm.authRequired'),
          description: t('comp.alertForm.authRequiredDesc'),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('alertes_utilisateurs')
        .insert([{
          email: validated.data.email,
          commune: validated.data.commune,
          consent_rgpd: validated.data.consent_rgpd
        }]);

      if (error) {
        console.error("Subscription error:", error);
        toast({
          title: t('comp.alertForm.subscriptionError'),
          description: t('comp.alertForm.subscriptionErrorDesc'),
          variant: "destructive",
        });
      } else {
        setIsSubmitted(true);
        toast({
          title: t('comp.alertForm.confirmed'),
          description: t('comp.alertForm.confirmedDesc'),
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: t('common.error'),
        description: t('comp.alertForm.genericError'),
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
              <h3 className="font-semibold">{t('comp.alertForm.confirmed')}</h3>
              <p className="text-sm">
                {t('comp.alertForm.confirmedDesc')}
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
          <span>{t('comp.alertForm.title')}</span>
        </CardTitle>
        <p className="text-sm text-blue-700">
          {t('comp.alertForm.subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('comp.alertForm.email')}
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
              {t('comp.alertForm.commune')}
            </label>
            <SearchBar
              onCitySelect={handleCommuneSelect}
              placeholder={t('comp.alertForm.communePlaceholder')}
            />
            {commune && (
              <p className="text-xs text-green-600 mt-1">
                {t('comp.alertForm.communeSelected')} {commune}
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
              {t('comp.alertForm.consent')}{' '}
              <a href="/mentions-legales" className="text-blue-600 hover:underline">
                {t('comp.alertForm.privacyPolicy')}
              </a>{' '}
              {t('comp.alertForm.required')}
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !email || !commune || !consentRgpd}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? t('comp.alertForm.submitting') : t('comp.alertForm.subscribe')}
          </Button>

          <div className="flex items-start space-x-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              {t('comp.alertForm.rgpdNotice')}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AlertSubscriptionForm;
