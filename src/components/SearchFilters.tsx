
import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>{t('comp.searchFilters.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('comp.searchFilters.placeholder')}
              className="w-full h-12 text-base"
            />
          </div>
          <div>
            <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="text-xs sm:text-sm py-2 px-1"
                  >
                    {category === 'all' ? t('comp.searchFilters.all') : category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
