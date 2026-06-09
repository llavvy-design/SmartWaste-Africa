import { createContext, useContext, useState, useCallback } from 'react';
import type { County } from '../types';

interface CountyContextType {
  selectedCounty: County | null;
  setSelectedCounty: (county: County | null) => void;
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
}

const CountyContext = createContext<CountyContextType>({
  selectedCounty: null,
  setSelectedCounty: () => {},
  selectedCity: null,
  setSelectedCity: () => {},
});

export function CountyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <CountyContext.Provider
      value={{
        selectedCounty,
        setSelectedCounty: useCallback((c) => setSelectedCounty(c), []),
        selectedCity,
        setSelectedCity: useCallback((c) => setSelectedCity(c), []),
      }}
    >
      {children}
    </CountyContext.Provider>
  );
}

export function useCounty() {
  return useContext(CountyContext);
}
