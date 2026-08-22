import React from 'react';
import { Link } from '@/components/LocalizedLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import InternalLinkHub from '@/components/InternalLinkHub';
import { MapPin } from 'lucide-react';
import { communeToSlug, communesByRegion, allCommunes } from '@/utils/communeSlug';
import { useLanguage } from '@/contexts/LanguageContext';
import TasteLinkCallout from '@/components/TasteLinkCallout';

const QualiteEauIndex: React.FC = () => {
  const { t } = useLanguage();
  const regions = communesByRegion();
  const total = allCommunes().length;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: "Comment connaître la qualité de l'eau dans ma commune ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Sélectionnez votre commune ci-dessous pour accéder à sa page dédiée : score de qualité, conformité, polluants détectés et dernier prélèvement officiel Hub'Eau.",
        },
      },
      {
        '@type': 'Question',
        name: "Les analyses proviennent-elles d'une source officielle ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui, les analyses affichées sont issues de l'API officielle Hub'Eau (Ministère de la Santé, ARS) sur le contrôle sanitaire des eaux destinées à la consommation humaine.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Qualité de l'eau dans ma commune — Analyse eau potable par ville"
        description={`Trouvez l'analyse officielle de l'eau du robinet dans votre commune. ${total} villes françaises couvertes : score, polluants, dureté et derniers prélèvements Hub'Eau.`}
        keywords="qualité eau ma commune, analyse eau potable commune, eau du robinet par ville, contrôle sanitaire eau"
        canonical="/qualite-eau"
        schemaData={faqSchema}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-sky-50 via-white to-green-50 py-12 md:py-16 px-4 border-b border-border">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('qualite.index.title')}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('qualite.index.subtitle', { total: String(total) })}
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
          <h2 className="text-xl md:text-2xl font-bold mb-6">{t('qualite.index.byRegion')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(regions)
              .sort(([a], [b]) => a.localeCompare(b, 'fr'))
              .map(([region, cities]) => (
                <div
                  key={region}
                  className="bg-card border border-border rounded-xl p-5 shadow-sm"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
                    {region}
                  </h3>
                  <ul className="space-y-1.5">
                    {cities.map((c) => (
                      <li key={c.citycode}>
                        <Link
                          to={`/qualite-eau/${communeToSlug(c)}`}
                          className="text-sm text-foreground hover:text-primary hover:underline inline-flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5 opacity-60" />
                          {c.name}
                          <span className="text-xs text-muted-foreground">({c.postcode})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>

        <div className="container mx-auto px-4">
          <TasteLinkCallout />
        </div>

        <InternalLinkHub
          heading={t('qualite.index.hubHeading')}
          description={t('qualite.index.hubDescription')}
        />
      </main>
      <Footer />
    </div>
  );
};

export default QualiteEauIndex;
