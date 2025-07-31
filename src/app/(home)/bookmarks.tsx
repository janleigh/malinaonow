import { LocationCard } from "@/components/home";
import { useAuth } from "@/context/AuthContext";
import { Location } from "@/lib/types/supabase";
import { shadowStyles } from "@/lib/utils/styles";
import { BookmarkService, LocationService } from "@/services";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksPage() {
	const [isGridView, setIsGridView] = useState(true);
	const [locations, setLocations] = useState<Location[]>([]);
	const [bookmarkedLocations, setBookmarkedLocations] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user, isSignedIn } = useAuth();

	const fetchBookmarkedLocations = useCallback(async () => {
		if (!isSignedIn || !user) {
			setBookmarkedLocations([]);
			setLocations([]);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const bookmarks = await BookmarkService.getBookmarks(user.id);
			setBookmarkedLocations(bookmarks);

			if (bookmarks.length === 0) {
				setLocations([]);
				setLoading(false);
				return;
			}

			const allLocations = await LocationService.getLocations();
			const bookmarkedLocationsData = allLocations.filter((location) => bookmarks.includes(location.id));
			setLocations(bookmarkedLocationsData);
		} catch (err) {
			console.error("Failed to fetch bookmarked locations:", err);
			setError("Failed to load bookmarked locations. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [isSignedIn, user]);

	useEffect(() => {
		fetchBookmarkedLocations();
	}, [fetchBookmarkedLocations]);

	const toggleView = () => {
		setIsGridView(!isGridView);
	};

	const handleToggleBookmark = async (locationId: string, newStatus: boolean) => {
		if (!isSignedIn || !user) return;

		try {
			if (!newStatus) {
				await BookmarkService.removeBookmark(user.id, locationId);
				setBookmarkedLocations((prev) => prev.filter((id) => id !== locationId));
				setLocations((prev) => prev.filter((location) => location.id !== locationId));
			}
		} catch (err) {
			console.error("Failed to update bookmark:", err);
		}
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<View className="flex-row items-center">
						<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
							Bookmarked Locations
						</Text>
					</View>
				</View>

				<ScrollView className="flex-1">
					<View className="mt-2 px-4 py-2">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black">
								My Bookmarks
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
								<Text className="mt-2 font-lexend text-[#666666]">Loading bookmarked locations...</Text>
							</View>
						) : error ? (
							<View className="p-4 my-4 border border-[#333333] bg-white" style={shadowStyles.standard}>
								<View className="items-center">
									<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
										<Feather name="alert-triangle" size={24} color="#333" />
									</View>
									<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
										Error Loading Bookmarks
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
										{error}
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center py-2 px-4 bg-[#fed787] border border-[#333333]"
										style={shadowStyles.small}
										onPress={fetchBookmarkedLocations}
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
										<AntDesign name="heart" size={24} color="#333" />
									</View>
									<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
										No Bookmarked Locations
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
										You haven&apos;t bookmarked any locations yet. Tap the heart icon on a location
										to bookmark it!
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center py-2 px-4 bg-[#fed787] border border-[#333333]"
										style={shadowStyles.standard}
										onPress={() => router.push("/(home)")}
									>
										<Text className="font-lexend-medium tracking-tighter-lexend text-black">
											Explore Locations
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : isGridView ? (
							// Grid View
							<View className="flex-row justify-between">
								<View className="w-[48%] space-y-4">
									{locations.slice(0, Math.ceil(locations.length / 2)).map((location) => (
										<LocationCard
											key={location.id}
											location={location}
											isBookmarked={true}
											onToggleBookmark={handleToggleBookmark}
										/>
									))}
								</View>
								<View className="w-[48%] space-y-4">
									{locations.slice(Math.ceil(locations.length / 2)).map((location) => (
										<LocationCard
											key={location.id}
											location={location}
											isBookmarked={true}
											onToggleBookmark={handleToggleBookmark}
										/>
									))}
								</View>
							</View>
						) : (
							// List View
							<View className="space-y-4">
								{locations.map((location) => (
									<LocationCard
										key={location.id}
										location={location}
										listView={true}
										isBookmarked={true}
										onToggleBookmark={handleToggleBookmark}
									/>
								))}
							</View>
						)}
					</View>
				</ScrollView>
				<View className="flex-row justify-around p-4 bg-transparent border-t-2 border-[#333]">
					<TouchableOpacity className="items-center" onPress={() => router.replace("/(home)")}>
						<AntDesign name="home" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center" onPress={() => router.push("/(home)/calendar")}>
						<AntDesign name="calendar" size={24} color="#999" />
					</TouchableOpacity>
					<TouchableOpacity className="items-center">
						<AntDesign name="heart" size={24} color="#333" />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	);
}
