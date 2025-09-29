import AsyncStorage from "@react-native-async-storage/async-storage";

// God bless TypeScript generics
interface CachedEntry<T = any> {
	d: T;
	ts: number;
}

// I will not explain this.
export const CacheService = {
	async getItem<T>(k: string, maxAge = 3_600_000): Promise<T | null> {
		try {
			const r = await AsyncStorage.getItem(`cache_${k}`);
			if (!r) return null;

			const p: CachedEntry<T> = JSON.parse(r);
			if (Date.now() - p.ts > maxAge) return p.d;

			return p.d;
		} catch (err) {
			console.error("Error (CacheService.getItem)", err);
			return null;
		}
	},
	async setItem<T>(k: string, d: T): Promise<void> {
		try {
			const e: CachedEntry<T> = { d, ts: Date.now() };
			await AsyncStorage.setItem(`cache_${k}`, JSON.stringify(e));
		} catch (err) {
			console.error("Error (CacheService.setItem)", err);
		}
	},
	async removeItem(k: string): Promise<void> {
		try {
			await AsyncStorage.removeItem(`cache_${k}`);
		} catch (err) {
			console.error("Error (CacheService.removeItem)", err);
		}
	},
	// async prefetch() {
	// 	try {
	// 		LocationService.getLocations();
	// 		ProductService.getAllProducts();
	// 	} catch (err) {
	// 		console.error("Error (CacheService.prefetch)", err);
	// 	}
	// }
};
