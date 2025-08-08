import { BottomTabBar } from "@/components/common";
import {
	Event,
	EventCard,
	LocationCard,
	UserSidebar
} from "@/components/home";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/TranslationContext";
import { Location } from "@/lib/types/supabase";
import { shadowStyles } from "@/lib/utils/styles";
import {
	BookmarkService,
	EventService,
	LocationService
} from "@/services";
import { AntDesign, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const EVENT_CARD_WIDTH = SCREEN_WIDTH - 28; // Accounting for padding

export default function HomePage() {
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const [isGridView, setIsGridView] = useState(true);
	const [locations, setLocations] = useState<Location[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeEventIndex, setActiveEventIndex] = useState(0);

	const [events, setEvents] = useState<Event[]>([]);
	const [loadingEvents, setLoadingEvents] = useState(true);
	const [eventError, setEventError] = useState<string | null>(null);

	const [bookmarkedLocations, setBookmarkedLocations] = useState<
		string[]
	>([]);
	const [showingBookmarksOnly, setShowingBookmarksOnly] =
		useState(false);
	const { user, isSignedIn } = useAuth();
	const { t } = useTranslation();

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
			const data = await LocationService.getLocations();
			setLocations(data);
		} catch (err) {
			console.error("Failed to fetch locations:", err);
			setError("Failed to load locations. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const fetchEvents = async () => {
		try {
			setLoadingEvents(true);
			setEventError(null);
			const data = await EventService.getEvents();
			setEvents(data);
		} catch (err) {
			console.error("Failed to fetch events:", err);
			setEventError("Failed to load events. Please try again.");
		} finally {
			setLoadingEvents(false);
		}
	};

	const fetchBookmarks = useCallback(async () => {
		if (!isSignedIn || !user) {
			setBookmarkedLocations([]);
			return;
		}

		try {
			const bookmarks = await BookmarkService.getBookmarks(user.id);
			setBookmarkedLocations(bookmarks);
		} catch (err) {
			console.error("Failed to fetch bookmarks:", err);
		}
	}, [isSignedIn, user]);

	useEffect(() => {
		fetchLocations();
		fetchEvents();
		fetchBookmarks();
	}, [user?.id, isSignedIn, fetchBookmarks]);

	const toggleView = () => {
		setIsGridView(!isGridView);
	};

	const handleToggleBookmark = async (
		locationId: string,
		newStatus: boolean
	) => {
		if (!isSignedIn || !user) return;

		try {
			if (newStatus) {
				await BookmarkService.addBookmark(user.id, locationId);
				setBookmarkedLocations((prev) => [...prev, locationId]);
			} else {
				await BookmarkService.removeBookmark(user.id, locationId);
				setBookmarkedLocations((prev) =>
					prev.filter((id) => id !== locationId)
				);
			}
		} catch (err) {
			console.error("Failed to update bookmark:", err);
		}
	};

	const toggleBookmarksView = () => {
		router.push("/(home)/bookmarks");
	};

	const displayedLocations = showingBookmarksOnly
		? locations.filter((location) =>
			bookmarkedLocations.includes(location.id)
		)
		: locations;

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						MalinaoNow
					</Text>
					<TouchableOpacity
						className="p-2"
						onPress={openSidebar}
					>
						<Feather name="user" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<ScrollView className="flex-1">
					<View className="px-4 mb-6">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black">
								{t("home.upcomingEvents")}
							</Text>
						</View>
						<View>
							{loadingEvents ? (
								<View className="p-4 items-center justify-center">
									<ActivityIndicator
										size="large"
										color="#fed787"
									/>
									<Text className="mt-2 font-lexend text-[#666666]">
										{t("home.loadingEvents")}
									</Text>
								</View>
							) : eventError ? (
								<View
									className="p-4 my-4 border border-[#333333] bg-white"
									style={shadowStyles.standard}
								>
									<View className="items-center">
										<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
											<Feather
												name="alert-triangle"
												size={24}
												color="#333"
											/>
										</View>
										<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
											Error Loading Events
										</Text>
										<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
											{eventError}
										</Text>
										<TouchableOpacity
											className="flex-row items-center justify-center py-2 px-4 bg-[#fed787] border border-[#333333]"
											style={shadowStyles.small}
											onPress={fetchEvents}
										>
											<Text className="font-lexend-medium tracking-tighter-lexend text-black">
												Retry
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							) : events.length === 0 ? (
								<View
									className="p-4 my-4 border border-[#333333] bg-white"
									style={shadowStyles.standard}
								>
									<View className="items-center">
										<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
											<Feather
												name="calendar"
												size={24}
												color="#333"
											/>
										</View>
										<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
											{t("home.noEvents")}
										</Text>
										<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
											{t("home.noEventsDesc")}
										</Text>
									</View>
								</View>
							) : (
								<>
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={
											false
										}
										pagingEnabled
										snapToInterval={
											EVENT_CARD_WIDTH + 16
										}
										decelerationRate="fast"
										contentContainerStyle={{
											paddingEnd: 16
										}}
										onMomentumScrollEnd={(e) => {
											const newIndex = Math.round(
												e.nativeEvent.contentOffset
													.x /
													(EVENT_CARD_WIDTH + 16)
											);
											setActiveEventIndex(newIndex);
										}}
									>
										{events.map((event, index) => (
											<View
												key={event.id}
												style={{
													width: EVENT_CARD_WIDTH,
													marginRight: 16
												}}
											>
												<EventCard event={event} />
											</View>
										))}
									</ScrollView>
									<View className="flex-row justify-center mt-3">
										{events.map((_, index) => (
											<View
												key={index}
												className={`h-2 w-2 rounded-full mx-1 ${index === activeEventIndex ? "bg-[#fed787]" : "bg-[#cccccc]"}`}
											/>
										))}
									</View>
								</>
							)}
						</View>
					</View>
					<View className="mt-2 px-4 py-2">
						<View className="flex-row justify-between items-center mb-4">
							<View className="flex-row items-center">
								<Text className="text-lg font-lexend-extrabold tracking-tighter-lexend text-black">
									{t("home.featuredLocations")}
								</Text>
							</View>
							<TouchableOpacity
								className="flex-row items-center"
								onPress={toggleView}
							>
								<Text className="mr-1 font-lexend tracking-tighter-lexend text-black">
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
							<View className="p-4 items-center justify-center">
								<ActivityIndicator
									size="large"
									color="#fed787"
								/>
								<Text className="mt-2 font-lexend text-[#666666]">
									{t("home.loadingLocations")}
								</Text>
							</View>
						) : error ? (
							<View
								className="p-4 my-4 border border-[#333333] bg-white"
								style={shadowStyles.standard}
							>
								<View className="items-center">
									<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
										<Feather
											name="alert-triangle"
											size={24}
											color="#333"
										/>
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
							<View
								className="p-4 my-4 border border-[#333333] bg-white"
								style={shadowStyles.standard}
							>
								<View className="items-center">
									<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
										<Feather
											name="tool"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
										{t("home.noLocations")}
									</Text>
									<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
										{t("home.noLocationsDesc")}
									</Text>
								</View>
							</View>
						) : showingBookmarksOnly &&
							displayedLocations.length === 0 ? (
								<View
									className="p-4 my-4 border border-[#333333] bg-white"
									style={shadowStyles.standard}
								>
									<View className="items-center">
										<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
											<AntDesign
												name="heart"
												size={24}
												color="#333"
											/>
										</View>
										<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
											{t("home.noBookmarks")}
										</Text>
										<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center mb-4">
											{t("home.noBookmarksDesc")}
										</Text>
									</View>
								</View>
							) : isGridView ? (
							// Grid View
								<View className="flex-row justify-between">
									<View className="w-[48%] space-y-4">
										{displayedLocations
											.slice(
												0,
												Math.ceil(
													displayedLocations.length /
													2
												)
											)
											.map((location) => (
												<LocationCard
													key={location.id}
													location={location}
													isBookmarked={bookmarkedLocations.includes(
														location.id
													)}
													onToggleBookmark={
														handleToggleBookmark
													}
												/>
											))}
									</View>
									<View className="w-[48%] space-y-4">
										{displayedLocations
											.slice(
												Math.ceil(
													displayedLocations.length /
													2
												)
											)
											.map((location) => (
												<LocationCard
													key={location.id}
													location={location}
													isBookmarked={bookmarkedLocations.includes(
														location.id
													)}
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
									{displayedLocations.map((location) => (
										<LocationCard
											key={location.id}
											location={location}
											listView={true}
											isBookmarked={bookmarkedLocations.includes(
												location.id
											)}
											onToggleBookmark={
												handleToggleBookmark
											}
										/>
									))}
								</View>
							)}
					</View>
				</ScrollView>
				<BottomTabBar
					activeTab="home"
					onHomePress={() => setShowingBookmarksOnly(false)}
					onProductsPress={() => router.push("/(home)/products")}
					onBookmarksPress={toggleBookmarksView}
				/>
				<UserSidebar
					visible={sidebarVisible}
					onClose={closeSidebar}
					onSignOut={handleSignOut}
					onShowBookmarks={toggleBookmarksView}
				/>
			</SafeAreaView>
		</View>
	);
}
