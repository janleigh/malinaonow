import { shadowStyles } from "@/utils/styles";
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
		title: 'Event 2',
		date: 'August 15, 2025',
		time: '10:00 AM - 6:00 PM',
		location: 'Malinao Town Center',
		image: 'https://i.redd.it/3k7x1q9z4vwe1.jpg',
		distance: '1.2 km away'
	},
	{
		id: '3',
		title: 'Event 3',
		date: 'September 5, 2025',
		time: '9:00 AM - 5:00 PM',
		location: 'Malinao Plaza',
		image: 'https://i.redd.it/4k7x1q9z4vwe1.jpg',
		distance: '2.0 km away'
	},
	{
		id: '4',
		title: 'Event 4',
		date: 'October 10, 2025',
		time: '8:00 AM - 4:00 PM',
		location: 'Malinao Sports Complex',
		image: 'https://i.redd.it/5k7x1q9z4vwe1.jpg',
		distance: '3.5 km away'
	},
	{
		id: '5',
		title: 'Event 5',
		date: 'November 20, 2025',
		time: '11:00 AM - 3:00 PM',
		location: 'Malinao',
		image: 'https://i.redd.it/6k7x1q9z4vwe1.jpg',
		distance: '4.0 km away'
	},
	{
		id: '6',
		title: 'Event 6',
		date: 'December 25, 2025',
		time: '12:00 PM - 6:00 PM',
		location: 'Malinao',
		image: 'https://i.redd.it/7k7x1q9z4vwe1.jpg',
		distance: '5.0 km away'
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
							style={shadowStyles.standard}
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
									style={shadowStyles.small}
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
						<View className="flex-row flex-wrap justify-between">
							{dummyEvents.map(event => (
								<TouchableOpacity 
									key={event.id}
									className="bg-white rounded-lg mb-4 border border-[#333333] overflow-hidden w-[48%]"
									style={shadowStyles.standard}
								>
									<View>
										<View className="w-full h-32">
											<Image 
												source={{ uri: event.image }} 
												className="w-full h-full" 
												resizeMode="cover"
											/>
										</View>
										<View className="p-3">
											<Text className="text-sm font-bold font-public-sans-extrabold text-black" numberOfLines={1}>
												{event.title}
											</Text>
											<View className="flex-row items-center mt-1">
												<FontAwesome name="calendar" size={10} color="#555" />
												<Text className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555]" numberOfLines={1}>
													{event.date}
												</Text>
											</View>
											<View className="flex-row items-center mt-1">
												<AntDesign name="enviromento" size={10} color="#555" />
												<Text className="ml-1 text-xs font-lexend tracking-tighter-lexend text-[#555]" numberOfLines={1}>
													{event.location}
												</Text>
											</View>
										</View>
									</View>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</ScrollView>
				<View className="flex-row justify-around p-4 bg-transparent border-t-2 border-[#333]">
					<TouchableOpacity className="items-center">
						<AntDesign name="home" size={24} color="#333" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<AntDesign name="search1" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<AntDesign name="calendar" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<AntDesign name="hearto" size={24} color="#999" />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	);
}
