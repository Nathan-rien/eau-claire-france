
import React from 'react';
import { AlertTriangle, MapPin, Calendar, Users, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Alertes = () => {
  // Mock data for active alerts
  const activeAlerts = [
    {
      id: 1,
      region: 'Île-de-France',
      city: 'Paris 15ème',
      type: 'Dépassement nitrates',
      severity: 'Modéré',
      date: '2024-06-10',
      description: 'Dépassement ponctuel des seuils de nitrates dans le réseau de distribution',
      affectedPopulation: 45000,
      measures: 'Surveillance renforcée et traitement en cours'
    },
    {
      id: 2,
      region: 'Île-de-France',
      city: 'Meaux',
      type: 'Turbidité élevée',
      severity: 'Faible',
      date: '2024-06-12',
      description: 'Légère augmentation de la turbidité suite aux récentes précipitations',
      affectedPopulation: 8500,
      measures: 'Filtration supplémentaire mise en place'
    },
    {
      id: 3,
      region: 'Occitanie',
      city: 'Toulouse',
      type: 'Pesticides détectés',
      severity: 'Élevé',
      date: '2024-06-08',
      description: 'Présence de résidus de pesticides au-dessus des seuils réglementaires',
      affectedPopulation: 125000,
      measures: 'Changement de source d\'approvisionnement temporaire'
    },
    {
      id: 4,
      region: 'Occitanie',
      city: 'Montpellier',
      type: 'Chlore résiduel faible',
      severity: 'Modéré',
      date: '2024-06-11',
      description: 'Taux de chlore résiduel insuffisant dans certains secteurs',
      affectedPopulation: 32000,
      measures: 'Renforcement de la chloration et purge des réseaux'
    },
    {
      id: 5,
      region: 'Occitanie',
      city: 'Nîmes',
      type: 'Bactéries coliformes',
      severity: 'Élevé',
      date: '2024-06-09',
      description: 'Détection de bactéries coliformes lors des analyses de routine',
      affectedPopulation: 18000,
      measures: 'Désinfection d\'urgence et restriction d\'usage'
    },
    {
      id: 6,
      region: 'Occitanie',
      city: 'Béziers',
      type: 'Dépassement aluminium',
      severity: 'Faible',
      date: '2024-06-13',
      description: 'Concentration d\'aluminium légèrement au-dessus de la normale',
      affectedPopulation: 12000,
      measures: 'Ajustement du traitement de coagulation'
    },
    {
      id: 7,
      region: 'Occitanie',
      city: 'Perpignan',
      type: 'pH anormal',
      severity: 'Modéré',
      date: '2024-06-07',
      description: 'Valeurs de pH en dehors des normes recommandées',
      affectedPopulation: 28000,
      measures: 'Correction du pH et surveillance continue'
    },
    {
      id: 8,
      region: 'Hauts-de-France',
      city: 'Lille',
      type: 'Métaux lourds',
      severity: 'Élevé',
      date: '2024-06-06',
      description: 'Traces de plomb détectées dans le réseau de distribution',
      affectedPopulation: 67000,
      measures: 'Remplacement des canalisations et distribution d\'eau en bouteille'
    },
    {
      id: 9,
      region: 'Hauts-de-France',
      city: 'Amiens',
      type: 'Odeur et goût',
      severity: 'Faible',
      date: '2024-06-14',
      description: 'Plaintes concernant l\'odeur et le goût de l\'eau du robinet',
      affectedPopulation: 21000,
      measures: 'Nettoyage des réservoirs et filtration au charbon actif'
    },
    {
      id: 10,
      region: 'Hauts-de-France',
      city: 'Valenciennes',
      type: 'Fluorure élevé',
      severity: 'Modéré',
      date: '2024-06-05',
      description: 'Concentration de fluorure supérieure aux recommandations',
      affectedPopulation: 15000,
      measures: 'Dilution avec d\'autres sources et surveillance'
    },
    {
      id: 11,
      region: 'Nouvelle-Aquitaine',
      city: 'La Rochelle',
      type: 'Salinité élevée',
      severity: 'Faible',
      date: '2024-06-15',
      description: 'Intrusion saline dans les nappes phréatiques côtières',
      affectedPopulation: 9500,
      measures: 'Surveillance et recherche de sources alternatives'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Élevé': return 'bg-red-100 text-red-800 border-red-200';
      case 'Modéré': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Faible': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Élevé': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Modéré': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'Faible': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const groupedAlerts = activeAlerts.reduce((acc, alert) => {
    if (!acc[alert.region]) {
      acc[alert.region] = [];
    }
    acc[alert.region].push(alert);
    return acc;
  }, {} as Record<string, typeof activeAlerts>);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <span>Alertes actives sur la qualité de l'eau</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Consultez les alertes en cours concernant la qualité de l'eau potable dans les différentes régions de France.
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{activeAlerts.length}</div>
                      <div className="text-sm text-gray-600">Alertes actives</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{Object.keys(groupedAlerts).length}</div>
                      <div className="text-sm text-gray-600">Régions concernées</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(activeAlerts.reduce((sum, alert) => sum + alert.affectedPopulation, 0) / 1000)}k
                      </div>
                      <div className="text-sm text-gray-600">Personnes concernées</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {activeAlerts.filter(alert => alert.severity === 'Élevé').length}
                      </div>
                      <div className="text-sm text-gray-600">Alertes sévères</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts by Region */}
            <div className="space-y-8">
              {Object.entries(groupedAlerts).map(([region, alerts]) => (
                <div key={region}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <span>{region}</span>
                    <Badge variant="outline" className="ml-2">
                      {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
                    </Badge>
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {alerts.map(alert => (
                      <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center space-x-2">
                                {getSeverityIcon(alert.severity)}
                                <span>{alert.city}</span>
                              </CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{alert.type}</p>
                            </div>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-700">{alert.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  {new Date(alert.date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  {alert.affectedPopulation.toLocaleString()} personnes
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-medium text-blue-900 text-sm mb-1">Mesures prises :</h4>
                              <p className="text-sm text-blue-800">{alert.measures}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Alertes;
