
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
  placeholder = "Votre adresse" 
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
    }, 500);

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
    onCitySelect(suggestion.city);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      let cityName = query.trim();
      
      // Si aucune suggestion n'est trouvée, forcer une recherche
      if (suggestions.length === 0 && query.length >= 3) {
        try {
          const results = await searchAddresses(query);
          if (results.length > 0) {
            cityName = results[0].city;
          }
        } catch (error) {
          console.error('Erreur lors de la recherche finale:', error);
        }
      } else if (suggestions.length > 0) {
        cityName = suggestions[0].city;
      }
      
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
            className="pl-10 pr-16 sm:pr-24 h-12 text-base border-2 border-blue-200 focus:border-blue-500 rounded-xl w-full"
            autoComplete="off"
            maxLength={100}
          />
          {isLoading && (
            <Loader2 className="absolute right-20 md:right-24 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 animate-spin text-blue-500" />
          )}
          <Button 
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-sm px-3 h-10"
          >
            <span className="hidden sm:inline">Rechercher</span>
            <span className="sm:hidden">OK</span>
          </Button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-blue-50 flex items-center justify-between first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 text-sm md:text-base">
                    {suggestion.name}
                  </p>
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
