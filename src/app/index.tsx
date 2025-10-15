import { OAuthButton } from "@/components/auth/OAuthButton";
import { BaseText as Text } from "@/components/BaseText";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "@shared/context/AuthContext";
import { shadowStyles } from "@shared/utils/styles";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useCallback, useLayoutEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingPage() {
	const { isSignedIn, isLoaded, signOut } = useAuth();
	const [showDialog, setShowDialog] = useState(false);
	const { isOnline } = useNetworkStatus();

	useFocusEffect(
		useCallback(() => {
			return () => {
				setShowDialog(false);
			};
		}, [])
	);

	useLayoutEffect(() => {
		if (isLoaded && isSignedIn === true) {
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

	if (!isLoaded) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" color="#0ff6be" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			{/* Offline Banner */}
			{!isOnline && (
				<View className="mx-4 mt-2 rounded-md border border-line bg-primary px-3 py-1">
					<Text className="text-xs text-black">
						You are currently offline. Some features may be
						unavailable.
					</Text>
				</View>
			)}
			{/* Logo and App Name */}
			<SafeAreaView className="flex-1 items-center justify-center">
				<View className="flex-1 items-center justify-center">
					<View className="flex-col items-center">
						<Image
							source={require("@shared/assets/images/icon.png")}
							className="android:w-32 android:h-32 mb-4 h-6 w-6"
							resizeMode="cover"
						/>
						<Text
							className="android:text-4xl android:font-normal text-3xl text-text"
							fontName="Montserrat_700Bold">
							MalinaoNow
						</Text>
					</View>
				</View>
				<View className="w-full space-y-3 rounded-t-xl px-5 py-10">
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
						className="android:mb-2"
					/>
					<Link href="/(auth)/signup" asChild>
						<Pressable
							className="h-12 w-full flex-row items-center justify-center rounded-3xl border border-line bg-white px-4 disabled:opacity-50"
							android_ripple={{
								color: "rgba(0,0,0,0.12)",
								foreground: true
							}}
							disabled>
							<Text
								className="android:font-normal text-base font-extrabold text-black"
								fontName="Poppins_500Medium">
								Sign up with email (DISABLED)
							</Text>
						</Pressable>
					</Link>
					<View className="my-6 flex-row items-center">
						<View className="h-[1px] flex-1 bg-[#cccccc]" />
						<Text className="mx-4 text-text">OR</Text>
						<View className="h-[1px] flex-1 bg-[#cccccc]" />
					</View>
					<Link href="/(home)/products" asChild>
						<Pressable
							className="h-12 w-full flex-row items-center justify-center rounded-3xl border border-line bg-white px-4"
							android_ripple={{
								color: "rgba(0,0,0,0.12)",
								foreground: true
							}}>
							<Text
								className="android:font-normal text-base font-extrabold text-black"
								fontName="Poppins_500Medium">
								Continue as Guest
							</Text>
						</Pressable>
					</Link>
					<View className="mt-6 items-center">
						<Text
							className="text-center text-white"
							fontName="Poppins_500Medium">
							Already have an account?{" "}
							<Text
								className="android:font-normal font-extrabold text-primary"
								fontName="Montserrat_700Bold"
								onPress={() => router.push("/(auth)/otp")}>
								Log in
							</Text>
						</Text>
					</View>
				</View>
			</SafeAreaView>
			{/* Already Signed In Dialog */}
			<Modal
				visible={showDialog}
				transparent={true}
				animationType="fade">
				<View className="flex-1 items-center justify-center bg-black/30">
					<View
						className="w-[80%] border-2 border-line bg-white p-5"
						style={shadowStyles.standard}>
						<Text
							className="mb-4 text-center text-xl text-black"
							fontStyle="extrabold">
							You&apos;re already signed in
						</Text>
						<Text className="mb-6 text-center text-line">
							Would you like to continue to the app or sign
							out?
						</Text>
						<View className="space-y-3">
							<TouchableOpacity
								className="h-12 w-full items-center justify-center border border-line bg-primary"
								style={shadowStyles.standard}
								onPress={handleGoToHome}>
								<Text
									className="text-base text-black"
									fontStyle="medium">
									Go to home page
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="mt-2 h-12 w-full items-center justify-center border border-line bg-white"
								style={shadowStyles.standard}
								onPress={handleSignOut}>
								<Text
									className="text-base text-black"
									fontStyle="medium">
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
