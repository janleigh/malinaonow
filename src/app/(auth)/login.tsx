import { OAuthButton } from "@/components/auth/OAuthButton";
import { useAuth } from "@/lib/context/AuthContext";
import { shadowStyles } from "@/lib/utils/styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const { signIn } = useAuth();

	const handleLogin = async () => {
		if (!email || !email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			await signIn(email);
		} catch (err) {
			console.error("Login error:", err);
			setError("Something went wrong. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<StatusBar style="dark" />
			<SafeAreaView className="flex-1">
				<View className="flex-1 p-6 flex-col justify-between">
					<View>
						<Text className="mb-2 text-3xl font-extrabold android:text-4xl android:font-normal text-black font-lexend tracking-tighter-lexend">
							Welcome Back
						</Text>
						<Text className="mb-8 font-lexend tracking-tighter-lexend text-[#333333]">
							Log in to continue using MalinaoNow
						</Text>
						<View className="mt-4 space-y-4">
							<View
								className="bg-white p-4 border border-[#333333]"
								style={shadowStyles.standard}
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
									placeholder="youremail@company.com"
									placeholderTextColor="#666666"
									className="text-base font-lexend text-black"
									autoCapitalize="none"
									keyboardType="email-address"
								/>
							</View>
							{error ? (
								<Text className="text-red-500 font-lexend tracking-tighter-lexend">
									{error}
								</Text>
							) : null}
						</View>
						<TouchableOpacity
							className="mt-8 h-12 w-full items-center justify-center bg-[#fed787] border border-[#333333]"
							style={shadowStyles.standard}
							onPress={handleLogin}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text className="text-base font-extrabold android:font-normal text-black font-lexend-medium tracking-tighter-lexend">
									Login
								</Text>
							)}
						</TouchableOpacity>

						<View className="my-6 flex-row items-center">
							<View className="flex-1 h-[1px] bg-[#cccccc]" />
							<Text className="mx-4 text-[#666666] font-lexend tracking-tighter-lexend">
								OR
							</Text>
							<View className="flex-1 h-[1px] bg-[#cccccc]" />
						</View>

						<OAuthButton
							strategy="oauth_google"
							text="Continue with Google"
							icon={
								<AntDesign
									className="mr-2"
									name="google"
									size={24}
									color="black"
								/>
							}
						/>
					</View>

					<View className="items-center pb-4">
						<Text className="text-center font-lexend tracking-tighter-lexend text-[#333333]">
							Don&apos;t have an account?{" "}
							<Text
								className="text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend"
								onPress={() => router.replace("/signup")}
							>
								Sign up
							</Text>
						</Text>
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
