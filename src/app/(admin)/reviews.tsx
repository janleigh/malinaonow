import { supabase } from "@/api/supabase";
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
	Text,
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
		<View
			className="mb-4 p-4 bg-white border border-[#333333]"
			
		>
			<View className="flex-row justify-between items-start mb-2">
				<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-black">
					{item.user_name || "Anonymous"}
				</Text>
				<View className="flex-row items-center">
					<RatingStars rating={item.rating} />
					<Text className="ml-2 font-lexend-medium text-black">
						{item.rating}/5
					</Text>
				</View>
			</View>
			{item.comment ? (
				<Text className="font-lexend tracking-tighter-lexend text-[#333333] mb-2">
					{item.comment}
				</Text>
			) : (
				<Text className="font-lexend tracking-tighter-lexend text-[#666666] italic mb-2">
					No comment
				</Text>
			)}
			<View className="flex-row justify-between items-center">
				<Text className="text-sm font-lexend tracking-tighter-lexend text-[#666666]">
					{item.locationName || "Unknown Location"}
				</Text>
				<Text className="text-xs font-lexend tracking-tighter-lexend text-[#666666]">
					{formatDate(item.created_at)}
				</Text>
			</View>
			<View className="flex-row mt-3 space-x-2">
				<TouchableOpacity
					className={`flex-1 py-2 mr-2 items-center border border-[#333333] rounded-xl ${item.flagged ? "bg-[#FFBB38]" : "bg-white"}`}
				
					onPress={() => handleFlagReview(item.id)}
				>
					<Text className="font-lexend-medium tracking-tighter-lexend text-black">
						{item.flagged ? "Flagged" : "Flag"}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="flex-1 py-2 bg-white border border-[#333333] rounded-xl items-center"
					
					onPress={() => handleDeleteReview(item.id)}
				>
					<Text className="font-lexend-medium tracking-tighter-lexend text-black">
						Delete
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center bg-[#faf4f0]">
				<ActivityIndicator size="large" color="#fed787" />
				<Text className="mt-2 font-lexend text-[#666666]">
					Loading reviews...
				</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 justify-center items-center p-4 bg-[#faf4f0]">
				<Text className="text-[#333333] mb-4 text-center font-lexend tracking-tighter-lexend">
					{error}
				</Text>
				<TouchableOpacity
					className="bg-[#fed787] px-6 py-2 border border-[#333333]"
					
					onPress={fetchReviews}
				>
					<Text className="font-lexend-medium tracking-tighter-lexend text-black">
						Retry
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-[#E1F2E9]">
			<SafeAreaView className="flex-1">
				<View className="p-4 bg-[#E1F2E9] border-b border-[#eee]">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
							Moderate Reviews
						</Text>
						<TouchableOpacity onPress={() => router.back()}>
							<Feather name="x" size={24} color="black" />
						</TouchableOpacity>
					</View>
					<View className="flex-row items-center bg-white border border-[#333333] rounded-xl px-3 py-2 mb-3">
						<Feather name="search" size={18} color="#666" />
						<TextInput
							className="flex-1 ml-2 text-base font-lexend text-black"
							placeholder="Search reviews..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholderTextColor="#666666"
						/>
					</View>
					<View className="flex-row justify-between items-center">
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							className="flex-1"
						>
							<View className="flex-row space-x-2">
								<TouchableOpacity
									className={`px-3 py-1 mr-1 border border-[#333333] rounded-2xl ${filterRating === 0 ? "bg-[#FFBB38]" : "bg-white"}`}
									
									onPress={() => setFilterRating(0)}
								>
									<Text className="font-lexend-medium tracking-tighter-lexend text-black">
										All
									</Text>
								</TouchableOpacity>
								{[1, 2, 3, 4, 5].map((rating) => (
									<TouchableOpacity
										key={rating}
										className={`px-3 py-1 mr-1 border border-[#333333] rounded-xl ${filterRating === rating ? "bg-[#FFBB38]" : "bg-white"}`}
										
										onPress={() =>
											setFilterRating(rating)
										}
									>
										<Text className="font-lexend-medium tracking-tighter-lexend text-black">
											{rating}★
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</ScrollView>
						<TouchableOpacity
							className={`px-3 py-1 border border-[#333333] rounded-xl ${showFlagged ? "bg-[#FFBB38]" : "bg-white"}`}
							
							onPress={() => setShowFlagged(!showFlagged)}
						>
							<Text className="font-lexend-medium tracking-tighter-lexend text-black">
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
						<View className="flex-1 justify-center items-center">
							<Text className="text-xl font-lexend-extrabold tracking-tighter-lexend text-black mb-2 text-center">
								{reviews.length === 0
									? "No Reviews Found"
									: "No Matching Reviews"}
							</Text>
							{reviews.length > 0 && (
								<Text className="text-base font-lexend tracking-tighter-lexend text-[#666666] text-center">
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
