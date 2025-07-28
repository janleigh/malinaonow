import { Event, EventCard, LocationCard, UserSidebar } from "@/components/home";
import { useAuth } from "@/context/AuthContext";
import { Location } from "@/lib/types/supabase";
import { shadowStyles } from "@/lib/utils/styles";
import { locationService } from "@/services/locationService";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sampleEvents: Event[] = [
	{
		id: "1",
		title: "Malinao Fiesta 2025",
		date: "idk",
		time: "8:00 AM - hasta mahilong",
		location: "Malinao",
		image: "https://rzgswlkldumfbqpdjzqo.supabase.co/storage/v1/object/public/app-assets//malinao-fiesta.jpg"
	},
	{
		id: "2",
		title: "Pasukan",
		date: "August 11, 2025",
		time: "8:00 AM - 7:00 PM",
		location: "Garcia College of Technology",
		image: "https://www.gct.edu.ph/wp-content/uploads/2024/08/GctCampus.jpg"
	}
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const EVENT_CARD_WIDTH = SCREEN_WIDTH - 28; // Accounting for padding

export default function HomePage() {
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const [isGridView, setIsGridView] = useState(true);
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeEventIndex, setActiveEventIndex] = useState(0);

	const openSidebar = () => {
		setSidebarVisible(true);
	};

	const closeSidebar = () => {
		setSidebarVisible(false);
	};

	const { signOut } = useAuth();

	const handleSignOut = async () => {
		try {
			closeSidebar();

			setTimeout(async () => {
				await signOut();
			}, 300);
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	const fetchLocations = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await locationService.getLocations();
			setLocations(data);
		} catch (err) {
			console.error("Failed to fetch locations:", err);
			setError("Failed to load locations. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLocations();
	}, []);

	const toggleView = () => {
		setIsGridView(!isGridView);
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						MalinaoNow
					</Text>
					<TouchableOpacity className="p-2" onPress={openSidebar}>
						<Feather name="user" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<ScrollView className="flex-1">
					<View className="px-4 mb-6">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black">
								Upcoming Events
							</Text>
							<TouchableOpacity onPress={() => router.push("/+not-found")}>
								<Text className="text-sm font-lexend tracking-tighter-lexend text-black">See all</Text>
							</TouchableOpacity>
						</View>
						<View>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								pagingEnabled
								snapToInterval={EVENT_CARD_WIDTH + 16} // width + margin
								decelerationRate="fast"
								contentContainerStyle={{ paddingEnd: 16 }}
								onMomentumScrollEnd={(e) => {
									const newIndex = Math.round(
										e.nativeEvent.contentOffset.x / (EVENT_CARD_WIDTH + 16)
									);
									setActiveEventIndex(newIndex);
								}}
							>
								{sampleEvents.map((event, index) => (
									<View
										key={event.id}
										style={{
											width: EVENT_CARD_WIDTH,
											marginRight: 16
										}}
									>
										<EventCard 
											event={event} 
										/>
									</View>
								))}
							</ScrollView>
							<View className="flex-row justify-center mt-3">
								{sampleEvents.map((_, index) => (
									<View
										key={index}
										className={`h-2 w-2 rounded-full mx-1 ${index === activeEventIndex ? "bg-[#fed787]" : "bg-[#cccccc]"}`}
									/>
								))}
							</View>
						</View>
					</View>
					<View className="mt-2 px-4 py-2">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black">
								Featured Locations
							</Text>
							<TouchableOpacity className="flex-row items-center" onPress={toggleView}>
								<Text className="mr-1 font-lexend tracking-tighter-lexend text-black">
									{isGridView ? "List View" : "Grid View"}
								</Text>
								<Feather name={isGridView ? "list" : "grid"} size={18} color="black" />
							</TouchableOpacity>
						</View>
						{loading ? (
							<View className="p-4 items-center justify-center">
								<ActivityIndicator size="large" color="#fed787" />
								<Text className="mt-2 font-lexend text-[#666666]">Loading locations...</Text>
							</View>
						) : error ? (
							<View className="p-4 my-4 border border-[#333333] bg-white" style={shadowStyles.standard}>
								<View className="items-center">
									<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
										<Feather name="alert-triangle" size={24} color="#333" />
									</View>
									<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
										Error Loading Data
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
										{error}
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center py-2 px-4 bg-[#fed787] border border-[#333333]"
										style={shadowStyles.small}
										onPress={fetchLocations}
									>
										<Text className="font-lexend-medium tracking-tighter-lexend text-black">
											Retry
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : locations.length === 0 ? (
							<View className="p-4 my-4 border border-[#333333] bg-white" style={shadowStyles.standard}>
								<View className="items-center">
									<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
										<Feather name="tool" size={24} color="#333" />
									</View>
									<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
										Under Construction
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
										We&apos;re currently working on bringing you the best locations in Malinao.
										Check back soon!
									</Text>
								</View>
							</View>
						) : isGridView ? (
							// Grid View
							<View className="flex-row justify-between">
								<View className="w-[48%] space-y-4">
									{locations.slice(0, Math.ceil(locations.length / 2)).map((location) => (
										<LocationCard key={location.id} location={location} />
									))}
								</View>
								<View className="w-[48%] space-y-4">
									{locations.slice(Math.ceil(locations.length / 2)).map((location) => (
										<LocationCard key={location.id} location={location} />
									))}
								</View>
							</View>
						) : (
							// List View
							<View className="space-y-4">
								{locations.map((location) => (
									<LocationCard key={location.id} location={location} listView={true} />
								))}
							</View>
						)}
					</View>
					<View className="p-4">
						<TouchableOpacity
							className="flex-row items-center justify-center py-3 bg-[#fed787] border border-[#333333] rounded-none"
							style={shadowStyles.standard}
							onPress={() => router.push("/")}
						>
							<Feather name="log-out" size={18} color="#333" />
							<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-black">
								Return to login
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
				<View className="flex-row justify-around p-4 bg-transparent border-t-2 border-[#333]">
					<TouchableOpacity className="items-center">
						<AntDesign name="home" size={24} color="#333" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="calendar" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center" onPress={() => router.push("/+not-found")}>
						<AntDesign name="book" size={24} color="#999" />
					</TouchableOpacity>
				</View>
				<UserSidebar visible={sidebarVisible} onClose={closeSidebar} onSignOut={handleSignOut} />
			</SafeAreaView>
		</View>
	);
}
