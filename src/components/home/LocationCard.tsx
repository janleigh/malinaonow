import { shadowStyles } from "@/lib/utils/styles";
import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Location = {
	id: string;
	name: string;
	address: string;
	image: {
		banner: string;
		360: string;
	};
	coordinates: {
		latitude: number;
		longitude: number;
	};
	description: string;
};

export const LocationCard = ({ location, listView = false }: { location: Location; listView?: boolean }) => {
	const [expanded, setExpanded] = useState(false);
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

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

	return (
		<>
			<TouchableOpacity
				key={location.id}
				className={`bg-white border border-[#333333] my-2 overflow-hidden ${listView ? "" : ""}`}
				style={shadowStyles.standard}
				onPress={toggleExpand}
			>
				{listView ? (
					// List view layout
					<View className="flex-row">
						<View className="w-1/3 h-24">
							<Image source={{ uri: location.image.banner }} className="w-full h-full" resizeMode="cover" />
						</View>
						<View className="p-3 flex-1">
							<Text
								className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
								numberOfLines={1}
							>
								{location.name}
							</Text>
							<View className="flex-row items-start mt-1">
								<AntDesign name="enviromento" size={10} color="#555" style={{ marginTop: 2 }} />
								<Text
									className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555] flex-1"
									numberOfLines={2}
								>
									{location.description}
								</Text>
							</View>
						</View>
					</View>
				) : (
					// Grid view layout (original)
					<View>
						<View className="w-full h-32">
							<Image source={{ uri: location.image.banner }} className="w-full h-full" resizeMode="cover" />
						</View>
						<View className="p-3">
							<Text
								className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black"
								numberOfLines={2}
							>
								{location.name}
							</Text>
							<View className="flex-row items-start mt-1">
								<AntDesign name="enviromento" size={10} color="#555" style={{ marginTop: 2 }} />
								<Text
									className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555] flex-1"
									numberOfLines={2}
								>
									{location.description}
								</Text>
							</View>
						</View>
					</View>
				)}
			</TouchableOpacity>

			<Modal visible={expanded} transparent={true} animationType="none">
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
								{location.name}
							</Text>
							<TouchableOpacity onPress={toggleExpand}>
								<Feather name="x" size={24} color="black" />
							</TouchableOpacity>
						</View>
						<View className="flex-1">
							<Image
								source={{ uri: location.image.banner }}
								className="w-full h-52"
								resizeMode="cover"
							/>
							<View className="p-4">
								<View className="flex-row items-start mb-4">
									<AntDesign name="enviromento" size={16} color="#333" style={{ marginTop: 2 }} />
									<Text className="ml-2 text-base font-lexend tracking-tighter-lexend text-[#333] flex-1">
										{location.address}
									</Text>
								</View>
								<Text className="text-base font-lexend-medium tracking-tighter-lexend text-[#333] mb-2">
									Description
								</Text>
								<Text className="text-base font-lexend tracking-tighter-lexend text-[#333]">
									{location.description}
								</Text>

								<View className="mt-6">
									<TouchableOpacity
										className="bg-[#fed787] h-12 w-full items-center justify-center border border-[#333333]"
										style={shadowStyles.standard}
									>
										<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
											View on Map
										</Text>
									</TouchableOpacity>

									{location.image[360] ? (
										<TouchableOpacity
											className="bg-white h-12 w-full items-center justify-center border border-[#333333] mt-3"
											style={shadowStyles.standard}
										>
											<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
												View 360° Photo
											</Text>
										</TouchableOpacity>
									) : null}
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Animated.View>
			</Modal>
		</>
	);
};

export default LocationCard;
