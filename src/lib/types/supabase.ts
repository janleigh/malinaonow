export interface Location {
	id: string;
	name: string;
	address: {
		street?: string;
		barangay?: string;
		town?: string;
	};
	image: {
		banner: string;
		360?: string;
	};
	coordinates: {
		latitude: number;
		longitude: number;
	};
	description: string;
	rating?: number;
	review_count?: number;
}

export interface Review {
	id: string;
	location_id: string;
	user_id: string; // Courtesy of Clerk User IDs
	user_name?: string; // User's display name
	rating: number;
	comment: string;
	created_at: string;
}
