
import React, { useState } from 'react';
import { Mail, MessageSquare, Users, Send } from 'lucide-react';
import Layout from '@/components/Layout';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: 'general',
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactTypes = [
    { value: 'general', label: 'Demande générale', icon: <MessageSquare className="w-5 h-5" /> },
    { value: 'technique', label: 'Support technique', icon: <Mail className="w-5 h-5" /> },
    { value: 'partenariat', label: 'Partenariat', icon: <Users className="w-5 h-5" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construction de l'email
    const emailSubject = `[InfoEau.fr] ${formData.type === 'general' ? 'Demande générale' : formData.type === 'technique' ? 'Support technique' : 'Partenariat'} - ${formData.subject}`;
    const emailBody = `Type de demande: ${contactTypes.find(t => t.value === formData.type)?.label}

Nom: ${formData.name}
Email: ${formData.email}
Sujet: ${formData.subject}

Message:
${formData.message}

---
Envoyé depuis InfoEau.fr`;

    const mailtoLink = `mailto:contact@infoeau.fr?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: "Redirection vers votre client email",
      description: "Un email pré-rempli s'ouvre dans votre application de messagerie.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Mail className="w-10 h-10 text-blue-600" />
              <span>Nous contacter</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une question, une suggestion ou un projet de partenariat ? 
              Nous sommes à votre écoute pour améliorer InfoEau.fr.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Formulaire de contact</CardTitle>
                  <p className="text-gray-600">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type de demande */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type de demande *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {contactTypes.map((type) => (
                          <label key={type.value} className="relative">
                            <input
                              type="radio"
                              name="type"
                              value={type.value}
                              checked={formData.type === type.value}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              formData.type === type.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              <div className="flex items-center space-x-2">
                                {type.icon}
                                <span className="font-medium">{type.label}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Informations personnelles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Votre nom"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    {/* Sujet */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Résumé de votre demande"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Décrivez votre demande en détail..."
                        className="resize-none"
                      />
                    </div>

                    {/* Bouton d'envoi */}
                    <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Envoyer le message</span>
                    </Button>

                    <p className="text-sm text-gray-500 text-center">
                      * Champs obligatoires
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email principal</h4>
                    <p className="text-gray-600">contact@infoeau.fr</p>
                    <p className="text-sm text-gray-500 mt-1">
                      (redirige vers nth.orso@gmail.com)
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Créateur</h4>
                    <p className="text-gray-600">Nathan Orso</p>
                    <a 
                      href="https://www.linkedin.com/in/nathan-orso-bdx/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Profil LinkedIn
                    </a>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Délai de réponse</h4>
                    <p className="text-gray-600 text-sm">
                      Nous nous efforçons de répondre dans les 48h ouvrables.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Types de demandes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Demande générale</h4>
                    <p className="text-sm text-gray-600">Questions, suggestions, commentaires</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Support technique</h4>
                    <p className="text-sm text-gray-600">Problèmes d'affichage, bugs, données manquantes</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Partenariat</h4>
                    <p className="text-sm text-gray-600">Collaboration, intégration, projets communs</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-green-800 mb-2">Projet citoyen</h4>
                  <p className="text-sm text-green-700">
                    InfoEau.fr est un projet indépendant et bénévole. 
                    Votre soutien et vos retours nous aident à améliorer 
                    la transparence sur la qualité de l'eau en France.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <NavigationCTA />
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
