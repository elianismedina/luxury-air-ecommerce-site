import "dotenv/config";
import { env } from "prisma/config";

const config = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    name: "db",
    provider: "postgresql",
    // Use PRISMA_DATABASE_URL (preferred) or fall back to DATABASE_URL
    url: env("PRISMA_DATABASE_URL") || env("DATABASE_URL"),
  },
};

export default config;
