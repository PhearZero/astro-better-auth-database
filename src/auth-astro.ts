import { db, user, account, session, verification } from "astro:db";
import { createAuth } from "./auth.ts";

/**
 * Entrypoint for Astro to hydrate the auth client
 */
export const auth = await createAuth(
	db,
	{
		user,
		session,
		account,
		verification,
	},
	import.meta.env.BETTER_AUTH_SECRET,
);
