import { OAuthButton } from "@/components/auth/OAuthButton";
import { BaseText as Text } from "@/components/BaseText";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "@shared/context/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
	ActivityIndicator,
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
		<View className="flex-1 bg-[#C6E3D3]">
			<StatusBar style="dark" />
			<SafeAreaView className="flex-1">
				<View className="flex-1 flex-col justify-between p-6">
					<View>
						<Text className="android:text-4xl android:font-normal mb-2 text-3xl tracking-tighter-lexend text-black">
							Welcome Back
						</Text>
						<Text className="mb-8 tracking-tighter-lexend text-[#333333]">
							Log in to continue using MalinaoNow
						</Text>
						<View className="mt-4 space-y-4">
							<View
								className="mb-4"
								
							>
								<Text className="mb-1 text-xs tracking-tighter-lexend text-[#666666]">
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
									className="text-base text-black border border-[#333333] bg-white p-4 rounded-md"
									autoCapitalize="none"
									keyboardType="email-address"
								/>
							</View>
							{error ? (
								<Text className="tracking-tighter-lexend text-red-500">
									{error}
								</Text>
							) : null}
						</View>
						<TouchableOpacity
							className="mt-8 h-12 w-full items-center justify-center border border-[#333333] bg-[#FFBB38] rounded-3xl shadow-md"
						
							onPress={handleLogin}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text
									className="android:font-normal text-base tracking-tighter-lexend text-black"
									fontStyle="medium"
								>
									Login
								</Text>
							)}
						</TouchableOpacity>
						<View className="my-6 flex-row items-center">
							<View className="h-[1px] flex-1 bg-[#cccccc]" />
							<Text className="mx-4 tracking-tighter-lexend text-[#666666]">
								OR
							</Text>
							<View className="h-[1px] flex-1 bg-[#cccccc]" />
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
						<Text className="text-center tracking-tighter-lexend text-[#333333]">
							Don&apos;t have an account?{" "}
							<Text
								className="android:font-normal tracking-tighter-lexend text-black"
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
