import { useTranslation } from "@/context/TranslationContext";
import { formatDate, formatTime } from "@/lib/utils/date";
import { shadowStyles } from "@/lib/utils/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
	Animated,
	Image,
	Modal,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Event = {
	id: string;
	name: string;
	date: string;
	time: string;
	location: string;
	banner_image: string;
};

export const EventCard = ({
	event,
	onPress
}: {
	event: Event;
	onPress?: () => void;
}) => {
	const [expanded, setExpanded] = useState(false);
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const { t } = useTranslation();

	const toggleExpand = () => {
		if (!expanded) {
			setExpanded(true);
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true
				})
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(scaleAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				}),
				Animated.timing(opacityAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true
				})
			]).start(() => {
				setExpanded(false);
			});
		}
	};

	const handlePress = () => {
		if (onPress) {
			onPress();
		} else {
			toggleExpand();
		}
	};

	return (
		<>
			<TouchableOpacity
				key={event.id}
				className="bg-white border border-[#333333] my-2 overflow-hidden"
				style={shadowStyles.standard}
				onPress={handlePress}
			>
				<View>
					<View className="w-full h-32">
						<Image
							source={{
								uri: event.banner_image
							}}
							className="w-full h-full"
							resizeMode="cover"
						/>
					</View>
					<View className="p-3">
						<Text
							className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
							numberOfLines={2}
						>
							{event.name}
						</Text>
						<View className="flex-row items-center mt-1">
							<AntDesign
								name="calendar"
								size={10}
								color="#555"
							/>
							<Text
								className="ml-1 text-sm font-lexend tracking-tighter-lexend text-[#555]"
								numberOfLines={1}
							>
								{formatDate(event.date)}
							</Text>
						</View>
						<View className="flex-row items-center mt-1">
							<AntDesign
								name="clockcircleo"
								size={10}
								color="#555"
							/>
							<Text className="ml-1 text-sm font-lexend tracking-tighter-lexend text-[#555]">
								{formatTime(event.time)}
							</Text>
						</View>
						<View className="flex-row items-start mt-1">
							<AntDesign
								name="enviromento"
								size={10}
								color="#555"
								style={{ marginTop: 2 }}
							/>
							<Text className="ml-1 text-sm font-lexend tracking-tighter-lexend text-[#555] flex-1">
								{event.location}
							</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
			<Modal
				visible={expanded}
				transparent={true}
				animationType="none"
			>
				<Animated.View
					style={{
						flex: 1,
						backgroundColor: "#faf4f0",
						opacity: opacityAnim,
						transform: [
							{
								scale: scaleAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [0.8, 1]
								})
							}
						]
					}}
				>
					<SafeAreaView className="flex-1">
						<View className="flex-row justify-between items-center p-4 border-b border-[#333333]">
							<Text className="text-xl font-lexend-bold tracking-tighter-lexend text-black">
								{t("event.eventDetails")}
							</Text>
							<TouchableOpacity onPress={toggleExpand}>
								<Feather
									name="x"
									size={24}
									color="black"
								/>
							</TouchableOpacity>
						</View>
						<View className="flex-1">
							<Image
								source={{
									uri: event.banner_image
								}}
								className="w-full h-52"
								resizeMode="cover"
							/>
							<View className="p-4">
								<Text className="text-2xl font-lexend-extrabold tracking-tighter-lexend text-black mb-4">
									{event.name}
								</Text>
								<View className="space-y-3 mb-6">
									<View className="flex-row items-center">
										<View className="w-10 h-10 rounded-full bg-[#fed787] items-center justify-center border border-[#333333]">
											<AntDesign
												name="calendar"
												size={20}
												color="#333"
											/>
										</View>
										<View className="ml-3">
											<Text className="text-xs font-lexend-medium tracking-tighter-lexend text-[#666666]">
												{t(
													"event.date"
												).toUpperCase()}
											</Text>
											<Text className="text-base font-lexend tracking-tighter-lexend text-[#333333]">
												{formatDate(event.date)}
											</Text>
										</View>
									</View>
									<View className="flex-row items-center">
										<View className="w-10 h-10 mt-2 rounded-full bg-[#fed787] items-center justify-center border border-[#333333]">
											<AntDesign
												name="clockcircleo"
												size={20}
												color="#333"
											/>
										</View>
										<View className="ml-3">
											<Text className="text-xs font-lexend-medium tracking-tighter-lexend text-[#666666]">
												{t(
													"event.time"
												).toUpperCase()}
											</Text>
											<Text className="text-base font-lexend tracking-tighter-lexend text-[#333333]">
												{formatTime(event.time)}
											</Text>
										</View>
									</View>
									<View className="flex-row items-center">
										<View className="w-10 h-10 mt-2 rounded-full bg-[#fed787] items-center justify-center border border-[#333333]">
											<AntDesign
												name="enviromento"
												size={20}
												color="#333"
											/>
										</View>
										<View className="ml-3">
											<Text className="text-xs font-lexend-medium tracking-tighter-lexend text-[#666666]">
												{t(
													"event.location"
												).toUpperCase()}
											</Text>
											<Text className="text-base font-lexend tracking-tighter-lexend text-[#333333]">
												{event.location}
											</Text>
										</View>
									</View>
								</View>
								<View className="mt-6">
									<TouchableOpacity
										className="bg-[#fed787] h-12 w-full items-center justify-center border border-[#333333]"
										style={shadowStyles.standard}
										onPress={toggleExpand}
									>
										<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
											{t("event.addToCalendar")}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Animated.View>
			</Modal>
		</>
	);
};

export default EventCard;
