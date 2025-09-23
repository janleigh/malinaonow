import { BaseText as Text } from "@/components/BaseText";
import { useTranslation } from "@/lib/context/TranslationContext";
import { formatDate, formatTime } from "@/lib/utils/date";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
	Animated,
	Image,
	Modal,
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
				className="my-2 overflow-hidden rounded-xl border border-[#333333] bg-white"
				onPress={handlePress}
			>
				<View>
					<View className="h-32 w-full">
						<Image
							source={{
								uri: event.banner_image
							}}
							className="h-full w-full"
							resizeMode="cover"
						/>
					</View>
					<View className="p-3">
						<Text
							className="text-sm tracking-tighter-lexend text-black"
							numberOfLines={2}
						>
							{event.name}
						</Text>
						<View className="mt-1 flex-row items-center">
							<AntDesign
								name="calendar"
								size={10}
								color="#555"
							/>
							<Text
								className="ml-1 text-sm tracking-tighter-lexend text-[#555]"
								numberOfLines={1}
							>
								{formatDate(event.date)}
							</Text>
						</View>
						<View className="mt-1 flex-row items-center">
							<AntDesign
								name="clockcircleo"
								size={10}
								color="#555"
							/>
							<Text className="ml-1 text-sm tracking-tighter-lexend text-[#555]">
								{formatTime(event.time)}
							</Text>
						</View>
						<View className="mt-1 flex-row items-start">
							<AntDesign
								name="enviromento"
								size={10}
								color="#555"
								style={{ marginTop: 2 }}
							/>
							<Text className="ml-1 flex-1 text-sm tracking-tighter-lexend text-[#555]">
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
						backgroundColor: "#C6E3D3",
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
						<View className="flex-row items-center justify-between border-b border-[#333333] p-4">
							<Text
								className="font-lexend-bold text-xl tracking-tighter-lexend text-black"
								fontStyle="bold"
							>
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
								className="h-52 w-full"
								resizeMode="cover"
							/>
							<View className="p-4">
								<Text className="mb-4 text-2xl tracking-tighter-lexend text-black">
									{event.name}
								</Text>
								<View className="mb-6 space-y-3">
									<View className="flex-row items-center">
										<View className="h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#FFBB38]">
											<AntDesign
												name="calendar"
												size={20}
												color="#333"
											/>
										</View>
										<View className="ml-3">
											<Text
												className="font-lexend-medium text-xs tracking-tighter-lexend text-[#666666]"
												fontStyle="medium"
											>
												{t(
													"event.date"
												).toUpperCase()}
											</Text>
											<Text className="text-base tracking-tighter-lexend text-[#333333]">
												{formatDate(event.date)}
											</Text>
										</View>
									</View>
									<View className="flex-row items-center">
										<View className="mt-2 h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#FFBB38]">
											<AntDesign
												name="clockcircleo"
												size={20}
												color="#333"
											/>
										</View>
										<View className="ml-3">
											<Text
												className="font-lexend-medium text-xs tracking-tighter-lexend text-[#666666]"
												fontStyle="medium"
											>
												{t(
													"event.time"
												).toUpperCase()}
											</Text>
											<Text className="text-base tracking-tighter-lexend text-[#333333]">
												{formatTime(event.time)}
											</Text>
										</View>
									</View>
									<View className="flex-row items-center">
										<View className="mt-2 h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#FFBB38]">
											<AntDesign
												name="enviromento"
												size={20}
												color="#333"
											/>
										</View>
										<View className="ml-3">
											<Text
												className="font-lexend-medium text-xs tracking-tighter-lexend text-[#666666]"
												fontStyle="medium"
											>
												{t(
													"event.location"
												).toUpperCase()}
											</Text>
											<Text className="text-base tracking-tighter-lexend text-[#333333]">
												{event.location}
											</Text>
										</View>
									</View>
								</View>
								<View className="mt-6">
									<TouchableOpacity
										className="h-12 w-full items-center justify-center rounded-xl border border-[#333333] bg-[#FFBB38]"
										onPress={toggleExpand}
									>
										<Text
											className="font-lexend-medium text-base tracking-tighter-lexend text-black"
											fontStyle="medium"
										>
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
