import { useAuth } from "@shared/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function HomeLayout() {
	const { isSignedIn, isLoaded, offlineMode, isGuestMode } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (
			isLoaded &&
			!offlineMode &&
			!isGuestMode &&
			isSignedIn === false
		) {
			const timer = setTimeout(() => {
				router.replace("/");
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [isSignedIn, isLoaded, offlineMode, isGuestMode, router]);

	if (!isLoaded && !offlineMode) {
		return (
			<View className="flex-1 items-center justify-center bg-[#faf4f0]">
				<ActivityIndicator size="large" color="#fed787" />
			</View>
		);
	}

	if (!isSignedIn && !offlineMode && !isGuestMode) {
		return null;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="products" />
			<Stack.Screen name="bookmarks" />
			<Stack.Screen name="calendar" />
			<Stack.Screen name="settings" />
		</Stack>
	);
}
