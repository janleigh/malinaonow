import AsyncStorage from "@react-native-async-storage/async-storage";
import akl from "@shared/i18n/dictionaries/akl";
import en from "@shared/i18n/dictionaries/en";
import fil from "@shared/i18n/dictionaries/fil";
import React, {
	createContext,
	useContext,
	useEffect,
	useState
} from "react";

export const LANGUAGE_STORAGE_KEY = "app_language_preference";
export const LANGUAGES = [
	{ id: "en", name: "English" },
	{ id: "fil", name: "Filipino" },
	{ id: "akl", name: "Aklanon" }
];

const translations = {
	en,
	fil,
	akl
};

type TranslationContextType = {
	language: string;
	setLanguage: (lang: string) => Promise<void>;
	t: (key: string) => string;
};

export const TranslationContext = createContext<TranslationContextType>({
	language: "en",
	setLanguage: async () => {},
	t: (key) => key
});

export const TranslationProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [language, setLanguageState] = useState("en");

	useEffect(() => {
		const loadLanguage = async () => {
			try {
				const savedLanguage = await AsyncStorage.getItem(
					LANGUAGE_STORAGE_KEY
				);
				if (savedLanguage) {
					setLanguageState(savedLanguage);
				}
			} catch (error) {
				console.error(
					"Failed to load language preference:",
					error
				);
			}
		};

		loadLanguage();
	}, []);

	const setLanguage = async (lang: string) => {
		try {
			await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
			setLanguageState(lang);
		} catch (error) {
			console.error("Failed to save language preference:", error);
		}
	};

	const t = (key: string) => {
		const languageTranslations =
			translations[language as keyof typeof translations] ||
			translations.en;
		const nestedKeys = key.split(".");
		let result = languageTranslations;

		for (const nestedKey of nestedKeys) {
			if (
				result &&
				typeof result === "object" &&
				nestedKey in result
			) {
				// @ts-ignore
				result = result[nestedKey];
			} else {
				return key;
			}
		}

		return typeof result === "string" ? result : key;
	};

	return (
		<TranslationContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</TranslationContext.Provider>
	);
};

export const useTranslation = () => useContext(TranslationContext);
