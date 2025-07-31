import { Stack, useNavigation, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function HomeLayout() {
	const { isSignedIn, isLoaded } = useAuth();
	const router = useRouter();
	const navigation = useNavigation();

	// Handle authentication state changes
	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			// If user is not signed in, redirect to login
			router.replace("/");
		}
	}, [isSignedIn, isLoaded]);

	// Don't render anything until auth state is loaded
	if (!isLoaded) {
		return null;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="bookmarks" />
			<Stack.Screen name="calendar" />
		</Stack>
	);
}
