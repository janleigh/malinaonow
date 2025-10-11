import { API_KEYS } from "@/config";
import { TranslationProvider } from "@/shared/context/TranslationContext";
import { LocationService, ProductService } from "@/shared/services";
import { ClerkProvider } from "@clerk/clerk-expo";
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
	async getToken(key: string) {
		try {
			return SecureStore.getItemAsync(key);
		} catch (err) {
			return null;
		}
	},
	async saveToken(key: string, value: string) {
		try {
			return SecureStore.setItemAsync(key, value);
		} catch (err) {
			return;
		}
	}
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		"LexendMega-Bold": require("../shared/assets/fonts/LexendMega-Bold.ttf"),
		"LexendMega-ExtraBold": require("../shared/assets/fonts/LexendMega-ExtraBold.ttf"),
		"LexendMega-Medium": require("../shared/assets/fonts/LexendMega-Medium.ttf"),
		"LexendMega-Regular": require("../shared/assets/fonts/LexendMega-Regular.ttf"),
		"LexendMega-SemiBold": require("../shared/assets/fonts/LexendMega-SemiBold.ttf")
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
