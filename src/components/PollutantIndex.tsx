
import React, { useState } from 'react';
import SearchFilters from './SearchFilters';
import StatisticsOverview from './StatisticsOverview';
import PollutantList from './PollutantList';
import { Pollutant } from './PollutantCard';

const PollutantIndex = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock pollutant data
  const pollutants: Pollutant[] = [
    {
      id: 'nitrates',
      name: 'Nitrates',
      category: 'Chimique',
      limit: 50,
      unit: 'mg/L',
      origin: 'Agriculture intensive, élevage',
      health: 'Risque pour les nourrissons (méthémoglobinémie)',
      prevalence: 15,
      trend: 'stable',
      riskLevel: 'medium',
      commonValues: '5-25 mg/L',
      detection: '85% des réseaux'
    },
    {
      id: 'pesticides',
      name: 'Pesticides totaux',
      category: 'Chimique',
      limit: 0.5,
      unit: 'µg/L',
      origin: 'Agriculture, traitement des espaces verts',
      health: 'Perturbateurs endocriniens, cancérigènes potentiels',
      prevalence: 32,
      trend: 'increasing',
      riskLevel: 'high',
      commonValues: '0.1-0.3 µg/L',
      detection: '32% des réseaux'
    },
    {
      id: 'trihalomethanes',
      name: 'Trihalométhanes',
      category: 'Sous-produit',
      limit: 100,
      unit: 'µg/L',
      origin: 'Chloration de l\'eau (sous-produit de désinfection)',
      health: 'Cancérigènes probables, irritation',
      prevalence: 68,
      trend: 'stable',
      riskLevel: 'medium',
      commonValues: '10-40 µg/L',
      detection: '68% des réseaux'
    },
    {
      id: 'plomb',
      name: 'Plomb',
      category: 'Métaux',
      limit: 10,
      unit: 'µg/L',
      origin: 'Canalisations anciennes, soudures',
      health: 'Neurotoxique, particulièrement dangereux pour les enfants',
      prevalence: 8,
      trend: 'decreasing',
      riskLevel: 'high',
      commonValues: '1-5 µg/L',
      detection: '8% des réseaux'
    },
    {
      id: 'arsenic',
      name: 'Arsenic',
      category: 'Métaux',
      limit: 10,
      unit: 'µg/L',
      origin: 'Géologie naturelle, activités industrielles',
      health: 'Cancérigène, lésions cutanées',
      prevalence: 3,
      trend: 'stable',
      riskLevel: 'high',
      commonValues: '1-3 µg/L',
      detection: '3% des réseaux'
    },
    {
      id: 'fluorures',
      name: 'Fluorures',
      category: 'Chimique',
      limit: 1.5,
      unit: 'mg/L',
      origin: 'Géologie naturelle, industrie',
      health: 'Fluorose dentaire et osseuse à haute dose',
      prevalence: 12,
      trend: 'stable',
      riskLevel: 'low',
      commonValues: '0.1-0.5 mg/L',
      detection: '12% des réseaux'
    }
  ];

  const categories = ['all', 'Chimique', 'Métaux', 'Sous-produit'];

  const filteredPollutants = pollutants.filter(pollutant => {
    const matchesSearch = pollutant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pollutant.origin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pollutant.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <StatisticsOverview pollutants={pollutants} />

      <PollutantList pollutants={filteredPollutants} />
    </div>
  );
};

export default PollutantIndex;
