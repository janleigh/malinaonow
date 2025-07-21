import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import "react-native-reanimated";
import "../styles/globals.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		'LexendMega-Bold': require('../assets/fonts/LexendMega-Bold.ttf'),
		'LexendMega-ExtraBold': require('../assets/fonts/LexendMega-ExtraBold.ttf'),
		'LexendMega-Medium': require('../assets/fonts/LexendMega-Medium.ttf'),
		'LexendMega-Regular': require('../assets/fonts/LexendMega-Regular.ttf'),
		'LexendMega-SemiBold': require('../assets/fonts/LexendMega-SemiBold.ttf'),

		// Public Sans
		'PublicSans-Bold': require('../assets/fonts/PublicSans-Bold.ttf'),
		'PublicSans-BoldItalic': require('../assets/fonts/PublicSans-BoldItalic.ttf'),
		'PublicSans-ExtraBold': require('../assets/fonts/PublicSans-ExtraBold.ttf'),
		'PublicSans-ExtraBoldItalic': require('../assets/fonts/PublicSans-ExtraBoldItalic.ttf'),
		'PublicSans-Italic': require('../assets/fonts/PublicSans-Italic.ttf'),
		'PublicSans-Medium': require('../assets/fonts/PublicSans-Medium.ttf'),
		'PublicSans-MediumItalic': require('../assets/fonts/PublicSans-MediumItalic.ttf'),
		'PublicSans-Regular': require('../assets/fonts/PublicSans-Regular.ttf'),
		'PublicSans-SemiBold': require('../assets/fonts/PublicSans-SemiBold.ttf'),
		'PublicSans-SemiBoldItalic': require('../assets/fonts/PublicSans-SemiBoldItalic.ttf'),
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
			<Stack.Screen name="home/index" />
			<Stack.Screen name="+not-found" />
		</Stack>
	);
}
