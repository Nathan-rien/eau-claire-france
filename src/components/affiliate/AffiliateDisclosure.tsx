import { Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  className?: string;
}

const TEXT = {
  fr: "Cette page contient des liens affiliés Amazon. InfoEau perçoit une commission sur les achats effectués via ces liens, sans coût supplémentaire pour vous. Nos recommandations sont basées uniquement sur l'efficacité prouvée des produits, indépendamment des partenariats commerciaux.",
  en: 'This page contains Amazon affiliate links. InfoEau earns a commission on purchases made through these links, at no extra cost to you. Our recommendations are based solely on the proven effectiveness of the products, independently of any commercial partnership.',
};

export default function AffiliateDisclosure({ className = '' }: Props) {
  const { language } = useLanguage();

  return (
    <p
      className={`flex items-start gap-2 text-xs leading-relaxed text-muted-foreground ${className}`}
    >
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{language === 'en' ? TEXT.en : TEXT.fr}</span>
    </p>
  );
}
