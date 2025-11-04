# Better Auth with Astro DB

The example includes a hydrated JavaScript client and a native form implementation.

# Get Started

Clone the repo:
```bash
git clone git@github.com:PhearZero/astro-better-auth-database.git
```

Change directory:
```bash
cd astro-better-auth-database
```

Install Dependencies:
```bash
npm install
```

Generate Schema:
```bash
npm run generate
```

Create an ENV file in the rood (`.env`):

```bash
BETTER_AUTH_SECRET=<ADD_SECRET_HERE>
BETTER_AUTH_URL=http://localhost:4321
```

Start Astro:
```bash
npm run dev
```

# Explanation:

This mirrors the better-auth cli drizzle example but uses astro's implementation.
The generator places the schema in `./db/auth-config.ts` and imports it into the standard `./db/config.ts`.
