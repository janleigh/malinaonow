import { supabase } from "@/api/supabase";
import { Review } from "@/lib/types/supabase";

export const ReviewService = {
	/**
	 * Fetch reviews for a specific location
	 * @param {string} locationId - The ID of the location
	 * @returns {Promise<Review[]>} - A promise that resolves to an array of Review objects
	 */
	async getReviews(locationId: string): Promise<Review[]> {
		try {
			const { data, error } = await supabase
				.from("reviews")
				.select("*")
				.eq("location_id", locationId)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching reviews:", error);
				return [];
			}

			return data || [];
		} catch (error) {
			console.error("Exception fetching reviews:", error);
			return [];
		}
	},

	/**
	 * Add a new review for a location
	 * @param {Omit<Review, 'id' | 'created_at'>} review - The review data
	 * @returns {Promise<Review | null>} - A promise that resolves to the created Review or null
	 */
	async addReview(
		review: Omit<Review, "id" | "created_at">
	): Promise<Review | null> {
		try {
			const { data, error } = await supabase
				.from("reviews")
				.insert([review])
				.select()
				.single();

			if (error) {
				console.error("Error adding review:", error);
				return null;
			}

			return data;
		} catch (error) {
			console.error("Exception adding review:", error);
			return null;
		}
	},

	/**
	 * Calculate average rating for a location
	 * @param {Review[]} reviews - Array of reviews
	 * @returns {number} - Average rating (0-5)
	 */
	calculateAverageRating(reviews: Review[]): number {
		if (reviews.length === 0) return 0;

		const sum = reviews.reduce(
			(acc, review) => acc + review.rating,
			0
		);
		return Number((sum / reviews.length).toFixed(1));
	}
};
