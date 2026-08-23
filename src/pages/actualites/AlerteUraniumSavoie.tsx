import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import InternalLinkHub from "@/components/InternalLinkHub";
import { Link } from '@/components/LocalizedLink';
import { AlertTriangle, Clock, MapPin, ShieldAlert, ArrowLeft, ExternalLink, Info, CheckCircle2, Droplets } from "lucide-react";

const CANONICAL = "/actualites/uranium-eau-robinet-savoie-maurienne-aout-2026";
const PUBLISHED = "2026-08-22";
const UPDATED = "2026-08-23";

const TIMELINE = [
  {
    date: "2026 — entrée en vigueur des nouvelles normes européennes",
    icon: Info,
    tone: "slate" as const,
    title: "L'uranium chimique intégré au contrôle sanitaire de l'eau potable",
    body:
      "Les nouvelles exigences européennes applicables depuis 2026 ajoutent l'uranium, en tant que paramètre chimique, à la liste des substances suivies dans l'eau destinée à la consommation humaine. Ce changement de cadre réglementaire fait apparaître des dépassements sur des réseaux où la teneur en uranium est d'origine naturelle et préexistante, sans qu'il s'agisse d'une pollution nouvelle.",
  },
  {
    date: "Fin juillet 2026 — La Chapelle",
    icon: ShieldAlert,
    tone: "orange" as const,
    title: "Arrêté municipal et interdiction de consommation",
    body:
      "À la suite des analyses de contrôle, un arrêté municipal interdit la consommation de l'eau du robinet pour la boisson ainsi que pour la préparation et la cuisson des aliments. Les autres usages domestiques (toilette, lessive, sanitaires) restent autorisés. Une distribution d'eau embouteillée est organisée trois jours par semaine (lundi, mardi et vendredi, de 18h30 à 20h).",
  },
  {
    date: "Courant août 2026 — La Chambre",
    icon: CheckCircle2,
    tone: "green" as const,
    title: "Réseau concerné déconnecté, situation réglée pour la commune",
    body:
      "Le réseau à l'origine du dépassement a été déconnecté, ce qui met fin à la situation de non-conformité pour cette commune. La restriction ne s'applique donc plus à La Chambre.",
  },
  {
    date: "Vendredi 21 août 2026 — Les Chavannes",
    icon: MapPin,
    tone: "orange" as const,
    title: "Résultats d'analyses et distribution d'eau le jour même",
    body:
      "Les résultats d'analyses transmis ce jour-là conduisent à une interdiction de consommation identique à celle de La Chapelle. Une distribution d'eau en bouteilles est mise en place sans délai pour les habitants concernés.",
  },
  {
    date: "Situation au 22 août 2026",
    icon: Clock,
    tone: "orange" as const,
    title: "Alerte en cours, solutions techniques à l'étude",
    body:
      "L'interdiction reste en vigueur à La Chapelle et aux Chavannes. Plusieurs pistes sont examinées pour un retour durable à la conformité : filtrage de l'eau distribuée ou création d'une unité de dépollution. Des réunions sont programmées entre les collectivités, le gestionnaire du réseau et les services de l'État.",
  },
];

const SOURCES = [
  {
    label: "ICI Pays de Savoie — reportage sur les communes concernées",
    href: "https://www.ici.fr/auvergne-rhone-alpes/savoie-73/la-chapelle/c-est-contraignant-en-savoie-pres-de-600-habitants-concernes-par-l-interdiction-de-boire-l-eau-du-robinet-9891978",
  },
  {
    label: "France Info — interdiction de consommation dans trois communes de Savoie",
    href: "https://www.franceinfo.fr/france/auvergne-rhone-alpes/savoie/la-consommation-d-eau-du-robinet-interdite-dans-trois-communes-de-savoie-en-raison-d-une-concentration-trop-importante-d-uranium_8156660.html",
  },
  {
    label: "Agence Régionale de Santé Auvergne-Rhône-Alpes",
    href: "https://www.auvergne-rhone-alpes.ars.sante.fr/",
  },
];

