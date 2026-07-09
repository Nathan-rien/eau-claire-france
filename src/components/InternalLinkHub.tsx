import { Link } from "react-router-dom";
import {
  Map,
  MapPin,
  Droplets,
  AlertTriangle,
  Bell,
  Activity,
  Euro,
  Sparkles,
  Globe2,
  Trophy,
  Beaker,
  Route,
  Factory,
  GlassWater,
} from "lucide-react";

type LinkItem = {
  to: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const LINK_GROUPS: Record<string, { title: string; items: LinkItem[] }> = {
  explore: {
    title: "Explorer la qualité de l'eau",
    items: [
      { to: "/carte", label: "Carte de l'eau du robinet", description: "Qualité commune par commune en France", icon: Map },
      { to: "/qualite-eau", label: "Qualité de l'eau par commune", description: "Analyse eau potable dans votre ville", icon: MapPin },
      { to: "/carte-polluants", label: "Carte des polluants", description: "PFAS, pesticides, nitrates par ville", icon: AlertTriangle },
      { to: "/polluants", label: "Index des polluants", description: "Tous les contaminants surveillés", icon: Beaker },
      { to: "/gout-eau", label: "Goût de l'eau par région", description: "Perceptions et témoignages par région", icon: GlassWater },
      { to: "/cours-eau", label: "Cours d'eau", description: "État écologique des rivières françaises", icon: Droplets },
    ],
  },
  decide: {
    title: "Choisir et comparer",
    items: [
      { to: "/diagnostic", label: "Diagnostic personnalisé", description: "Quelle eau est faite pour vous ?", icon: Sparkles },
      { to: "/quelle-eau-boire", label: "Comparateur de bouteilles", description: "Évian, Cristaline, Volvic, Vittel…", icon: Trophy },
      { to: "/classement", label: "Classement des eaux", description: "Top des marques selon 11 critères", icon: Trophy },
      { to: "/comparateur-prix", label: "Comparateur de prix", description: "Prix en magasin mis à jour quotidiennement", icon: Euro },
    ],
  },
  journey: {
    title: "Comprendre le parcours de l'eau",
    items: [
      { to: "/parcours-eau", label: "Parcours de l'eau du robinet", description: "De la source au verre, en 6 étapes", icon: Route },
      { to: "/parcours-eau-bouteille", label: "Parcours de l'eau en bouteille", description: "Logistique et empreinte carbone", icon: Factory },
      { to: "/sources-eau", label: "Sources d'eau minérale", description: "Cartographie des sources françaises", icon: Droplets },
      { to: "/alertes", label: "Alertes qualité", description: "Soyez prévenu des dépassements", icon: Bell },
    ],
  },
  europe: {
    title: "Europe & données ouvertes",
    items: [
      { to: "/carte-europe", label: "Carte de l'eau en Europe", description: "27 pays — données EEA", icon: Globe2 },
      { to: "/classement-europe", label: "Classement européen", description: "Comparaison entre pays", icon: Trophy },
      { to: "/composition-europe", label: "Composition minérale UE", description: "Calcium, magnésium, nitrates", icon: Beaker },
      { to: "/prix-eaux", label: "Prix des eaux", description: "Tarifs détaillés par marque", icon: Activity },
    ],
  },
};

interface InternalLinkHubProps {
  /** Quels groupes afficher (par défaut : tous) */
  groups?: Array<keyof typeof LINK_GROUPS>;
  /** Titre principal de la section */
  heading?: string;
  /** Sous-titre / contexte */
  description?: string;
  /** Variante visuelle */
  variant?: "default" | "muted" | "inline";
}

/**
 * Bloc de maillage interne contextuel.
 * Améliore la découverte par les crawlers (Google Search Console)
 * en exposant les pages importantes depuis la home, le blog et les pages catégorie.
 */
export default function InternalLinkHub({
  groups = ["explore", "decide", "journey", "europe"],
  heading = "Explorez InfoEau.fr",
  description = "Toutes nos ressources pour comprendre, comparer et surveiller la qualité de votre eau.",
  variant = "default",
}: InternalLinkHubProps) {
  const bgClass =
    variant === "muted"
      ? "bg-muted/30"
      : variant === "inline"
        ? "bg-transparent"
        : "bg-gradient-to-br from-sky-50 via-white to-green-50";

  return (
    <section
      className={`${bgClass} py-12 md:py-16 px-4 border-t border-border`}
      role="region"
      aria-labelledby="internal-hub-title"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-10">
          <h2
            id="internal-hub-title"
            className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2"
          >
            {heading}
          </h2>
          {description && (
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {groups.map((groupKey) => {
            const group = LINK_GROUPS[groupKey];
            if (!group) return null;
            return (
              <div
                key={groupKey}
                className="bg-card rounded-xl p-5 md:p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className="group flex items-start gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors"
                        >
                          <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-4.5 h-4.5" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.label}
                            </span>
                            <span className="block text-xs text-muted-foreground leading-snug">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
