import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export type TabName = "home" | "products" | "calendar" | "bookmarks";

interface BottomTabBarProps {
	activeTab: TabName;
	onHomePress?: () => void;
	onProductsPress?: () => void;
	onCalendarPress?: () => void;
	onBookmarksPress?: () => void;
	cartItemCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
	activeTab,
	onHomePress,
	onProductsPress,
	onCalendarPress,
	onBookmarksPress,
	cartItemCount = 0
}) => {
	const handleHomePress = () => {
		if (onHomePress) {
			onHomePress();
		} else {
			router.replace("/(home)");
		}
	};

	const handleProductsPress = () => {
		if (onProductsPress) {
			onProductsPress();
		} else {
			router.push("/(home)/products");
		}
	};

	const handleCalendarPress = () => {
		if (onCalendarPress) {
			onCalendarPress();
		} else {
			router.push("/(home)/calendar");
		}
	};

	const handleBookmarksPress = () => {
		if (onBookmarksPress) {
			onBookmarksPress();
		} else {
			router.push("/(home)/bookmarks");
		}
	};

	return (
		<View className="flex-row justify-around p-4 bg-transparent border-t-2 border-[#333]">
			<TouchableOpacity
				className="items-center"
				onPress={handleHomePress}
			>
				<AntDesign
					name="home"
					size={24}
					color={activeTab === "home" ? "#333" : "#999"}
				/>
			</TouchableOpacity>
			<View className="items-center">
				<TouchableOpacity
					onPress={handleProductsPress}
					className="relative"
				>
					<AntDesign
						name="appstore-o"
						size={24}
						color={activeTab === "products" ? "#333" : "#999"}
					/>
					{cartItemCount > 0 && (
						<View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
							<Text className="text-white text-xs font-bold">
								{cartItemCount > 9 ? '9+' : cartItemCount}
							</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>
			<TouchableOpacity
				className="items-center"
				onPress={handleCalendarPress}
			>
				<AntDesign
					name="calendar"
					size={24}
					color={activeTab === "calendar" ? "#333" : "#999"}
				/>
			</TouchableOpacity>
			<TouchableOpacity
				className="items-center"
				onPress={handleBookmarksPress}
			>
				<AntDesign
					name="heart"
					size={24}
					color={activeTab === "bookmarks" ? "#FE5B62" : "#999"}
				/>
			</TouchableOpacity>
		</View>
	);
};

export default BottomTabBar;
