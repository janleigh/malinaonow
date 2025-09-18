import { useAuth } from "@/lib/context/AuthContext";
import { useTranslation } from "@/lib/context/TranslationContext";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";

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
			<Text className="text-lg font-lexend-bold tracking-tighter-lexend text-black mb-2">
				{t("review.writeReview")}
			</Text>
			<View className="space-y-4">
				<View>
					<Text className="mb-1 text-sm font-lexend tracking-tighter-lexend text-[#666666]">
						{t("review.rating")}
					</Text>
					<View className="flex-row mb-2">
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
				<View
					className="bg-white p-4 border border-[#333333]"
					
				>
					<TextInput
						value={comment}
						onChangeText={setComment}
						placeholder={t("review.commentPlaceholder")}
						placeholderTextColor="#666666"
						className="text-base font-lexend text-black"
						multiline
						numberOfLines={4}
						textAlignVertical="top"
						style={{ height: 100 }}
					/>
				</View>
				{error ? (
					<Text className="text-red-500 font-lexend tracking-tighter-lexend">
						{error}
					</Text>
				) : null}
				<TouchableOpacity
					className="h-12 mt-2 w-full items-center justify-center bg-[#FFBB38] border border-[#333333] rounded-xl"
				
					onPress={handleSubmit}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<ActivityIndicator color="#000" />
					) : (
						<Text className="text-base font-lexend-medium tracking-tighter-lexend text-black">
							{t("review.submit")}
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
};
