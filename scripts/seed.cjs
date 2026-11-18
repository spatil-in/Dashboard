const { createJiti } = require("jiti");
const { resolve } = require("node:path");

createJiti(__filename)(resolve(__dirname, "../prisma/seed.ts"));
