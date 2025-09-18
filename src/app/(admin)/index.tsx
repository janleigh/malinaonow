import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboard() {
	const adminOptions = [
		{
			title: "Manage Tourist spots",
			icon: "map-pin",
			route: "/(admin)/locations",
			description: "Add, edit, or remove tourist spots"
		},
		{
			title: "Manage Events",
			icon: "calendar",
			route: "/(admin)/events",
			description: "Create and manage upcoming events"
		},
		{
			title: "Manage Products",
			icon: "package",
			route: "/(admin)/products",
			description: "Add, edit, or remove products"
		},
		{
			title: "Moderate Reviews",
			icon: "message-square",
			route: "/(admin)/reviews",
			description: "View and moderate user reviews"
		}
	];

	return (
		<View className="flex-1 bg-[#C6E3D3]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Admin Panel
					</Text>
					<TouchableOpacity
						onPress={() => router.replace("/(home)")}
					>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] mb-6">
						Manage tourist spots, events, and moderate user
						reviews.
					</Text>
					<View className="space-y-4">
						{adminOptions.map((option, index) => (
							<TouchableOpacity
								key={index}
								className="bg-white p-4 mt-2 border border-[#333333] rounded-xl"
								// @ts-expect-error
								onPress={() => router.push(option.route)}
							>
								<View className="flex-row items-center">
									<View className="w-12 h-12 rounded-full bg-[#FFBB38] items-center justify-center mr-4 border border-[#333333]">
										<Feather
											// @ts-expect-error
											name={option.icon}
											size={24}
											color="#333"
										/>
									</View>
									<View className="flex-1">
										<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-black">
											{option.title}
										</Text>
										<Text className="text-sm font-lexend tracking-tighter-lexend text-[#666666]">
											{option.description}
										</Text>
									</View>
									<Feather
										name="chevron-right"
										size={24}
										color="#333"
									/>
								</View>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
