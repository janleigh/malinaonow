import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSignup = async () => {
		if (!email || !email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			// TODO: Move email validation here.
			await new Promise((resolve) => setTimeout(resolve, 1000));

			router.push({
				pathname: "/auth/otp",
				params: { email, type: "signup" }
			});
		} catch (err) {
			console.error("Signup error:", err);
			setError("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<LinearGradient colors={["#fbdfff", "#c5a1ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-1">
			<StatusBar style="dark" />
			<SafeAreaView className="flex-1">
				<View className="p-6">
					<Text className="mb-2 text-3xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Create Account
					</Text>
					<Text className="mb-8 font-lexend tracking-tighter-lexend text-[#333333]">
						Sign up to get started with MalinaoNow
					</Text>
					<View className="mt-4 space-y-4">
						<View
							className="rounded-lg bg-white p-4 border border-[#333333]"
							style={{
								shadowColor: "#000000",
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 1,
								shadowRadius: 0,
								elevation: 6
							}}
						>
							<Text className="mb-1 text-xs font-lexend tracking-tighter-lexend text-[#666666]">
								EMAIL
							</Text>
							<TextInput
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									setError("");
								}}
								placeholder="your@email.com"
								className="text-base font-lexend text-black"
								autoCapitalize="none"
								keyboardType="email-address"
							/>
						</View>
						{error ? (
							<Text className="text-red-500 font-lexend tracking-tighter-lexend">{error}</Text>
						) : null}
					</View>
					<TouchableOpacity
						className="mt-8 h-12 w-full items-center justify-center rounded-lg bg-[#ffdc58] border border-[#333333]"
						style={{
							shadowColor: "#000000",
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 1,
							shadowRadius: 0,
							elevation: 6
						}}
						onPress={handleSignup}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#000" />
						) : (
							<Text className="text-base text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend">
								Create Account
							</Text>
						)}
					</TouchableOpacity>
					<View className="mt-6 items-center">
						<Text className="text-center font-lexend tracking-tighter-lexend text-[#333333]">
							Already have an account?{" "}
							<Text
								className="text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend"
								onPress={() => router.replace("/auth/login")}
							>
								Log in
							</Text>
						</Text>
					</View>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}
