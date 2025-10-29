// Warn about missing environment variables in development
if (__DEV__) {
	const requiredEnvVars = [
		"EXPO_PUBLIC_MAPBOX_APIKEY",
		"EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
		"EXPO_PUBLIC_SUPABASE_URL",
		"EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
	];

	const missing = requiredEnvVars.filter((key) => !process.env[key]);

	if (missing.length > 0) {
		console.warn(
			"⚠️  Missing environment variables:\n" +
				missing.map((key) => `  - ${key}`).join("\n") +
				"\n\nPlease create a .env file from .env.example and fill in the required values."
		);
	}
}

export const API_KEYS = {
	mapbox: process.env.EXPO_PUBLIC_MAPBOX_APIKEY,
	clerk: {
		publishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
	},
	supabase: {
		url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
		publishableKey:
			process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
	}
};
