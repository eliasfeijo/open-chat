import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { getDatabase } from "@/db";
import { authSchema } from "@/db/schema";
import { getServerEnv } from "@/lib/env";
import {
  deleteUserProfileById,
  syncUserProfileFromAuthIdentity,
} from "@/modules/users";

function createAuthInstance() {
  const serverEnv = getServerEnv();

  return betterAuth({
    baseURL: serverEnv.BETTER_AUTH_URL,
    database: drizzleAdapter(getDatabase(), {
      provider: "pg",
      schema: authSchema,
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await syncUserProfileFromAuthIdentity({
              authUserId: user.id,
            });
          },
        },
        delete: {
          after: async (user) => {
            await deleteUserProfileById(user.id);
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    plugins: [nextCookies()],
    secret: serverEnv.BETTER_AUTH_SECRET,
    trustedOrigins: [serverEnv.BETTER_AUTH_URL],
  });
}

type OpenChatAuth = ReturnType<typeof createAuthInstance>;

let authInstance: OpenChatAuth | undefined;

export function getAuth(): OpenChatAuth {
  const existingAuthInstance = authInstance;

  if (existingAuthInstance) {
    return existingAuthInstance;
  }

  const createdAuthInstance = createAuthInstance();

  authInstance = createdAuthInstance;

  return createdAuthInstance;
}
