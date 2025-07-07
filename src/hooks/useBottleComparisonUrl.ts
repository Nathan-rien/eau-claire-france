
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BottleWaterData, getUniqueBottles } from '@/data/bottleComparisonData';

export const useBottleComparisonUrl = () => {
  const [selectedBottles, setSelectedBottles] = useState<BottleWaterData[]>([]);
  const [showTapWater, setShowTapWater] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Load bottles from URL on startup
  useEffect(() => {
    const bottleIds = searchParams.get('bottles');
    const tapWater = searchParams.get('tapwater') === 'true';
    
    if (bottleIds) {
      const ids = bottleIds.split(',').map(id => parseInt(id.trim()));
      const uniqueBottles = getUniqueBottles();
      const loadedBottles = uniqueBottles.filter(bottle => ids.includes(bottle.id));
      setSelectedBottles(loadedBottles);
    }
    
    setShowTapWater(tapWater);
  }, [searchParams]);

  // Update URL when selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedBottles.length > 0) {
      params.set('bottles', selectedBottles.map(b => b.id).join(','));
    }
    
    if (showTapWater) {
      params.set('tapwater', 'true');
    }
    
    setSearchParams(params);
  }, [selectedBottles, showTapWater, setSearchParams]);

  return {
    selectedBottles,
    setSelectedBottles,
    showTapWater,
    setShowTapWater
  };
};
