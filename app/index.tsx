import { OAuthButton } from "@/src/components/auth/OAuthButton";
import { Button, Text } from "@/src/components/ui";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link, router } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {

	return (
		<>
			<View className="flex-1">
				<SafeAreaView className="flex-1 items-center justify-center">
					<View className="flex-1 items-center justify-center">
						<View className="flex-col items-center">
							<Image
								source={require("@/assets/images/icon.png")}
								className="android:w-32 android:h-32 mb-4 h-6 w-6"
								resizeMode="cover"
							/>
							<Text
								className="android:text-4xl android:font-normal text-3xl tracking-tighter-lexend text-black"
							>
								MalinaoNow
							</Text>
						</View>
					</View>
					<View className="w-full space-y-3 px-5 pb-10">
						<Link href="/+not-found" asChild>
							<Button variant="outline">
								<Text>Sign up with email</Text>
							</Button>
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
					</View>
					<View className="mt-6 items-center">
						<Text className="text-center tracking-tighter-lexend text-[#333333]">
							Already have an account?{" "}
							<Text
								className="android:font-normal font-extrabold tracking-tighter-lexend text-black"
								onPress={() =>
									router.push("/")
								}>
								Log in
							</Text>
						</Text>
					</View>
				</SafeAreaView>
			</View>
		</>
	);
}
