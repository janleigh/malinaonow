import { BaseText as Text } from "@/components/BaseText";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
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
		<View className="flex-1 bg-background">
			<SafeAreaView className="flex-1">
				<View className="flex-row items-center justify-between p-4">
					<Text
						className="android:font-normal text-2xl text-text"
						fontName="Montserrat_700Bold">
						Admin Panel
					</Text>
					<TouchableOpacity
						onPress={() => router.replace("/(home)")}>
						<Feather name="x" size={24} color="#f7f7f7" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<Text
						className="mb-6 text-base text-text-inactive"
						fontName="Poppins_500Medium">
						Manage tourist spots, events, and moderate user
						reviews.
					</Text>
					<View className="space-y-4">
						{adminOptions.map((option, index) => (
							<TouchableOpacity
								key={index}
								className="mt-2 rounded-xl border border-line bg-surface p-4"
								onPress={() =>
									router.push(option.route as any)
								}>
								<View className="flex-row items-center">
									<View className="mr-4 h-12 w-12 items-center justify-center rounded-full border border-line bg-primary">
										<Feather
											name={option.icon as any}
											size={24}
											color="#333"
										/>
									</View>
									<View className="flex-1">
										<Text
											className="text-lg text-text"
											fontName="Montserrat_700Bold">
											{option.title}
										</Text>
										<Text
											className="text-sm text-text-inactive"
											fontName="Poppins_500Medium">
											{option.description}
										</Text>
									</View>
									<Feather
										name="chevron-right"
										size={24}
										color="#cacbca"
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
