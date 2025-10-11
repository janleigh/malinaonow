import "@/global.css";

import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

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
	useEffect(() => {
		SplashScreen.hideAsync();
	}, []);

	return (
		<ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="+not-found" />
			</Stack>
		</ClerkProvider>
	);
}
