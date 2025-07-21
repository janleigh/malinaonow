import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import "react-native-reanimated";
import "../styles/globals.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		'LexendMega-ExtraLight': require('../assets/fonts/LexendMega-ExtraLight.ttf'),
		'LexendMega-Light': require('../assets/fonts/LexendMega-Light.ttf'),
		'LexendMega-Thin': require('../assets/fonts/LexendMega-Thin.ttf'),
		'LexendMega-Medium': require('../assets/fonts/LexendMega-Medium.ttf'),
		'LexendMega-Regular': require('../assets/fonts/LexendMega-Regular.ttf'),
		'LexendMega-Bold': require('../assets/fonts/LexendMega-Bold.ttf'),
		'LexendMega-Black': require('../assets/fonts/LexendMega-Black.ttf'),
		'LexendMega-SemiBold': require('../assets/fonts/LexendMega-SemiBold.ttf'),
		'LexendMega-ExtraBold': require('../assets/fonts/LexendMega-ExtraBold.ttf'),
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
			<Stack.Screen name="auth/login" />
			<Stack.Screen name="auth/signup" />
			<Stack.Screen name="auth/otp" />
			<Stack.Screen name="+not-found" />
		</Stack>
	);
}
