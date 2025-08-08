import { OAuthButton } from "@/components/auth/OAuthButton";
import { useAuth } from "@/context/AuthContext";
import { shadowStyles } from "@/lib/utils/styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useCallback, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Modal,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingPage() {
	const { isSignedIn, isLoaded, signOut } = useAuth();
	const [showDialog, setShowDialog] = useState(false);

	useFocusEffect(
		useCallback(() => {
			return () => {
				setShowDialog(false);
			};
		}, [])
	);

	useLayoutEffect(() => {
		// Only redirect if auth is fully loaded and user is definitely signed in
		// This prevents race conditions during OAuth flow
		if (isLoaded && isSignedIn === true) {
			// Add a small delay to ensure auth state is stable
			const timer = setTimeout(() => {
				handleGoToHome();
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [isLoaded, isSignedIn]);

	const handleGoToHome = () => {
		setShowDialog(false);
		router.replace("/(home)");
	};

	const handleSignOut = async () => {
		try {
			setShowDialog(false);
			await signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	// Show loading screen while auth state is being determined
	if (!isLoaded) {
		return (
			<View className="flex-1 bg-[#faf4f0] items-center justify-center">
				<ActivityIndicator size="large" color="#fed787" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1 items-center justify-center">
				<View className="flex-1 items-center justify-center">
					<View className="flex-col items-center">
						<Image
							source={require("../assets/images/icon.png")}
							className="w-6 h-6 android:w-32 android:h-32 mb-4"
							resizeMode="cover"
						/>
						<Text className="text-3xl font-extrabold android:text-4xl android:font-normal text-black font-lexend tracking-tighter-lexend">
							MalinaoNow
						</Text>
					</View>
				</View>
				<View className="w-full px-5 pb-10 space-y-3">
					<Link href="/(auth)/signup" asChild>
						<TouchableOpacity
							className="h-12 w-full flex-row items-center justify-center bg-white px-4 border border-[#333333]"
							style={shadowStyles.standard}
						>
							<Text className="text-base text-black font-extrabold android:font-normal font-lexend-medium tracking-tighter-lexend">
								Sign up with email
							</Text>
						</TouchableOpacity>
					</Link>
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
						className="android:mt-2"
					/>
					<View className="mt-6 items-center">
						<Text className="text-center font-lexend tracking-tighter-lexend text-[#333333]">
							Already have an account?{" "}
							<Text
								className="text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend"
								onPress={() =>
									router.push("/(auth)/login")
								}
							>
								Log in
							</Text>
						</Text>
					</View>
				</View>
			</SafeAreaView>
			<Modal
				visible={showDialog}
				transparent={true}
				animationType="fade"
			>
				<View className="flex-1 justify-center items-center bg-black/30">
					<View
						className="w-[80%] bg-white p-5 border-2 border-[#333333]"
						style={shadowStyles.standard}
					>
						<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-4 text-center">
							You&apos;re already signed in
						</Text>
						<Text className="mb-6 font-lexend tracking-tighter-lexend text-[#333333] text-center">
							Would you like to continue to the app or sign
							out?
						</Text>
						<View className="space-y-3">
							<TouchableOpacity
								className="h-12 w-full items-center justify-center bg-[#fed787] border border-[#333333]"
								style={shadowStyles.standard}
								onPress={handleGoToHome}
							>
								<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
									Go to home page
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="h-12 w-full mt-2 items-center justify-center bg-white border border-[#333333]"
								style={shadowStyles.standard}
								onPress={handleSignOut}
							>
								<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
									Sign out
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
