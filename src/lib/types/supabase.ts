export interface Event {
	id: string;
	name: string;
	date: string;
	time: string;
	location: string;
	banner_image: string;
}

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
	description_fil?: string;
	description_akl?: string;
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
	flagged?: boolean;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	image_url: string;
	images?: string[];
	details?: string;
	barangay: string;
	is_available: boolean;
	created_at: string;
	updated_at?: string;
}

export interface CreateProductDTO
	extends Omit<Product, "id" | "created_at" | "updated_at"> {}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}
