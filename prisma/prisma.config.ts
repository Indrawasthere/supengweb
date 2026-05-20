const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

// Prisma v7 schema no longer supports `url` inside schema.prisma.
// We provide connection URL via adapter configuration.
export default {
  adapter: {
    url: databaseUrl,
  },
};
