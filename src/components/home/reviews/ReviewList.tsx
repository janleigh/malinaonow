import { Review } from "@/lib/types/supabase";
import { formatDate } from "@/lib/utils/date";
import React from "react";
import { Text, View } from "react-native";

interface ReviewListProps {
	reviews: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
	if (reviews.length === 0) {
		return (
			<View className="py-4">
				<Text className="text-center font-lexend tracking-tighter-lexend text-[#666666]">
					No reviews yet. Be the first to leave a review!
				</Text>
			</View>
		);
	}

	return (
		<View className="space-y-4">
			{reviews.map((review) => (
				<View key={review.id} className="border-b border-[#eee] pb-4">
					<View className="flex-row justify-between items-center">
						<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-black">
							{review.user_name || "Anonymous"}
						</Text>
						<Text className="text-sm font-lexend tracking-tighter-lexend text-[#999]">
							{formatDate(review.created_at)}
						</Text>
					</View>
					<View className="flex-row items-center py-1">
						<RatingStars rating={review.rating} />
					</View>
					<Text className="font-lexend tracking-tighter-lexend text-[#333] mt-1">{review.comment}</Text>
				</View>
			))}
		</View>
	);
};

interface RatingStarsProps {
	rating: number;
	size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, size = 16 }) => {
	return (
		<View className="flex-row">
			{[1, 2, 3, 4, 5].map((star) => (
				<Text key={star} style={{ fontSize: size, color: star <= rating ? "#FED787" : "#CCCCCC" }}>
					★
				</Text>
			))}
		</View>
	);
};
