import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AppContextType {
  region: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AuthProviderProps) {
  const [region, setRegion] = useState('SE');

  useEffect(() => {
    fetch('http://ip-api.com/json/?fields=countryCode,region')
      .then((response) => response.json())
      .then(({ countryCode, region }) => {
        if (countryCode && region) {
          setRegion(region);
        }
      })
      .catch((e) => {
        console.log(`Fallback to default region SE due to error: ${e}`);
        setRegion('SE');
      });
  }, [setRegion]);

  return (
    <AppContext.Provider value={{ region }}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  return context || { region: 'SE' };
}
