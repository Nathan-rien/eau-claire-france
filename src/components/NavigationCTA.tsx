
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Stethoscope, Droplets } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const NavigationCTA = () => {
  const navigationItems = [
    {
      title: "Carte des eaux",
      description: "Explorez la qualité de l'eau dans votre région",
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      href: "/carte",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Diagnostic",
      description: "Analysez la qualité de votre eau locale",
      icon: <Stethoscope className="w-8 h-8 text-green-600" />,
      href: "/diagnostic",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Quelle eau boire ?",
      description: "Trouvez l'eau qui vous convient",
      icon: <Droplets className="w-8 h-8 text-purple-600" />,
      href: "/quelle-eau-boire",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
        Explorez nos services
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navigationItems.map((item, index) => (
          <Link key={index} to={item.href} className="block group">
            <Card className={`${item.bgColor} ${item.borderColor} border-2 hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavigationCTA;
