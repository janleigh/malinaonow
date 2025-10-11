import { router, Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				gestureEnabled: true
			}}>
			<Stack.Screen
				name="login"
				options={{
					gestureEnabled: true,
					animation: "slide_from_right",
					presentation: "card"
				}}
				listeners={{
					beforeRemove: (e) => {
						if (e.data.action.type === "GO_BACK") {
							e.preventDefault();
							router.replace("/");
						}
					}
				}}
			/>
			<Stack.Screen
				name="signup"
				options={{
					gestureEnabled: true,
					animation: "slide_from_right",
					presentation: "card"
				}}
				listeners={{
					beforeRemove: (e) => {
						if (e.data.action.type === "GO_BACK") {
							e.preventDefault();
							router.replace("/");
						}
					}
				}}
			/>
			<Stack.Screen name="otp" />
		</Stack>
	);
}
