import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../styles/globals.css";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		"LexendMega-Regular": require("../assets/fonts/LexendMega-Regular.ttf"),
		"LexendMega-Bold": require("../assets/fonts/LexendMega-Bold.ttf"),
		"LexendMega-ExtraBold": require("../assets/fonts/LexendMega-ExtraBold.ttf")
	});

	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="auth/login" />
				<Stack.Screen name="auth/signup" />
				<Stack.Screen name="auth/otp" />
				<Stack.Screen name="+not-found" />
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
