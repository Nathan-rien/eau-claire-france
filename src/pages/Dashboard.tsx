
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Users, Eye, Clock, MousePointer, LogOut, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    avgTimePerPage: 0,
    totalClicks: 0
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Simulation de métriques (dans un vrai projet, ces données viendraient d'une API)
    const simulatedMetrics = {
      totalVisits: Math.floor(Math.random() * 10000) + 5000,
      uniqueVisitors: Math.floor(Math.random() * 3000) + 1500,
      avgTimePerPage: Math.floor(Math.random() * 300) + 120,
      totalClicks: Math.floor(Math.random() * 1000) + 500
    };
    
    setMetrics(simulatedMetrics);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const pageMetrics = [
    { page: 'Accueil', visits: 2453, avgTime: 145, bounceRate: '32%' },
    { page: 'Carte', visits: 1876, avgTime: 287, bounceRate: '28%' },
    { page: 'Diagnostic', visits: 1234, avgTime: 198, bounceRate: '35%' },
    { page: 'Alertes', visits: 987, avgTime: 156, bounceRate: '42%' },
    { page: 'vs Bouteilles', visits: 654, avgTime: 203, bounceRate: '39%' },
    { page: 'Polluants', visits: 432, avgTime: 167, bounceRate: '45%' }
  ];

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                InfoEau.fr - Dashboard
              </h1>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord analytique</h2>
            <p className="text-gray-600">Vue d'ensemble des performances du site InfoEau.fr</p>
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
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% ce mois
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
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% ce mois
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
                <div className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                  -3% ce mois
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
                <div className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% ce mois
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détail par page */}
          <Card>
            <CardHeader>
              <CardTitle>Performance par page</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {pageMetrics.map((page, index) => (
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
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
