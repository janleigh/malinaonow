import { BaseText as Text } from "@/components/BaseText";
import { useTranslation } from "@/hooks/useTranslation";
import { AntDesign, Feather } from "@expo/vector-icons";
import { formatDate, formatTime } from "@shared/utils/date";
import { LinearGradient } from "expo-linear-gradient";
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
			{/* Event Card in Homepage */}
			<TouchableOpacity
				key={event.id}
				className="my-2 overflow-hidden rounded-xl border border-line bg-lighterBackground"
				onPress={handlePress}>
				<View>
					<View className="h-32 w-full">
						<Image
							source={{
								uri: event.banner_image
							}}
							className="h-full w-full"
							resizeMode="cover"
						/>
						<LinearGradient
							colors={["transparent", "rgba(0,0,0,0.7)"]}
							className="absolute bottom-0 left-0 right-0 h-16"
						/>
					</View>
					<View className="p-3">
						<Text
							className="text-lg text-text"
							numberOfLines={2}
							fontName="Montserrat_700Bold">
							{event.name}
						</Text>
						<View className="mt-1 flex-row items-center">
							<AntDesign
								name="calendar"
								size={10}
								color="#cacbca"
							/>
							<Text
								className="ml-1 text-sm text-[#cacbca]"
								numberOfLines={1}>
								{formatDate(event.date)}
							</Text>
						</View>
						<View className="mt-1 flex-row items-center">
							<AntDesign
								name="clockcircleo"
								size={10}
								color="#cacbca"
							/>
							<Text className="ml-1 text-sm text-[#cacbca]">
								{formatTime(event.time)}
							</Text>
						</View>
						<View className="mt-1 flex-row items-start">
							<AntDesign
								name="enviromento"
								size={10}
								color="#cacbca"
								style={{ marginTop: 2 }}
							/>
							<Text className="ml-1 flex-1 text-sm text-[#cacbca]">
								{event.location}
							</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>
			{/* Expanded Modal */}
			<Modal
				visible={expanded}
				transparent={true}
				animationType="none"
				onRequestClose={toggleExpand}>
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
					}}>
					<SafeAreaView className="flex-1 bg-background">
						{/* Header */}
						<View className="flex-row items-center justify-between border-b border-line p-4">
							<Text
								className="text-xl text-text"
								fontName="Montserrat_700Bold">
								{t("event.eventDetails")}
							</Text>
							<TouchableOpacity onPress={toggleExpand}>
								<Feather
									name="x"
									size={24}
									color="#f7f7f7"
								/>
							</TouchableOpacity>
						</View>
						<View className="flex-1">
							<Image
								source={{
									uri: event.banner_image
								}}
								className="h-52 w-full"
								resizeMode="center"
							/>
							<View className="p-4">
								<Text
									className="mb-4 text-2xl text-text"
									fontName="Montserrat_700Bold">
									{event.name}
								</Text>
								<View className="mb-6 space-y-3">
									{/* Date, Time, Location */}
									{/* Date */}
									<View className="flex-row items-center">
										<View className="h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-surface">
											<AntDesign
												name="calendar"
												size={20}
												color="#f7f7f7"
											/>
										</View>
										<View className="ml-3">
											<Text
												className="text-xs text-[#cacbca]"
												fontName="Poppins_500Medium">
												{t(
													"event.date"
												).toUpperCase()}
											</Text>
											<Text
												className="text-base text-text"
												fontName="Poppins_500Medium">
												{formatDate(event.date)}
											</Text>
										</View>
									</View>
									{/* Time */}
									<View className="flex-row items-center">
										<View className="mt-2 h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-surface">
											<AntDesign
												name="clockcircleo"
												size={20}
												color="#f7f7f7"
											/>
										</View>
										<View className="ml-3 mt-2">
											<Text
												className="text-xs text-[#cacbca]"
												fontName="Poppins_500Medium">
												{t(
													"event.time"
												).toUpperCase()}
											</Text>
											<Text
												className="text-base text-text"
												fontName="Poppins_500Medium">
												{formatTime(event.time)}
											</Text>
										</View>
									</View>
									{/* Location */}
									<View className="flex-row items-center">
										<View className="mt-2 h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-surface">
											<AntDesign
												name="enviromento"
												size={20}
												color="#f7f7f7"
											/>
										</View>
										<View className="ml-3 mt-2">
											<Text
												className="text-xs text-[#cacbca]"
												fontName="Poppins_500Medium">
												{t(
													"event.location"
												).toUpperCase()}
											</Text>
											<Text
												className="text-text] text-base"
												fontName="Poppins_500Medium">
												{event.location}
											</Text>
										</View>
									</View>
								</View>
								<View className="mt-6">
									<TouchableOpacity
										className="h-12 w-full items-center justify-center rounded-3xl border border-[#333333] bg-primary"
										onPress={toggleExpand}>
										<Text
											className="text-base text-black"
											fontName="Montserrat_700Bold">
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
