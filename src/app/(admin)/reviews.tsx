import { supabase } from "@/api/supabase";
import { RatingStars } from "@/components/home/reviews";
import { Review } from "@/lib/types/supabase";
import { formatDate } from "@/lib/utils/date";
import { shadowStyles } from "@/lib/utils/styles";
import { LocationService, ReviewService } from "@/services";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ModerateReviewsScreen() {
	const [allReviews, setAllReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterRating, setFilterRating] = useState(0);
	const [locationNames, setLocationNames] = useState<Record<string, string>>({});
	const [flaggedReviews, setFlaggedReviews] = useState<Record<string, boolean>>({});
	const [showFlagged, setShowFlagged] = useState(false);

	const fetchAllReviews = async () => {
		try {
			setLoading(true);
			setError(null);

			const locations = await LocationService.getLocations();
			const namesMap = locations.reduce(
				(acc, location) => {
					acc[location.id] = location.name;
					return acc;
				},
				{} as Record<string, string>
			);
			console.log("====================================");
			console.log("Location Names Map:", namesMap);
			console.log("====================================");
			setLocationNames(namesMap);

			const data = [];
			for (const location of locations) {
				const reviews = await ReviewService.getReviews(location.id);
				data.push(...reviews);
			}

			console.log(data.length);
			setAllReviews(data);

			const flagMap = data.reduce(
				(acc, review) => {
					acc[review.id] = review.flagged || false;
					return acc;
				},
				{} as Record<string, boolean>
			);
			setFlaggedReviews(flagMap);
		} catch (err) {
			console.error("Failed to fetch reviews:", err);
			setError("Failed to load reviews. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllReviews();
	}, []);

	const filteredReviews = allReviews.filter((review) => {
		const matchesSearch =
			review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			review.comment.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesRating = filterRating === 0 || review.rating === filterRating;
		const matchesFlagged = !showFlagged || flaggedReviews[review.id];
		return matchesSearch && matchesRating && matchesFlagged;
	});

	const handleDeleteReview = async (reviewId: string) => {
		Alert.alert("Confirm Delete", "Are you sure you want to delete this review? This action cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						setLoading(true);
						const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

						if (error) throw error;

						await fetchAllReviews();
					} catch (err) {
						console.error("Error deleting review:", err);
						Alert.alert("Error", "Failed to delete review. Please try again.");
					} finally {
						setLoading(false);
					}
				}
			}
		]);
	};

	const handleFlagReview = async (reviewId: string) => {
		try {
			setLoading(true);

			const newFlaggedStatus = !flaggedReviews[reviewId];
			const { error } = await supabase.from("reviews").update({ flagged: newFlaggedStatus }).eq("id", reviewId);

			if (error) throw error;

			setFlaggedReviews((prev) => ({
				...prev,
				[reviewId]: newFlaggedStatus
			}));

			Alert.alert("Success", `Review ${newFlaggedStatus ? "flagged" : "unflagged"} successfully.`);
		} catch (err) {
			console.error("Error flagging review:", err);
			Alert.alert("Error", "Failed to update review flag status.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-[#faf4f0]">
			<SafeAreaView className="flex-1">
				<View className="flex-row justify-between items-center p-4 border-b border-[#eee]">
					<Text className="text-2xl font-extrabold android:font-normal text-black font-lexend tracking-tighter-lexend">
						Moderate Reviews
					</Text>
					<TouchableOpacity onPress={() => router.push("/(admin)")}>
						<Feather name="x" size={24} color="black" />
					</TouchableOpacity>
				</View>
				<View className="p-4">
					<View className="mb-4">
						<View className="flex-row mb-4">
							<View
								className="flex-1 bg-white border border-[#333333] flex-row items-center px-3"
								style={shadowStyles.standard}
							>
								<Feather name="search" size={18} color="#666" />
								<TextInput
									className="flex-1 py-2 px-2 text-black font-lexend"
									placeholder="Search reviews..."
									placeholderTextColor="#666666"
									value={searchQuery}
									onChangeText={setSearchQuery}
								/>
							</View>
						</View>
						<View className="flex-row mb-4">
							<Text className="mr-2 font-lexend-medium tracking-tighter-lexend text-black">
								Filter by rating:
							</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<TouchableOpacity
									className={`px-3 py-1 mr-2 border ${filterRating === 0 ? "bg-[#fed787] border-[#333333]" : "bg-white border-[#cccccc]"}`}
									onPress={() => setFilterRating(0)}
								>
									<Text className="font-lexend text-black tracking-tighter-lexend">All</Text>
								</TouchableOpacity>
								{[1, 2, 3, 4, 5].map((rating) => (
									<TouchableOpacity
										key={rating}
										className={`px-3 py-1 mr-2 border ${filterRating === rating ? "bg-[#fed787] border-[#333333]" : "bg-white border-[#cccccc]"}`}
										onPress={() => setFilterRating(rating)}
									>
										<Text className="font-lexend text-black tracking-tighter-lexend">
											{rating} Star
										</Text>
									</TouchableOpacity>
								))}
								<TouchableOpacity
									className={`px-3 py-1 ml-4 border ${showFlagged ? "bg-[#ffcccc] border-[#333333]" : "bg-white border-[#cccccc]"}`}
									style={shadowStyles.standard}
									onPress={() => setShowFlagged(!showFlagged)}
								>
									<Text className="font-lexend text-black tracking-tighter-lexend">
										{showFlagged ? "All Reviews" : "Flagged Only"}
									</Text>
								</TouchableOpacity>
							</ScrollView>
						</View>
					</View>
					{loading ? (
						<View className="flex-1 items-center justify-center py-8">
							<ActivityIndicator size="large" color="#fed787" />
							<Text className="mt-2 font-lexend text-[#666666]">Loading reviews...</Text>
						</View>
					) : error ? (
						<View className="flex-1 items-center justify-center py-8">
							<View className="w-12 h-12 rounded-full bg-[#fed787] items-center justify-center mb-4 border border-[#333333]">
								<Feather name="alert-triangle" size={24} color="#333" />
							</View>
							<Text className="text-base font-lexend-bold tracking-tighter-lexend text-black mb-2">
								{error}
							</Text>
							<TouchableOpacity
								className="mt-2 bg-[#fed787] px-4 py-2 border border-[#333333]"
								style={shadowStyles.small}
								onPress={fetchAllReviews}
							>
								<Text className="font-lexend-medium tracking-tighter-lexend text-black">Try Again</Text>
							</TouchableOpacity>
						</View>
					) : (
						<ScrollView className="flex-1">
							{filteredReviews.length === 0 ? (
								<View className="items-center justify-center py-8">
									<Text className="text-base font-lexend-medium tracking-tighter-lexend text-[#666666]">
										No reviews found matching your criteria.
									</Text>
								</View>
							) : (
								<View className="space-y-4">
									{filteredReviews.map((review) => (
										<View
											key={review.id}
											className="bg-white p-4 border border-[#333333]"
											style={shadowStyles.standard}
										>
											<View className="flex-row justify-between items-center mb-2">
												<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-black">
													{review.user_name || "Anonymous"}
												</Text>
												<Text className="text-sm font-lexend tracking-tighter-lexend text-[#999]">
													{formatDate(review.created_at)}
												</Text>
											</View>
											<View className="flex-row items-center py-1">
												<RatingStars rating={review.rating} />
												<Text className="ml-2 font-lexend-medium tracking-tighter-lexend text-[#666666]">
													at {locationNames[review.location_id] || "Unknown Location"}
												</Text>
											</View>
											<Text className="font-lexend tracking-tighter-lexend text-[#333] mt-1 mb-3">
												{review.comment}
											</Text>

											<View className="flex-row mt-2">
												<TouchableOpacity
													className={`flex-1 ${flaggedReviews[review.id] ? "bg-[#ffcccc]" : "bg-white"} h-10 mr-1 items-center justify-center border border-[#333333]`}
													style={shadowStyles.small}
													onPress={() => handleFlagReview(review.id)}
												>
													<Text className="font-lexend-medium tracking-tighter-lexend text-black">
														{flaggedReviews[review.id] ? "Unflag" : "Flag"}
													</Text>
												</TouchableOpacity>
												<TouchableOpacity
													className="flex-1 bg-white h-10 ml-1 items-center justify-center border border-[#333333]"
													style={shadowStyles.small}
													onPress={() => handleDeleteReview(review.id)}
												>
													<Text className="font-lexend-medium tracking-tighter-lexend text-black">
														Delete
													</Text>
												</TouchableOpacity>
											</View>
										</View>
									))}
								</View>
							)}
						</ScrollView>
					)}
				</View>
			</SafeAreaView>
		</View>
	);
}
