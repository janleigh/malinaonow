import { supabase } from "@shared/api/supabase";
import { extractFilePathFromUrl, StorageService } from "@shared/services";
import {
	Location as CardLocation,
	Location as SupabaseLocation
} from "@shared/types/supabase";
import { CacheService } from "./CacheService";

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
				const cached =
					await CacheService.getItem<CardLocation[]>(
						"locations_all"
					);
				return cached || [];
			}

			const map = (data || []).map((location) =>
				this.mapToCardLocation(location)
			);
			CacheService.setItem("locations_all", map);
			return map;
		} catch (error) {
			console.error("Exception fetching locations:", error);
			const cached =
				await CacheService.getItem<CardLocation[]>(
					"locations_all"
				);
			return cached || [];
		}
	},

	/**
	 * what do you think it does?
	 */
	async getCachedLocations(): Promise<CardLocation[]> {
		return (
			(await CacheService.getItem<CardLocation[]>(
				"locations_all"
			)) || []
		);
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
	 * Create a new location with image uploads
	 * @param {Omit<SupabaseLocation, 'id'>} locationData - Location data without ID
	 * @param {File} bannerImage - Banner image file
	 * @param {File} image360 - 360° image file (optional)
	 * @returns {Promise<CardLocation>} - Created location
	 */
	async createLocation(
		locationData: Omit<SupabaseLocation, "id">,
		bannerImage?: any,
		image360?: any
	): Promise<CardLocation> {
		try {
			// First create the location record
			const { data: location, error: locationError } = await supabase
				.from("locations")
				.insert([locationData])
				.select()
				.single();

			if (locationError) throw locationError;

			const locationId = location.id;

			// Upload images if provided
			const updatedImageData: any = { ...locationData.image };

			if (bannerImage) {
				const uploadResult = await StorageService.uploadFile(
					bannerImage,
					"locations",
					locationId,
					"banner"
				);
				if (uploadResult.success) {
					updatedImageData.banner = uploadResult.url!;
				}
			}

			if (image360) {
				const uploadResult = await StorageService.uploadFile(
					image360,
					"locations",
					locationId,
					"360"
				);
				if (uploadResult.success) {
					updatedImageData["360"] = uploadResult.url!;
				}
			}

			// Update location with image URLs
			const { data: updatedLocation, error: updateError } =
				await supabase
					.from("locations")
					.update({ image: updatedImageData })
					.eq("id", locationId)
					.select()
					.single();

			if (updateError) throw updateError;

			// Clear cache to force refresh
			await CacheService.removeItem("locations_all");

			return this.mapToCardLocation(updatedLocation);
		} catch (error) {
			console.error("Error creating location:", error);
			throw error;
		}
	},

	/**
	 * Update a location with optional image uploads
	 * @param {string} id - Location ID
	 * @param {Partial<SupabaseLocation>} updates - Location updates
	 * @param {File} bannerImage - New banner image (optional)
	 * @param {File} image360 - New 360° image (optional)
	 * @returns {Promise<CardLocation>} - Updated location
	 */
	async updateLocation(
		id: string,
		updates: Partial<SupabaseLocation>,
		bannerImage?: any,
		image360?: any
	): Promise<CardLocation> {
		try {
			// First get the existing location to retrieve old image URLs
			const existingLocation = await this.getLocationById(id);
			if (!existingLocation) {
				throw new Error("Location not found");
			}

			let updatedImageData = updates.image || {
				"banner": "",
				"360": ""
			};

			// Upload new banner image and delete old one if provided
			if (bannerImage) {
				// Delete old banner image if it exists
				if (existingLocation.image.banner) {
					const filePath = extractFilePathFromUrl(
						existingLocation.image.banner
					);
					if (filePath) {
						try {
							await StorageService.deleteFile(filePath);
						} catch (error) {
							console.warn(
								"Failed to delete old banner image:",
								error
							);
						}
					}
				}

				const uploadResult = await StorageService.uploadFile(
					bannerImage,
					"locations",
					id,
					"banner"
				);
				if (uploadResult.success) {
					updatedImageData = {
						...updatedImageData,
						banner: uploadResult.url!
					};
				}
			}

			// Upload new 360 image and delete old one if provided
			if (image360) {
				// Delete old 360 image if it exists
				if (existingLocation.image[360]) {
					const filePath = extractFilePathFromUrl(
						existingLocation.image[360]
					);
					if (filePath) {
						try {
							await StorageService.deleteFile(filePath);
						} catch (error) {
							console.warn(
								"Failed to delete old 360 image:",
								error
							);
						}
					}
				}

				const uploadResult = await StorageService.uploadFile(
					image360,
					"locations",
					id,
					"360"
				);
				if (uploadResult.success) {
					updatedImageData = {
						...updatedImageData,
						"360": uploadResult.url!
					};
				}
			}

			// Update location with new data
			const finalUpdates = updatedImageData
				? { ...updates, image: updatedImageData }
				: updates;

			const { data: location, error } = await supabase
				.from("locations")
				.update(finalUpdates)
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;

			// Clear cache to force refresh
			await CacheService.removeItem("locations_all");

			return this.mapToCardLocation(location);
		} catch (error) {
			console.error("Error updating location:", error);
			throw error;
		}
	},

	/**
	 * Delete a location and its associated images
	 * @param {string} id - Location ID
	 * @returns {Promise<void>}
	 */
	async deleteLocation(id: string): Promise<void> {
		try {
			// First get the location to find associated images
			const location = await this.getLocationById(id);
			if (!location) throw new Error("Location not found");

			// Delete images from storage
			if (location.image.banner) {
				try {
					const { pathname } = new URL(location.image.banner);
					const filePath = pathname
						.split("/")
						.slice(-3)
						.join("/");
					await StorageService.deleteFile(filePath);
				} catch (error) {
					console.warn("Failed to delete banner image:", error);
				}
			}

			if (location.image[360]) {
				try {
					const { pathname } = new URL(location.image[360]);
					const filePath = pathname
						.split("/")
						.slice(-3)
						.join("/");
					await StorageService.deleteFile(filePath);
				} catch (error) {
					console.warn("Failed to delete 360 image:", error);
				}
			}

			// Delete multiple images from storage
			if (location.images && location.images.length > 0) {
				for (const imageUrl of location.images) {
					try {
						const { pathname } = new URL(imageUrl);
						const filePath = pathname
							.split("/")
							.slice(-3)
							.join("/");
						await StorageService.deleteFile(filePath);
					} catch (error) {
						console.warn(
							"Failed to delete location image:",
							error
						);
					}
				}
			}

			// Delete the location record
			const { error } = await supabase
				.from("locations")
				.delete()
				.eq("id", id);

			if (error) throw error;

			// Clear cache
			await CacheService.removeItem("locations_all");
		} catch (error) {
			console.error("Error deleting location:", error);
			throw error;
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
			images: location.images || [],
			coordinates: location.coordinates,
			description: location.description,
			description_fil: location.description_fil || "",
			description_akl: location.description_akl || "",
			rating: location.rating || 0,
			review_count: location.review_count || 0
		};
	}
};
