import { shadowStyles } from '@/utils/styles';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Link, router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LandingPage() {
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
					<Link href="/auth/signup" asChild>
						<TouchableOpacity
							className="h-12 w-full flex-row items-center justify-center bg-white px-4 border border-[#333333]"
							style={shadowStyles.standard}
						>
							<Text className="text-base text-black font-extrabold android:font-normal font-lexend-medium tracking-tighter-lexend">
								Sign up with email
							</Text>
						</TouchableOpacity>
					</Link>
					<TouchableOpacity
						className="h-12 w-full android:mt-2 flex-row items-center justify-center bg-[#9ee3ae] px-4 border border-[#333333]"
						style={shadowStyles.standard}
					>
						<AntDesign className="mr-2" name="google" size={24} color="black" />
						<Text className="text-base text-black font-extrabold android:font-normal font-lexend-medium tracking-tighter-lexend">
							Continue with Google
						</Text>
					</TouchableOpacity>
					<View className="mt-6 items-center">
						<Text className="text-center font-lexend tracking-tighter-lexend text-[#333333]">
							Already have an account?{" "}
							<Text
								className="text-black font-extrabold android:font-normal font-lexend tracking-tighter-lexend"
								onPress={() => router.replace("/home")}
							>
								Log in
							</Text>
						</Text>
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
