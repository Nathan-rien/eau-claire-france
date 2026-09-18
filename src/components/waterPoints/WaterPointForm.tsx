import React, { useState } from 'react';
import {
  MapPin,
  CheckCircle,
  AlertCircle,
  Crosshair,
  Loader2,
  Camera,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import {
  WATER_POINT_TYPES,
  WATER_POINT_TYPE_META,
  WATER_POINT_PHOTO_BUCKET,
  WaterPointType,
  WaterPointPotabilite,
  POTABILITE_META,
} from '@/data/waterPoints';

const pointSchema = z.object({
  type: z.enum(['fontaine_publique', 'source', 'point_recharge', 'autre']),
  latitude: z
    .number({ invalid_type_error: 'Latitude invalide' })
    .min(-90)
    .max(90),
  longitude: z
    .number({ invalid_type_error: 'Longitude invalide' })
    .min(-180)
    .max(180),
  description: z
    .string()
    .trim()
    .max(1000, 'Description trop longue (1000 caractères max)')
    .optional(),
  accessibilite: z
    .string()
    .trim()
    .max(500, 'Texte trop long (500 caractères max)')
    .optional(),
  statut_potabilite: z.enum([
    'non_verifie',
    'declare_potable',
    'declare_non_potable',
  ]),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Le consentement est requis',
  }),
});

interface WaterPointFormProps {
  onSubmitted?: () => void;
}

