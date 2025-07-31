import AsyncStorage from "@react-native-async-storage/async-storage";

const BOOKMARK_STORAGE_KEY = "malinaonow_bookmarks";

export const BookmarkService = {
	/**
	 * Get all bookmarked location IDs for the current user
	 * @param {string} userId - The ID of the current user
	 * @returns {Promise<string[]>} - A promise that resolves to an array of bookmarked location IDs
	 */
	async getBookmarks(userId: string): Promise<string[]> {
		try {
			const bookmarksJson = await AsyncStorage.getItem(`${BOOKMARK_STORAGE_KEY}_${userId}`);
			return bookmarksJson ? JSON.parse(bookmarksJson) : [];
		} catch (error) {
			console.error("Error retrieving bookmarks:", error);
			return [];
		}
	},

	/**
	 * Add a location to bookmarks
	 * @param {string} userId - The ID of the current user
	 * @param {string} locationId - The ID of the location to bookmark
	 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success
	 */
	async addBookmark(userId: string, locationId: string): Promise<boolean> {
		try {
			const bookmarks = await this.getBookmarks(userId);
			if (!bookmarks.includes(locationId)) {
				bookmarks.push(locationId);
				await AsyncStorage.setItem(`${BOOKMARK_STORAGE_KEY}_${userId}`, JSON.stringify(bookmarks));
			}
			return true;
		} catch (error) {
			console.error("Error adding bookmark:", error);
			return false;
		}
	},

	/**
	 * Remove a location from bookmarks
	 * @param {string} userId - The ID of the current user
	 * @param {string} locationId - The ID of the location to remove from bookmarks
	 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success
	 */
	async removeBookmark(userId: string, locationId: string): Promise<boolean> {
		try {
			const bookmarks = await this.getBookmarks(userId);
			const updatedBookmarks = bookmarks.filter((id) => id !== locationId);
			await AsyncStorage.setItem(`${BOOKMARK_STORAGE_KEY}_${userId}`, JSON.stringify(updatedBookmarks));
			return true;
		} catch (error) {
			console.error("Error removing bookmark:", error);
			return false;
		}
	},

	/**
	 * Check if a location is bookmarked
	 * @param {string} userId - The ID of the current user
	 * @param {string} locationId - The ID of the location to check
	 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the location is bookmarked
	 */
	async isBookmarked(userId: string, locationId: string): Promise<boolean> {
		try {
			const bookmarks = await this.getBookmarks(userId);
			return bookmarks.includes(locationId);
		} catch (error) {
			console.error("Error checking bookmark status:", error);
			return false;
		}
	}
};
