
import React, { useState } from 'react';
import { bottledWaters, tapWater } from '@/data/bottleWaterData';
import WaterSelector from './WaterSelector';
import WaterComparisonCard from './WaterComparisonCard';
import AnnualImpactComparison from './AnnualImpactComparison';

const BottleComparison = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('cristaline');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtrer les eaux selon la recherche
  const filteredWaters = bottledWaters.filter(water =>
    water.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    water.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    water.producer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedWater = bottledWaters.find(w => w.id === selectedBrand) || bottledWaters[0];

  return (
    <div className="space-y-6">
      <WaterSelector
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredWaters={filteredWaters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterComparisonCard 
          water={tapWater} 
          isTapWater={true}
        />
        <WaterComparisonCard 
          water={selectedWater} 
          selectedWater={selectedWater}
        />
      </div>

      <AnnualImpactComparison 
        selectedWater={selectedWater} 
        tapWater={tapWater} 
      />
    </div>
  );
};

export default BottleComparison;
