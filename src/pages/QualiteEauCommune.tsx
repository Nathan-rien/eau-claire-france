import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Droplets, ShieldCheck, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { useWaterQuality } from '@/hooks/useWaterQuality';
import { FRENCH_CITIES } from '@/data/frenchCities';
import { communeToSlug, findCommuneBySlug } from '@/utils/communeSlug';
import { useLanguage } from '@/contexts/LanguageContext';

const QualiteEauCommune: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const commune = slug ? findCommuneBySlug(slug) : undefined;


  if (!commune) return <Navigate to="/qualite-eau" replace />;

  const { data, isLoading } = useWaterQuality(commune.name);

  const results = data?.data ?? [];
  const score = data?.score;
  const grade = data?.grade;
  const lastAnalysis = data?.lastAnalysis;

  const nonConforme = results.filter((r) => r.conformite === 'Non conforme');
  const params = Array.from(new Set(results.map((r) => r.parametreAnalyse))).slice(0, 20);

  // Extract real values for dureté (TH), nitrates, chlore — for keyword-rich SEO copy
  const findLatest = (regex: RegExp) => results.find((r) => regex.test(r.parametreAnalyse ?? ''));
  const durete = findLatest(/dureté|titre hydrotim|TH\b/i);
  const nitrates = findLatest(/nitrate/i);
  const chlore = findLatest(/chlore/i);
  const pH = findLatest(/^pH|potentiel hydrog/i);

  const dureteText = durete
    ? `${Number(durete.valeurParametre).toFixed(1)} °f (${Number(durete.valeurParametre) < 15 ? 'douce' : Number(durete.valeurParametre) < 30 ? 'moyennement dure' : 'dure'})`
    : null;
  const nitratesText = nitrates
    ? `${Number(nitrates.valeurParametre).toFixed(1)} mg/L (limite 50 mg/L)`
    : null;

  // Neighbors: same region, up to 5
  const neighbors = FRENCH_CITIES
    .filter((c) => c.context === commune.context && c.citycode !== commune.citycode)
    .slice(0, 6);

  // Thin content protection: no data yet → soft noindex to avoid low-quality pages in index
  const hasData = results.length > 0;

  // Shorter title (<60 chars target) — Google truncates otherwise
  const title = `Qualité de l'eau à ${commune.name} (${commune.postcode})`;
  const description = hasData
    ? `Analyse eau potable ${commune.name} : ${nonConforme.length === 0 ? 'conforme' : `${nonConforme.length} non-conformité(s)`}${dureteText ? `, dureté ${dureteText}` : ''}${nitratesText ? `, nitrates ${nitratesText}` : ''}. Dernier prélèvement ARS ${lastAnalysis ? new Date(lastAnalysis).toLocaleDateString('fr-FR') : ''}.`.slice(0, 158)
    : `Analyse officielle de l'eau du robinet à ${commune.name} (${commune.postcode}) : conformité, polluants, dureté et derniers prélèvements ARS via Hub'Eau.`;
  const canonical = `/qualite-eau/${slug}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `L'eau du robinet est-elle potable à ${commune.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${nonConforme.length === 0 ? `Oui, l'eau distribuée à ${commune.name} (${commune.postcode}) est conforme aux limites réglementaires du contrôle sanitaire ARS sur les derniers prélèvements officiels Hub'Eau.` : `L'eau de ${commune.name} présente ${nonConforme.length} paramètre(s) non conforme(s) sur les derniers prélèvements ARS : ${Array.from(new Set(nonConforme.map((n) => n.parametreAnalyse))).slice(0, 3).join(', ')}. Elle reste distribuée sous surveillance renforcée.`}`,
        },
      },
      {
        '@type': 'Question',
        name: `Quelle est la dureté de l'eau à ${commune.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: dureteText
            ? `La dureté de l'eau à ${commune.name} est de ${dureteText} au dernier prélèvement officiel. Elle mesure la teneur en calcium et magnésium (titre hydrotimétrique).`
            : `La dureté de l'eau (titre hydrotimétrique TH) à ${commune.name} varie selon la ressource. Consultez le tableau des derniers prélèvements ARS ci-dessus pour la valeur exacte.`,
        },
      },
      {
        '@type': 'Question',
        name: `Y a-t-il des polluants dans l'eau à ${commune.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Le contrôle sanitaire de l'eau à ${commune.name} surveille nitrates${nitratesText ? ` (${nitratesText})` : ''}, pesticides, PFAS, métaux lourds (plomb, arsenic) et paramètres microbiologiques. ${nonConforme.length === 0 ? 'Aucun dépassement de seuil n\'a été relevé sur les derniers prélèvements.' : `Dépassements récents : ${Array.from(new Set(nonConforme.map((n) => n.parametreAnalyse))).slice(0, 3).join(', ')}.`}`,
        },
      },
      {
        '@type': 'Question',
        name: `Où trouver le rapport officiel d'analyse de l'eau à ${commune.name} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Le rapport officiel d'analyse de l'eau à ${commune.name} est publié par le Ministère de la Santé sur orobnat.sante.gouv.fr et exposé via l'API Hub'Eau. InfoEau.fr agrège ces données ARS sur cette page.`,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://infoeau.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Qualité de l\'eau par commune', item: 'https://infoeau.fr/qualite-eau' },
      { '@type': 'ListItem', position: 3, name: commune.name, item: `https://infoeau.fr${canonical}` },
    ],
  };

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: commune.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: commune.name,
      postalCode: commune.postcode,
      addressRegion: commune.context,
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: commune.coordinates[1],
      longitude: commune.coordinates[0],
    },
  };

  // Dataset schema — freshness + provenance signal for Google Dataset Search
  const datasetSchema = hasData ? {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Contrôle sanitaire de l'eau potable à ${commune.name} (${commune.postcode})`,
    description: `Résultats officiels du contrôle sanitaire de l'eau du robinet à ${commune.name} : conformité, polluants, dureté, nitrates. Source Hub'Eau / ARS.`,
    url: `https://infoeau.fr${canonical}`,
    keywords: [`qualité eau ${commune.name}`, `eau du robinet ${commune.name}`, 'contrôle sanitaire ARS', 'Hub\'Eau'],
    creator: { '@type': 'Organization', name: 'Ministère de la Santé' },
    publisher: { '@type': 'Organization', name: 'InfoEau.fr', url: 'https://infoeau.fr' },
    license: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence',
    spatialCoverage: {
      '@type': 'Place',
      geo: { '@type': 'GeoCoordinates', latitude: commune.coordinates[1], longitude: commune.coordinates[0] },
    },
    ...(lastAnalysis && { temporalCoverage: `${lastAnalysis}/..`, dateModified: lastAnalysis }),
    isBasedOn: 'https://hubeau.eaufrance.fr/page/api-qualite-eau-potable',
  } : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={title}
        description={description}
        keywords={`qualité eau ${commune.name}, eau du robinet ${commune.name}, analyse eau potable ${commune.name}, dureté eau ${commune.name}, nitrates ${commune.name}, ${commune.postcode}, polluants ${commune.name}, contrôle sanitaire ARS`}
        canonical={canonical}
        noindex={!hasData && !isLoading}
        schemaData={[faqSchema, breadcrumbSchema, placeSchema, ...(datasetSchema ? [datasetSchema] : [])]}
      />
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="container mx-auto max-w-5xl px-4 pt-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">{t('common.breadcrumb.home')}</Link></li>
            <li>›</li>
            <li><Link to="/qualite-eau" className="hover:text-primary">{t('commune.breadcrumb.list')}</Link></li>
            <li>›</li>
            <li className="text-foreground font-medium">{commune.name}</li>
          </ol>
        </nav>


        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary mt-1" />
            <span className="text-sm text-muted-foreground">{commune.context}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            {title}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            {hasData ? (
              <>
                Eau du robinet à <strong>{commune.name}</strong> ({commune.postcode}) :{' '}
                {nonConforme.length === 0 ? 'conforme aux limites réglementaires' : `${nonConforme.length} non-conformité(s) relevée(s)`}
                {dureteText && <>, dureté <strong>{dureteText}</strong></>}
                {nitratesText && <>, nitrates <strong>{nitratesText}</strong></>}
                {lastAnalysis && <> — dernier prélèvement ARS du {new Date(lastAnalysis).toLocaleDateString('fr-FR')}</>}.
              </>
            ) : (
              <>Score de qualité, conformité sanitaire, polluants surveillés et dernier prélèvement officiel pour l'eau du robinet à {commune.name} ({commune.postcode}).</>
            )}
          </p>
        </section>

        {/* Summary */}
        <section className="container mx-auto max-w-5xl px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">{t('commune.card.score')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-10 bg-muted rounded animate-pulse" />
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">{score ?? '—'}</span>
                    {grade && <Badge variant="secondary">{t('commune.card.grade', { grade })}</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">{t('commune.card.compliance')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-10 bg-muted rounded animate-pulse" />
                ) : nonConforme.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-semibold">{t('commune.card.compliant')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">{t('commune.card.nonCompliant', { count: String(nonConforme.length) })}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">{t('commune.card.lastSample')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    {lastAnalysis ? new Date(lastAnalysis).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Analyse content */}
        <section className="container mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-2xl font-bold mb-4">{t('commune.analysis.title', { name: commune.name })}</h2>
          <div className="prose prose-slate max-w-none">
            <p>
              {t('commune.analysis.intro', { name: commune.name, postcode: commune.postcode, context: commune.context })}
            </p>
            {params.length > 0 && (
              <>
                <h3>{t('commune.analysis.recentTitle')}</h3>
                <p>{t('commune.analysis.recentBody', { name: commune.name, params: params.join(', ') })}</p>
              </>
            )}
            {nonConforme.length > 0 && (
              <>
                <h3>{t('commune.analysis.watchTitle')}</h3>
                <p>
                  {t('commune.analysis.watchBody', {
                    count: String(nonConforme.length),
                    list: Array.from(new Set(nonConforme.map((n) => n.parametreAnalyse))).join(', '),
                  })}
                </p>
              </>
            )}
          </div>
        </section>


        {/* Last samples table */}
        {results.length > 0 && (
          <section className="container mx-auto max-w-5xl px-4 py-6">
            <h2 className="text-2xl font-bold mb-4">{t('commune.table.title')}</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">{t('commune.table.date')}</th>
                    <th className="text-left px-3 py-2 font-semibold">{t('commune.table.param')}</th>
                    <th className="text-right px-3 py-2 font-semibold">{t('commune.table.value')}</th>
                    <th className="text-right px-3 py-2 font-semibold">{t('commune.table.limit')}</th>
                    <th className="text-left px-3 py-2 font-semibold">{t('commune.table.conformity')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...results].sort((a, b) => {
                    const rank = (c: string) => c === 'Non conforme' ? 0 : c === 'Non déterminé' ? 2 : 1;
                    return rank(a.conformite) - rank(b.conformite);
                  }).slice(0, 15).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(r.datePrelevement).toLocaleDateString('fr-FR')}</td>
                      <td className="px-3 py-2">{r.parametreAnalyse}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.valeurParametre} {r.uniteParametre}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.limiteQualite || '—'}</td>
                      <td className="px-3 py-2">
                        {r.conformite === 'Conforme' ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">{t('commune.card.compliant')}</Badge>
                        ) : r.conformite === 'Non conforme' ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">Non conforme</Badge>
                        ) : (
                          <Badge variant="outline">{t('commune.table.undetermined')}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('commune.table.source')} <a href={`https://orobnat.sante.gouv.fr/orobnat/rechercherResultatQualite.do?methode=menu&usd=AEP&idRegion=&departement=&communeDepartement=&commune=${encodeURIComponent(commune.name)}`} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">{t('commune.table.officialReport')} <ExternalLink className="w-3 h-3" /></a>
            </p>
          </section>
        )}


        {/* FAQ */}
        <section className="container mx-auto max-w-5xl px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">{t('commune.faq.title', { name: commune.name })}</h2>
          <div className="space-y-4">
            {(faqSchema.mainEntity as any[]).map((q, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-1">{q.name}</h3>
                <p className="text-sm text-muted-foreground">{q.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="container mx-auto max-w-5xl px-4 py-6">
          <div className="bg-gradient-to-br from-sky-50 to-green-50 rounded-2xl p-6 md:p-8 border border-border">
            <h2 className="text-xl md:text-2xl font-bold mb-2">{t('commune.cta.title')}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {t('commune.cta.body')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/diagnostic">{t('commune.cta.diagnostic')} <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/quelle-eau-boire">{t('commune.cta.which')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/carte">{t('commune.cta.map')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Neighboring communes */}
        {neighbors.length > 0 && (
          <section className="container mx-auto max-w-5xl px-4 py-8">
            <h2 className="text-xl font-bold mb-4">{t('commune.neighbors.title', { context: commune.context })}</h2>
            <div className="flex flex-wrap gap-2">
              {neighbors.map((n) => (
                <Link
                  key={n.citycode}
                  to={`/qualite-eau/${communeToSlug(n)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm hover:bg-muted transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 opacity-60" />
                  {n.name} <span className="text-xs text-muted-foreground">({n.postcode})</span>
                </Link>
              ))}
              <Link
                to="/qualite-eau"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-primary hover:underline"
              >
                {t('commune.neighbors.all')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default QualiteEauCommune;
