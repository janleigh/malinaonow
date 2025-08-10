import { useAuth } from "@/lib/context/AuthContext";
import { shadowStyles } from "@/lib/utils/styles";
import { Feather } from "@expo/vector-icons";
import { Link, Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
	ActivityIndicator,
	Text,
	TouchableOpacity,
	View
} from "react-native";
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
			<View className="flex-1 bg-[#faf4f0] items-center justify-center">
				<ActivityIndicator size="large" color="#fed787" />
			</View>
		);
	}
	return (
		<>
			<Stack.Screen options={{ title: "Coming Soon" }} />
			<View className="flex-1 bg-[#faf4f0]">
				<SafeAreaView className="flex-1 items-center justify-center p-6">
					<View className="items-center">
						<View className="w-16 h-16 rounded-full bg-[#fed787] items-center justify-center mb-6 border border-[#333333]">
							<Feather name="tool" size={32} color="#333" />
						</View>
						<Text className="text-3xl font-lexend-extrabold tracking-tighter-lexend text-black mb-4">
							Coming Soon
						</Text>
						<Text className="text-lg font-lexend tracking-tighter-lexend text-[#333333] text-center mb-2">
							We&apos;re working on this feature!
						</Text>
						<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-8">
							This part of MalinaoNow is still under
							development. Check back soon for updates.
						</Text>

						<Link href="/" asChild>
							<TouchableOpacity
								className="h-12 flex-row items-center justify-center bg-[#fed787] px-6 border border-[#333333]"
								style={shadowStyles.standard}
							>
								<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
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
