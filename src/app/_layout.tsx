import { API_KEYS } from "@/config";
import { AuthProvider } from "@/context/AuthContext";
import "@/lib/styles/globals.css";
import { ClerkProvider } from "@clerk/clerk-expo";
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
		"LexendMega-Bold": require("../assets/fonts/LexendMega-Bold.ttf"),
		"LexendMega-ExtraBold": require("../assets/fonts/LexendMega-ExtraBold.ttf"),
		"LexendMega-Medium": require("../assets/fonts/LexendMega-Medium.ttf"),
		"LexendMega-Regular": require("../assets/fonts/LexendMega-Regular.ttf"),
		"LexendMega-SemiBold": require("../assets/fonts/LexendMega-SemiBold.ttf")
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<ClerkProvider
			publishableKey={CLERK_PUBLISHABLE_KEY}
			tokenCache={tokenCache}
		>
			<AuthProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="(auth)" />
					<Stack.Screen name="(home)" />
					<Stack.Screen name="+not-found" />
				</Stack>
			</AuthProvider>
		</ClerkProvider>
	);
}
