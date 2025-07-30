import { supabase } from "@/api/supabase";
import { Event as ComponentEvent } from "@/components/home";
import { Event as SupabaseEvent } from "@/lib/types/supabase";

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

			return (data || []).map(event => this.mapToComponentEvent(event));
		} catch (error) {
			console.error("Exception fetching events:", error);
			return [];
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
			title: event.name,
			date: event.date,
			time: event.time,
			location: event.location,
			image: event.banner_image
		};
	}
};
