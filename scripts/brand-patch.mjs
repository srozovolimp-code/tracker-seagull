import { readFile, writeFile } from "node:fs/promises";

export async function applyBrandPatch() {
  const appPath = "src/components/tracker-app.js";
  const cssPath = "src/app/globals.css";

  let source = await readFile(appPath, "utf8");
  source = source.replaceAll('e("strong",{children:"TEAMLY"})', 'e("strong",{children:"Tracker Seagull"})');
  await writeFile(appPath, source);

  const css = await readFile(cssPath, "utf8");
  await writeFile(
    cssPath,
    css + '\n.sidebar-brand strong{font-size:13px;letter-spacing:-.25px;white-space:nowrap}\n',
  );
}
