import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingPage() {
	return (
		<LinearGradient colors={["#fbdfff", "#c5a1ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-1">
			<SafeAreaView className="flex-1 items-center justify-center">
				<View className="flex-1 items-center justify-center">
					<View className="flex-row items-center">
						<Text className="text-3xl font-extrabold android:text-4xl android:font-normal text-black font-lexend tracking-tighter-lexend">
							MalinaoNow
						</Text>
					</View>
				</View>
				<View className="w-full px-5 pb-10 space-y-3">
					<TouchableOpacity
						className="h-12 w-full android:mb-2 flex-row items-center justify-center rounded-lg bg-[#ffdc58] px-4 border border-[#333333]"
						style={{
							shadowColor: "#000000",
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 1,
							shadowRadius: 1,
							elevation: 6
						}}
					>
						<AntDesign className="mr-2" name="google" size={24} color="black" />
						<Text className="text-base text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend">
							Continue with Google
						</Text>
					</TouchableOpacity>
					<Link href="/auth/signup" asChild>
						<TouchableOpacity
							className="h-12 w-full flex-row items-center justify-center rounded-lg bg-white px-4 border border-[#333333]"
							style={{
								shadowColor: "#000000",
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 1,
								shadowRadius: 1,
								elevation: 6
							}}
						>
							<Text className="text-base text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend">
								Sign up with email
							</Text>
						</TouchableOpacity>
					</Link>
					<View className="pt-1 android:py-4 marker:items-center">
						<View className="h-px w-full rounded-full bg-[#000] opacity-100" />
					</View>
					<Link href="/auth/login" asChild>
						<TouchableOpacity
							className="h-12 w-full flex-row items-center justify-center rounded-lg bg-white px-4 border border-[#333333]"
							style={{
								shadowColor: "#000000",
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 1,
								shadowRadius: 0,
								elevation: 6
							}}
						>
							<Text className="text-base text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend">
								Log in
							</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}
