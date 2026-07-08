import React, { useState } from 'react';
import { MessageSquarePlus, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { REGION_CENTERS, TASTE_TAG_META, TasteTag } from '@/data/tasteReports';

const TAG_OPTIONS: TasteTag[] = [
  'chlore',
  'mineral',
  'metallique',
  'neutre',
  'variable',
];

const submissionSchema = z.object({
  region: z.string().max(80).optional().nullable(),
  locationLabel: z
    .string()
    .trim()
    .max(120, 'Lieu trop long (120 caractères max)')
    .optional(),
  quote: z
    .string()
    .trim()
    .min(5, 'Décrivez le goût en au moins 5 caractères')
    .max(1000, 'Message trop long (1000 caractères max)'),
  tag: z.enum(['chlore', 'mineral', 'metallique', 'neutre', 'variable']),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Email invalide')
    .max(255)
    .optional()
    .or(z.literal('')),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Le consentement est requis',
  }),
});

const REGIONS = Object.keys(REGION_CENTERS);

const TasteReportForm: React.FC = () => {
  const [region, setRegion] = useState<string>('');
  const [locationLabel, setLocationLabel] = useState('');
  const [tag, setTag] = useState<TasteTag>('chlore');
  const [quote, setQuote] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = submissionSchema.safeParse({
        region: region || null,
        locationLabel,
        quote,
        tag,
        email,
        consent,
      });

      if (!validated.success) {
        toast({
          title: 'Erreur de validation',
          description: validated.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('taste_reports_submissions')
        .insert([
          {
            region: validated.data.region ?? null,
            location_label: validated.data.locationLabel || null,
            quote: validated.data.quote,
            tag: validated.data.tag,
            email: validated.data.email ? validated.data.email : null,
            status: 'pending',
          },
        ]);

      if (error) {
        console.error('Taste submission error:', error);
        toast({
          title: 'Envoi impossible',
          description: 'Une erreur est survenue. Réessayez plus tard.',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitted(true);
      toast({
        title: 'Merci pour votre contribution',
        description:
          'Votre retour est en attente de modération avant publication.',
      });
    } catch (err) {
      console.error('Taste submission error:', err);
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 text-green-800">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Contribution reçue</h3>
              <p className="text-sm mt-1">
                Merci ! Votre témoignage est en attente de modération. Il
                n'apparaîtra publiquement qu'après validation par un
                administrateur.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <MessageSquarePlus className="w-6 h-6" />
          <span>Signaler le goût de l'eau chez vous</span>
        </CardTitle>
        <p className="text-sm text-blue-700">
          Partagez votre ressenti sur l'eau du robinet de votre commune. Chaque
          contribution est modérée avant publication.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Région
              </label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">— Non précisée —</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="locationLabel" className="block text-sm font-medium text-gray-700 mb-1">
                Ville ou lieu (optionnel)
              </label>
              <Input
                id="locationLabel"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                maxLength={120}
                placeholder="Ex. Nantes, quartier Bouffay"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de goût perçu
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((t) => {
                const meta = TASTE_TAG_META[t];
                const active = tag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      active
                        ? 'text-white border-transparent'
                        : `${meta.badgeClass} hover:opacity-80`
                    }`}
                    style={
                      active
                        ? { background: meta.color, borderColor: meta.color }
                        : {}
                    }
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
              Décrivez le goût <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Ex. Forte odeur de chlore le matin, disparaît si je laisse la carafe reposer."
              required
              minLength={5}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {quote.length}/1000 caractères
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (optionnel — pour que l'on puisse vous recontacter)
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="votre@email.com"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="taste-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="taste-consent" className="text-sm text-gray-700">
              J'accepte que ce témoignage soit publié anonymement après
              modération.{' '}
              <a href="/mentions-legales" className="text-blue-600 hover:underline">
                Politique de confidentialité
              </a>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || quote.trim().length < 5 || !consent}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Envoi…' : 'Envoyer mon témoignage'}
          </Button>

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Aucun retour n'est publié sans validation manuelle. L'email, si
              fourni, reste confidentiel et n'est jamais affiché publiquement.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TasteReportForm;
