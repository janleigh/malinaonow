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
