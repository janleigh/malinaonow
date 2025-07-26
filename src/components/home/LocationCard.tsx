import { shadowStyles } from "@/utils/styles";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

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

export const LocationCard = ({ location, listView = false }: { location: Location; listView?: boolean }) => (
	<TouchableOpacity
		key={location.id}
		className={`bg-white border border-[#333333] my-2 overflow-hidden ${listView ? "" : ""}`}
		style={shadowStyles.standard}
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
);

export default LocationCard;
