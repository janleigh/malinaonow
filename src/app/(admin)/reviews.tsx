import { supabase } from "@/api/supabase";
import { BaseText as Text } from "@/components/BaseText";
import { RatingStars } from "@/components/home/reviews";
import { Review } from "@/lib/types/supabase";
import { formatDate } from "@/lib/utils/date";
import { LocationService, ReviewService } from "@/services";
import { Feather } from "@expo/vector-icons";
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
		<View className="mb-4 border border-[#333333] bg-white p-4">
			<View className="mb-2 flex-row items-start justify-between">
				<Text
					className="font-lexend-bold text-lg tracking-tighter-lexend text-black"
					fontStyle="bold"
				>
					{item.user_name || "Anonymous"}
				</Text>
				<View className="flex-row items-center">
					<RatingStars rating={item.rating} />
					<Text className="ml-2 text-black" fontStyle="medium">
						{item.rating}/5
					</Text>
				</View>
			</View>
			{item.comment ? (
				<Text className="mb-2 tracking-tighter-lexend text-[#333333]">
					{item.comment}
				</Text>
			) : (
				<Text className="mb-2 italic tracking-tighter-lexend text-[#666666]">
					No comment
				</Text>
			)}
			<View className="flex-row items-center justify-between">
				<Text className="text-sm tracking-tighter-lexend text-[#666666]">
					{item.locationName || "Unknown Location"}
				</Text>
				<Text className="text-xs tracking-tighter-lexend text-[#666666]">
					{formatDate(item.created_at)}
				</Text>
			</View>
			<View className="mt-3 flex-row space-x-2">
				<TouchableOpacity
					className={`mr-2 flex-1 items-center rounded-xl border border-[#333333] py-2 ${item.flagged ? "bg-[#FFBB38]" : "bg-white"}`}
					onPress={() => handleFlagReview(item.id)}
				>
					<Text
						className="font-lexend-medium tracking-tighter-lexend text-black"
						fontStyle="medium"
					>
						{item.flagged ? "Flagged" : "Flag"}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="flex-1 items-center rounded-xl border border-[#333333] bg-white py-2"
					onPress={() => handleDeleteReview(item.id)}
				>
					<Text
						className="font-lexend-medium tracking-tighter-lexend text-black"
						fontStyle="medium"
					>
						Delete
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-[#faf4f0]">
				<ActivityIndicator size="large" color="#fed787" />
				<Text className="mt-2 text-[#666666]">
					Loading reviews...
				</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 items-center justify-center bg-[#faf4f0] p-4">
				<Text className="mb-4 text-center tracking-tighter-lexend text-[#333333]">
					{error}
				</Text>
				<TouchableOpacity
					className="border border-[#333333] bg-[#fed787] px-6 py-2"
					onPress={fetchReviews}
				>
					<Text
						className="font-lexend-medium tracking-tighter-lexend text-black"
						fontStyle="medium"
					>
						Retry
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#E1F2E9]">
			<SafeAreaView className="flex-1">
				<View className="border-b border-[#eee] bg-[#E1F2E9] p-4">
					<View className="mb-4 flex-row items-center justify-between">
						<Text
							className="android:font-normal text-2xl tracking-tighter-lexend text-black"
							fontStyle="extrabold"
						>
							Moderate Reviews
						</Text>
						<TouchableOpacity onPress={() => router.back()}>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<View className="mb-3 flex-row items-center rounded-xl border border-[#333333] bg-white px-3 py-2">
						<Feather name="search" size={18} color="#666" />
						<TextInput
							className="ml-2 flex-1 text-base text-black"
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
							className="flex-1"
						>
							<View className="flex-row space-x-2">
								<TouchableOpacity
									className={`mr-1 rounded-2xl border border-[#333333] px-3 py-1 ${filterRating === 0 ? "bg-[#FFBB38]" : "bg-white"}`}
									onPress={() => setFilterRating(0)}
								>
									<Text
										className="font-lexend-medium tracking-tighter-lexend text-black"
										fontStyle="medium"
									>
										All
									</Text>
								</TouchableOpacity>
								{[1, 2, 3, 4, 5].map((rating) => (
									<TouchableOpacity
										key={rating}
										className={`mr-1 rounded-xl border border-[#333333] px-3 py-1 ${filterRating === rating ? "bg-[#FFBB38]" : "bg-white"}`}
										onPress={() =>
											setFilterRating(rating)
										}
									>
										<Text
											className="font-lexend-medium tracking-tighter-lexend text-black"
											fontStyle="medium"
										>
											{rating}★
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>
						<TouchableOpacity
							className={`rounded-xl border border-[#333333] px-3 py-1 ${showFlagged ? "bg-[#FFBB38]" : "bg-white"}`}
							onPress={() => setShowFlagged(!showFlagged)}
						>
							<Text
								className="font-lexend-medium tracking-tighter-lexend text-black"
								fontStyle="medium"
							>
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
								className="mb-2 text-center text-xl tracking-tighter-lexend text-black"
								fontStyle="extrabold"
							>
								{reviews.length === 0
									? "No Reviews Found"
									: "No Matching Reviews"}
							</Text>
							{reviews.length > 0 && (
								<Text className="text-center text-base tracking-tighter-lexend text-[#666666]">
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
