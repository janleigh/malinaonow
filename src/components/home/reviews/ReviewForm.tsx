import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@shared/context/AuthContext";
import React, { useState } from "react";
import {
	ActivityIndicator,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import { BaseText as Text } from "../../BaseText";

interface ReviewFormProps {
	locationId: string;
	onSubmit: (rating: number, comment: string) => Promise<void>;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
	locationId,
	onSubmit
}) => {
	const { isSignedIn, user } = useAuth();
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const { t } = useTranslation();

	const handleSubmit = async () => {
		if (!isSignedIn) {
			setError("You must be signed in to leave a review");
			return;
		}

		if (rating < 1 || rating > 5) {
			setError("Please select a rating between 1 and 5");
			return;
		}

		if (!comment.trim()) {
			setError("Please enter a comment");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			await onSubmit(rating, comment);
			setRating(5);
			setComment("");
		} catch (err) {
			console.error("Error submitting review:", err);
			setError("Failed to submit review. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className="mt-4">
			<Text
				className="mb-2 font-lexend-bold text-lg tracking-tighter-lexend text-black"
				fontStyle="bold"
			>
				{t("review.writeReview")}
			</Text>
			<View className="space-y-4">
				<View>
					<Text className="mb-1 font-lexend text-sm tracking-tighter-lexend text-[#666666]">
						{t("review.rating")}
					</Text>
					<View className="mb-2 flex-row">
						{[1, 2, 3, 4, 5].map((star) => (
							<TouchableOpacity
								key={star}
								onPress={() => setRating(star)}
								className="mr-1"
							>
								<Text
									style={{
										fontSize: 28,
										color:
											star <= rating
												? "#FED787"
												: "#CCCCCC"
									}}
								>
									★
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
				<View className="border border-[#333333] bg-white p-4">
					<TextInput
						value={comment}
						onChangeText={setComment}
						placeholder={t("review.commentPlaceholder")}
						placeholderTextColor="#666666"
						className="font-lexend text-base text-black"
						multiline
						numberOfLines={4}
						textAlignVertical="top"
						style={{ height: 100 }}
					/>
				</View>
				{error ? (
					<Text className="font-lexend tracking-tighter-lexend text-red-500">
						{error}
					</Text>
				) : null}
				<TouchableOpacity
					className="mt-2 h-12 w-full items-center justify-center rounded-xl border border-[#333333] bg-[#FFBB38]"
					onPress={handleSubmit}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<ActivityIndicator color="#000" />
					) : (
						<Text
							className="font-lexend-medium text-base tracking-tighter-lexend text-black"
							fontStyle="medium"
						>
							{t("review.submit")}
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
};
