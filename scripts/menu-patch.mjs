import { readFile, writeFile } from "node:fs/promises";

const MENU_FUNCTION = String.raw`function le({open:l,onClose:s}) {
  const c=[[m,"Трекер",!0],[O,"Контакты",!1]];
  return a(n,{children:[
    l&&e("button",{className:"sidebar-backdrop","aria-label":"Закрыть меню",onClick:s}),
    a("aside",{className:_("project-sidebar",l&&"open"),children:[
      a("div",{className:"sidebar-brand",children:[
        e("strong",{children:"TEAMLY"}),
        e("button",{onClick:s,"aria-label":"Закрыть",children:e(U,{size:18})})
      ]}),
      a("div",{className:"project-title",children:[
        e("div",{className:"project-orb"}),
        a("div",{children:[
          e("b",{children:"Проектный офис"}),
          e("span",{children:"Рабочее пространство"})
        ]}),
        e(o,{size:18})
      ]}),
      e("nav",{className:"project-menu compact-project-menu",children:c.map(([n,t,l])=>a("button",{className:l?"active":"",children:[
        e(n,{size:17}),
        e("span",{children:t}),
        l&&e(T,{size:15,className:"menu-plus"})
      ]},t))}),
      a("button",{className:"sidebar-create",children:[e(T,{size:17})," создать"]})
    ]})
  ]})
}
`;

const MENU_STYLES = String.raw`
/* Compact project navigation */
.compact-project-menu{margin-top:18px}
`;

export async function applyMenuPatch() {
  const appPath = "src/components/tracker-app.js";
  const cssPath = "src/app/globals.css";
  let source = await readFile(appPath, "utf8");

  const menuStart = source.indexOf("function le(");
  const menuEnd = source.indexOf("function ie(", menuStart);
  if (menuStart < 0 || menuEnd < 0) {
    throw new Error("Menu patch markers were not found in tracker-app.js");
  }

  source = source.slice(0, menuStart) + MENU_FUNCTION + source.slice(menuEnd);
  await writeFile(appPath, source);

  const css = await readFile(cssPath, "utf8");
  await writeFile(cssPath, css + "\n" + MENU_STYLES);
}
