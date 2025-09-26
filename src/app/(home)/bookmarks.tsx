import { BaseText as Text } from "@/components/BaseText";
import { BottomTabBar } from "@/components/common";
import { LocationCard } from "@/components/home";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useAuth } from "@shared/context/AuthContext";
import { useTranslation } from "@shared/context/TranslationContext";
import { BookmarkService, LocationService } from "@shared/services";
import { Location } from "@shared/types/supabase";
import { shadowStyles } from "@shared/utils/styles";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksPage() {
	const [isGridView, setIsGridView] = useState(true);
	const [locations, setLocations] = useState<Location[]>([]);
	const [bookmarkedLocations, setBookmarkedLocations] = useState<
		string[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user, isSignedIn } = useAuth();
	const { t } = useTranslation();

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
			const bookmarkedLocationsData = allLocations.filter(
				(location) => bookmarks.includes(location.id)
			);
			setLocations(bookmarkedLocationsData);
		} catch (err) {
			console.error("Failed to fetch bookmarked locations:", err);
			setError(
				"Failed to load bookmarked locations. Please try again."
			);
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

	const handleToggleBookmark = async (
		locationId: string,
		newStatus: boolean
	) => {
		if (!isSignedIn || !user) return;

		try {
			if (!newStatus) {
				await BookmarkService.removeBookmark(user.id, locationId);
				setBookmarkedLocations((prev) =>
					prev.filter((id) => id !== locationId)
				);
				setLocations((prev) =>
					prev.filter((location) => location.id !== locationId)
				);
			}
		} catch (err) {
			console.error("Failed to update bookmark:", err);
		}
	};

	return (
		<View className="flex-1 bg-[#C6E3D3]">
			<SafeAreaView className="flex-1">
				<View className="flex-row items-center justify-between border-b border-[#000] p-4">
					<View className="flex-row items-center">
						<Text className="android:font-normal text-2xl tracking-tighter-lexend text-black">
							{t("home.bookmarkedLocations")}
						</Text>
					</View>
				</View>
				<ScrollView className="flex-1">
					<View className="mt-2 px-4 py-2">
						<View className="mb-4 flex-row items-center justify-between">
							<Text className="text-xl tracking-tighter-lexend text-black">
								{t("home.myBookmarks")}
							</Text>
							<TouchableOpacity
								className="flex-row items-center"
								onPress={toggleView}
							>
								<Text className="mr-1 tracking-tighter-lexend text-black">
									{isGridView
										? "List View"
										: "Grid View"}
								</Text>
								<Feather
									name={isGridView ? "list" : "grid"}
									size={18}
									color="black"
								/>
							</TouchableOpacity>
						</View>
						{loading ? (
							<View className="items-center justify-center p-4">
								<ActivityIndicator
									size="large"
									color="#fed787"
								/>
								<Text className="mt-2 text-[#666666]">
									Loading bookmarked locations...
								</Text>
							</View>
						) : error ? (
							<View
								className="my-4 border border-[#333333] bg-white p-4"
								style={shadowStyles.standard}
							>
								<View className="items-center">
									<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
										<Feather
											name="alert-triangle"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="mb-2 text-center text-xl tracking-tighter-lexend text-black">
										Error Loading Bookmarks
									</Text>
									<Text className="mb-4 text-center text-base tracking-tighter-lexend text-[#666666]">
										{error}
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center border border-[#333333] bg-[#fed787] px-4 py-2"
										style={shadowStyles.small}
										onPress={fetchBookmarkedLocations}
									>
										<Text className="tracking-tighter-lexend text-black">
											Retry
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : locations.length === 0 ? (
							<View className="my-4 rounded-lg border border-[#333333] bg-white p-4">
								<View className="items-center">
									<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
										<AntDesign
											name="heart"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="mb-2 text-center text-xl tracking-tighter-lexend text-black">
										{t("home.noBookmarks")}
									</Text>
									<Text className="mb-4 text-center text-base tracking-tighter-lexend text-[#666666]">
										{t("home.noBookmarksDesc")}
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center border border-[#333333] bg-[#fed787] px-4 py-2"
										onPress={() =>
											router.push("/(home)")
										}
									>
										<Text className="tracking-tighter-lexend text-black">
											{t("home.exploreLocations")}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : isGridView ? (
							// Grid View
							<View className="flex-row justify-between">
								<View className="w-[48%] space-y-4">
									{locations
										.slice(
											0,
											Math.ceil(locations.length / 2)
										)
										.map((location) => (
											<LocationCard
												key={location.id}
												location={location}
												isBookmarked={true}
												onToggleBookmark={
													handleToggleBookmark
												}
											/>
										))}
								</View>
								<View className="w-[48%] space-y-4">
									{locations
										.slice(
											Math.ceil(locations.length / 2)
										)
										.map((location) => (
											<LocationCard
												key={location.id}
												location={location}
												isBookmarked={true}
												onToggleBookmark={
													handleToggleBookmark
												}
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
										onToggleBookmark={
											handleToggleBookmark
										}
									/>
								))}
							</View>
						)}
					</View>
				</ScrollView>
				<BottomTabBar activeTab="bookmarks" />
			</SafeAreaView>
		</View>
	);
}
