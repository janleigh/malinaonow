import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RouteData {
	origin: {
		latitude: number;
		longitude: number;
	};
	destination: {
		latitude: number;
		longitude: number;
	};
	distance?: string;
	duration?: string;
	timestamp: number;
}

interface CachedRoute {
	locationId: string;
	route: RouteData;
}

/**
 * Service for caching map route data for offline use
 */
export const MapRouteService = {
	/**
	 * Save a route for a location
	 * @param locationId - The ID of the location
	 * @param routeData - The route data to cache
	 */
	async saveRoute(
		locationId: string,
		routeData: RouteData
	): Promise<void> {
		try {
			const key = `map_route_${locationId}`;
			const cacheData: CachedRoute = {
				locationId,
				route: routeData
			};
			await AsyncStorage.setItem(key, JSON.stringify(cacheData));
		} catch (error) {
			console.error("Error saving route:", error);
		}
	},

	/**
	 * Get a cached route for a location
	 * @param locationId - The ID of the location
	 * @returns The cached route data or null if not found
	 */
	async getRoute(locationId: string): Promise<RouteData | null> {
		try {
			const key = `map_route_${locationId}`;
			const data = await AsyncStorage.getItem(key);
			if (!data) return null;

			const cached: CachedRoute = JSON.parse(data);
			return cached.route;
		} catch (error) {
			console.error("Error getting route:", error);
			return null;
		}
	},

	/**
	 * Clear cached route for a location
	 * @param locationId - The ID of the location
	 */
	async clearRoute(locationId: string): Promise<void> {
		try {
			const key = `map_route_${locationId}`;
			await AsyncStorage.removeItem(key);
		} catch (error) {
			console.error("Error clearing route:", error);
		}
	},

	/**
	 * Clear all cached routes
	 */
	async clearAllRoutes(): Promise<void> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			const routeKeys = keys.filter((key) =>
				key.startsWith("map_route_")
			);
			await AsyncStorage.multiRemove(routeKeys);
		} catch (error) {
			console.error("Error clearing all routes:", error);
		}
	}
};
