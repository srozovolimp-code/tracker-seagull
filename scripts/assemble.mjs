import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { applyCalendarPatch } from "./calendar-patch.mjs";
import { applyMenuPatch } from "./menu-patch.mjs";
import { applyContactsPatch } from "./contacts-patch.mjs";
import { applyContactTagsPatch } from "./contact-tags-patch.mjs";
import { applyTaskAssigneesPatch } from "./task-assignees-patch.mjs";
import { applyTeamMembersPatch } from "./team-members-patch.mjs";
import { applyBrandPatch } from "./brand-patch.mjs";
import { applyProjectCabinetPatch } from "./project-cabinet-patch.mjs";

async function assemble(parts, output) {
  const encoded = (await Promise.all(parts.map((part) => readFile(part, "utf8")))).join("");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, Buffer.from(encoded, "base64"));
}

await assemble(
  [
    "src/generated/tracker-app.01.b64",
    "src/generated/tracker-app.02.b64",
    "src/generated/tracker-app.03.b64",
    "src/generated/tracker-app.04.b64",
  ],
  "src/components/tracker-app.js",
);

await assemble(
  [
    "src/generated/globals.01.b64",
    "src/generated/globals.02.b64",
    "src/generated/globals.03.b64",
    "src/generated/globals.04.b64",
  ],
  "src/app/globals.css",
);

await applyCalendarPatch();
await applyMenuPatch();
await applyContactsPatch();
await applyContactTagsPatch();
await applyTaskAssigneesPatch();
await applyTeamMembersPatch();
await applyBrandPatch();
await applyProjectCabinetPatch();
