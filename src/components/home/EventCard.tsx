import { shadowStyles } from "@/lib/utils/styles";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type Event = {
	id: string;
	title: string;
	date: string;
	time: string;
	location: string;
	image: string;
	distance: string;
};

export const EventCard = ({ event }: { event: Event }) => (
	<TouchableOpacity
		key={event.id}
		className="bg-white border border-[#333333] my-2 overflow-hidden"
		style={shadowStyles.standard}
	>
		<View>
			<View className="w-full h-32">
				<Image source={{ uri: event.image }} className="w-full h-full" resizeMode="cover" />
			</View>
			<View className="p-3">
				<Text className="text-sm font-lexend-extrabold tracking-tighter-lexend text-black" numberOfLines={2}>
					{event.title}
				</Text>
				<View className="flex-row items-center mt-1">
					<FontAwesome name="calendar" size={10} color="#555" />
					<Text className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555]" numberOfLines={1}>
						{event.date}
					</Text>
				</View>
				<View className="flex-row items-start mt-1">
					<AntDesign name="enviromento" size={10} color="#555" style={{ marginTop: 2 }} />
					<Text className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555] flex-1">
						{event.location}
					</Text>
				</View>
			</View>
		</View>
	</TouchableOpacity>
);

export default EventCard;
