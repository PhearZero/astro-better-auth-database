// @ts-check
import { defineConfig, envField } from 'astro/config';

import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
    env: {
      schema: {
          BETTER_AUTH_SECRET: envField.string({context: "server", access: "public", optional: false}),
          BETTER_AUTH_URL: envField.string({context: "server", access: "public", optional: false}),
      },
        validateSecrets: true,
    },
    integrations: [db()],
    output: 'server',
});
