import assert from "node:assert/strict";

import { baseUrl, createAuthenticatedClient } from "./http-session.mjs";

const admin = await createAuthenticatedClient("admin@opsflow.dev");
const member = await createAuthenticatedClient("member@opsflow.dev");
const adminList = await admin.getPage("/work-items");
const memberList = await member.getPage("/work-items");
const itemIds = (html) => [...html.matchAll(/href="\/work-items\/([^"/]+)"[^>]*>View<\/a>/g)].map((match) => match[1]);
const memberItemId = itemIds(memberList.html)[0];
const adminOnlyItemId = itemIds(adminList.html).find((id) => !itemIds(memberList.html).includes(id));
assert.ok(memberItemId && adminOnlyItemId, "Demo records for both role checks are missing");
const adminId = adminList.html.match(/<option value="([^"]+)">Alex Morgan<\/option>/)?.[1];
const memberId = adminList.html.match(/<option value="([^"]+)">Sam Taylor<\/option>/)?.[1];
assert.ok(adminId && memberId, "Demo assignee options are missing");

const payload = {
  title: "Stage three test item",
  description: "Temporary lifecycle verification",
  assigneeId: memberId,
  priority: "MEDIUM",
  dueDate: "2026-12-01",
};

function send(client, path, method, body) {
  return client.request(path, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const guest = await fetch(new URL("/api/work-items", baseUrl), {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: baseUrl },
  body: JSON.stringify(payload),
});
assert.equal(guest.status, 401);

assert.equal((await send(member, "/api/work-items", "POST", payload)).status, 403);
for (const path of ["/work-items/new", `/work-items/${adminOnlyItemId}/edit`, `/work-items/${adminOnlyItemId}`]) {
  const denied = await member.getPage(path);
  assert.equal(denied.status, 403);
  assert.doesNotMatch(denied.html, /<dt[^>]*>Status<\/dt>/);
}
for (const client of [admin, member]) {
  assert.equal((await client.getPage("/work-items/does-not-exist")).status, 404);
}
assert.equal((await admin.getPage("/work-items/new")).status, 200);
assert.equal((await admin.getPage(`/work-items/${memberItemId}/edit`)).status, 200);
assert.equal((await member.getPage(`/work-items/${memberItemId}`)).status, 200);

assert.equal((await send(admin, "/api/work-items", "POST", { ...payload, title: "No" })).status, 400);
assert.equal((await send(admin, "/api/work-items", "POST", { ...payload, assigneeId: "invalid" })).status, 400);
assert.equal((await send(admin, "/api/work-items", "POST", { ...payload, dueDate: "2026-02-30" })).status, 400);
assert.equal((await send(admin, "/api/work-items", "POST", { ...payload, priority: "URGENT" })).status, 400);
assert.equal((await send(admin, "/api/work-items", "POST", { ...payload, createdById: memberId })).status, 400);
assert.equal((await send(admin, `/api/work-items/${memberItemId}/status`, "PATCH", { status: "BLOCKED" })).status, 400);
assert.equal((await send(member, `/api/work-items/${memberItemId}/status`, "PATCH", { status: "DONE", title: "Injected" })).status, 400);
assert.equal((await send(member, `/api/work-items/${adminOnlyItemId}/status`, "PATCH", { status: "DONE" })).status, 403);
assert.equal((await send(member, `/api/work-items/${adminOnlyItemId}`, "DELETE")).status, 403);
assert.equal((await send(member, `/api/work-items/${memberItemId}`, "PATCH", { ...payload, status: "DONE" })).status, 403);
assert.equal((await send(admin, "/api/work-items/does-not-exist", "DELETE")).status, 404);
assert.equal((await send(admin, "/api/work-items/does-not-exist/status", "PATCH", { status: "TODO" })).status, 404);
assert.equal((await admin.request("/api/work-items", { method: "POST", headers: { Origin: "https://other.example", "Content-Type": "application/json" }, body: JSON.stringify(payload) })).status, 403);

const created = await send(admin, "/api/work-items", "POST", payload);
assert.equal(created.status, 201);
const { id } = await created.json();
assert.ok(id);

try {
  const detail = await member.getPage(`/work-items/${id}`);
  assert.equal(detail.status, 200);
  assert.match(detail.html, /Stage three test item/);
  assert.match(detail.html, /Temporary lifecycle verification/);
  assert.equal((await member.getPage("/work-items")).html.includes("Stage three test item"), true);

  const updated = await send(admin, `/api/work-items/${id}`, "PATCH", {
    ...payload,
    title: "Stage three edited item",
    priority: "HIGH",
    dueDate: "2026-12-10",
    status: "IN_PROGRESS",
  });
  assert.equal(updated.status, 200);
  const editedDetail = await member.getPage(`/work-items/${id}`);
  assert.match(editedDetail.html, /Stage three edited item/);
  assert.match(editedDetail.html, /Dec 10, 2026/);
  assert.match(editedDetail.html, /<dt[^>]*>Priority<\/dt><dd[^>]*><span[^>]*>High<\/span>/);

  assert.equal((await send(admin, `/api/work-items/${id}/status`, "PATCH", { status: "DONE" })).status, 200);
  assert.match((await admin.getPage(`/work-items/${id}`)).html, /<dt[^>]*>Status<\/dt><dd[^>]*><span[^>]*>Completed<\/span>/);
  assert.equal((await send(member, `/api/work-items/${id}/status`, "PATCH", { status: "TODO" })).status, 200);
  assert.match((await member.getPage(`/work-items/${id}`)).html, /<dt[^>]*>Status<\/dt><dd[^>]*><span[^>]*>To Do<\/span>/);
  assert.equal((await send(member, `/api/work-items/${id}/status`, "PATCH", { status: "DONE", priority: "LOW" })).status, 400);
  assert.match((await admin.getPage(`/work-items/${id}`)).html, /Stage three edited item/);

  assert.equal((await send(admin, `/api/work-items/${id}`, "PATCH", { ...payload, assigneeId: "invalid", status: "TODO" })).status, 400);
  assert.equal((await send(admin, `/api/work-items/${id}`, "PATCH", { ...payload, assigneeId: adminId, status: "TODO" })).status, 200);
  assert.equal((await member.getPage(`/work-items/${id}`)).status, 403);
  assert.equal((await send(member, `/api/work-items/${id}/status`, "PATCH", { status: "DONE" })).status, 403);
  assert.equal((await send(admin, `/api/work-items/${id}`, "DELETE")).status, 204);
  assert.equal((await admin.getPage(`/work-items/${id}`)).status, 404);
  assert.match((await admin.getPage("/work-items?message=deleted")).html, /Work item deleted/);
} finally {
  const remaining = await admin.getPage(`/work-items/${id}`);
  if (remaining.status === 200) await send(admin, `/api/work-items/${id}`, "DELETE");
}

console.info("Stage 3 lifecycle, role access, validation, and status isolation verified.");
