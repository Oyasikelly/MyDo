"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark";
type ColorScheme = "blue" | "purple" | "green" | "orange";

interface ThemeContextType {
	mode: ThemeMode;
	colorScheme: ColorScheme;
	toggleTheme: () => void;
	setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
	mode: "light",
	colorScheme: "blue",
	toggleTheme: () => {},
	setColorScheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const colorSchemes = {
	blue: {
		light: { main: "#1976d2", dark: "#1565c0" },
		dark: { main: "#90caf9", dark: "#42a5f5" },
	},
	purple: {
		light: { main: "#7b1fa2", dark: "#6a1b9a" },
		dark: { main: "#ce93d8", dark: "#ab47bc" },
	},
	green: {
		light: { main: "#2e7d32", dark: "#1b5e20" },
		dark: { main: "#81c784", dark: "#66bb6a" },
	},
	orange: {
		light: { main: "#ed6c02", dark: "#e65100" },
		dark: { main: "#ffb74d", dark: "#ffa726" },
	},
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [mode, setMode] = useState<ThemeMode>("light");
	const [colorScheme, setColorScheme] = useState<ColorScheme>("blue");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const savedMode = localStorage.getItem("themeMode") as ThemeMode;
		const savedColor = localStorage.getItem("colorScheme") as ColorScheme;
		if (savedMode) setMode(savedMode);
		if (savedColor) setColorScheme(savedColor);
	}, []);

	const toggleTheme = () => {
		const newMode = mode === "light" ? "dark" : "light";
		setMode(newMode);
		if (mounted) {
			localStorage.setItem("themeMode", newMode);
		}
	};

	const handleColorScheme = (scheme: ColorScheme) => {
		setColorScheme(scheme);
		if (mounted) {
			localStorage.setItem("colorScheme", scheme);
		}
	};

	const theme = createTheme({
		palette: {
			mode,
			primary: colorSchemes[colorScheme][mode],
			secondary: {
				main: "#dc004e",
			},
			background: {
				default: mode === "light" ? "#f5f5f5" : "#121212",
				paper: mode === "light" ? "#ffffff" : "#1e1e1e",
			},
		},
		typography: {
			fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
			h1: {
				fontSize: "2.5rem",
				fontWeight: 700,
				"@media (max-width:600px)": {
					fontSize: "2rem",
				},
			},
			h2: {
				fontSize: "2rem",
				fontWeight: 600,
				"@media (max-width:600px)": {
					fontSize: "1.75rem",
				},
			},
			h3: {
				fontSize: "1.75rem",
				fontWeight: 600,
				"@media (max-width:600px)": {
					fontSize: "1.5rem",
				},
			},
			h4: {
				fontSize: "1.5rem",
				fontWeight: 500,
				"@media (max-width:600px)": {
					fontSize: "1.25rem",
				},
			},
			h5: {
				fontSize: "1.25rem",
				fontWeight: 500,
				"@media (max-width:600px)": {
					fontSize: "1.125rem",
				},
			},
			h6: {
				fontSize: "1.125rem",
				fontWeight: 500,
				"@media (max-width:600px)": {
					fontSize: "1rem",
				},
			},
		},
		components: {
			MuiAppBar: {
				styleOverrides: {
					root: {
						background:
							mode === "light"
								? `linear-gradient(90deg, ${colorSchemes[colorScheme].light.main} 0%, ${colorSchemes[colorScheme].light.dark} 100%)`
								: `linear-gradient(90deg, ${colorSchemes[colorScheme].dark.main} 0%, ${colorSchemes[colorScheme].dark.dark} 100%)`,
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						textTransform: "none",
						borderRadius: 8,
						transition: "all 0.3s ease",
						"&:hover": {
							transform: "translateY(-2px)",
							boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
						},
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: 12,
						transition: "all 0.3s ease",
						"&:hover": {
							transform: "translateY(-4px)",
							boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
						},
					},
				},
			},
			MuiFab: {
				styleOverrides: {
					root: {
						transition: "all 0.3s ease",
						"&:hover": {
							transform: "scale(1.1)",
						},
					},
				},
			},
		},
	});

	return (
		<ThemeContext.Provider
			value={{
				mode,
				colorScheme,
				toggleTheme,
				setColorScheme: handleColorScheme,
			}}>
			<MUIThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</MUIThemeProvider>
		</ThemeContext.Provider>
	);
}
