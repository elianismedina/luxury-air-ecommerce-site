require("dotenv").config();

module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    name: "db",
    provider: "postgresql",
    url: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL,
  },
};
