import { generateAstroDBSchema } from "../db/generators/astro-db.ts";
import { drizzle } from "drizzle-orm/libsql";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as fs from "node:fs";
const db = drizzle("file:./.astro/content.db");
const res = await generateAstroDBSchema({
	options: {
		emailAndPassword: {
			enabled: true,
		},
	},
	adapter: drizzleAdapter(db, {
		provider: "sqlite",
	}),
});

fs.writeFileSync(res.fileName, res.code || "");