export default function AlerteUraniumSavoie() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline:
      "Uranium dans l'eau du robinet en Savoie : trois communes de Maurienne concernées (août 2026)",
    description:
      "La Chambre, Les Chavannes et La Chapelle (Maurienne, Savoie) sont concernées par un dépassement de la valeur réglementaire en uranium, révélé par les nouvelles normes européennes de 2026. Situation en cours de résolution.",
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    inLanguage: "fr-FR",
    author: { "@type": "Organization", name: "InfoEau.fr" },
    publisher: {
      "@type": "Organization",
      name: "InfoEau.fr",
      logo: { "@type": "ImageObject", url: "https://infoeau.fr/favicon.svg" },
    },
    mainEntityOfPage: `https://infoeau.fr${CANONICAL}`,
  };

  return (
    <Layout>
      <SEOHead
        title="Uranium dans l'eau du robinet en Savoie (Maurienne) — situation août 2026 | InfoEau.fr"
        description="La Chambre, Les Chavannes et La Chapelle : dépassement en uranium révélé par les nouvelles normes européennes 2026. Consommation interdite dans deux communes, situation en cours de résolution."
        canonical={CANONICAL}
        schemaData={schema}
      />

      <article className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Link
          to="/alertes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les alertes
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Alerte en cours
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              <MapPin className="h-3.5 w-3.5" />
              Maurienne — Savoie (Auvergne-Rhône-Alpes)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Uranium dans l'eau du robinet en Savoie : trois communes de Maurienne concernées
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              Publié le <time dateTime={PUBLISHED}>22 août 2026</time>
            </span>
            <span>
              Mis à jour le <time dateTime={UPDATED}>23 août 2026</time>
            </span>
          </div>
        </header>

        {/* Intro */}
        <div className="prose prose-slate max-w-none mb-10">
          <p className="lead text-lg text-foreground/90">
            La Chambre, Les Chavannes et La Chapelle, trois communes de Maurienne totalisant
            environ 1 760 habitants, sont concernées par une concentration en uranium supérieure
            à la valeur réglementaire dans l'eau distribuée. La consommation est interdite pour
            la boisson et la cuisine à La Chapelle et aux Chavannes, tandis que le réseau
            problématique a été déconnecté à La Chambre.
          </p>
        </div>

        {/* Mise en perspective : pas de radioactivité */}
        <aside className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                Un dépassement révélé par la réglementation, pas une pollution nouvelle
              </p>
              <p className="text-sm text-blue-900/90">
                L'uranium présent dans ces réseaux est d'origine géologique : il provient
                naturellement du sous-sol du secteur et n'est pas lié à une activité industrielle
                récente. Le sujet relève de la toxicité chimique du métal, et non de la
                radioactivité. Ce qui change en 2026, c'est le cadre de contrôle : l'uranium
                chimique fait désormais partie des paramètres suivis, ce qui met en évidence une
                teneur qui existait déjà auparavant sans être mesurée dans le contrôle sanitaire.
              </p>
            </div>
          </div>
        </aside>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Chronologie des faits</h2>
          <ol className="space-y-6">
            {TIMELINE.map((step, i) => {
              const Icon = step.icon;
              const borderClass =
                step.tone === "green"
                  ? "border-green-300"
                  : step.tone === "slate"
                    ? "border-slate-300"
                    : "border-orange-300";
              const badgeClass =
                step.tone === "green"
                  ? "bg-green-100 text-green-700"
                  : step.tone === "slate"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-orange-100 text-orange-700";
              return (
                <li
                  key={i}
                  className={`relative pl-12 pb-6 border-l-2 ${borderClass} last:border-transparent last:pb-0`}
                >
                  <span
                    className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full ${badgeClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    {step.date}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                  <p className="text-foreground/80 leading-relaxed">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Risque sanitaire */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Ce que disent les autorités sanitaires</h2>
          <div className="prose prose-slate max-w-none">
            <p>
              Selon Aymeric Bogey, directeur de la Santé publique à l'ARS Auvergne-Rhône-Alpes,
              le risque est associé à une exposition répétée et prolongée : boire durablement une
              eau dont la concentration en uranium est excessive peut affecter le fonctionnement
              des reins. Cette approche explique la logique des arrêtés municipaux, qui visent la
              boisson, la préparation et la cuisson des aliments, tout en laissant les usages
              non alimentaires (toilette, lessive, sanitaires) autorisés.
            </p>
          </div>
        </section>

        {/* Organisation locale */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">L'organisation sur le terrain</h2>
          <div className="prose prose-slate max-w-none">
            <p>
              À La Chapelle, une distribution d'eau embouteillée est assurée depuis fin juillet
              2026, trois jours par semaine (lundi, mardi et vendredi, de 18h30 à 20h). D'après
              la maire Isabelle Quillet, le coût pour la commune atteint environ 5 000 € pour
              trois semaines de distribution. Aux Chavannes, le dispositif a été installé dès la
              réception des résultats d'analyses, le vendredi 21 août 2026.
            </p>
            <p>
              Pour un retour durable à la conformité, plusieurs solutions techniques sont
              étudiées : un traitement par filtration de l'eau distribuée, ou la construction
              d'une unité de dépollution. Des réunions associant les collectivités, le
              gestionnaire du réseau et les services de l'État sont programmées.
            </p>
          </div>
        </section>

        {/* Statut : alerte en cours */}
        <aside className="rounded-xl border border-orange-200 bg-orange-50 p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-orange-900 mb-1">Situation en cours</p>
              <p className="text-sm text-orange-900/90">
                Au 22 août 2026, l'interdiction de consommation reste en vigueur à La Chapelle et
                aux Chavannes. La situation est réglée à La Chambre après déconnexion du réseau
                concerné. Cette page sera mise à jour en fonction des annonces officielles.
              </p>
            </div>
          </div>
        </aside>

        {/* Callout consignes officielles */}
        <aside className="rounded-lg border border-border bg-muted/40 p-4 mb-12">
          <div className="flex items-start gap-3">
            <Droplets className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Habitants concernés : pour vos décisions pratiques (usages autorisés, horaires de
              distribution, levée éventuelle de la restriction), référez-vous aux consignes
              officielles de votre mairie et de l'ARS Auvergne-Rhône-Alpes. Cet article a une
              visée informative et ne remplace pas ces communications.
            </p>
          </div>
        </aside>

        {/* Sources */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Sources officielles</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cet article s'appuie sur les communications publiques et les reportages de presse
            régionale et nationale. Aucun contenu n'est reproduit verbatim : consultez les
            sources ci-dessous pour les libellés exacts.
          </p>
          <ul className="space-y-2">
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  {s.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Related */}
        <section className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Aller plus loin</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/qualite-eau"
              className="block rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition-colors"
            >
              <div className="font-medium mb-1">Qualité de l'eau dans ma commune</div>
              <div className="text-sm text-muted-foreground">
                Consulter les analyses de l'eau du robinet commune par commune.
              </div>
            </Link>
            <Link
              to="/diagnostic"
              className="block rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition-colors"
            >
              <div className="font-medium mb-1">Diagnostic personnalisé</div>
              <div className="text-sm text-muted-foreground">
                Identifier quelle eau boire selon votre situation et votre réseau.
              </div>
            </Link>
            <Link
              to="/guide/plomb-eau"
              className="block rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition-colors"
            >
              <div className="font-medium mb-1">Métaux lourds et eau du robinet</div>
              <div className="text-sm text-muted-foreground">
                Comprendre les métaux dans l'eau (plomb, etc.) et les solutions de traitement.
              </div>
            </Link>
            <Link
              to="/carte-polluants"
              className="block rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition-colors"
            >
              <div className="font-medium mb-1">Carte des polluants</div>
              <div className="text-sm text-muted-foreground">
                Visualiser les substances détectées dans l'eau potable en France.
              </div>
            </Link>
          </div>
        </section>

        <div className="mt-12">
          <InternalLinkHub />
        </div>
      </article>
    </Layout>
  );
}
