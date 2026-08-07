import React from 'react';
import { Link } from '@/components/LocalizedLink';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/utils/seoData';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const allItems = [
    { name: 'Accueil', href: '/' },
    ...items
  ];

  const schemaData = generateBreadcrumbSchema(
    allItems.map(item => ({
      name: item.name,
      url: `https://infoeau.fr${item.href}`
    }))
  );

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 px-4" aria-label="Fil d'ariane">
        <ol className="flex items-center space-x-2">
          <li>
            <Link 
              to="/" 
              className="flex items-center hover:text-foreground transition-colors"
              aria-label="Retour à l'accueil"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Accueil</span>
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2" />
              {item.current ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  to={item.href} 
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;