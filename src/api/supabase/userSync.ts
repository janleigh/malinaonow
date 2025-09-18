import type { UserProfile } from "@/lib/types/supabase";
import { supabase } from "./supabase";

type MinimalClerkUser = {
	id: string;
	email?: string;
	firstName?: string | null;
	lastName?: string | null;
	imageUrl?: string | null;
};

export async function upsertUserFromClerk(
	u: MinimalClerkUser
): Promise<UserProfile> {
	const payload = {
		id: u.id,
		email: u.email ?? null,
		first_name: u.firstName ?? null,
		last_name: u.lastName ?? null,
		image_url: u.imageUrl ?? null
	};

	const { data, error } = await supabase
		.from("users")
		.upsert(payload, { onConflict: "id" })
		.select("*")
		.single();

	if (error) {
		console.error("upsertUserFromClerk error:", error);
		throw error;
	}
	return data as UserProfile;
}

export async function getUserProfile(
	userId: string
): Promise<UserProfile | null> {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) {
		// If no row yet, return null; otherwise bubble the error
		if (error.code === "PGRST116") return null;
		console.error("getUserProfile error:", error);
		throw error;
	}
	return data as UserProfile;
}
