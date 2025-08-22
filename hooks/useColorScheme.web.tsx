import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Web variant: mirrors the native API but does not persist
 */
type Scheme = 'light' | 'dark';

type ColorSchemeContextValue = {
  colorScheme: Scheme;
  setColorScheme: (scheme: Scheme) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(undefined);

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const rnScheme = useRNColorScheme();
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const scheme: Scheme = hasHydrated ? (rnScheme === 'dark' ? 'dark' : 'light') : 'light';

  const value = useMemo<ColorSchemeContextValue>(
    () => ({ colorScheme: scheme, setColorScheme: () => {} }),
    [scheme]
  );

  return React.createElement(ColorSchemeContext.Provider, { value }, children as any);
}

export function useColorScheme(): Scheme {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) return 'light';
  return ctx.colorScheme;
}

export function useThemeController() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) throw new Error('useThemeController must be used within ColorSchemeProvider');
  return ctx;
}


