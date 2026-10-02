import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
const databasePath = join(process.cwd(), "prisma", "dev.db");
const existing = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

if (!/^AUTH_SECRET\s*=/m.test(existing)) {
  const secret = randomBytes(32).toString("base64url");
  const line = `AUTH_SECRET="${secret}"\n`;
  if (existing) {
    appendFileSync(envPath, `${existing.endsWith("\n") ? "" : "\n"}${line}`);
  } else {
    writeFileSync(envPath, line, { flag: "wx" });
  }
}

if (!existsSync(databasePath)) {
  writeFileSync(databasePath, "", { flag: "wx" });
}
