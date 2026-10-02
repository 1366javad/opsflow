import assert from "node:assert/strict";
import { createAuthenticatedSession } from "./http-session.mjs";

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ");
}

async function expectPage(getPage, path) {
  const page = await getPage(path);
  assert.equal(page.status, 200, `Unexpected status for ${path}`);
  return page;
}

function tableRows(html) {
  const body = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1] ?? "";
  return [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => visibleText(match[1]));
}

function shownCount(text) {
  const count = text.match(/Showing (\d+) of (\d+) work items/);
  assert.ok(count, "Work Item count is missing");
  return { shown: Number(count[1]), total: Number(count[2]) };
}

function dashboardCount(text, label) {
  const count = text.match(new RegExp(`(\\d+) ${label}`));
  assert.ok(count, `${label} count is missing`);
  return Number(count[1]);
}

const adminPage = await createAuthenticatedSession("admin@opsflow.dev");
const memberPage = await createAuthenticatedSession("member@opsflow.dev");

const adminDashboard = visibleText((await expectPage(adminPage, "/dashboard")).html);
assert.match(adminDashboard, /Recent Work Items/);
assert.match(adminDashboard, /Overdue Work Items/);

const memberDashboard = visibleText((await expectPage(memberPage, "/dashboard")).html);

const adminListPage = await expectPage(adminPage, "/work-items");
const adminList = visibleText(adminListPage.html);
const adminCount = shownCount(adminList);
assert.equal(adminCount.shown, adminCount.total);
assert.equal(tableRows(adminListPage.html).length, adminCount.total);
assert.equal(dashboardCount(adminDashboard, "Total Work Items"), adminCount.total);
assert.equal(
  dashboardCount(adminDashboard, "To Do") + dashboardCount(adminDashboard, "In Progress") + dashboardCount(adminDashboard, "Completed"),
  adminCount.total,
);
assert.ok(dashboardCount(adminDashboard, "Overdue") <= adminCount.total);

const memberListPage = await expectPage(memberPage, "/work-items");
const memberList = visibleText(memberListPage.html);
const memberCount = shownCount(memberList);
assert.equal(memberCount.shown, memberCount.total);
assert.equal(tableRows(memberListPage.html).length, memberCount.total);
assert.ok(memberCount.total < adminCount.total, "Demo data should include an Admin-only Work Item");
assert.equal(dashboardCount(memberDashboard, "Total Work Items"), memberCount.total);
assert.equal(
  dashboardCount(memberDashboard, "To Do") + dashboardCount(memberDashboard, "In Progress") + dashboardCount(memberDashboard, "Completed"),
  memberCount.total,
);
assert.ok(dashboardCount(memberDashboard, "Overdue") <= memberCount.total);
const adminOnlyTitle = "Plan next sprint capacity";
assert.ok(adminList.includes(adminOnlyTitle));
assert.ok(!memberList.includes(adminOnlyTitle));
assert.ok(!memberDashboard.includes(adminOnlyTitle));
assert.doesNotMatch(memberListPage.html, /id="work-item-assignee"/);

const searched = visibleText((await expectPage(memberPage, "/work-items?query=onboarding")).html);
if (memberList.includes("Prepare onboarding checklist")) {
  assert.match(searched, /Prepare onboarding checklist/);
} else {
  assert.match(searched, /No matching work items/);
}

const statusPage = await expectPage(adminPage, "/work-items?status=TODO");
const statusFiltered = visibleText(statusPage.html);
const todoCount = dashboardCount(adminDashboard, "To Do");
if (todoCount === 0) {
  assert.match(statusFiltered, /No matching work items/);
} else {
  assert.deepEqual(shownCount(statusFiltered), { shown: todoCount, total: adminCount.total });
  assert.ok(tableRows(statusPage.html).every((row) => row.includes("To Do")));
}

const priorityPage = await expectPage(adminPage, "/work-items?priority=HIGH");
const priorityFiltered = visibleText(priorityPage.html);
const highPriorityRows = tableRows(priorityPage.html);
if (highPriorityRows.length === 0) {
  assert.match(priorityFiltered, /No matching work items/);
} else {
  assert.equal(shownCount(priorityFiltered).shown, highPriorityRows.length);
  assert.ok(highPriorityRows.every((row) => row.includes("High")));
}

const memberOption = adminListPage.html.match(/<option value="([^"]+)">Sam Taylor<\/option>/);
assert.ok(memberOption, "Member assignee option is missing");
const memberAssigneeId = memberOption[1];
const assigneeFiltered = visibleText((await expectPage(adminPage, `/work-items?assigneeId=${memberAssigneeId}`)).html);
assert.deepEqual(shownCount(assigneeFiltered), { shown: memberCount.total, total: adminCount.total });
assert.ok(!assigneeFiltered.includes(adminOnlyTitle));

const memberWithAssigneeParam = visibleText((await expectPage(memberPage, "/work-items?assigneeId=someone-else")).html);
assert.deepEqual(shownCount(memberWithAssigneeParam), memberCount);
assert.ok(!memberWithAssigneeParam.includes(adminOnlyTitle));

const emptyFilter = visibleText((await expectPage(adminPage, "/work-items?query=not-a-demo-item")).html);
assert.match(emptyFilter, /No matching work items/);
assert.match(emptyFilter, /Clear filters/);

console.info("Stage 2 dashboard, role visibility, and filters verified.");
