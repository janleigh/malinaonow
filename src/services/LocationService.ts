import { supabase } from "@/api/supabase";
import {
	Location as CardLocation,
	Location as SupabaseLocation
} from "@/lib/types/supabase";

export const LocationService = {
	/**
	 * Fetch all locations
	 * @returns {Promise<CardLocation[]>} - A promise that resolves to an array of CardLocation objects
	 */
	async getLocations(): Promise<CardLocation[]> {
		try {
			const { data, error } = await supabase
				.from("locations")
				.select("*")
				.order("name");

			if (error) {
				console.error("Error fetching locations:", error);
				return [];
			}

			return (data || []).map((location) =>
				this.mapToCardLocation(location)
			);
		} catch (error) {
			console.error("Exception fetching locations:", error);
			return [];
		}
	},

	/**
	 * Fetch a location by ID
	 * @param {string} [id] - The ID of the location to fetch
	 * @return {Promise<CardLocation | null>} - A promise that resolves to a CardLocation object or null if not found
	 */
	async getLocationById(id: string): Promise<CardLocation | null> {
		try {
			const { data, error } = await supabase
				.from("locations")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
				console.error("Error fetching location:", error);
				return null;
			}

			return data ? this.mapToCardLocation(data) : null;
		} catch (error) {
			console.error("Exception fetching location:", error);
			return null;
		}
	},

	/**
	 * Maps a Supabase location to the format expected by LocationCard
	 * @param {SupabaseLocation} [location] - The location data from Supabase
	 * @return {CardLocation} - The mapped CardLocation object
	 */
	mapToCardLocation(location: SupabaseLocation): CardLocation {
		return {
			id: location.id,
			name: location.name,
			address: location.address,
			image: {
				banner: location.image.banner,
				360: location.image["360"] || ""
			},
			coordinates: location.coordinates,
			description: location.description
		};
	}
};
