import { OAuthButton } from "@/components/auth/OAuthButton";
import { BaseText as Text } from "@/components/BaseText";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "@shared/context/AuthContext";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const { signIn, setGuestMode } = useAuth();

	const handleContinueAsGuest = () => {
		setGuestMode(true);
		router.replace("/(home)");
	};

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
		<View className="flex-1 bg-background">
			<StatusBar style="dark" />
			<SafeAreaView className="flex-1">
				<View className="flex-1 flex-col justify-between p-6">
					<View>
						<Text
							className="android:text-4xl android:font-normal mb-2 text-3xl text-text"
							fontName="Montserrat_700Bold">
							Welcome Back
						</Text>
						<Text
							className="mb-8 text-text-inactive"
							fontName="Poppins_500Medium">
							Log in to continue using MalinaoNow
						</Text>
						{/* <View className="mt-4 space-y-4">
							<View className="mb-4">
								<Text
									className="mb-1 w-[180px] text-sm text-lineAlt"
									fontName="Montserrat_600SemiBold">
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
									className="my-2 rounded-lg border border-[#333333] bg-surface p-2 pl-4 text-base text-text"
									autoCapitalize="none"
									keyboardType="email-address"
								/>
							</View>
							{error ? (
								<Text className="text-red-500">
									{error}
								</Text>
							) : null}
						</View>
						<TouchableOpacity
							className="mt-4 h-12 w-full items-center justify-center rounded-3xl border border-line bg-primary"
							onPress={handleLogin}
							disabled={isLoading}>
							{isLoading ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text
									className="android:font-normal text-base text-black"
									fontName="Montserrat_700Bold">
									Login
								</Text>
							)}
						</TouchableOpacity> */}
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
						<View className="my-6 flex-row items-center">
							<View className="h-[1px] flex-1 bg-[#666]" />
							<Text className="mx-4 text-text">OR</Text>
							<View className="h-[1px] flex-1 bg-[#666]" />
						</View>
						<Pressable
							className="h-12 w-full flex-row items-center justify-center rounded-3xl border border-line bg-white px-4"
							android_ripple={{
								color: "rgba(0,0,0,0.12)",
								foreground: true
							}}
							onPress={handleContinueAsGuest}>
							<Text
								className="android:font-normal text-base font-extrabold text-black"
								fontName="Poppins_500Medium">
								Continue as Guest
							</Text>
						</Pressable>
					</View>
					{/* <View className="items-center pb-4">
						<Text
							className="text-center text-text"
							fontName="Poppins_500Medium">
							Don&apos;t have an account?{" "}
							<Text
								className="android:font-normal text-primary"
								fontName="Montserrat_700Bold"
								onPress={() => router.replace("/signup")}>
								Sign up
							</Text>
						</Text>
					</View> */}
				</View>
			</SafeAreaView>
		</View>
	);
}
