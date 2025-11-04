import { db, user } from "astro:db";
import { generateId } from "better-auth";

export default async function () {
	// TODO: seed the database with some data
	// await db.insert(user).values([
	//     { id: generateId(), name: "Michael Feher", email: "mike@telluric.guru", emailVerified: true, image: "", createdAt: new Date(), updatedAt: new Date() },
	// ]);
}
