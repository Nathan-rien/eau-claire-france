import { Link } from '@/components/LocalizedLink';
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
import { useLanguage } from "@/contexts/LanguageContext";

type LinkItem = {
  to: string;
  labelKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
};

const LINK_GROUPS: Record<string, { titleKey: string; items: LinkItem[] }> = {
  explore: {
    titleKey: "hub.explore.title",
    items: [
      { to: "/carte", labelKey: "hub.explore.carte.label", descKey: "hub.explore.carte.desc", icon: Map },
      { to: "/qualite-eau", labelKey: "hub.explore.qualite.label", descKey: "hub.explore.qualite.desc", icon: MapPin },
      { to: "/carte-polluants", labelKey: "hub.explore.pollmap.label", descKey: "hub.explore.pollmap.desc", icon: AlertTriangle },
      { to: "/polluants", labelKey: "hub.explore.poll.label", descKey: "hub.explore.poll.desc", icon: Beaker },
      { to: "/gout-eau", labelKey: "hub.explore.gout.label", descKey: "hub.explore.gout.desc", icon: GlassWater },
      { to: "/cours-eau", labelKey: "hub.explore.cours.label", descKey: "hub.explore.cours.desc", icon: Droplets },
    ],
  },
  decide: {
    titleKey: "hub.decide.title",
    items: [
      { to: "/diagnostic", labelKey: "hub.decide.diagnostic.label", descKey: "hub.decide.diagnostic.desc", icon: Sparkles },
      { to: "/quelle-eau-boire", labelKey: "hub.decide.which.label", descKey: "hub.decide.which.desc", icon: Trophy },
      { to: "/classement", labelKey: "hub.decide.ranking.label", descKey: "hub.decide.ranking.desc", icon: Trophy },
      { to: "/prix-eaux", labelKey: "hub.decide.prix.label", descKey: "hub.decide.prix.desc", icon: Euro },
      { to: "/calculateur-hydratation", labelKey: "hub.decide.hydration.label", descKey: "hub.decide.hydration.desc", icon: Droplets },
    ],
  },
  journey: {
    titleKey: "hub.journey.title",
    items: [
      { to: "/parcours-eau", labelKey: "hub.journey.tap.label", descKey: "hub.journey.tap.desc", icon: Route },
      { to: "/parcours-eau-bouteille", labelKey: "hub.journey.bottle.label", descKey: "hub.journey.bottle.desc", icon: Factory },
      { to: "/sources-eau", labelKey: "hub.journey.sources.label", descKey: "hub.journey.sources.desc", icon: Droplets },
      { to: "/alertes", labelKey: "hub.journey.alertes.label", descKey: "hub.journey.alertes.desc", icon: Bell },
    ],
  },
  europe: {
    titleKey: "hub.europe.title",
    items: [
      { to: "/carte-europe", labelKey: "hub.europe.carte.label", descKey: "hub.europe.carte.desc", icon: Globe2 },
      { to: "/classement-europe", labelKey: "hub.europe.ranking.label", descKey: "hub.europe.ranking.desc", icon: Trophy },
      { to: "/composition-europe", labelKey: "hub.europe.compo.label", descKey: "hub.europe.compo.desc", icon: Beaker },
      { to: "/prix-eaux", labelKey: "hub.europe.prix.label", descKey: "hub.europe.prix.desc", icon: Activity },
    ],
  },
};

interface InternalLinkHubProps {
  groups?: Array<keyof typeof LINK_GROUPS>;
  heading?: string;
  description?: string;
  variant?: "default" | "muted" | "inline";
}

export default function InternalLinkHub({
  groups = ["explore", "decide", "journey", "europe"],
  heading,
  description,
  variant = "default",
}: InternalLinkHubProps) {
  const { t } = useLanguage();
  const bgClass =
    variant === "muted"
      ? "bg-muted/30"
      : variant === "inline"
        ? "bg-transparent"
        : "bg-gradient-to-br from-sky-50 via-white to-green-50";

  const resolvedHeading = heading ?? t("hub.defaultHeading");
  const resolvedDescription = description ?? t("hub.defaultDescription");

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
            {resolvedHeading}
          </h2>
          {resolvedDescription && (
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              {resolvedDescription}
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
                  {t(group.titleKey)}
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
                              {t(item.labelKey)}
                            </span>
                            <span className="block text-xs text-muted-foreground leading-snug">
                              {t(item.descKey)}
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
