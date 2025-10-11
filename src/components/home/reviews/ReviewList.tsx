import { useTranslation } from "@/hooks/useTranslation";
import { Review } from "@shared/types/supabase";
import { formatDate } from "@shared/utils/date";
import React from "react";
import { View } from "react-native";
import { BaseText as Text } from "../../BaseText";

interface ReviewListProps {
	reviews: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
	const { t } = useTranslation();

	if (reviews.length === 0) {
		return (
			<View className="py-4">
				<Text className="text-center font-lexend tracking-tighter-lexend text-[#666666]">
					{t("review.noReviews")}
				</Text>
			</View>
		);
	}

	return (
		<View className="space-y-4">
			{reviews.map((review) => (
				<View
					key={review.id}
					className="border-b border-[#eee] pb-4">
					<View className="flex-row items-center justify-between">
						<Text
							className="font-lexend-bold text-lg tracking-tighter-lexend text-black"
							fontStyle="bold">
							{review.user_name || "Anonymous"}
						</Text>
						<Text className="font-lexend text-sm tracking-tighter-lexend text-[#999]">
							{formatDate(review.created_at)}
						</Text>
					</View>
					<View className="flex-row items-center py-1">
						<RatingStars rating={review.rating} />
					</View>
					<Text className="mt-1 font-lexend tracking-tighter-lexend text-[#333]">
						{review.comment}
					</Text>
				</View>
			))}
		</View>
	);
};

interface RatingStarsProps {
	rating: number;
	size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
	rating,
	size = 16
}) => {
	return (
		<View className="flex-row">
			{[1, 2, 3, 4, 5].map((star) => (
				<Text
					key={star}
					style={{
						fontSize: size,
						color: star <= rating ? "#FED787" : "#CCCCCC"
					}}>
					★
				</Text>
			))}
		</View>
	);
};