const WaterPointForm: React.FC<WaterPointFormProps> = ({ onSubmitted }) => {
  const [type, setType] = useState<WaterPointType>('fontaine_publique');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [address, setAddress] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [description, setDescription] = useState('');
  const [accessibilite, setAccessibilite] = useState('');
  const [potabilite, setPotabilite] =
    useState<WaterPointPotabilite>('non_verifie');
  const [photo, setPhoto] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoError(
        "La géolocalisation n'est pas disponible sur cet appareil. Saisissez une adresse ci-dessous."
      );
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setGeoError(
          'Position non obtenue. Saisissez une adresse ou une ville ci-dessous.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Fallback: resolve a free-text address with the French official address API.
  const geocodeAddress = async () => {
    if (address.trim().length < 3) return;
    setGeocoding(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?limit=1&q=${encodeURIComponent(
          address.trim()
        )}`
      );
      const json = await res.json();
      const feature = json?.features?.[0];
      if (!feature) {
        setGeoError('Adresse introuvable. Précisez la rue et la commune.');
        return;
      }
      const [lng, lat] = feature.geometry.coordinates;
      setLatitude(Number(lat).toFixed(6));
      setLongitude(Number(lng).toFixed(6));
      toast({
        title: 'Adresse localisée',
        description: feature.properties?.label ?? address,
      });
    } catch (err) {
      console.error('Address geocoding error:', err);
      setGeoError('Recherche impossible pour le moment. Réessayez.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = pointSchema.safeParse({
        type,
        latitude: latitude === '' ? NaN : Number(latitude),
        longitude: longitude === '' ? NaN : Number(longitude),
        description,
        accessibilite,
        statut_potabilite: potabilite,
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

      let photoPath: string | null = null;
      if (photo) {
        if (photo.size > 5 * 1024 * 1024) {
          toast({
            title: 'Photo trop lourde',
            description: '5 Mo maximum.',
            variant: 'destructive',
          });
          return;
        }
        const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
        const key = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(WATER_POINT_PHOTO_BUCKET)
          .upload(key, photo, { contentType: photo.type });
        if (uploadError) {
          console.error('Water point photo upload error:', uploadError);
          toast({
            title: 'Photo non envoyée',
            description: 'Le point sera enregistré sans photo.',
          });
        } else {
          photoPath = key;
        }
      }

      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('water_points').insert([
        {
          type: validated.data.type,
          latitude: validated.data.latitude,
          longitude: validated.data.longitude,
          description: validated.data.description || null,
          accessibilite: validated.data.accessibilite || null,
          statut_potabilite: validated.data.statut_potabilite,
          photo_url: photoPath,
          source_donnee: 'citoyen',
          statut_moderation: 'en_attente',
          soumis_par: userData.user?.id ?? null,
        },
      ]);

      if (error) {
        console.error('Water point submission error:', error);
        toast({
          title: 'Envoi impossible',
          description: 'Une erreur est survenue. Réessayez plus tard.',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitted(true);
      onSubmitted?.();
      toast({
        title: 'Merci pour votre contribution',
        description:
          'Votre point d\u2019eau est en attente de modération avant publication.',
      });
    } catch (err) {
      console.error('Water point submission error:', err);
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
              <h3 className="font-semibold">Point d&apos;eau reçu</h3>
              <p className="text-sm mt-1">
                Merci ! Votre signalement est en attente de modération. Il
                n&apos;apparaîtra sur la carte qu&apos;après validation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasCoords = latitude !== '' && longitude !== '';

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <MapPin className="w-6 h-6" />
          <span>Signaler un point d&apos;eau</span>
        </CardTitle>
        <p className="text-sm text-blue-700">
          Fontaine publique, source, point de recharge : ajoutez-le à la carte
          communautaire. Chaque contribution est modérée avant publication.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de point <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {WATER_POINT_TYPES.map((tp) => {
                const meta = WATER_POINT_TYPE_META[tp];
                const active = type === tp;
                return (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setType(tp)}
                    className={`min-h-[44px] px-3 py-2 rounded-full text-xs font-medium border transition ${
                      active
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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

          {/* Position */}
          <div className="rounded-lg border border-blue-200 bg-white p-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={locate}
                disabled={locating}
                className="min-h-[44px]"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Crosshair className="w-4 h-4 mr-2" />
                )}
                Utiliser ma position
              </Button>
              {hasCoords && (
                <span className="text-xs text-gray-600 font-mono">
                  {latitude}, {longitude}
                </span>
              )}
            </div>

            {geoError && (
              <p className="text-xs text-amber-700 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {geoError}
              </p>
            )}

            <div>
              <label
                htmlFor="wp-address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ou saisissez une adresse
              </label>
              <div className="flex gap-2">
                <Input
                  id="wp-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex. 12 rue de la Paix, Nantes"
                  maxLength={200}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={geocodeAddress}
                  disabled={geocoding || address.trim().length < 3}
                  className="min-h-[44px] flex-shrink-0"
                >
                  {geocoding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Localiser'
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="wp-lat"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Latitude
                </label>
                <Input
                  id="wp-lat"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  inputMode="decimal"
                  placeholder="47.218371"
                />
              </div>
              <div>
                <label
                  htmlFor="wp-lng"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Longitude
                </label>
                <Input
                  id="wp-lng"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  inputMode="decimal"
                  placeholder="-1.553621"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="wp-desc"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optionnel)
            </label>
            <Textarea
              id="wp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Ex. Fontaine en pierre sur la place du marché, débit correct."
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/1000 caractères
            </p>
          </div>

          {/* Accessibilité */}
          <div>
            <label
              htmlFor="wp-access"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Accessibilité (horaires, conditions d&apos;accès)
            </label>
            <Textarea
              id="wp-access"
              value={accessibilite}
              onChange={(e) => setAccessibilite(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Ex. Accessible 24h/24, coupée en hiver. Accès de plain-pied."
            />
          </div>

          {/* Potabilité */}
          <div>
            <label
              htmlFor="wp-potabilite"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Potabilité déclarée
            </label>
            <select
              id="wp-potabilite"
              value={potabilite}
              onChange={(e) =>
                setPotabilite(e.target.value as WaterPointPotabilite)
              }
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
            >
              {(
                Object.keys(POTABILITE_META) as WaterPointPotabilite[]
              ).map((p) => (
                <option key={p} value={p}>
                  {POTABILITE_META[p].label}
                </option>
              ))}
            </select>
          </div>

          {/* Photo */}
          <div>
            <label
              htmlFor="wp-photo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Photo (optionnel, 5 Mo max)
            </label>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <Input
                id="wp-photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <span className="font-semibold">
                Signalement communautaire, non vérifié officiellement.
              </span>{' '}
              La potabilité indiquée est déclarative et n&apos;a pas de valeur
              sanitaire. En cas de doute, ne consommez pas l&apos;eau.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="wp-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="wp-consent" className="text-sm text-gray-700">
              J&apos;accepte que ce point d&apos;eau soit publié anonymement
              après modération.
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !hasCoords || !consent}
            className="w-full bg-blue-600 hover:bg-blue-700 min-h-[44px]"
          >
            {isSubmitting ? 'Envoi…' : 'Envoyer ce point d\u2019eau'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WaterPointForm;
