import { Event as ComponentEvent } from "@/components/home";
import { supabase } from "@shared/api/supabase";
import { extractFilePathFromUrl, StorageService } from "@shared/services";
import { Event as SupabaseEvent } from "@shared/types/supabase";

export const EventService = {
	// Track the last time past due events were cleaned up
	_lastCleanupTime: 0,
	_CLEANUP_INTERVAL_MS: 60 * 60 * 1000, // 1 hour

	/**
	 * Fetch all events
	 * @returns {Promise<ComponentEvent[]>} - A promise that resolves to an array of ComponentEvent objects
	 */
	async getEvents(): Promise<ComponentEvent[]> {
		try {
			// Only clean up past due events if enough time has passed since last cleanup
			const now = Date.now();
			if (now - this._lastCleanupTime > this._CLEANUP_INTERVAL_MS) {
				await this.deletePastDueEvents();
				this._lastCleanupTime = now;
			}

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
				// First get the existing event to retrieve old banner image URL
				const { data: existingEvent, error: fetchError } =
					await supabase
						.from("events")
						.select("banner_image")
						.eq("id", id)
						.single();

				if (fetchError)
					throw new Error(
						"Event not found: " + fetchError.message
					);

				// Delete old banner image if it exists
				if (existingEvent?.banner_image) {
					const filePath = extractFilePathFromUrl(
						existingEvent.banner_image
					);
					if (filePath) {
						try {
							await StorageService.deleteFile(filePath);
						} catch (error) {
							console.warn(
								"Failed to delete old event banner image:",
								error
							);
						}
					}
				}

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
				const filePath = extractFilePathFromUrl(
					event.banner_image
				);
				if (filePath) {
					try {
						await StorageService.deleteFile(filePath);
					} catch (error) {
						console.warn(
							"Failed to delete event banner image:",
							error
						);
					}
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
	 * Delete all past due events (events where date is before today)
	 * @returns {Promise<number>} - Number of events deleted
	 */
	async deletePastDueEvents(): Promise<number> {
		try {
			// Get current date in YYYY-MM-DD format (UTC)
			const todayString = new Date().toISOString().split("T")[0];

			// Fetch all past due events
			const { data: pastEvents, error: fetchError } = await supabase
				.from("events")
				.select("*")
				.lt("date", todayString);

			if (fetchError) {
				console.error(
					"Error fetching past due events:",
					fetchError
				);
				return 0;
			}

			if (!pastEvents || pastEvents.length === 0) {
				console.log("No past due events to delete");
				return 0;
			}

			// Delete each event and its associated banner image
			let deletedCount = 0;
			for (const event of pastEvents) {
				try {
					// Delete banner image from storage if it exists
					if (event.banner_image) {
						const filePath = extractFilePathFromUrl(
							event.banner_image
						);
						if (filePath) {
							try {
								await StorageService.deleteFile(filePath);
							} catch (error) {
								console.warn(
									`Failed to delete banner image for event ${event.id}:`,
									error
								);
							}
						}
					}

					// Delete the event record
					const { error: deleteError } = await supabase
						.from("events")
						.delete()
						.eq("id", event.id);

					if (deleteError) {
						console.error(
							`Failed to delete event ${event.id}:`,
							deleteError
						);
					} else {
						deletedCount++;
					}
				} catch (error) {
					console.error(
						`Exception deleting event ${event.id}:`,
						error
					);
				}
			}

			console.log(
				`Successfully deleted ${deletedCount} past due events`
			);
			return deletedCount;
		} catch (error) {
			console.error("Error in deletePastDueEvents:", error);
			return 0;
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
