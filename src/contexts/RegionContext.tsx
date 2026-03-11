import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Region = 'fr' | 'eu';

interface RegionContextType {
  region: Region;
  setRegion: (r: Region) => void;
  toggleRegion: () => void;
  isFrance: boolean;
  isEurope: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<Region>('fr');

  const toggleRegion = () => setRegion(prev => (prev === 'fr' ? 'eu' : 'fr'));

  return (
    <RegionContext.Provider value={{
      region,
      setRegion,
      toggleRegion,
      isFrance: region === 'fr',
      isEurope: region === 'eu',
    }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
};
