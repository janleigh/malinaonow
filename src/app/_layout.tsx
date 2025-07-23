import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../styles/globals.css";

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
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="(auth)" />
			<Stack.Screen name="(home)" />
			<Stack.Screen name="+not-found" />
		</Stack>
	);
}
