import { useAuth } from "@/lib/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function AdminLayout() {
	const { isLoaded, isSignedIn, isAdmin } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoaded) return;
		if (!isSignedIn || !isAdmin) {
			router.replace("/(home)");
		}
	}, [isLoaded, isSignedIn, isAdmin, router]);

	if (!isLoaded) return null;

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="locations" />
			<Stack.Screen name="events" />
			<Stack.Screen name="reviews" />
			<Stack.Screen name="products" />
		</Stack>
	);
}
