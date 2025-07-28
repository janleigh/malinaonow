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
}

export interface Review {
	id: string;
	location_id: string;
	username: string;
	rating: number;
	comment: string;
	created_at: string;
}
