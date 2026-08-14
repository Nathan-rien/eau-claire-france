import { Link } from '@/components/LocalizedLink';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, Droplets, Info, Mountain, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWaterCompositions } from '@/hooks/useWaterCompositions';
import { getWaterRegion, REGION_LABELS } from '@/config/waterRegions';
import { REGION_PAGE_SLUGS, type RegionPageKey } from '@/config/regionPages';

const TODAY = new Date().toISOString().slice(0, 10);

const fmt = (v?: number) => (typeof v === 'number' && !Number.isNaN(v) ? String(v) : '—');

interface Props {
  region: RegionPageKey;
}

export default function EauxMineralesRegion({ region }: Props) {
  const { t, language } = useLanguage();
  const { waters, loading } = useWaterCompositions();

  const canonical = `/${REGION_PAGE_SLUGS[region]}`;
  const regionLabel = REGION_LABELS[region];
  // « des Alpes », « d'Auvergne », « the Alps »… : article + label from waterRegions.ts
  const regionPhrase = `${t(`regionPage.${region}.prefix`)}${regionLabel}`;
  const h1 = t('regionPage.h1', { region: regionPhrase });

  // Region membership comes ONLY from waterRegions.ts; values come ONLY from the dataset.
  const regionWaters = waters
    .filter((w) => getWaterRegion(w.brand) === region)
    .sort(
      (a, b) =>
        (b.composition.residu_sec_180_mg_L ?? -1) - (a.composition.residu_sec_180_mg_L ?? -1),
    );

  const FAQ = [
    { q: t(`regionPage.${region}.faq.q1.q`), a: t(`regionPage.${region}.faq.q1.a`) },
    { q: t(`regionPage.${region}.faq.q2.q`), a: t(`regionPage.${region}.faq.q2.a`) },
    {
      q: t('regionPage.faq.shared1.q', { region: regionPhrase }),
      a: t('regionPage.faq.shared1.a'),
    },
    {
      q: t('regionPage.faq.shared2.q', { region: regionPhrase }),
      a: t('regionPage.faq.shared2.a'),
    },
  ];

  const links = [
    { to: '/classement', title: t('regionPage.links.ranking'), desc: t('regionPage.links.ranking.desc') },
    { to: '/durete-eau-france', title: t('regionPage.links.durete'), desc: t('regionPage.links.durete.desc') },
    { to: '/qualite-eau', title: t('regionPage.links.quality'), desc: t('regionPage.links.quality.desc') },
  ];

  const description = t('regionPage.seo.desc', { region: regionPhrase });

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: h1,
      description,
      author: { '@type': 'Organization', name: 'InfoEau.fr' },
      publisher: {
        '@type': 'Organization',
        name: 'InfoEau.fr',
        logo: { '@type': 'ImageObject', url: 'https://infoeau.fr/favicon.svg' },
      },
      datePublished: TODAY,
      dateModified: TODAY,
      mainEntityOfPage: `https://infoeau.fr${canonical}`,
      inLanguage: language === 'en' ? 'en-US' : 'fr-FR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('common.breadcrumb.home'), item: 'https://infoeau.fr/' },
        { '@type': 'ListItem', position: 2, name: t('regionPage.breadcrumb.hub'), item: 'https://infoeau.fr/classement' },
        { '@type': 'ListItem', position: 3, name: h1, item: `https://infoeau.fr${canonical}` },
      ],
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={t('regionPage.seo.title', { region: regionPhrase })}
        description={description}
        canonical={canonical}
        keywords={`eaux minérales ${regionLabel}, eau en bouteille ${regionLabel}, composition eau minérale, minéralisation`}
        schemaData={schemas}
      />

      <div className="min-h-screen bg-background">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50">
          <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 lg:py-20">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">
                {t('common.breadcrumb.home')}
              </Link>
              <span className="mx-2">›</span>
              <Link to="/classement" className="hover:text-foreground">
                {t('regionPage.breadcrumb.hub')}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{regionLabel}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-700 mb-4">
              <Droplets className="w-4 h-4" />
              <span>{t('regionPage.tag')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
              {h1}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-4">
              {t(`regionPage.${region}.intro`)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/classement">
                  {t('regionPage.cta.ranking')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/durete-eau-france">{t('regionPage.cta.durete')}</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-white/70 backdrop-blur px-4 py-3 text-sm text-muted-foreground ring-1 ring-black/5 max-w-3xl">
              <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
              <p className="m-0">{t('regionPage.note')}</p>
            </div>
          </div>
        </section>

        {/* GEOLOGIE */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight flex items-center gap-3">
              <Mountain className="w-8 h-8 text-blue-600 shrink-0" />
              {t('regionPage.geo.title', { region: regionPhrase })}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t(`regionPage.${region}.geo1`)}</p>
            <p className="text-muted-foreground leading-relaxed mb-6">{t(`regionPage.${region}.geo2`)}</p>
            <Link
              to="/durete-eau-france"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
            >
              {t('regionPage.geo.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* LISTE DES EAUX */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-y border-border">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {t('regionPage.list.title', { region: regionPhrase })}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              {t('regionPage.list.intro')}
            </p>

            {loading ? (
              <p className="text-muted-foreground">{t('regionPage.list.loading')}</p>
            ) : regionWaters.length === 0 ? (
              <p className="text-muted-foreground">{t('regionPage.list.empty')}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-background">
                <Table className="min-w-[760px]">
                  <TableCaption className="px-4 pb-4 text-left">
                    {t('regionPage.list.caption')}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[220px]">{t('regionPage.list.col.brand')}</TableHead>
                      <TableHead>{t('regionPage.list.col.residu')}</TableHead>
                      <TableHead>{t('regionPage.list.col.ca')}</TableHead>
                      <TableHead>{t('regionPage.list.col.mg')}</TableHead>
                      <TableHead>{t('regionPage.list.col.na')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regionWaters.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="align-top">
                          <span className="font-semibold text-foreground">{w.brand}</span>
                          {w.is_sparkling && (
                            <Badge variant="secondary" className="ml-2 align-middle">
                              {t('regionPage.list.sparkling')}
                            </Badge>
                          )}
                          {w.location && (
                            <span className="block text-xs text-muted-foreground mt-1">
                              {w.location}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground align-top">
                          {fmt(w.composition.residu_sec_180_mg_L)}
                        </TableCell>
                        <TableCell className="text-muted-foreground align-top">
                          {fmt(w.composition.Ca_mg_L)}
                        </TableCell>
                        <TableCell className="text-muted-foreground align-top">
                          {fmt(w.composition.Mg_mg_L)}
                        </TableCell>
                        <TableCell className="text-muted-foreground align-top">
                          {fmt(w.composition.Na_mg_L)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-12 md:py-16">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-600" />
              {t('regionPage.faq.title')}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* MAILLAGE */}
        <section className="px-4 py-12 md:py-16 bg-muted/30 border-t border-border">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 tracking-tight">
              {t('regionPage.links.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {links.map((l) => (
                <Card key={l.to} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{l.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{l.desc}</p>
                    <Link
                      to={l.to}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                    >
                      {l.title}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
