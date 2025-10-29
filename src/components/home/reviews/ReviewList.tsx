import { useTranslation } from "@/hooks/useTranslation";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@shared/context/AuthContext";
import { ReviewService } from "@shared/services";
import { Review } from "@shared/types/supabase";
import { formatDate } from "@shared/utils/date";
import React, { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { BaseText as Text } from "../../BaseText";

interface ReviewListProps {
	reviews: Review[];
	onReviewDeleted?: (reviewId: string) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
	reviews,
	onReviewDeleted
}) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [deletingReviewId, setDeletingReviewId] = useState<
		string | null
	>(null);

	const handleDeleteReview = async (reviewId: string) => {
		Alert.alert(
			t("review.deleteTitle") || "Delete Review",
			t("review.deleteConfirm") ||
				"Are you sure you want to delete this review?",
			[
				{
					text: t("common.cancel") || "Cancel",
					style: "cancel"
				},
				{
					text: t("review.delete") || "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							setDeletingReviewId(reviewId);
							const success =
								await ReviewService.deleteReview(reviewId);

							if (success) {
								onReviewDeleted?.(reviewId);
							} else {
								Alert.alert(
									t("common.error") || "Error",
									t("review.deleteFailed") ||
										"Failed to delete review. Please try again."
								);
							}
						} catch (error) {
							console.error("Error deleting review:", error);
							Alert.alert(
								t("common.error") || "Error",
								t("review.deleteFailed") ||
									"Failed to delete review. Please try again."
							);
						} finally {
							setDeletingReviewId(null);
						}
					}
				}
			]
		);
	};

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
			{reviews.map((review) => {
				const isOwnReview = user && review.user_id === user.id;

				return (
					<View
						key={review.id}
						className="border-b border-[#333333] p-2">
						<View className="flex-row items-center justify-between">
							<Text
								className="text-lg text-text"
								fontName="Montserrat_700Bold">
								{review.user_name || "Anonymous"}
							</Text>
							<View className="flex-row items-center">
								<Text
									className="text-sm text-[#cacbca]"
									fontName="Poppins_400Regular">
									{formatDate(review.created_at)}
								</Text>
								{isOwnReview && (
									<TouchableOpacity
										onPress={() =>
											handleDeleteReview(review.id)
										}
										disabled={
											deletingReviewId === review.id
										}
										className="ml-2 p-1">
										<Feather
											name="trash-2"
											size={16}
											color={
												deletingReviewId ===
												review.id
													? "#666666"
													: "#cacbca"
											}
										/>
									</TouchableOpacity>
								)}
							</View>
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
				);
			})}
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
