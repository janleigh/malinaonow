import { BaseText as Text } from "@/components/BaseText";
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

export default function SignupScreen() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const { signUp } = useAuth();

	const handleSignup = async () => {
		if (!firstName.trim()) {
			setError("Please enter your first name");
			return;
		}

		if (!lastName.trim()) {
			setError("Please enter your last name");
			return;
		}

		if (!email || !email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			await signUp(email, firstName, lastName);
		} catch (err) {
			console.error("Signup error:", err);
			setError("Something went wrong. Please try again.");
		} finally {
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
							Create Account
						</Text>
						<Text className="mb-8 tracking-tighter-lexend text-[#333333]">
							Sign up to get started with MalinaoNow
						</Text>
						<View className="mt-1 space-y-4">
							<View className="mb-4">
								<Text className="mb-1 text-xs tracking-tighter-lexend text-[#666666]">
									FIRST NAME
								</Text>
								<TextInput
									value={firstName}
									onChangeText={(text) => {
										setFirstName(text);
										setError("");
									}}
									placeholder="John"
									placeholderTextColor="#666666"
									className="my-2 rounded-md border border-[#333333] bg-white p-2 text-base text-black"
									autoCapitalize="words"
								/>
							</View>
							<View className="mb-4">
								<Text className="mb-1 text-xs tracking-tighter-lexend text-[#666666]">
									LAST NAME
								</Text>
								<TextInput
									value={lastName}
									onChangeText={(text) => {
										setLastName(text);
										setError("");
									}}
									placeholder="Doe"
									placeholderTextColor="#666666"
									className="my-2 rounded-md border border-[#333333] bg-white p-2 text-base text-black"
									autoCapitalize="words"
								/>
							</View>
							<View className="mb-4">
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
									className="my-2 rounded-md border border-[#333333] bg-white p-2 text-base text-black"
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
							className="mt-4 h-12 w-full items-center justify-center rounded-3xl border border-[#333333] bg-[#FFBB38]"
							onPress={handleSignup}
							disabled={isLoading}>
							{isLoading ? (
								<ActivityIndicator color="#000" />
							) : (
								<Text className="android:font-normal font-lexend-medium text-base tracking-tighter-lexend text-black">
									Create Account
								</Text>
							)}
						</TouchableOpacity>
					</View>
					<View className="items-center pb-4">
						<Text className="text-center tracking-tighter-lexend text-[#333333]">
							Already have an account?{" "}
							<Text
								className="android:font-normal tracking-tighter-lexend text-black"
								onPress={() => router.replace("/login")}>
								Log in
							</Text>
						</Text>
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
