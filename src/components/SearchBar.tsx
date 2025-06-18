
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchAddresses, AddressSuggestion } from '@/services/addressApi';

interface SearchBarProps {
  onCitySelect: (city: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onCitySelect, 
  placeholder = "Recherchez votre commune..." 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchAddresses(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.label);
    setSuggestions([]);
    setShowSuggestions(false);
    onCitySelect(suggestion.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Si pas de suggestion sélectionnée, utiliser le texte saisi
      const cityName = suggestions.length > 0 ? suggestions[0].name : query.trim();
      onCitySelect(cityName);
      setShowSuggestions(false);
    }
  };

  const handleInputBlur = () => {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-24 h-11 md:h-12 text-sm md:text-lg border-2 border-blue-200 focus:border-blue-500 rounded-xl w-full"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-20 md:right-24 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 animate-spin text-blue-500" />
          )}
          <Button 
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-xs md:text-sm px-2 md:px-4 h-9 md:h-10"
          >
            <span className="hidden sm:inline">Rechercher</span>
            <span className="sm:hidden">OK</span>
          </Button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-blue-50 flex items-center justify-between first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm md:text-base">{suggestion.name}</p>
                  <p className="text-xs md:text-sm text-gray-600">
                    {suggestion.postcode} - {suggestion.context}
                  </p>
                </div>
              </div>
              <div className="text-xs text-blue-600 font-medium">
                {Math.round(suggestion.score * 100)}%
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
