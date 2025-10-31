import { BaseText as Text } from "@/components/BaseText";
import { RatingStars } from "@/components/home/reviews";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@shared/api/supabase";
import { LocationService, ReviewService } from "@shared/services";
import { Review } from "@shared/types/supabase";
import { formatDate } from "@shared/utils/date";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReviewWithLocation extends Review {
	locationName?: string;
}

export default function ModerateReviewsScreen() {
	const [reviews, setReviews] = useState<ReviewWithLocation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterRating, setFilterRating] = useState(0);
	const [showFlagged, setShowFlagged] = useState(false);

	const fetchReviews = async () => {
		try {
			setLoading(true);
			setError(null);

			const locations = await LocationService.getLocations();
			const locationMap = locations.reduce(
				(acc, loc) => ({
					...acc,
					[loc.id]: loc.name
				}),
				{} as Record<string, string>
			);

			const allReviews: ReviewWithLocation[] = [];
			for (const location of locations) {
				const locationReviews = await ReviewService.getReviews(
					location.id
				);
				const reviewsWithLocation = locationReviews.map(
					(review) => ({
						...review,
						locationName:
							locationMap[review.location_id] ||
							"Unknown Location"
					})
				);
				allReviews.push(...reviewsWithLocation);
			}

			setReviews(allReviews);
		} catch (err) {
			console.error("Error fetching reviews:", err);
			setError("Failed to load reviews. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchReviews();
	}, []);

	const filteredReviews = reviews.filter((review) => {
		const matchesSearch =
			review.user_name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			review.comment
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			review.locationName
				?.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const matchesRating =
			filterRating === 0 || review.rating === filterRating;
		const matchesFlagged = !showFlagged || review.flagged;

		return matchesSearch && matchesRating && matchesFlagged;
	});

	const handleFlagReview = async (reviewId: string) => {
		try {
			const review = reviews.find((r) => r.id === reviewId);
			if (!review) return;

			const { error } = await supabase
				.from("reviews")
				.update({ flagged: !review.flagged })
				.eq("id", reviewId);

			if (error) throw error;

			setReviews(
				reviews.map((r) =>
					r.id === reviewId ? { ...r, flagged: !r.flagged } : r
				)
			);
		} catch (err) {
			console.error("Error toggling flag:", err);
			Alert.alert("Error", "Failed to update review status");
		}
	};

	const handleDeleteReview = async (reviewId: string) => {
		Alert.alert(
			"Delete Review",
			"Are you sure you want to delete this review?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const { error } = await supabase
								.from("reviews")
								.delete()
								.eq("id", reviewId);

							if (error) throw error;

							await fetchReviews();
						} catch (err) {
							console.error("Error deleting review:", err);
							Alert.alert(
								"Error",
								"Failed to delete review"
							);
						}
					}
				}
			]
		);
	};

	const renderReviewItem = ({ item }: { item: ReviewWithLocation }) => (
		<View className="mb-4 rounded-lg border border-line bg-surface p-4">
			<View className="mb-2 flex-row items-start justify-between">
				<Text
					className="android:font-normal text-lg text-text"
					fontName="Montserrat_700Bold">
					{item.user_name || "Anonymous"}
				</Text>
				<View className="flex-row items-center">
					<RatingStars rating={item.rating} />
					<Text
						className="ml-2 text-text"
						fontName="Poppins_500Medium">
						{item.rating}/5
					</Text>
				</View>
			</View>
			{item.comment ? (
				<Text className="mb-2 text-text-inactive">
					{item.comment}
				</Text>
			) : (
				<Text className="mb-2 italic text-text-inactive">
					No comment
				</Text>
			)}
			<View className="flex-row items-center justify-between">
				<Text className="text-sm text-text-inactive">
					{item.locationName || "Unknown Location"}
				</Text>
				<Text className="text-xs text-text-inactive">
					{formatDate(item.created_at)}
				</Text>
			</View>
			<View className="mt-3 flex-row space-x-2">
				<TouchableOpacity
					className={`mr-2 flex-1 items-center rounded-lg border border-line py-2 ${item.flagged ? "bg-primary" : "bg-lighterBackground"}`}
					onPress={() => handleFlagReview(item.id)}>
					<Text
						className={`android:font-normal ${item.flagged ? "text-black" : "text-text"}`}
						fontName="Poppins_500Medium">
						{item.flagged ? "Flagged" : "Flag"}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="flex-1 items-center rounded-lg border border-line bg-lighterBackground py-2"
					onPress={() => handleDeleteReview(item.id)}>
					<Text
						className="android:font-normal text-text"
						fontName="Poppins_500Medium">
						Delete
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" color="#0ff6be" />
				<Text className="mt-2 text-text-inactive">
					Loading reviews...
				</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-4">
				<Text className="mb-4 text-center text-text">{error}</Text>
				<TouchableOpacity
					className="rounded-lg border border-line bg-primary px-6 py-2"
					onPress={fetchReviews}>
					<Text
						className="android:font-normal text-black"
						fontName="Poppins_500Medium">
						Retry
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<SafeAreaView className="flex-1">
				<View className="border-b border-line bg-background p-4">
					<View className="mb-4 flex-row items-center justify-between">
						<Text
							className="android:font-normal text-2xl text-text"
							fontName="Montserrat_700Bold">
							Moderate Reviews
						</Text>
						<TouchableOpacity onPress={() => router.back()}>
							<Feather name="x" size={24} color="#f7f7f7" />
						</TouchableOpacity>
					</View>
					<View className="mb-3 flex-row items-center rounded-lg border border-line bg-surface px-4 py-1">
						<Feather name="search" size={18} color="#cacbca" />
						<TextInput
							className="ml-2 flex-1 text-base text-text"
							placeholder="Search reviews..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholderTextColor="#666666"
						/>
					</View>
					<View className="flex-row items-center justify-between">
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							className="flex-1">
							<View className="flex-row space-x-2 pr-2">
								<TouchableOpacity
									className={`mr-1 rounded-lg border border-line px-3 py-1 ${filterRating === 0 ? "bg-primary" : "bg-lighterBackground"}`}
									onPress={() => setFilterRating(0)}>
									<Text
										className="android:font-normal text-black"
										fontName="Poppins_500Medium">
										All
									</Text>
								</TouchableOpacity>
								{[1, 2, 3, 4, 5].map((rating) => (
									<TouchableOpacity
										key={rating}
										className={`mr-1 rounded-lg border border-line px-3 py-1 ${filterRating === rating ? "bg-primary" : "bg-lighterBackground"}`}
										onPress={() =>
											setFilterRating(rating)
										}>
										<Text
											className={`android:font-normal ${filterRating === rating ? "text-black" : "text-text"}`}
											fontName="Poppins_500Medium">
											{rating}★
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>
						<TouchableOpacity
							className={`rounded-lg border border-line px-3 py-1 ${showFlagged ? "bg-primary" : "bg-lighterBackground"}`}
							onPress={() => setShowFlagged(!showFlagged)}>
							<Text
								className={`android:font-normal ${showFlagged ? "text-black" : "text-text"}`}
								fontName="Poppins_500Medium">
								Flagged
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View className="flex-1 p-4">
					{filteredReviews.length > 0 ? (
						<FlatList
							data={filteredReviews}
							renderItem={renderReviewItem}
							keyExtractor={(item) => item.id}
							contentContainerStyle={{
								paddingBottom: 20
							}}
							showsVerticalScrollIndicator={false}
						/>
					) : (
						<View className="flex-1 items-center justify-center">
							<Text
								className="android:font-normal mb-2 text-center text-xl text-text"
								fontName="Montserrat_700Bold">
								{reviews.length === 0
									? "No Reviews Found"
									: "No Matching Reviews"}
							</Text>
							{reviews.length > 0 && (
								<Text className="text-center text-base text-text-inactive">
									Try adjusting your search or filter
									criteria
								</Text>
							)}
						</View>
					)}
				</View>
			</SafeAreaView>
		</View>
	);
}
