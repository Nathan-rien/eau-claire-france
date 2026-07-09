import React, { useState } from 'react';
import { z } from 'zod';
import { Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const schema = z.object({
  company_name: z.string().trim().min(1, 'Nom requis').max(150),
  contact_name: z.string().trim().min(1, 'Nom requis').max(150),
  email: z.string().trim().email('Email invalide').max(255),
  website: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal('')),
  product_category: z.string().trim().max(100).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Décrivez brièvement votre produit').max(2000),
});

const CATEGORIES = [
  'Arômes naturels / sirops',
  'Filtration & carafes',
  'Infusions & thés froids',
  'Concentrés & poudres',
  'Gourdes & accessoires',
  'Autre',
];

const TastePartnerForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    website: '',
    product_category: '',
    message: '',
  });

  const update = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Formulaire invalide');
      return;
    }
    setLoading(true);
    const payload = {
      company_name: parsed.data.company_name,
      contact_name: parsed.data.contact_name,
      email: parsed.data.email,
      website: parsed.data.website || null,
      product_category: parsed.data.product_category || null,
      message: parsed.data.message,
    };
    const { error } = await supabase.from('taste_partner_submissions').insert(payload);
    if (error) {
      setLoading(false);
      toast.error("Impossible d'envoyer votre demande. Réessayez plus tard.");
      return;
    }
    // Fire-and-forget email notification (does not block success UX)
    supabase.functions
      .invoke('notify-partner-submission', { body: payload })
      .catch((e) => console.error('notify-partner-submission failed', e));
    setLoading(false);
    setSent(true);
    toast.success('Demande envoyée. Nous revenons vers vous rapidement.');
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-green-50 p-5 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
        <h3 className="font-semibold text-gray-900 mb-1">Merci !</h3>
        <p className="text-sm text-gray-700">
          Votre demande de partenariat a bien été transmise à l'équipe InfoEau.
        </p>
      </div>
    );
  }

  return (
    <aside
      aria-labelledby="partner-form-title"
      className="rounded-xl border border-blue-200 bg-white shadow-lg overflow-hidden"
    >
      <div className="bg-gradient-to-br from-blue-600 to-green-500 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          <h3 id="partner-form-title" className="font-semibold text-sm md:text-base">
            Votre produit améliore le goût de l'eau ?
          </h3>
        </div>
        <p className="text-xs text-white/90 mt-1 leading-relaxed">
          Marques d'arômes, sirops, filtres, infusions… mettez en avant votre solution
          auprès des lecteurs d'InfoEau.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div>
          <Label htmlFor="company_name" className="text-xs">Entreprise *</Label>
          <Input
            id="company_name"
            value={form.company_name}
            onChange={update('company_name')}
            required
            maxLength={150}
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="contact_name" className="text-xs">Contact *</Label>
          <Input
            id="contact_name"
            value={form.contact_name}
            onChange={update('contact_name')}
            required
            maxLength={150}
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="partner_email" className="text-xs">Email *</Label>
          <Input
            id="partner_email"
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            maxLength={255}
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="website" className="text-xs">Site web</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://…"
            value={form.website}
            onChange={update('website')}
            maxLength={500}
            className="h-9"
          />
        </div>
        <div>
          <Label htmlFor="product_category" className="text-xs">Catégorie</Label>
          <Select
            value={form.product_category}
            onValueChange={(v) => setForm((f) => ({ ...f, product_category: v }))}
          >
            <SelectTrigger id="product_category" className="h-9">
              <SelectValue placeholder="Sélectionner…" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="partner_message" className="text-xs">Votre produit *</Label>
          <Textarea
            id="partner_message"
            value={form.message}
            onChange={update('message')}
            required
            maxLength={2000}
            rows={3}
            placeholder="Décrivez brièvement votre produit et votre objectif de mise en avant."
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          <Send className="w-4 h-4 mr-2" aria-hidden="true" />
          {loading ? 'Envoi…' : 'Proposer mon produit'}
        </Button>
        <p className="text-[10px] text-gray-500 leading-tight">
          En envoyant ce formulaire, vous acceptez d'être recontacté par l'équipe
          InfoEau au sujet de votre demande.
        </p>
      </form>
    </aside>
  );
};

export default TastePartnerForm;
