import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

type Scheme = 'light' | 'dark';

type ColorSchemeContextValue = {
	colorScheme: Scheme;
	setColorScheme: (scheme: Scheme) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'meds.theme.v1';

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
	const getInitial = useCallback((): Scheme => {
		const sys = Appearance.getColorScheme();
		return sys === 'dark' ? 'dark' : 'light';
	}, []);

	const [scheme, setScheme] = useState<Scheme>(getInitial);

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
			if (saved === 'light' || saved === 'dark') {
				setScheme(saved);
			}
		});
	}, []);

	const setColorScheme = useCallback((next: Scheme) => {
		setScheme(next);
		AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
	}, []);

	const value: ColorSchemeContextValue = useMemo(() => ({ colorScheme: scheme, setColorScheme }), [scheme, setColorScheme]);

	return React.createElement(ColorSchemeContext.Provider, { value }, children as any);
}

export function useColorScheme(): Scheme {
	const ctx = useContext(ColorSchemeContext);
	if (!ctx) {
		// Fallback to system if provider is missing
		const sys = Appearance.getColorScheme();
		return sys === 'dark' ? 'dark' : 'light';
	}
	return ctx.colorScheme;
}

export function useThemeController() {
	const ctx = useContext(ColorSchemeContext);
	if (!ctx) {
		throw new Error('useThemeController must be used within ColorSchemeProvider');
	}
	return ctx;
}


