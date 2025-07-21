import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const dummyEvents = [
	{
		id: '1',
		title: 'Shabuhan Kanday Cel',
		date: 'July 22, 2025',
		time: '7:00 AM - 7:00 PM',
		location: 'Polo, New Washington',
		image: 'https://i.redd.it/t20nfsv8guwe1.jpeg',
		distance: '0.5 km away'
	},
	{
		id: '2',
		title: 'Malinao Fiesta',
		date: 'May 1, 2026',
		time: '10:00 AM - 6:00 PM',
		location: 'Malinao Town Plaza',
		image: 'https://via.placeholder.com/150',
		distance: '1.2 km away'
	},
	{
		id: '3',
		title: 'Lorem Ipsum',
		date: 'September 11, 2001',
		time: '8:14 AM',
		location: 'Somewhere only we know',
		image: 'https://via.placeholder.com/150',
		distance: '0.8 km away'
	}
];

export default function HomePage() {
	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
                        MalinaoNow
					</Text>
					<TouchableOpacity className="p-2">
						<Feather name="user" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<ScrollView className="flex-1">
					<View className="px-4">
						<View 
							className="h-48 bg-white rounded-lg mb-4 overflow-hidden border border-[#333333]"
							style={{
								shadowColor: "#000000",
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 1,
								shadowRadius: 0,
								elevation: 6
							}}
						>
							<View className="flex-1 items-center justify-center bg-gray-200">
								<Feather name="map" size={48} color="#555" />
								<Text className="mt-2 font-lexend tracking-tighter-lexend text-[#333333]">
                                    TODO: Map View
								</Text>
							</View>
							{/* // TODO: Add functionality to the button */}
							<View className="absolute bottom-2 right-2">
								<TouchableOpacity 
									className="bg-white h-8 w-8 rounded-full items-center justify-center border border-[#333333]"
									style={{
										shadowColor: "#000000",
										shadowOffset: { width: 0, height: 2 },
										shadowOpacity: 1,
										shadowRadius: 0,
										elevation: 3
									}}
								>
									<Feather name="plus" size={18} color="black" />
								</TouchableOpacity>
							</View>
						</View>
					</View>
					<View className="px-4 py-2">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-bold font-public-sans-extrabold text-black">
                                Local Events
							</Text>
							<TouchableOpacity className="flex-row items-center">
								<Text className="mr-1 font-lexend tracking-tighter-lexend text-black">
                                    Filter
								</Text>
								<AntDesign name="filter" size={18} color="black" />
							</TouchableOpacity>
						</View>
						{dummyEvents.map(event => (
							<TouchableOpacity 
								key={event.id}
								className="bg-white rounded-lg mb-4 border border-[#333333] overflow-hidden"
								style={{
									shadowColor: "#000000",
									shadowOffset: { width: 0, height: 4 },
									shadowOpacity: 1,
									shadowRadius: 0,
									elevation: 6
								}}
							>
								<View className="flex-row">
									<View className="w-24 h-24">
										<Image 
											source={{ uri: event.image }} 
											className="w-full h-full" 
											resizeMode="cover"
										/>
									</View>
									<View className="flex-1 p-3">
										<Text className="text-base font-bold font-public-sans-extrabold text-black">
											{event.title}
										</Text>
										<View className="flex-row items-center mt-1">
											<FontAwesome name="calendar" size={12} color="#555" />
											<Text className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555]">
												{event.date} · {event.time}
											</Text>
										</View>
										<View className="flex-row items-center mt-1">
											<FontAwesome name="map-marker" size={12} color="#555" />
											<Text className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555]">
												{event.location}
											</Text>
										</View>
										<View className="flex-row items-center mt-1">
											<AntDesign name="enviromento" size={12} color="#555" />
											<Text className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555]">
												{event.distance}
											</Text>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
				<View className="flex-row justify-around p-4 bg-transparent border-t-2 border-[#333]">
					<TouchableOpacity className="items-center">
						<AntDesign name="home" size={24} color="#333" />
						{/* <Text className="text-xs font-lexend tracking-tighter-lexend text-[#333]">Home</Text> */}
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<AntDesign name="search1" size={24} color="#999" />
						{/* <Text className="text-xs font-lexend tracking-tighter-lexend text-[#999]">Explore</Text> */}
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<AntDesign name="calendar" size={24} color="#999" />
						{/* <Text className="text-xs font-lexend tracking-tighter-lexend text-[#999]">Events</Text> */}
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<AntDesign name="hearto" size={24} color="#999" />
						{/* <Text className="text-xs font-lexend tracking-tighter-lexend text-[#999]">Saved</Text> */}
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	);
}
