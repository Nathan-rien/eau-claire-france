import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import InternalLinkHub from '@/components/InternalLinkHub';
import CrisisWaterCalculator from '@/components/CrisisWaterCalculator';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ExternalLink, Info } from 'lucide-react';

const CANONICAL = '/actualites/crise-eau-finistere';
const PUBLISHED = '2026-10-09';
const UPDATED = '2026-10-09';
const TITLE = "Crise de l'eau dans le Finistère : où en est-on, comment réduire sa consommation";
const DESCRIPTION = "Crise de l'eau dans le Nord-Finistère : situation au 9 octobre 2026, consignes officielles et estimation indicative de la consommation de votre foyer.";
const SOURCES = [
  { label: 'ICI, 8 octobre 2026', href: 'https://www.ici.fr/emissions/l-info-d-ici-ici-breizh-izel/nous-sommes-en-alerte-ecarlate-dans-le-nord-finistere-les-collectivites-appellent-a-reduire-la-consommation-d-eau-9596824' },
  { label: 'France 3 Régions, 8 octobre 2026', href: 'https://france3-regions.franceinfo.fr/bretagne/finistere/brest/ce-n-est-plus-une-blague-places-en-alerte-ecarlate-les-maires-du-finistere-previennent-les-habitants-du-risque-imminent-de-coupure-d-eau-potable-3430515.html' },
  { label: 'ARS Normandie — « Initier aux principaux usages domestiques de l’eau »', href: 'https://www.normandie.ars.sante.fr/media/2763/download?inline' },
];
export default function CriseEauFinistere() {
  const schema = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: TITLE, description: DESCRIPTION,
    datePublished: PUBLISHED, dateModified: UPDATED, inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'InfoEau.fr' },
    publisher: { '@type': 'Organization', name: 'InfoEau.fr', logo: { '@type': 'ImageObject', url: 'https://infoeau.fr/favicon.svg' } },
    mainEntityOfPage: `https://infoeau.fr${CANONICAL}`,
  };
  return <Layout>
    <SEOHead title={TITLE} description={DESCRIPTION} canonical={CANONICAL} schemaData={schema}
      ogType="article" articlePublishedTime={PUBLISHED} articleModifiedTime={UPDATED} />
    <article className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link to="/alertes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Toutes les alertes</Link>
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]"><AlertTriangle className="h-4 w-4" aria-hidden="true" />Alerte en cours</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">{TITLE}</h1>
        <p className="text-sm text-muted-foreground">Publié le <time dateTime={PUBLISHED}>9 octobre 2026</time> · Mis à jour le <time dateTime={UPDATED}>9 octobre 2026</time></p>
      </header>
      <section className="mb-10" aria-labelledby="situation-title">
        <h2 id="situation-title" className="text-2xl font-semibold mb-5">Où en est-on</h2>
        <ol className="space-y-5 border-l-2 border-[hsl(var(--warning)/0.4)] pl-5">
          <li><p className="font-semibold mb-1">8 octobre 2026 — Pays de Brest</p><p>Selon ICI et France 3 Régions, les élus du Pays de Brest ont déclaré l’« alerte écarlate » lors d’une conférence de presse à l’usine de Pont-Ar-Bled le 8 octobre 2026, notamment par la voix de Stéphane Roudaut, maire de Brest.</p></li>
          <li><p className="font-semibold mb-1">Depuis le 7 août 2026 — Finistère</p><p>Selon ICI et France 3 Régions, le Finistère est au niveau « crise sécheresse », le plus élevé, depuis le 7 août 2026.</p></li>
          <li><p className="font-semibold mb-1">8 octobre 2026 — Pluviométrie</p><p>Selon ICI, le 8 octobre, la pluviométrie des trois derniers mois est inférieure de plus de 60 % à la moyenne des quarante dernières années.</p></li>
          <li><p className="font-semibold mb-1">8 octobre 2026 — Consommation</p><p>Selon ICI, la consommation moyenne dans le Finistère est de 112 L par personne et par jour.</p><p className="mt-2">Selon Philippe Rybski, du syndicat du bassin de l’Elorn, cité par France 3 Régions, les collectivités du Nord-Finistère demandent de la réduire d’environ moitié : cet objectif concerne le Nord-Finistère / Pays de Brest, pas tout le département.</p></li>
          <li><p className="font-semibold mb-1">9 octobre 2026 — Ressources et interconnexions</p><p>Selon Noémie Saint-Hilary, directrice générale d’Eau du Ponant, citée par Hit West le 9 octobre, il resterait environ 30 % des ressources du lac du Drennec, qui soutient l’Elorn ; l’usine de Pont-Ar-Bled, alimentée par l’Elorn, secourt le nord du département par interconnexion.</p></li>
          <li><p className="font-semibold mb-1">9 octobre 2026 — Mesures envisagées</p><p>Selon Hit West, le préfet a indiqué le 9 octobre que le plan Orsec pourrait être déclenché dans environ un mois si la pluie n’est pas au rendez-vous ; les mesures évoquées comprennent la priorité à certains secteurs comme la santé et de nouvelles réductions de pression et de débit.</p><p className="mt-2">Selon Hit West, il appelle particuliers et entreprises à un effort supplémentaire.</p></li>
        </ol>
        <aside className="mt-6 border border-border rounded-lg bg-muted/40 p-4 flex gap-3">
          <Info className="h-5 w-5 shrink-0 mt-1 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm">Selon la nomenclature réglementaire rappelée par la préfecture, « alerte écarlate » n’est pas un niveau réglementaire : les niveaux sont vigilance, alerte, alerte renforcée et crise.</p>
        </aside>
      </section>
      <section id="calculateur" className="mb-10 scroll-mt-24" aria-labelledby="calculator-title">
        <h2 id="calculator-title" className="text-2xl font-semibold mb-5">Calculez votre consommation</h2>
        <CrisisWaterCalculator />
      </section>
      <section className="mb-10" aria-labelledby="tregarvan-title">
        <h2 id="tregarvan-title" className="text-2xl font-semibold mb-4">Ce que ça donne quand l’eau manque : l’exemple de Trégarvan (août 2026)</h2>
        <p>Selon France 3 Bretagne, le 15 août 2026, Trégarvan compte environ 300 habitants et connaît une production insuffisante depuis le 9 août.</p>
        <p className="mt-3">Selon ce reportage de France 3 Bretagne, des camions-citernes de 30 m³ interviennent deux à trois fois par jour, un pack d’eau par foyer est distribué pour boire et cuisiner, et un effort de 12 L par jour et par personne est demandé.</p>
        <p className="mt-3">Selon une élue interrogée par France 3 Bretagne, l’eau reste potable malgré des colorations ponctuelles : il s’agit de sa déclaration, et non d’un constat sanitaire établi par cette page.</p>
      </section>
      <section className="mb-10" aria-labelledby="official-title">
        <h2 id="official-title" className="text-2xl font-semibold mb-4">Où trouver l’information officielle</h2>
        <aside className="rounded-lg border border-border bg-muted/40 p-5">
          <h3 className="font-semibold mb-2">Consignes officielles</h3>
          <p>Pour toute consigne concernant une coupure, une restriction ou la potabilité, référez-vous à l’opérateur de votre commune, à votre mairie, à la préfecture et à l’ARS Bretagne ; cette page ne remplace pas leurs communications.</p>
          <a href="https://www.finistere.gouv.fr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary underline mt-4">Préfecture du Finistère<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
        </aside>
      </section>
      <section className="mb-10" aria-labelledby="sources-title">
        <h2 id="sources-title" className="text-2xl font-semibold mb-4">Sources</h2>
        <ul className="space-y-3">{SOURCES.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-primary underline break-words">{source.label}<ExternalLink className="h-4 w-4 shrink-0 mt-1" aria-hidden="true" /></a></li>)}
          <li>Hit West, 9 octobre 2026</li><li>France 3 Bretagne, 15 août 2026</li>
        </ul>
      </section>
      <section className="border-t border-border pt-6" aria-labelledby="further-title">
        <h2 id="further-title" className="text-2xl font-semibold mb-4">Aller plus loin</h2>
        <p className="text-muted-foreground mb-4">Les pages qualité de l’eau présentent des analyses passées, pas l’état du réseau en temps réel.</p>
        <ul className="space-y-3"><li><Link to="/qualite-eau" className="text-primary underline">Qualité de l’eau dans ma commune</Link></li><li><Link to="/carte-polluants" className="text-primary underline">Carte des polluants</Link></li></ul>
      </section>
      <div className="mt-10"><InternalLinkHub groups={['explore']} variant="inline" /></div>
    </article>
  </Layout>;
}
