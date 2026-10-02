import assert from "node:assert/strict";
import { createAuthenticatedSession } from "./http-session.mjs";

for (const [email, expectedName] of [
  ["admin@opsflow.dev", "Alex Morgan"],
  ["member@opsflow.dev", "Sam Taylor"],
]) {
  const getPage = await createAuthenticatedSession(email);
  const workspace = await getPage("/dashboard");
  assert.equal(workspace.status, 200, `Login failed for ${email}`);
  assert.ok(workspace.html.includes(expectedName), `Wrong session for ${email}`);
  console.info(`Login verified: ${email}`);
}
