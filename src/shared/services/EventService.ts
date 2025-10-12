import { Event as ComponentEvent } from "@/components/home";
import { supabase } from "@shared/api/supabase";
import { StorageService } from "@shared/services";
import { Event as SupabaseEvent } from "@shared/types/supabase";

export const EventService = {
	/**
	 * Fetch all events
	 * @returns {Promise<ComponentEvent[]>} - A promise that resolves to an array of ComponentEvent objects
	 */
	async getEvents(): Promise<ComponentEvent[]> {
		try {
			const { data, error } = await supabase
				.from("events")
				.select("*")
				.order("date");

			if (error) {
				console.error("Error fetching events:", error);
				return [];
			}

			return (data || []).map((event) =>
				this.mapToComponentEvent(event)
			);
		} catch (error) {
			console.error("Exception fetching events:", error);
			return [];
		}
	},

	/**
	 * Create a new event with banner image upload
	 * @param {Omit<SupabaseEvent, 'id' | 'created_at' | 'updated_at'>} eventData - Event data without ID and timestamps
	 * @param {File} bannerImage - Banner image file (optional)
	 * @returns {Promise<ComponentEvent>} - Created event
	 */
	async createEvent(
		eventData: Omit<SupabaseEvent, "id" | "created_at" | "updated_at">,
		bannerImage?: any
	): Promise<ComponentEvent> {
		try {
			// First create the event record
			const { data: event, error: eventError } = await supabase
				.from("events")
				.insert([eventData])
				.select()
				.single();

			if (eventError) throw eventError;

			const eventId = event.id;
			let updatedEventData = { ...eventData };

			// Upload banner image if provided
			if (bannerImage) {
				const uploadResult = await StorageService.uploadFile(
					bannerImage,
					"events",
					eventId,
					"banner"
				);
				if (uploadResult.success) {
					updatedEventData.banner_image = uploadResult.url!;
				}
			}

			// Update event with banner image URL
			const { data: updatedEvent, error: updateError } =
				await supabase
					.from("events")
					.update(updatedEventData)
					.eq("id", eventId)
					.select()
					.single();

			if (updateError) throw updateError;

			return this.mapToComponentEvent(updatedEvent as SupabaseEvent);
		} catch (error) {
			console.error("Error creating event:", error);
			throw error;
		}
	},

	/**
	 * Update an event with optional banner image upload
	 * @param {string} id - Event ID
	 * @param {Partial<SupabaseEvent>} updates - Event updates
	 * @param {File} bannerImage - New banner image (optional)
	 * @returns {Promise<ComponentEvent>} - Updated event
	 */
	async updateEvent(
		id: string,
		updates: Partial<SupabaseEvent>,
		bannerImage?: any
	): Promise<ComponentEvent> {
		try {
			let updatedImageData = {
				banner_image: updates.banner_image || ""
			};

			// Upload new banner image if provided
			if (bannerImage) {
				const uploadResult = await StorageService.uploadFile(
					bannerImage,
					"events",
					id,
					"banner"
				);
				if (uploadResult.success) {
					updatedImageData.banner_image = uploadResult.url!;
				}
			}

			// Update event with new data
			const finalUpdates = updatedImageData.banner_image
				? { ...updates, ...updatedImageData }
				: updates;

			const { data: event, error } = await supabase
				.from("events")
				.update(finalUpdates)
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;

			return this.mapToComponentEvent(event as SupabaseEvent);
		} catch (error) {
			console.error("Error updating event:", error);
			throw error;
		}
	},

	/**
	 * Delete an event and its associated banner image
	 * @param {string} id - Event ID
	 * @returns {Promise<void>}
	 */
	async deleteEvent(id: string): Promise<void> {
		try {
			// First get the event to find associated banner image
			const { data: event, error: fetchError } = await supabase
				.from("events")
				.select("banner_image")
				.eq("id", id)
				.single();

			if (fetchError) throw fetchError;

			// Delete banner image from storage if it exists
			if (event.banner_image) {
				try {
					const url = new URL(event.banner_image);
					const pathParts = url.pathname.split("/");
					const filePath = pathParts.slice(-3).join("/");
					await StorageService.deleteFile(filePath);
				} catch (error) {
					console.warn(
						"Failed to delete event banner image:",
						error
					);
				}
			}

			// Delete the event record
			const { error } = await supabase
				.from("events")
				.delete()
				.eq("id", id);

			if (error) throw error;
		} catch (error) {
			console.error("Error deleting event:", error);
			throw error;
		}
	},

	/**
	 * Maps a Supabase event to the format expected by EventCard
	 * @param {SupabaseEvent} event - The event data from Supabase
	 * @return {ComponentEvent} - The mapped ComponentEvent object
	 */
	mapToComponentEvent(event: SupabaseEvent): ComponentEvent {
		return {
			id: event.id,
			name: event.name,
			date: event.date,
			time: event.time,
			location: event.location,
			banner_image: event.banner_image
		};
	}
};
