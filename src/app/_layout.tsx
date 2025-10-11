import { API_KEYS } from "@/config";
import { TranslationProvider } from "@/shared/context/TranslationContext";
import { LocationService, ProductService } from "@/shared/services";
import { ClerkProvider } from "@clerk/clerk-expo";
import {
	Geist_400Regular,
	Geist_500Medium,
	Geist_600SemiBold,
	Geist_700Bold,
	Geist_800ExtraBold
} from "@expo-google-fonts/geist";
import {
	Montserrat_400Regular,
	Montserrat_500Medium,
	Montserrat_600SemiBold,
	Montserrat_700Bold,
	Montserrat_800ExtraBold
} from "@expo-google-fonts/montserrat";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_600SemiBold,
	Poppins_700Bold,
	Poppins_800ExtraBold
} from "@expo-google-fonts/poppins";
import { AuthProvider } from "@shared/context/AuthContext";
import "@shared/styles/globals.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

const CLERK_PUBLISHABLE_KEY = API_KEYS.clerk.publishableKey;

const tokenCache = {
	async getToken<T>(key: string): Promise<T | null> {
		try {
			const stored = await SecureStore.getItemAsync(key);
			if (stored) {
				return JSON.parse(stored) as T;
			}
			return null;
		} catch (err) {
			return null;
		}
	},
	async saveToken<T>(key: string, value: T) {
		try {
			const serialized = JSON.stringify(value);
			return SecureStore.setItemAsync(key, serialized);
		} catch (err) {
			return;
		}
	}
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		Geist_400Regular,
		Geist_500Medium,
		Geist_600SemiBold,
		Geist_700Bold,
		Geist_800ExtraBold,
		Montserrat_400Regular,
		Montserrat_500Medium,
		Montserrat_600SemiBold,
		Montserrat_700Bold,
		Montserrat_800ExtraBold,
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_600SemiBold,
		Poppins_700Bold,
		Poppins_800ExtraBold
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync();
			// CacheService.prefetch();
			LocationService.getLocations();
			ProductService.getAllProducts();
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<ClerkProvider
			publishableKey={CLERK_PUBLISHABLE_KEY}
			tokenCache={tokenCache}>
			<TranslationProvider>
				<AuthProvider>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="index" />
						<Stack.Screen name="(auth)" />
						<Stack.Screen name="(home)" />
						<Stack.Screen name="+not-found" />
					</Stack>
				</AuthProvider>
			</TranslationProvider>
		</ClerkProvider>
	);
}
