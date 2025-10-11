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
			<View className="flex-1 items-center justify-center bg-[#faf4f0]">
				<ActivityIndicator size="large" color="#fed787" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			{!isOnline && (
				<View className="border-line mx-4 mt-2 rounded-md border bg-primary px-3 py-1">
					<Text className="text-xs text-black">
						You are currently offline. Some features may be
						unavailable.
					</Text>
				</View>
			)}
			<SafeAreaView className="flex-1 items-center justify-center">
				<View className="flex-1 items-center justify-center">
					<View className="flex-col items-center">
						<Image
							source={require("@shared/assets/images/icon.png")}
							className="android:w-32 android:h-32 mb-4 h-6 w-6"
							resizeMode="cover"
						/>
						<Text
							className="android:text-4xl android:font-normal text-text-light text-3xl"
							fontName="Poppins_700Bold">
							MalinaoNow
						</Text>
					</View>
				</View>
				<View className="bg-surface w-full space-y-3 rounded-t-xl px-5 py-10">
					<Link href="/(auth)/signup" asChild>
						<TouchableOpacity className="border-line h-12 w-full flex-row items-center justify-center rounded-3xl border bg-white px-4">
							<Text
								className="android:font-normal text-base font-extrabold text-black"
								fontName="Poppins_700Bold">
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
						<Text
							className="text-center text-white"
							fontName="Poppins_500Medium">
							Already have an account?{" "}
							<Text
								className="android:font-normal font-extrabold text-black"
								fontName="Poppins_700Bold"
								onPress={() =>
									router.push("/(auth)/login")
								}>
								Log in
							</Text>
						</Text>
					</View>
				</View>
			</SafeAreaView>
			<Modal
				visible={showDialog}
				transparent={true}
				animationType="fade">
				<View className="flex-1 items-center justify-center bg-black/30">
					<View
						className="border-line w-[80%] border-2 bg-white p-5"
						style={shadowStyles.standard}>
						<Text
							className="mb-4 text-center text-xl text-black"
							fontStyle="extrabold">
							You&apos;re already signed in
						</Text>
						<Text className="text-line mb-6 text-center">
							Would you like to continue to the app or sign
							out?
						</Text>
						<View className="space-y-3">
							<TouchableOpacity
								className="border-line h-12 w-full items-center justify-center border bg-primary"
								style={shadowStyles.standard}
								onPress={handleGoToHome}>
								<Text
									className="text-base text-black"
									fontStyle="medium">
									Go to home page
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="border-line mt-2 h-12 w-full items-center justify-center border bg-white"
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
