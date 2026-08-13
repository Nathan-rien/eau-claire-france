
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Users, Eye, Clock, MousePointer, LogOut, TrendingUp, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import IndexationOverview from '@/components/IndexationOverview';


const Dashboard = () => {
  const { metrics, refreshMetrics, resetAnalytics } = useAnalytics();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive"
      });
    }
  };

  const handleResetAnalytics = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données analytiques ?')) {
      resetAnalytics();
      refreshMetrics();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  InfoEau.fr - Dashboard
                </h1>
                <p className="text-sm text-gray-600">Connecté en tant que: {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={refreshMetrics} variant="outline" size="sm" className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser</span>
              </Button>
              <Button onClick={handleResetAnalytics} variant="outline" size="sm" className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
                <span>Reset</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord analytique</h2>
            <p className="text-gray-600">Données réelles de trafic et d'engagement du site InfoEau.fr</p>
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Visites totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{metrics.totalVisits.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Depuis le début du tracking
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Visiteurs uniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.uniqueVisitors.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Identifiés par cookie
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Temps moyen/page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatTime(metrics.avgTimePerPage)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Durée moyenne de session
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <MousePointer className="w-4 h-4 mr-2" />
                  Clics totaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{metrics.totalClicks.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Interactions avec les boutons
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indexation Google */}
          <div className="mb-8">
            <IndexationOverview />
          </div>

          {/* Détail par page */}

          <Card>
            <CardHeader>
              <CardTitle>Performance par page</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.pageMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Page</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Visites</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Temps moyen</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Taux de rebond</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.pageMetrics.map((page, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{page.page}</td>
                          <td className="py-3 px-4 text-right">{page.visits.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{formatTime(page.avgTime)}</td>
                          <td className="py-3 px-4 text-right">{page.bounceRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune donnée disponible pour le moment.</p>
                  <p className="text-sm mt-1">Naviguez sur les pages du site pour générer des statistiques.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
