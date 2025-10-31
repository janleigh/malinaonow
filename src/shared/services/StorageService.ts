import { supabase } from "../api/supabase";
import { UploadResult } from "../types/storage";

/**
 * Safely extract file path from storage URL
 * @param {string} url - The full storage URL
 * @returns {string | null} - The file path or null if extraction fails
 */
export const extractFilePathFromUrl = (url: string): string | null => {
	try {
		const parsedUrl = new URL(url);
		const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
		// Ensure we have at least 3 parts for the path (entityType/entityId/filename)
		if (pathParts.length >= 3) {
			return pathParts.slice(-3).join("/");
		}
		return null;
	} catch (error) {
		console.error("Failed to parse URL:", error);
		return null;
	}
};

export interface IStorageService {
	uploadFile(
		file: any,
		entityType: string,
		entityId: string,
		fileType: string
	): Promise<UploadResult>;
	deleteFile(filePath: string): Promise<void>;
	listFiles(entityType: string, entityId: string): Promise<string[]>;
}

export const StorageService: IStorageService = {
	/**
	 * Upload a file to Supabase Storage
	 * @param file - The file to upload
	 * @param entityType - Type of entity (e.g., "locations", "products")
	 * @param entityId - ID of the entity
	 * @param fileType - Type of file (e.g., "banner", "360")
	 * @returns Promise with upload result
	 */
	async uploadFile(
		file: any,
		entityType: string,
		entityId: string,
		fileType: string
	): Promise<UploadResult> {
		try {
			// Generate unique filename with timestamp and random ID
			const timestamp = Date.now();
			const randomId = Math.random().toString(36).substring(2, 8);
			const fileExtension = file.name
				? file.name.split(".").pop()
				: file.uri
					? file.uri.split(".").pop()
					: "jpg";
			const fileName = `${fileType}-${timestamp}-${randomId}.${fileExtension}`;

			// Create file path: assets/{entityType}/{entityId}/{fileName}
			const filePath = `${entityType}/${entityId}/${fileName}`;

			// Determine content type
			let contentType = "image/jpeg"; // default
			if (file.type) {
				contentType = file.type;
			} else if (fileExtension.toLowerCase() === "png") {
				contentType = "image/png";
			} else if (fileExtension.toLowerCase() === "gif") {
				contentType = "image/gif";
			} else if (fileExtension.toLowerCase() === "webp") {
				contentType = "image/webp";
			}

			// Upload to Supabase Storage with proper content type
			const { data, error } = await supabase.storage
				.from("assets")
				.upload(filePath, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: contentType
				});

			if (error) {
				console.error("Upload error:", error);
				return {
					success: false,
					error: error.message
				};
			}

			// Get public URL
			const { data: urlData } = supabase.storage
				.from("assets")
				.getPublicUrl(filePath);

			return {
				success: true,
				url: urlData.publicUrl
			};
		} catch (error) {
			console.error("Upload exception:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Unknown error"
			};
		}
	},

	/**
	 * Delete a file from Supabase Storage
	 * @param filePath - Path to the file to delete
	 */
	async deleteFile(filePath: string): Promise<void> {
		try {
			const { error } = await supabase.storage
				.from("assets")
				.remove([filePath]);

			if (error) {
				console.error("Delete error:", error);
				throw error;
			}
		} catch (error) {
			console.error("Delete exception:", error);
			throw error;
		}
	},

	/**
	 * List files for an entity
	 * @param entityType - Type of entity
	 * @param entityId - ID of the entity
	 * @returns Array of file URLs
	 */
	async listFiles(
		entityType: string,
		entityId: string
	): Promise<string[]> {
		try {
			const { data, error } = await supabase.storage
				.from("assets")
				.list(`${entityType}/${entityId}`, {
					limit: 100,
					sortBy: { column: "created_at", order: "desc" }
				});

			if (error) {
				console.error("List error:", error);
				return [];
			}

			const urls = data.map((file) => {
				const { data: urlData } = supabase.storage
					.from("assets")
					.getPublicUrl(
						`${entityType}/${entityId}/${file.name}`
					);
				return urlData.publicUrl;
			});

			return urls;
		} catch (error) {
			console.error("List exception:", error);
			return [];
		}
	}
};
