
import React, { useState } from 'react';
import { Search, MapPin, Droplets, AlertTriangle, Leaf, Award, Zap, ClipboardList, Globe, Shield, Heart, Baby, Dumbbell, FlaskConical, Bell, Activity, Skull } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/SearchBar';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { seoData } from '@/utils/seoData';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const { t } = useLanguage();

  return (
    <Layout>
      <SEOHead 
        title={seoData.home.title}
        description={seoData.home.description}
        keywords={seoData.home.keywords}
        canonical="/"
        ogImage={seoData.home.ogImage}
        schemaData={seoData.home.schemaData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50">
        {/* Hero Section */}
        <section className="py-8 md:py-12 lg:py-16 px-4" role="banner">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight px-2">
                {t('home.title')} 
                <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent"> {t('home.titleHighlight')}</span> ?
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed px-2">
                {t('home.subtitle')}
              </p>
              
              <div className="mb-6 md:mb-8 lg:mb-12">
                <SearchBar onCitySelect={setSelectedCity} />
                {selectedCity && (
                  <div className="mt-4 px-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 max-w-lg mx-auto">
                      <p className="text-blue-800 text-sm md:text-base">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        {t('home.searchResult', { city: selectedCity })}
                      </p>
                      <div className="mt-2">
                        <Link 
                          to={`/diagnostic?city=${encodeURIComponent(selectedCity)}`}
                          className="text-primary hover:text-primary/80 font-medium underline text-sm md:text-base"
                        >
                          {t('home.seeFullDiagnostic')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="mb-6 md:mb-8 lg:mb-12">
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{t('home.stats.title')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-2">
                  <div className="bg-card rounded-lg p-3 md:p-4 border border-border shadow-sm">
                    <div className="text-lg md:text-xl lg:text-2xl font-bold text-primary">35,000+</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{t('home.stats.communes')}</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 md:p-4 border border-border shadow-sm">
                    <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">50+</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{t('home.stats.pollutants')}</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 md:p-4 border border-border shadow-sm">
                    <div className="text-lg md:text-xl lg:text-2xl font-bold text-orange-600">98%</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{t('home.stats.compliance')}</div>
                  </div>
                  <div className="bg-card rounded-lg p-3 md:p-4 border border-border shadow-sm">
                    <div className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">24h</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{t('home.stats.update')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1 — Quelle eau boire ? */}
        <section className="py-8 md:py-12 lg:py-16 px-4 bg-card" role="region" aria-labelledby="diagnostic-title">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-6 md:mb-8">
              <h2 id="diagnostic-title" className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3">
                Quelle eau boire ?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Trouvez l'eau idéale pour votre santé grâce à nos outils de diagnostic personnalisé.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Link to="/quelle-eau-boire" className="group">
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CardTitle className="text-lg md:text-xl">Diagnostic rapide</CardTitle>
                      <Badge variant="secondary" className="text-xs">Rapide</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm md:text-base">
                      3 questions, résultat en 30 secondes. Obtenez une recommandation immédiate.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/quelle-eau-boire" className="group">
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <ClipboardList className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CardTitle className="text-lg md:text-xl">Diagnostic complet</CardTitle>
                      <Badge variant="secondary" className="text-xs">4 étapes</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm md:text-base">
                      Analyse détaillée avec profils, intolérances et préférences pour un résultat sur-mesure.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2 — Classement des eaux */}
        <section className="py-8 md:py-12 lg:py-16 px-4" role="region" aria-labelledby="ranking-title">
          <div className="container mx-auto max-w-4xl">
            <Link to="/classement" className="group block">
              <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-r from-primary/10 via-blue-50 to-green-50 p-6 md:p-8 lg:p-10">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h2 id="ranking-title" className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                        Classement des eaux en bouteille
                      </h2>
                      <p className="text-muted-foreground text-sm md:text-base mb-4">
                        Découvrez le top des eaux minérales et de source classées par composition minérale, prix et qualité.
                      </p>
                      <Button className="group-hover:shadow-md transition-shadow">
                        Voir le classement →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Section 3 — Cartes & Infographies */}
        <section className="py-8 md:py-12 lg:py-16 px-4 bg-card" role="region" aria-labelledby="maps-title">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-6 md:mb-8">
              <h2 id="maps-title" className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3">
                Cartes & Infographies
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Explorez nos cartes interactives et visualisations pour tout comprendre sur l'eau en France et en Europe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { to: '/carte', icon: MapPin, color: 'text-primary', bg: 'bg-primary/10', title: 'Carte qualité de l\'eau', desc: 'Qualité de l\'eau potable par commune en France' },
                { to: '/carte-polluants', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', title: 'Carte des polluants', desc: 'Polluants détectés dans l\'eau en France' },
                { to: '/carte-parcours-eau', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-100', title: 'Parcours eau en bouteille', desc: 'De la source au magasin, suivez le trajet' },
                { to: '/carte-parcours-robinet', icon: Search, color: 'text-green-600', bg: 'bg-green-100', title: 'Parcours eau du robinet', desc: 'Du captage au robinet, le traitement expliqué' },
                { to: '/sources-eau', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-100', title: 'Sources d\'eau', desc: 'Carte des sources d\'eau en France' },
                { to: '/carte-europe', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-100', title: 'Carte Europe', desc: 'Qualité de l\'eau potable en Europe' },
              ].map(({ to, icon: Icon, color, bg, title, desc }) => (
                <Link key={to} to={to} className="group">
                  <Card className="h-full border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                    <CardHeader className="pb-2">
                      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <CardTitle className="text-base md:text-lg">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section A — Les risques liés à l'eau du robinet */}
        <section className="py-8 md:py-12 lg:py-16 px-4 bg-orange-50/50" role="region" aria-labelledby="risks-title">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 order-2 md:order-1">
                <div className="border-l-4 border-orange-400 pl-5">
                  <h2 id="risks-title" className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    Les risques liés à l'eau du robinet
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
                    L'eau du robinet en France est globalement de bonne qualité, mais elle peut contenir des traces de <strong className="text-foreground">pesticides</strong>, <strong className="text-foreground">microplastiques</strong> ou <strong className="text-foreground">résidus médicamenteux</strong> selon les régions.
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
                    Les canalisations anciennes peuvent libérer du <strong className="text-foreground">plomb</strong>, tandis que le traitement au chlore génère des sous-produits potentiellement indésirables. Connaître la qualité de votre eau est essentiel.
                  </p>
                  <Link to="/polluants">
                    <Button variant="outline" className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100">
                      Découvrir les polluants →
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0 order-1 md:order-2 relative">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-orange-100 rounded-full flex items-center justify-center relative">
                  <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-orange-500 animate-[pulse_3s_ease-in-out_infinite]" />
                  <Droplets className="w-8 h-8 text-orange-300 absolute -top-2 -right-2 animate-fade-in" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section B — Bien choisir son eau en bouteille */}
        <section className="py-8 md:py-12 lg:py-16 px-4 bg-card" role="region" aria-labelledby="choose-title">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-shrink-0 relative">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <Award className="w-16 h-16 md:w-20 md:h-20 text-primary animate-fade-in" />
                  <Droplets className="w-8 h-8 text-green-400 absolute -bottom-2 -left-2 animate-fade-in" />
                </div>
              </div>
              <div className="flex-1">
                <div className="border-l-4 border-primary pl-5">
                  <h2 id="choose-title" className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    Bien choisir son eau en bouteille
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
                    Chaque eau en bouteille a une <strong className="text-foreground">composition minérale unique</strong>. Calcium, magnésium, bicarbonates… choisir la bonne eau, c'est adapter sa consommation à ses besoins : <strong className="text-foreground">bébés</strong>, <strong className="text-foreground">sportifs</strong>, <strong className="text-foreground">personnes âgées</strong>.
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3">
                    Le <strong className="text-foreground">pH</strong> et le <strong className="text-foreground">résidu sec</strong> sont des indicateurs clés. Une eau faiblement minéralisée convient au quotidien, tandis qu'une eau riche en magnésium aide à combattre la fatigue.
                  </p>
                  <Link to="/classement">
                    <Button className="mt-2">
                      Voir le classement des eaux →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section C — Surveiller la qualité de votre eau */}
        <section className="py-10 md:py-14 lg:py-20 px-4 bg-gradient-to-br from-primary/10 via-blue-50 to-primary/5" role="region" aria-labelledby="monitor-title">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h2 id="monitor-title" className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Surveillez la qualité de votre eau
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3 max-w-2xl mx-auto">
              Les données de qualité de l'eau sont publiques et accessibles à tous. Grâce à notre outil de diagnostic, retrouvez en quelques clics les <strong className="text-foreground">analyses officielles</strong> de votre commune.
            </p>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 max-w-2xl mx-auto">
              Restez informé des dépassements de seuils, comprenez les résultats et recevez des <strong className="text-foreground">alertes en temps réel</strong> pour protéger votre santé et celle de vos proches.
            </p>
            <Link to="/diagnostic">
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                Lancer un diagnostic gratuit →
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
