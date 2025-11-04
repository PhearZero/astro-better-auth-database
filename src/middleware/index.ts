import { createAuth } from "../auth.ts";
import { defineMiddleware } from "astro:middleware";
import { drizzle } from "drizzle-orm/libsql";
import { db, user, session, account, verification } from "astro:db";
const auth = await createAuth(db, {
	user,
	session,
	account,
	verification,
});
export const onRequest = defineMiddleware(async (context, next) => {
	const data = await db.select().from(session).limit(1).all();
	console.log(data);
	// console.log(db, user)
	const isAuthed = await auth.api.getSession({
		headers: context.request.headers,
	});

	console.log(isAuthed);
	if (isAuthed) {
		context.locals.user = isAuthed.user;
		context.locals.session = isAuthed.session;
	} else {
		context.locals.user = null;
		context.locals.session = null;
	}

	return next();
});
