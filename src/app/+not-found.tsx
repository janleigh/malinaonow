import { BaseText as Text } from "@/components/BaseText";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@shared/context/AuthContext";
import { shadowStyles } from "@shared/utils/styles";
import { Link, Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InDevelopmentScreen() {
	const { isSignedIn, isLoaded } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoaded && isSignedIn) {
			router.replace("/(home)");
		} else if (isLoaded && isSignedIn === false) {
			router.replace("/");
		}
	}, [isLoaded, isSignedIn, router]);

	if (!isLoaded) {
		return (
			<View className="flex-1 items-center justify-center bg-[#faf4f0]">
				<ActivityIndicator size="large" color="#fed787" />
			</View>
		);
	}
	return (
		<>
			<Stack.Screen options={{ title: "Coming Soon" }} />
			<View className="flex-1 bg-background">
				<SafeAreaView className="flex-1 items-center justify-center p-6">
					<View className="items-center">
						<View className="mb-6 h-16 w-16 items-center justify-center rounded-full border border-[#333333] bg-[#0ff6be]">
							<Feather name="tool" size={32} color="#333" />
						</View>
						<Text className="mb-4 text-3xl text-black">
							Coming Soon
						</Text>
						<Text className="mb-2 text-center text-lg text-[#333333]">
							We&apos;re working on this feature!
						</Text>
						<Text className="mb-8 text-center text-base text-[#666666]">
							This part of MalinaoNow is still under
							development. Check back soon for updates.
						</Text>
						<Link href="/" asChild>
							<TouchableOpacity
								className="h-12 flex-row items-center justify-center border border-[#333333] bg-[#0ff6be] px-6"
								style={shadowStyles.standard}>
								<Text
									className="text-base text-black"
									fontName="Montserrat_500Medium"
									fontStyle="medium">
									Return to landing page
								</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</SafeAreaView>
			</View>
		</>
	);
}
