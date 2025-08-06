import { useAuth } from "@/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function HomeLayout() {
	const { isSignedIn, isLoaded } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Only redirect if we're absolutely sure the user is not signed in
		// This prevents race conditions during OAuth flow
		if (isLoaded && isSignedIn === false) {
			// Add a small delay to prevent navigation conflicts
			const timer = setTimeout(() => {
				router.replace("/");
			}, 50);

			return () => clearTimeout(timer);
		}
	}, [isSignedIn, isLoaded, router]);

	// Show loading screen while auth state is being determined
	if (!isLoaded || isSignedIn === undefined) {
		return (
			<View className="flex-1 bg-[#faf4f0] items-center justify-center">
				<ActivityIndicator size="large" color="#fed787" />
			</View>
		);
	}

	// Don't render anything if user is not signed in (will redirect)
	if (!isSignedIn) {
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
