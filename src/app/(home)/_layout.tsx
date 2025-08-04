import { useAuth } from "@/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function HomeLayout() {
	const { isSignedIn, isLoaded } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			router.replace("/");
		}
	}, [isSignedIn, isLoaded, router]);

	if (!isLoaded) {
		return null;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="bookmarks" />
			<Stack.Screen name="calendar" />
			<Stack.Screen name="settings" />
		</Stack>
	);
}
