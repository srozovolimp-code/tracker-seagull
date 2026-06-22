import { readFile, writeFile } from "node:fs/promises";

export async function applyProjectCabinetRuntimeFix(){
  const appPath="src/components/tracker-app.js";
  let source=await readFile(appPath,"utf8");
  source=source.replace('||DEFAULT_PROJECT.id;return"tracker-seagull-project-"+id+"-"+section+"-v1"','||"project-office";return"tracker-seagull-project-"+id+"-"+section+"-v1"');
  source=source.replace('||DEFAULT_PROJECT.id;\n    if(active===DEFAULT_PROJECT.id&&!window.localStorage.getItem(key))','||"project-office";\n    if(active==="project-office"&&!window.localStorage.getItem(key))');
  if(source.includes('projectTasksStorageKey()')&&source.includes('DEFAULT_PROJECT.id;return"tracker-seagull-project-"'))throw new Error("Project runtime initialization fix was not applied");
  await writeFile(appPath,source);
}
