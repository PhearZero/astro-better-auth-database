import { defineDb } from "astro:db";
import * as schemas from "./auth-config";
export default defineDb({
	tables: {
		...schemas,
	},
});
