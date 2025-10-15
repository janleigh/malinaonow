import { BaseText as Text } from "@/components/BaseText";
import { BottomTabBar } from "@/components/common";
import {
	Event,
	EventCard,
	LocationCard,
	UserSidebar
} from "@/components/home";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useTranslation } from "@/hooks/useTranslation";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useAuth } from "@shared/context/AuthContext";
import {
	BookmarkService,
	EventService,
	LocationService
} from "@shared/services";
import { Location } from "@shared/types/supabase";
import { shadowStyles } from "@shared/utils/styles";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const EVENT_CARD_WIDTH = SCREEN_WIDTH - 28; // Accounting for padding

export default function HomePage() {
	const [sidebarVisible, setSidebarVisible] = useState(false);
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
	const { isOnline } = useNetworkStatus();

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

	const fetchLocations = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			if (!isOnline) {
				const cached =
					await LocationService.getCachedLocations?.();
				if (cached?.length) {
					setLocations(cached);
				}
				setLoading(false);
				return;
			}

			const data = await LocationService.getLocations();
			setLocations(data);
		} catch (err) {
			console.error("Failed to fetch locations:", err);
			if (!locations.length) {
				setError("Failed to load locations. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	}, [isOnline, locations.length]);

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
	}, [user?.id, isSignedIn, fetchBookmarks, fetchLocations]);

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
		<View className="flex-1 bg-background">
			<SafeAreaView className="flex-1">
				{/* Offline Banner */}
				{!isOnline && (
					<View className="mx-4 mt-2 rounded-md border border-line bg-primary px-3 py-1">
						<Text className="text-xs text-black">
							You are currently offline. Some features may be
							unavailable.
						</Text>
					</View>
				)}
				{/* Header */}
				<View className="flex-row items-center justify-between p-4">
					<Text
						className="android:font-normal text-2xl text-text"
						fontName="Montserrat_700Bold">
						MalinaoNow
					</Text>
					<TouchableOpacity
						className="p-2"
						onPress={openSidebar}>
						<Feather name="user" size={24} color="#f7f7f7" />
					</TouchableOpacity>
				</View>
				{/* Main Window */}
				<ScrollView className="flex-1">
					{/* Events Section */}
					<View className="mb-6 px-4">
						<View className="mb-4 flex-row items-center justify-between">
							<Text
								className="text-xl text-text"
								fontName="Montserrat_700Bold">
								{t("home.upcomingEvents")}
							</Text>
						</View>
						<View>
							{loadingEvents ? (
								<View className="items-center justify-center p-4">
									<ActivityIndicator
										size="large"
										color="#0ff6be"
									/>
									<Text className="mt-2 text-[#666666]">
										{t("home.loadingEvents")}
									</Text>
								</View>
							) : eventError ? (
								<View
									className="my-4 border border-[#333333] bg-white p-4"
									style={shadowStyles.standard}>
									<View className="items-center">
										<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
											<Feather
												name="alert-triangle"
												size={24}
												color="#333"
											/>
										</View>
										<Text className="mb-2 text-center text-xl text-text">
											Error Loading Events
										</Text>
										<Text className="mb-4 text-center text-base text-[#666666]">
											{eventError}
										</Text>
										<TouchableOpacity
											className="flex-row items-center justify-center border border-[#333333] bg-[#fed787] px-4 py-2"
											style={shadowStyles.small}
											onPress={fetchEvents}>
											<Text className="text-text">
												Retry
											</Text>
										</TouchableOpacity>
									</View>
								</View>
							) : events.length === 0 ? (
								<View
									className="my-4 border border-[#333333] bg-white p-4"
									style={shadowStyles.standard}>
									<View className="items-center">
										<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
											<Feather
												name="calendar"
												size={24}
												color="#333"
											/>
										</View>
										<Text className="mb-2 text-center text-xl text-black">
											{t("home.noEvents")}
										</Text>
										<Text className="mb-4 text-center text-base text-[#666666]">
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
										}}>
										{events.map((event, index) => (
											<View
												key={event.id}
												style={{
													width: EVENT_CARD_WIDTH,
													marginRight: 16
												}}>
												<EventCard event={event} />
											</View>
										))}
									</ScrollView>
									<View className="mt-3 flex-row justify-center">
										{events.map((_, index) => (
											<View
												key={index}
												className={`mx-1 h-2 w-2 rounded-full ${index === activeEventIndex ? "bg-[#0ff6be]" : "bg-[#cccccc]"}`}
											/>
										))}
									</View>
								</>
							)}
						</View>
					</View>
					{/* Locations Section */}
					<View className="mt-2 px-4 py-2">
						<View className="mb-4 flex-row items-center justify-between">
							<View className="flex-row items-center">
								<Text
									className="text-xl leading-tight text-text"
									fontName="Poppins_700Bold">
									{t("home.featuredLocations")}
								</Text>
							</View>
						</View>
						{loading ? (
							<View className="items-center justify-center p-4">
								<ActivityIndicator
									size="large"
									color="#0ff6be"
								/>
								<Text className="mt-2 text-[#666666]">
									{t("home.loadingLocations")}
								</Text>
							</View>
						) : error ? (
							<View
								className="my-4 border border-[#333333] bg-white p-4"
								style={shadowStyles.standard}>
								<View className="items-center">
									<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
										<Feather
											name="alert-triangle"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="mb-2 text-center text-xl text-black">
										Error Loading Data
									</Text>
									<Text className="mb-4 text-center text-base text-[#666666]">
										{error}
									</Text>
									<TouchableOpacity
										className="flex-row items-center justify-center border border-[#333333] bg-[#fed787] px-4 py-2"
										style={shadowStyles.small}
										onPress={fetchLocations}>
										<Text className="text-black">
											Retry
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : locations.length === 0 ? (
							<View
								className="my-4 border border-[#333333] bg-white p-4"
								style={shadowStyles.standard}>
								<View className="items-center">
									<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
										<Feather
											name="tool"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="mb-2 text-center text-xl text-black">
										{t("home.noLocations")}
									</Text>
									<Text className="mb-4 text-center text-base text-[#666666]">
										{t("home.noLocationsDesc")}
									</Text>
								</View>
							</View>
						) : showingBookmarksOnly &&
						  displayedLocations.length === 0 ? (
							<View
								className="my-4 border border-[#333333] bg-white p-4"
								style={shadowStyles.standard}>
								<View className="items-center">
									<View className="mb-4 h-12 w-12 items-center justify-center rounded-full border border-[#333333] bg-[#fed787]">
										<AntDesign
											name="heart"
											size={24}
											color="#333"
										/>
									</View>
									<Text className="mb-2 text-center text-xl text-black">
										{t("home.noBookmarks")}
									</Text>
									<Text className="mb-4 text-center text-base text-[#666666]">
										{t("home.noBookmarksDesc")}
									</Text>
								</View>
							</View>
						) : (
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
