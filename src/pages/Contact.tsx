
import React, { useState } from 'react';
import { Mail, MessageSquare, Users, Send } from 'lucide-react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import NavigationCTA from '@/components/NavigationCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    type: 'general',
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactTypes = [
    { value: 'general', label: t('contact.general'), icon: <MessageSquare className="w-5 h-5" /> },
    { value: 'technique', label: t('contact.technical'), icon: <Mail className="w-5 h-5" /> },
    { value: 'partenariat', label: t('contact.partnership'), icon: <Users className="w-5 h-5" /> }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailSubject = `[InfoEau.fr] ${contactTypes.find(ct => ct.value === formData.type)?.label} - ${formData.subject}`;
    const emailBody = `Type: ${contactTypes.find(ct => ct.value === formData.type)?.label}\n\nNom: ${formData.name}\nEmail: ${formData.email}\nSujet: ${formData.subject}\n\nMessage:\n${formData.message}\n\n---\nEnvoyé depuis InfoEau.fr`;
    window.location.href = `mailto:nth.orso@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    toast({ title: t('contact.redirecting'), description: t('contact.redirectDesc') });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <SEOHead {...seoData.contact} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 md:py-12">
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
              <Mail className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
              <span>{t('contact.title')}</span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">{t('contact.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t('contact.formTitle')}</CardTitle>
                  <p className="text-gray-600">{t('contact.formSubtitle')}</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">{t('contact.requestType')}</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {contactTypes.map((type) => (
                          <label key={type.value} className="relative">
                            <input type="radio" name="type" value={type.value} checked={formData.type === type.value} onChange={handleInputChange} className="sr-only" />
                            <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.type === type.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                              <div className="flex items-center space-x-2">{type.icon}<span className="font-medium">{type.label}</span></div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">{t('contact.fullName')}</label>
                        <Input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} placeholder={t('contact.yourName')} />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('contact.email')}</label>
                        <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="votre@email.com" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">{t('contact.subject')}</label>
                      <Input id="subject" name="subject" type="text" required value={formData.subject} onChange={handleInputChange} placeholder={t('contact.subjectPlaceholder')} />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">{t('contact.message')}</label>
                      <Textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleInputChange} placeholder={t('contact.messagePlaceholder')} className="resize-none" />
                    </div>
                    <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>{t('contact.send')}</span>
                    </Button>
                    <p className="text-sm text-gray-500 text-center">{t('contact.required')}</p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>{t('contact.infoTitle')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('contact.mainEmail')}</h4>
                    <p className="text-gray-600">nth.orso@gmail.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('contact.creator')}</h4>
                    <p className="text-gray-600">Nathan Orso</p>
                    <a href="https://www.linkedin.com/in/nathan-orso-bdx/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">{t('contact.linkedinProfile')}</a>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{t('contact.responseTime')}</h4>
                    <p className="text-gray-600 text-sm">{t('contact.responseDesc')}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>{t('contact.requestTypes')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><h4 className="font-semibold text-gray-900 mb-1">{t('contact.general')}</h4><p className="text-sm text-gray-600">{t('contact.generalDesc')}</p></div>
                  <div><h4 className="font-semibold text-gray-900 mb-1">{t('contact.technical')}</h4><p className="text-sm text-gray-600">{t('contact.technicalDesc')}</p></div>
                  <div><h4 className="font-semibold text-gray-900 mb-1">{t('contact.partnership')}</h4><p className="text-sm text-gray-600">{t('contact.partnershipDesc')}</p></div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-green-800 mb-2">{t('contact.citizenProject')}</h4>
                  <p className="text-sm text-green-700">{t('contact.citizenDesc')}</p>
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
