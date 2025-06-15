
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onCitySelect: (city: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onCitySelect, 
  placeholder = "Recherchez votre commune..." 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Simulated French cities for demo
  const mockCities = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Montpellier",
    "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Étienne",
    "Le Havre", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne"
  ];

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length > 2) {
      const filtered = mockCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (city: string) => {
    setQuery(city);
    setSuggestions([]);
    onCitySelect(city);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onCitySelect(query.trim());
      setSuggestions([]);
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-20 h-12 text-lg border-2 border-blue-200 focus:border-blue-500 rounded-xl"
          />
          <Button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            Rechercher
          </Button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          {suggestions.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelect(city)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg"
            >
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
