import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";

// Wrapper for when in the Astro context vs CLI context
export async function createAuth(
	db?: any,
	schema?: Record<string, any>,
	secret?: string,
) {
	if (typeof secret === "undefined" || secret === null || secret === "") {
		secret =
			process.env.BETTER_AUTH_SECRET || import.meta.env.BETTER_AUTH_SECRET;
	}
	// Use a local database for development
	if (!db) {
		db = drizzle("file:./.astro/content.db");
	}
	return betterAuth({
		emailAndPassword: {
			enabled: true,
		},
		secret,
		logger: {
			disabled: false,
			disableColors: false,
			level: "debug",
		},
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema,
		}),
	});
}
export const auth = await createAuth();
