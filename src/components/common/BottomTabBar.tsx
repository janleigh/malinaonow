import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export type TabName = "home" | "calendar" | "bookmarks";

interface BottomTabBarProps {
  activeTab: TabName;
  onHomePress?: () => void;
  onCalendarPress?: () => void;
  onBookmarksPress?: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
	activeTab,
	onHomePress,
	onCalendarPress,
	onBookmarksPress,
}) => {
	const handleHomePress = () => {
		if (onHomePress) {
			onHomePress();
		} else {
			router.replace("/(home)");
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
			<TouchableOpacity className="items-center" onPress={handleHomePress}>
				<AntDesign
					name="home"
					size={24}
					color={activeTab === "home" ? "#333" : "#999"}
				/>
			</TouchableOpacity>
			<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
				<AntDesign
					name="appstore-o"
					size={24}
					color="#999"
				/>
			</TouchableOpacity>
			<TouchableOpacity className="items-center" onPress={handleCalendarPress}>
				<AntDesign
					name="calendar"
					size={24}
					color={activeTab === "calendar" ? "#333" : "#999"}
				/>
			</TouchableOpacity>
			<TouchableOpacity className="items-center" onPress={handleBookmarksPress}>
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
