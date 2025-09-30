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
		<View className="flex-1 bg-[#C6E3D3]">
			{!isOnline && (
				<View className="mx-4 mt-2 rounded-md border border-[#333333] bg-[#FFBB38] px-3 py-1">
					<Text className="text-xs tracking-tighter-lexend text-black">
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
							className="android:text-4xl android:font-normal text-3xl tracking-tighter-lexend text-black"
							fontStyle="extrabold"
						>
							MalinaoNow
						</Text>
					</View>
				</View>
				<View className="w-full space-y-3 px-5 pb-10">
					<Link href="/(auth)/signup" asChild>
						<TouchableOpacity
							className="h-12 w-full flex-row items-center justify-center border border-[#333333] bg-white px-4 rounded-3xl"
						
						>
							<Text
								className="android:font-normal text-base font-extrabold tracking-tighter-lexend text-black"
								fontStyle="medium"
							>
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
						<Text className="text-center tracking-tighter-lexend text-[#333333]">
							Already have an account?{" "}
							<Text
								className="android:font-normal font-extrabold tracking-tighter-lexend text-black"
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
				<View className="flex-1 items-center justify-center bg-black/30">
					<View
						className="w-[80%] border-2 border-[#333333] bg-white p-5"
						style={shadowStyles.standard}
					>
						<Text
							className="mb-4 text-center text-xl tracking-tighter-lexend text-black"
							fontStyle="extrabold"
						>
							You&apos;re already signed in
						</Text>
						<Text className="mb-6 text-center tracking-tighter-lexend text-[#333333]">
							Would you like to continue to the app or sign
							out?
						</Text>
						<View className="space-y-3">
							<TouchableOpacity
								className="h-12 w-full items-center justify-center border border-[#333333] bg-[#fed787]"
								style={shadowStyles.standard}
								onPress={handleGoToHome}
							>
								<Text
									className="text-base tracking-tighter-lexend text-black"
									fontStyle="medium"
								>
									Go to home page
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="mt-2 h-12 w-full items-center justify-center border border-[#333333] bg-white"
								style={shadowStyles.standard}
								onPress={handleSignOut}
							>
								<Text
									className="text-base tracking-tighter-lexend text-black"
									fontStyle="medium"
								>
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
