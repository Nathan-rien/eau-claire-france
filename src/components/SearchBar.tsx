
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchAddresses, AddressSuggestion } from '@/services/addressApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/utils/ga';

interface SearchBarProps {
  onCitySelect: (city: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onCitySelect, 
  placeholder
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const resolvedPlaceholder = placeholder || t('search.yourAddress');

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
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
        console.error('Search error:', error);
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
      
      if (suggestions.length === 0 && query.length >= 2) {
        try {
          const results = await searchAddresses(query);
          if (results.length > 0) {
            cityName = results[0].city;
          }
        } catch (error) {
          console.error('Search error:', error);
        }
      } else if (suggestions.length > 0) {
        cityName = suggestions[0].city;
      }
      
      onCitySelect(cityName);
      setShowSuggestions(false);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <Input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={resolvedPlaceholder}
            className="pl-10 pr-16 sm:pr-24 h-12 sm:h-14 text-base sm:text-lg border-2 border-blue-200 focus:border-blue-500 rounded-xl w-full"
            autoComplete="off"
            maxLength={100}
            enterKeyHint="search"
            aria-label={t('search.searchMunicipality')}
          />
          {isLoading && (
            <Loader2 className="absolute right-20 sm:right-24 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-blue-500" aria-hidden="true" />
          )}
          <Button 
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-12 min-w-[44px]"
            aria-label={t('search.search')}
          >
            <span className="hidden sm:inline">{t('search.search')}</span>
            <span className="sm:hidden">{t('search.ok')}</span>
          </Button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 min-h-[56px] hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between first:rounded-t-lg last:rounded-b-lg transition-colors"
              aria-label={`${suggestion.name}, ${suggestion.postcode}`}
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
