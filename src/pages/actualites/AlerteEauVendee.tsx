import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import InternalLinkHub from "@/components/InternalLinkHub";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, ShieldAlert, ArrowLeft, ExternalLink } from "lucide-react";

const CANONICAL = "/actualites/pollution-manganese-vendee-juillet-2026";
const PUBLISHED = "2026-07-08";
const UPDATED = "2026-07-09";

const TIMELINE = [
  {
    date: "8 juillet 2026 — matin",
    icon: ShieldAlert,
    tone: "orange" as const,
    title: "Détection de manganèse à l'usine de production d'eau potable du Moulin Papon",
    body:
      "Les autocontrôles réalisés par Vendée Eau à l'usine de traitement du Moulin Papon (Roche-sur-Yon Agglomération) mettent en évidence un dépassement de la valeur de référence en manganèse dans l'eau distribuée. L'ARS Pays de la Loire est immédiatement informée.",
  },
  {
    date: "8 juillet 2026 — après-midi",
    icon: MapPin,
    tone: "orange" as const,
    title: "Communes concernées et consignes de précaution",
    body:
      "Une consigne de non-consommation temporaire est diffusée pour les usages alimentaires (boisson, préparation des aliments et biberons) dans plusieurs communes desservies par l'usine du Moulin Papon, dont La Roche-sur-Yon et sa périphérie. Les autres usages (toilette, lessive, sanitaires) restent autorisés. Des points de distribution d'eau embouteillée sont ouverts pour les publics sensibles.",
  },
  {
    date: "8 juillet 2026 — soirée",
    icon: Clock,
    tone: "orange" as const,
    title: "Purges du réseau et nouveaux prélèvements",
    body:
      "Vendée Eau engage des purges ciblées sur le réseau et multiplie les prélèvements de contrôle en différents points. Les résultats sont transmis en continu à l'ARS pour évaluer le retour à la conformité.",
  },
  {
    date: "9 juillet 2026",
    icon: CheckCircle2,
    tone: "green" as const,
    title: "Levée de l'alerte par l'ARS et Vendée Eau",
    body:
      "Au vu des analyses de contrôle repassant sous la valeur de référence, l'ARS Pays de la Loire et Vendée Eau annoncent la levée de la restriction d'usage alimentaire. L'eau distribuée est de nouveau conforme et peut être consommée normalement dans l'ensemble des communes concernées.",
  },
];

const SOURCES = [
  {
    label: "Vendée Eau — communiqués officiels",
    href: "https://www.vendee-eau.fr/",
  },
  {
    label: "Ville de La Roche-sur-Yon — informations aux habitants",
    href: "https://www.larochesuryon.fr/",
  },
  {
    label: "ARS Pays de la Loire",
    href: "https://www.pays-de-la-loire.ars.sante.fr/",
  },
];

export default function AlerteEauVendee() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline:
      "Pollution au manganèse en Vendée : alerte à Moulin Papon levée le 9 juillet 2026",
    description:
      "Chronologie factuelle de l'alerte manganèse détectée le 8 juillet 2026 à l'usine du Moulin Papon (Vendée Eau) et levée le 9 juillet 2026 par l'ARS Pays de la Loire.",
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
        title="Pollution manganèse Vendée (juillet 2026) — alerte levée | InfoEau.fr"
        description="Détection de manganèse à l'usine du Moulin Papon le 8 juillet 2026, consignes émises pour La Roche-sur-Yon et communes voisines, alerte levée le 9 juillet par l'ARS et Vendée Eau."
        canonical={CANONICAL}
        structuredData={schema}
      />

      <article className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Breadcrumb / back */}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Résolu
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              <MapPin className="h-3.5 w-3.5" />
              Vendée — Pays de la Loire
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Pollution au manganèse en Vendée : alerte à l'usine du Moulin Papon levée le 9 juillet 2026
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              Publié le{" "}
              <time dateTime={PUBLISHED}>8 juillet 2026</time>
            </span>
            <span>
              Mis à jour le{" "}
              <time dateTime={UPDATED}>9 juillet 2026</time>
            </span>
          </div>
        </header>

        {/* Intro */}
        <div className="prose prose-slate max-w-none mb-10">
          <p className="lead text-lg text-foreground/90">
            Un dépassement de la valeur de référence en manganèse a été détecté le 8 juillet 2026
            dans l'eau produite à l'usine du Moulin Papon, exploitée par Vendée Eau et desservant
            notamment La Roche-sur-Yon. Après purges du réseau, contrôles complémentaires et retour
            à la conformité, l'alerte a été levée le lendemain par l'ARS Pays de la Loire.
          </p>
        </div>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Chronologie des faits</h2>
          <ol className="space-y-6">
            {TIMELINE.map((step, i) => {
              const Icon = step.icon;
              const isGreen = step.tone === "green";
              return (
                <li
                  key={i}
                  className={`relative pl-12 pb-6 border-l-2 ${
                    isGreen ? "border-green-300" : "border-orange-300"
                  } last:border-transparent last:pb-0`}
                >
                  <span
                    className={`absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full ${
                      isGreen
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
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

        {/* Status callout */}
        <aside className="rounded-xl border border-green-200 bg-green-50 p-5 mb-12">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-green-900 mb-1">Situation résolue</p>
              <p className="text-sm text-green-900/90">
                L'eau distribuée dans les communes concernées est de nouveau conforme depuis
                le 9 juillet 2026. Aucun impact sanitaire de long terme n'a été signalé par
                les autorités.
              </p>
            </div>
          </div>
        </aside>

        {/* Sources */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Sources officielles</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cet article s'appuie exclusivement sur les communications publiques des acteurs
            institutionnels. Aucun contenu n'est reproduit verbatim : consultez les sources
            ci-dessous pour les libellés exacts.
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
              to="/carte-polluants"
              className="block rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition-colors"
            >
              <div className="font-medium mb-1">Carte des polluants</div>
              <div className="text-sm text-muted-foreground">
                Visualiser les substances détectées dans l'eau potable en France.
              </div>
            </Link>
            <Link
              to="/alertes"
              className="block rounded-lg border p-4 hover:border-primary hover:bg-accent/40 transition-colors"
            >
              <div className="font-medium mb-1">Alertes en cours</div>
              <div className="text-sm text-muted-foreground">
                Suivre les restrictions d'usage actives sur le territoire.
              </div>
            </Link>
          </div>
        </section>

        <div className="mt-12">
          <InternalLinkHub context="article" />
        </div>
      </article>
    </Layout>
  );
}
