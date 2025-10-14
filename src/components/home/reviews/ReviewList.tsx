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
				<Text
					className="text-inactive text-center"
					fontName="Poppins_500Medium">
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
					className="border-b border-[#333333] p-2">
					<View className="flex-row items-center justify-between">
						<Text
							className="text-lg text-text"
							fontName="Montserrat_700Bold">
							{review.user_name || "Anonymous"}
						</Text>
						<Text
							className="text-sm text-[#cacbca]"
							fontName="Poppins_400Regular">
							{formatDate(review.created_at)}
						</Text>
					</View>
					<View className="flex-row items-center py-1">
						<RatingStars rating={review.rating} />
					</View>
					<Text
						className="mt-1 text-text"
						fontName="Poppins_400Regular">
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
					className="mb-2"
					key={star}
					style={{
						fontSize: size,
						color: star <= rating ? "#FED787" : "#CCCCCC"
					}}
					fontName="Poppins_700Bold">
					★
				</Text>
			))}
		</View>
	);
};
