import React, { useMemo, useState } from 'react';
import { Link } from '@/components/LocalizedLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import InternalLinkHub from '@/components/InternalLinkHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  MapPin,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { allCommunes, communeToSlug } from '@/utils/communeSlug';
import { useLanguage } from '@/contexts/LanguageContext';

const GuideMaCommune: React.FC = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const communes = useMemo(() => allCommunes(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return communes.slice(0, 24);
    return communes
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.postcode.startsWith(q),
      )
      .slice(0, 24);
  }, [communes, query]);

  const KEY_QUESTIONS = [
    { id: 'potable', icon: ShieldCheck, q: t('guide.commune.q1.q'), a: t('guide.commune.q1.a') },
    { id: 'polluants', icon: AlertTriangle, q: t('guide.commune.q2.q'), a: t('guide.commune.q2.a') },
    { id: 'durete', icon: FlaskConical, q: t('guide.commune.q3.q'), a: t('guide.commune.q3.a') },
    { id: 'gout-odeur', icon: Droplets, q: t('guide.commune.q4.q'), a: t('guide.commune.q4.a') },
    { id: 'filtrer', icon: Filter, q: t('guide.commune.q5.q'), a: t('guide.commune.q5.a') },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: KEY_QUESTIONS.map((k) => ({
      '@type': 'Question',
      name: k.q,
      acceptedAnswer: { '@type': 'Answer', text: k.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://infoeau.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://infoeau.fr/guide/ma-commune' },
      { '@type': 'ListItem', position: 3, name: 'Ma commune', item: 'https://infoeau.fr/guide/ma-commune' },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={t('guide.commune.seo.title')}
        description={t('guide.commune.seo.description')}
        keywords="qualité eau ma commune, eau du robinet commune, guide eau potable, PFAS commune, dureté eau commune, analyse eau ARS"
        canonical="/guide/ma-commune"
        schemaData={[faqSchema, breadcrumbSchema]}
      />

      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-sky-50 via-white to-green-50 py-12 md:py-16 px-4 border-b border-border">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              {t('guide.commune.badge')}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('guide.commune.h1')}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('guide.commune.intro')}
            </p>

            {/* Commune search */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm max-w-xl mx-auto">
              <label
                htmlFor="commune-search"
                className="text-sm font-semibold text-foreground block mb-2 text-left"
              >
                {t('guide.commune.search.label')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="commune-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('guide.commune.search.placeholder')}
                  className="pl-9"
                />
              </div>
              {filtered.length > 0 && (
                <ul className="mt-3 max-h-64 overflow-y-auto text-left divide-y divide-border">
                  {filtered.map((c) => (
                    <li key={c.citycode}>
                      <Link
                        to={`/qualite-eau/${communeToSlug(c)}`}
                        className="flex items-center justify-between py-2 px-2 rounded hover:bg-muted transition-colors"
                      >
                        <span className="inline-flex items-center gap-2 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {c.name}
                          <span className="text-xs text-muted-foreground">
                            ({c.postcode})
                          </span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {query && filtered.length === 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  {t('guide.commune.search.empty')}{' '}
                  <Link to="/qualite-eau" className="text-primary underline">
                    {t('guide.commune.search.emptyLink')}
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Key questions */}
        <section className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            {t('guide.commune.q.title')}
          </h2>

          <div className="grid gap-4">
            {KEY_QUESTIONS.map((k, i) => {
              const Icon = k.icon;
              return (
                <Card key={k.id} className="border-border">
                  <CardHeader className="flex-row items-start gap-4 space-y-0 pb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        {t('guide.commune.q.label')} {i + 1}
                      </div>
                      <CardTitle className="text-lg leading-snug">
                        {k.q}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-[4.5rem]">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {k.a}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How to read your commune page */}
        <section className="bg-muted/40 py-12 md:py-16 px-4 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              {t('guide.commune.how.title')}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="score">
                <AccordionTrigger>{t('guide.commune.how.score.q')}</AccordionTrigger>
                <AccordionContent>{t('guide.commune.how.score.a')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="conformite">
                <AccordionTrigger>{t('guide.commune.how.conf.q')}</AccordionTrigger>
                <AccordionContent>{t('guide.commune.how.conf.a')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="preleve">
                <AccordionTrigger>{t('guide.commune.how.date.q')}</AccordionTrigger>
                <AccordionContent>{t('guide.commune.how.date.a')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="parametres">
                <AccordionTrigger>{t('guide.commune.how.params.q')}</AccordionTrigger>
                <AccordionContent>{t('guide.commune.how.params.a')}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-4xl px-4 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t('guide.commune.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t('guide.commune.cta.body')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/qualite-eau">{t('guide.commune.cta.all')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/carte">{t('guide.commune.cta.map')}</Link>
            </Button>
          </div>
        </section>

        <InternalLinkHub
          heading={t('guide.commune.hub.heading')}
          description={t('guide.commune.hub.description')}
        />
      </main>
      <Footer />
    </div>
  );
};

export default GuideMaCommune;
