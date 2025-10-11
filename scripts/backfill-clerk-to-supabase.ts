import { createClerkClient } from "@clerk/clerk-sdk-node";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLERK_SECRET_KEY } =
	process.env as Record<string, string | undefined>;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CLERK_SECRET_KEY) {
	const missing = [
		!SUPABASE_URL && "SUPABASE_URL",
		!SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
		!CLERK_SECRET_KEY && "CLERK_SECRET_KEY",
	]
		.filter(Boolean)
		.join(", ");
	console.error(
		`Missing required environment variables: ${missing}.\n` +
			"Ensure these are set in your environment or .env file before running this script."
	);
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

async function run() {
	let total = 0;
	let offset = 0;
	const limit = 100;

	for (;;) {
		const list = await clerk.users.getUserList({ limit, offset });
		if (!list?.data?.length) break;

		type ClerkUser = {
			id: string;
			emailAddresses?: { emailAddress?: string | null }[] | null;
			firstName?: string | null;
			lastName?: string | null;
			imageUrl?: string | null;
		};

		const users = list.data as unknown as ClerkUser[];

		const rows = users.map((u) => ({
			id: u.id,
			email: u.emailAddresses?.[0]?.emailAddress ?? null,
			first_name: u.firstName ?? null,
			last_name: u.lastName ?? null,
			image_url: u.imageUrl ?? null,
		}));

		const { error } = await supabase.from("users").upsert(rows, {
			onConflict: "id",
		});
		if (error) {
			console.error("Upsert error:", error);
			process.exit(1);
		}

		total += rows.length;
		offset += rows.length;
		console.log(`Upserted ${total} users...`);
	}

	console.log(`Done. Total users upserted: ${total}`);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
