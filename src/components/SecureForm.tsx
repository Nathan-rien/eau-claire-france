
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SecurityService } from '@/services/securityService';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const contactSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .min(1, 'Email requis')
    .max(255, 'Email trop long'),
  commune: z
    .string()
    .min(1, 'Commune requise')
    .max(100, 'Nom de commune trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Caractères invalides dans le nom de commune'),
  message: z
    .string()
    .max(1000, 'Message trop long')
    .optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface SecureFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  submitLabel: string;
  includeMessage?: boolean;
}

const SecureForm = ({ onSubmit, submitLabel, includeMessage = false }: SecureFormProps) => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: '',
      commune: '',
      message: '',
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    try {
      // Rate limiting check using SecurityService
      if (!SecurityService.checkRateLimit('form_submission', 60000)) {
        toast({
          title: "Trop de tentatives",
          description: "Veuillez attendre avant de soumettre à nouveau.",
          variant: "destructive"
        });
        return;
      }

      // Normalize and validate email
      const normalizedData = {
        ...data,
        email: SecurityService.normalizeEmail(data.email),
        commune: SecurityService.sanitizeInput(data.commune),
        message: data.message ? SecurityService.sanitizeInput(data.message) : undefined,
      };

      // Additional validation
      if (!SecurityService.isValidEmail(normalizedData.email)) {
        toast({
          title: "Email invalide",
          description: "Veuillez saisir un email valide.",
          variant: "destructive"
        });
        return;
      }

      if (!SecurityService.isValidCommune(normalizedData.commune)) {
        toast({
          title: "Commune invalide",
          description: "Veuillez saisir un nom de commune valide.",
          variant: "destructive"
        });
        return;
      }

      // Log security event
      SecurityService.logSecurityEvent('form_submission', { 
        type: submitLabel, 
        hasMessage: !!normalizedData.message 
      });

      await onSubmit(normalizedData);
      form.reset();
      
      toast({
        title: "Succès",
        description: "Votre demande a été envoyée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="votre.email@exemple.com"
                  className="border-2 border-gray-300 focus:border-blue-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commune"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commune *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nom de votre commune"
                  className="border-2 border-gray-300 focus:border-blue-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {includeMessage && (
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Votre message (optionnel)"
                    className="border-2 border-gray-300 focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Envoi...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
};

export default SecureForm;
