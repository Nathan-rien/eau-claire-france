
import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PollutantCard, { Pollutant } from './PollutantCard';

interface PollutantListProps {
  pollutants: Pollutant[];
}

const PollutantList: React.FC<PollutantListProps> = ({ pollutants }) => {
  if (pollutants.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun polluant trouvé pour votre recherche.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {pollutants.map(pollutant => (
        <PollutantCard key={pollutant.id} pollutant={pollutant} />
      ))}
    </div>
  );
};

export default PollutantList;
