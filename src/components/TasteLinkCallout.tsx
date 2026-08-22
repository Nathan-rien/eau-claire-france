import { Link } from '@/components/LocalizedLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassWater } from 'lucide-react';

/**
 * Lien contextuel vers /gout-eau (maillage interne).
 */
export default function TasteLinkCallout() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <aside className="mt-8 rounded-xl border border-border bg-card p-5 flex items-start gap-3">
      <GlassWater className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
      <p className="text-sm text-muted-foreground">
        {isEn ? 'Taste or smell problem? ' : 'Un problème de goût ou d’odeur ? '}
        <Link to="/gout-eau" className="text-primary underline hover:no-underline font-medium">
          {isEn
            ? 'Report a tap water taste or odour issue in your area'
            : 'Signalez un problème de goût ou d’odeur de l’eau du robinet'}
        </Link>
        {isEn
          ? ' and compare regional taste reports.'
          : ' et comparez les retours de goût région par région.'}
      </p>
    </aside>
  );
}
