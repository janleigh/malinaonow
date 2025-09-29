import { supabase } from "@shared/api/supabase";
import {
	CreateProductDTO,
	Product,
	UpdateProductDTO
} from "@shared/types/supabase";
import { CacheService } from ".";
import { StorageService } from "@shared/api/supabase/storage";

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
				const cached =
					await CacheService.getItem<Product[]>("products_all");
				return cached || [];
			}

			const list = (data || []) as Product[];
			CacheService.setItem("products_all", list);
			return list;
		} catch (error) {
			console.error("Exception fetching products:", error);
			const cached =
				await CacheService.getItem<Product[]>("products_all");
			return cached || [];
		}
	},

	/**
	 * what do you think it does again?
	 */
	async getCachedProducts(): Promise<Product[]> {
		return (
			(await CacheService.getItem<Product[]>("products_all")) || []
		);
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
	 * Create a new product with image uploads
	 * @param {CreateProductDTO} productData - Product data without ID
	 * @param {File} mainImage - Main product image file
	 * @param {File[]} additionalImages - Additional product image files (optional)
	 * @returns {Promise<Product>} - Created product
	 */
	async createProduct(
		productData: CreateProductDTO,
		mainImage?: any,
		additionalImages?: any[]
	): Promise<Product> {
		try {
			// First create the product record
			const { data: product, error: productError } = await supabase
				.from("products")
				.insert([productData])
				.select()
				.single();

			if (productError) throw productError;

			const productId = product.id;
			let updatedProductData = { ...productData };

			// Upload main image if provided
			if (mainImage) {
				const uploadResult = await StorageService.uploadFile(
					mainImage,
					"products",
					productId,
					"main"
				);
				if (uploadResult.success) {
					updatedProductData.image_url = uploadResult.url!;
				}
			}

			// Upload additional images if provided
			if (additionalImages && additionalImages.length > 0) {
				const additionalImageUrls: string[] = [];

				for (let i = 0; i < additionalImages.length; i++) {
					const uploadResult = await StorageService.uploadFile(
						additionalImages[i],
						"products",
						productId,
						`additional-${i + 1}`
					);
					if (uploadResult.success) {
						additionalImageUrls.push(uploadResult.url!);
					}
				}

				updatedProductData.images = additionalImageUrls;
			}

			// Update product with image URLs
			const { data: updatedProduct, error: updateError } = await supabase
				.from("products")
				.update(updatedProductData)
				.eq("id", productId)
				.select()
				.single();

			if (updateError) throw updateError;

			// Clear cache to force refresh
			await CacheService.removeItem("products_all");

			return updatedProduct as Product;
		} catch (error) {
			console.error("Error creating product:", error);
			throw error;
		}
	},

	/**
	 * Update a product with optional image uploads
	 * @param {string} id - Product ID
	 * @param {UpdateProductDTO} updates - Product updates
	 * @param {File} mainImage - New main image (optional)
	 * @param {File[]} additionalImages - New additional images (optional)
	 * @returns {Promise<Product>} - Updated product
	 */
	async updateProduct(
		id: string,
		updates: UpdateProductDTO,
		mainImage?: any,
		additionalImages?: any[]
	): Promise<Product> {
		try {
			let updatedImageData = {
				image_url: updates.image_url || "",
				images: updates.images || []
			};

			// Upload new main image if provided
			if (mainImage) {
				const uploadResult = await StorageService.uploadFile(
					mainImage,
					"products",
					id,
					"main"
				);
				if (uploadResult.success) {
					updatedImageData.image_url = uploadResult.url!;
				}
			}

			// Upload new additional images if provided
			if (additionalImages && additionalImages.length > 0) {
				const additionalImageUrls: string[] = [];

				for (let i = 0; i < additionalImages.length; i++) {
					const uploadResult = await StorageService.uploadFile(
						additionalImages[i],
						"products",
						id,
						`additional-${i + 1}`
					);
					if (uploadResult.success) {
						additionalImageUrls.push(uploadResult.url!);
					}
				}

				updatedImageData.images = additionalImageUrls;
			}

			// Update product with new data
			const finalUpdates = updatedImageData.image_url || updatedImageData.images.length > 0
				? { ...updates, ...updatedImageData }
				: updates;

			const { data: product, error } = await supabase
				.from("products")
				.update({
					...finalUpdates,
					updated_at: new Date().toISOString()
				})
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;

			// Clear cache to force refresh
			await CacheService.removeItem("products_all");

			return product as Product;
		} catch (error) {
			console.error("Error updating product:", error);
			throw error;
		}
	},

	/**
	 * Delete a product and its associated images
	 * @param {string} id - Product ID
	 * @returns {Promise<void>}
	 */
	async deleteProduct(id: string): Promise<void> {
		try {
			// First get the product to find associated images
			const product = await this.getProductById(id);
			if (!product) throw new Error("Product not found");

			// Delete main image from storage
			if (product.image_url) {
				try {
					const url = new URL(product.image_url);
					const pathParts = url.pathname.split('/');
					const filePath = pathParts.slice(-3).join('/');
					await StorageService.deleteFile(filePath);
				} catch (error) {
					console.warn("Failed to delete main product image:", error);
				}
			}

			// Delete the product record
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", id);

			if (error) throw error;

			// Clear cache
			await CacheService.removeItem("products_all");
		} catch (error) {
			console.error("Error deleting product:", error);
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
