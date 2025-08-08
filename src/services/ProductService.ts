import { supabase } from "@/api/supabase/supabase";
import {
	CreateProductDTO,
	Product,
	UpdateProductDTO
} from "@/lib/types/supabase";

export const ProductService = {
	/**
	 * Fetch all products
	 * @returns {Promise<Product[]>} - A promise that resolves to an array of Product objects
	 */
	async getAllProducts(): Promise<Product[]> {
		try {
			const { data, error } = await supabase
				.from("products")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching products:", error);
				return [];
			}

			return (data || []) as Product[];
		} catch (error) {
			console.error("Exception fetching products:", error);
			return [];
		}
	},

	/**
	 * Fetch a product by ID
	 * @param {string} id - The ID of the product to fetch
	 * @return {Promise<Product | null>} - A promise that resolves to a Product object or null if not found
	 */
	async getProductById(id: string): Promise<Product | null> {
		try {
			const { data, error } = await supabase
				.from("products")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
				console.error("Error fetching product:", error);
				return null;
			}

			return data as Product;
		} catch (error) {
			console.error("Exception fetching product:", error);
			return null;
		}
	},

	/**
	 * Create a new product
	 * @param {CreateProductDTO} product - The product data to create
	 * @return {Promise<Product>} - A promise that resolves to the created Product
	 */
	async createProduct(product: CreateProductDTO): Promise<Product> {
		try {
			const { data, error } = await supabase
				.from("products")
				.insert([product])
				.select()
				.single();

			if (error) {
				console.error("Error creating product:", error);
				throw error;
			}

			return data as Product;
		} catch (error) {
			console.error("Exception creating product:", error);
			throw error;
		}
	},

	/**
	 * Update an existing product
	 * @param {string} id - The ID of the product to update
	 * @param {UpdateProductDTO} updates - The fields to update
	 * @return {Promise<Product>} - A promise that resolves to the updated Product
	 */
	async updateProduct(
		id: string,
		updates: UpdateProductDTO
	): Promise<Product> {
		try {
			const { data, error } = await supabase
				.from("products")
				.update({
					...updates,
					updated_at: new Date().toISOString()
				})
				.eq("id", id)
				.select()
				.single();

			if (error) {
				console.error("Error updating product:", error);
				throw error;
			}

			return data as Product;
		} catch (error) {
			console.error("Exception updating product:", error);
			throw error;
		}
	},

	/**
	 * Delete a product
	 * @param {string} id - The ID of the product to delete
	 * @return {Promise<void>}
	 */
	async deleteProduct(id: string): Promise<void> {
		try {
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", id);

			if (error) {
				console.error("Error deleting product:", error);
				throw error;
			}
		} catch (error) {
			console.error("Exception deleting product:", error);
			throw error;
		}
	},

	/**
	 * Subscribe to product changes
	 * @param callback - Function to call when products change
	 * @returns {() => void} - Function to unsubscribe
	 */
	subscribeToProducts(callback: (payload: any) => void) {
		const subscription = supabase
			.channel("products")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "products"
				},
				(payload) => {
					console.log("Product change received:", payload);
					callback(payload);
				}
			)
			.subscribe();

		// Return unsubscribe function
		return () => {
			supabase.removeChannel(subscription);
		};
	}
};
