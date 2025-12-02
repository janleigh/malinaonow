import { Location } from "@shared/types/supabase";
import { ReviewService } from "@shared/services/ReviewService";

/**
 * Sorts items using the following hierarchy:
 * 1. Rating — highest first
 * 2. Review count — highest first (only when ratings are equal)
 * 3. Name — alphabetical A → Z (only when both rating and review count match)
 *
 * @param items - Array of items to sort (Location objects)
 * @returns Sorted array following the sorting rules
 */
export function sortByRatingReviewsAndName<
	T extends {
		rating?: number;
		review_count?: number;
		name: string;
	}
>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const ratingA = a.rating ?? 0;
		const ratingB = b.rating ?? 0;
		const reviewCountA = a.review_count ?? 0;
		const reviewCountB = b.review_count ?? 0;

		// 1. Sort by rating (highest first)
		if (ratingA !== ratingB) {
			return ratingB - ratingA;
		}

		// 2. Sort by review count (highest first, when ratings are equal)
		if (reviewCountA !== reviewCountB) {
			return reviewCountB - reviewCountA;
		}

		// 3. Sort by name (alphabetical A → Z, when both rating and review count match)
		return a.name.localeCompare(b.name);
	});
}

/**
 * Sorts locations specifically with computed ratings from reviews
 * @param locations - Array of locations to sort
 * @returns Promise that resolves to sorted locations with computed ratings
 */
export async function sortLocations(
	locations: Location[]
): Promise<Location[]> {
	// Enhance locations with computed ratings and review counts
	const enhancedLocations = await Promise.all(
		locations.map(async (location) => {
			const reviews = await ReviewService.getReviews(location.id);
			const avgRating =
				ReviewService.calculateAverageRating(reviews);
			const reviewCount = reviews.length;

			return {
				...location,
				rating: avgRating,
				review_count: reviewCount
			};
		})
	);

	// Sort by the computed values
	return sortByRatingReviewsAndName(enhancedLocations);
}
