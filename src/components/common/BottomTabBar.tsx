import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export type TabName = "home" | "products" | "calendar" | "bookmarks";

interface BottomTabBarProps {
	activeTab: TabName;
	onHomePress?: () => void;
	onProductsPress?: () => void;
	onCalendarPress?: () => void;
	onBookmarksPress?: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
	activeTab,
	onHomePress,
	onProductsPress,
	onCalendarPress,
	onBookmarksPress
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
		<View className="bg-backround flex-row justify-around border-t border-surface p-4">
			<TouchableOpacity
				className="items-center"
				onPress={handleHomePress}>
				<AntDesign
					name="home"
					size={24}
					color={activeTab === "home" ? "#0ff6be" : "#666666"}
				/>
			</TouchableOpacity>
			<View className="items-center">
				<TouchableOpacity
					onPress={handleProductsPress}
					className="relative">
					<AntDesign
						name="appstore-o"
						size={24}
						color={
							activeTab === "products"
								? "#0ff6be"
								: "#666666"
						}
					/>
				</TouchableOpacity>
			</View>
			<TouchableOpacity
				className="items-center"
				onPress={handleCalendarPress}>
				<AntDesign
					name="calendar"
					size={24}
					color={
						activeTab === "calendar" ? "#0ff6be" : "#666666"
					}
				/>
			</TouchableOpacity>
			<TouchableOpacity
				className="items-center"
				onPress={handleBookmarksPress}>
				<AntDesign
					name="heart"
					size={24}
					color={
						activeTab === "bookmarks" ? "#FE5B62" : "#666666"
					}
				/>
			</TouchableOpacity>
		</View>
	);
};

export default BottomTabBar;
