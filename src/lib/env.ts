import { z } from "zod";

// Define your environment variable schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Number(val))
    .default("3000"),
  DATABASE_URL: z.string().url(),
  API_SERVICE_ENDPOINT: z.string().url(),
});

// Parse and validate process.env
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

// Export the validated and parsed environment variables
export const env = parsedEnv.data;
