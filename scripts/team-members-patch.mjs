import { readFile, writeFile } from "node:fs/promises";

const TEAM_TABLE = String.raw`
const HIDDEN_ROWS_KEY="tracker-seagull-hidden-rows-v1";
function readHiddenRows(){try{const parsed=JSON.parse(window.localStorage.getItem(HIDDEN_ROWS_KEY)||"[]");return Array.isArray(parsed)?parsed.filter(value=>typeof value==="string"):[]}catch{return[]}}
function writeHiddenRows(ids){const next=Array.from(new Set(ids));window.localStorage.setItem(HIDDEN_ROWS_KEY,JSON.stringify(next));return next}
function teamMembersDialog({team,onClose}){
  const[contacts]=useContactsDirectory();
  const members=contacts.filter(contact=>contact.tags.includes(team)).sort((left,right)=>left.name.localeCompare(right.name,"ru"));
  F(()=>{function closeOnEscape(event){if(event.key==="Escape")onClose()}window.addEventListener("keydown",closeOnEscape);return()=>window.removeEventListener("keydown",closeOnEscape)},[onClose]);
  return e("div",{className:"team-members-backdrop",onMouseDown:onClose,children:a("section",{className:"team-members-dialog",role:"dialog","aria-modal":"true","aria-label":"Участники команды "+team,onMouseDown:event=>event.stopPropagation(),children:[
    a("header",{className:"team-members-head",children:[a("div",{children:[e("span",{children:"Команда"}),e("h2",{children:team}),e("p",{children:members.length+" "+(members.length===1?"участник":members.length>1&&members.length<5?"участника":"участников")})]}),e("button",{type:"button",onClick:onClose,"aria-label":"Закрыть",children:e(U,{size:19})})]}),
    members.length?e("div",{className:"team-members-list",children:members.map(contact=>a("article",{className:"team-member-card",children:[
      e("div",{className:"team-member-avatar",children:contact.code||contactsInitials(contact.name)}),
      a("div",{className:"team-member-main",children:[e("strong",{children:contact.name}),e("span",{children:contact.role||"Должность не указана"}),e("div",{className:"team-member-tags",children:contact.tags.map(tag=>e("small",{className:tag===team?"active":"",children:tag},tag))})]}),
      a("div",{className:"team-member-actions",children:[contact.email&&e("a",{href:"mailto:"+contact.email,title:"Написать письмо",children:"Email"}),contact.phone&&e("a",{href:"tel:"+contact.phone.replace(/[^+\d]/g,""),title:"Позвонить",children:"Телефон"}),contact.telegram&&e("a",{href:"https://t.me/"+contact.telegram.replace(/^@/,""),target:"_blank",rel:"noreferrer",title:"Открыть Telegram",children:"Telegram"})]})
    ]},contact.id))}):a("div",{className:"team-members-empty",children:[e(O,{size:28}),e("h3",{children:"В команде пока никого нет"}),e("p",{children:"Добавьте контакт и назначьте ему тег «"+team+"»."})]}),
    e("footer",{className:"team-members-footer",children:e("button",{type:"button",onClick:onClose,children:"Закрыть"})})
  ]})})
}
function hiddenRowsDialog({tasks,hiddenIds,onRestore,onRestoreAll,onClose}){
  const hiddenTasks=tasks.filter(task=>hiddenIds.includes(task.id));
  F(()=>{function closeOnEscape(event){if(event.key==="Escape")onClose()}window.addEventListener("keydown",closeOnEscape);return()=>window.removeEventListener("keydown",closeOnEscape)},[onClose]);
  return e("div",{className:"hidden-rows-backdrop",onMouseDown:onClose,children:a("section",{className:"hidden-rows-dialog",role:"dialog","aria-modal":"true","aria-label":"Скрытые строки",onMouseDown:event=>event.stopPropagation(),children:[
    a("header",{className:"hidden-rows-head",children:[a("div",{children:[e("span",{children:"Таблица задач"}),e("h2",{children:"Скрытые строки"}),e("p",{children:hiddenIds.length+" скрыто"})]}),e("button",{type:"button",onClick:onClose,"aria-label":"Закрыть",children:e(U,{size:19})})]}),
    hiddenTasks.length?e("div",{className:"hidden-rows-list",children:hiddenTasks.map(task=>a("article",{className:"hidden-row-card",children:[a("div",{children:[e("strong",{children:task.title}),e("span",{children:task.team+" · "+H[task.status]})]}),e("button",{type:"button",onClick:()=>onRestore(task.id),children:"Вернуть"})]},task.id))}):a("div",{className:"hidden-rows-empty",children:[e("h3",{children:"Скрытые строки не найдены"}),e("p",{children:hiddenIds.length?"Некоторые скрытые задачи не входят в текущую выборку или фильтр.":"Все строки таблицы сейчас отображаются."})]}),
    a("footer",{className:"hidden-rows-footer",children:[hiddenIds.length>0&&e("button",{type:"button",className:"restore-all-rows",onClick:onRestoreAll,children:"Вернуть все строки"}),e("button",{type:"button",onClick:onClose,children:"Закрыть"})]})
  ]})})
}
function ie({tasks:n,collapsedTeams:t,onToggleTeam:l,onEdit:s,onUpdate:c,onCreate:d}){
  const[selectedTeam,setSelectedTeam]=q(null);
  const[hiddenOpen,setHiddenOpen]=q(false);
  const[hiddenIds,setHiddenIds]=q([]);
  F(()=>{setHiddenIds(readHiddenRows())},[]);
  const groups=A(()=>Array.from(new Set(n.map(task=>task.team))).map(team=>({team,tasks:n.filter(task=>task.team===team)})),[n]);
  const tones=["pink","amber","violet","cyan"];
  function hideRow(id){setHiddenIds(current=>writeHiddenRows([...current,id]))}
  function restoreRow(id){setHiddenIds(current=>writeHiddenRows(current.filter(value=>value!==id)))}
  function restoreAll(){setHiddenIds(writeHiddenRows([]));setHiddenOpen(false)}
  return a("div",{className:"team-table-root",children:[
    hiddenIds.length>0&&a("div",{className:"hidden-rows-toolbar",children:[e("span",{children:"Часть строк скрыта"}),e("button",{type:"button",onClick:()=>setHiddenOpen(true),children:["Скрытые строки · ",hiddenIds.length]})]}),
    n.length?a("div",{className:"table-wrap",children:[
      a("div",{className:"task-table task-table-head",children:[e("div",{className:"task-col",children:"Задачи"}),e("div",{children:"Статус"}),e("div",{children:"Приоритет"}),e("div",{children:"Спринт"}),e("div",{children:"Ответственные"}),e("div",{children:"Срок"})]}),
      groups.map((group,index)=>{const collapsed=t.includes(group.team);const visibleTasks=group.tasks.filter(task=>!hiddenIds.includes(task.id));const hiddenCount=group.tasks.length-visibleTasks.length;return a("section",{className:"task-group",children:[
        a("div",{className:"group-header team-group-header",children:[
          e("button",{type:"button",className:"team-collapse-button",onClick:()=>l(group.team),"aria-label":collapsed?"Развернуть группу":"Свернуть группу",children:collapsed?"›":"⌄"}),
          e("button",{type:"button",className:"team-chip "+tones[index%tones.length]+" team-members-trigger",onClick:()=>setSelectedTeam(group.team),title:"Показать участников команды",children:group.team}),
          e("b",{children:visibleTasks.length}),
          hiddenCount>0&&e("button",{type:"button",className:"team-hidden-count",onClick:()=>setHiddenOpen(true),children:hiddenCount+" скрыто"})
        ]}),
        !collapsed&&a("div",{children:[
          visibleTasks.map(task=>a("div",{className:"task-table task-row",children:[
            a("button",{className:_("task-title-cell",task.parentId&&"nested"),onClick:()=>s(task),children:[e("span",{className:"task-drag-mark row-hide-trigger",role:"button",tabIndex:0,title:"Скрыть строку",onClick:event=>{event.stopPropagation();hideRow(task.id)},onKeyDown:event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();event.stopPropagation();hideRow(task.id)}},children:"−"}),e("span",{children:task.title})]}),
            e(re,{value:task.status,tone:"status-"+task.status,onChange:value=>c(task.id,{status:value}),options:W.map(status=>[status,H[status]])}),
            e(re,{value:task.priority,tone:"priority-"+task.priority,onChange:value=>c(task.id,{priority:value}),options:X.map(priority=>[priority,P[priority]])}),
            e(re,{value:task.sprint,tone:"sprint-tone",onChange:value=>c(task.id,{sprint:value}),options:G.map(sprint=>[sprint,sprint])}),
            e(taskAssigneePicker,{task,onChange:c}),
            e("button",{className:"date-button",onClick:()=>s(task),children:ee(task.dueDate)})
          ]},task.id)),
          visibleTasks.length===0&&hiddenCount>0&&a("div",{className:"all-rows-hidden",children:[e("span",{children:"Все строки этой команды скрыты"}),e("button",{type:"button",onClick:()=>setHiddenOpen(true),children:"Показать скрытые"})]}),
          a("button",{className:"add-row",onClick:()=>d({team:group.team}),children:["＋ ","Новая строка"]})
        ]})
      ]},group.team)}),
    ]}):a("div",{className:"empty-state",children:[e("h2",{children:"Задач не найдено"}),e("p",{children:"Измените фильтры или создайте новую задачу."}),e("button",{className:"primary-button",onClick:()=>d(),children:"Создать задачу"})]}),
    selectedTeam&&e(teamMembersDialog,{team:selectedTeam,onClose:()=>setSelectedTeam(null)}),
    hiddenOpen&&e(hiddenRowsDialog,{tasks:n,hiddenIds,onRestore:restoreRow,onRestoreAll:restoreAll,onClose:()=>setHiddenOpen(false)})
  ]})
}
`;

const TEAM_STYLES = String.raw`
/* Team members popup and hidden task rows */
.team-table-root{min-width:0}
.team-group-header{display:flex;align-items:center;gap:7px;width:100%;min-height:42px;padding:5px 10px;border:0;border-bottom:1px solid #edf0f4;background:#fafbfd;text-align:left}
.team-collapse-button{width:27px;height:27px;border:0;border-radius:7px;background:transparent;color:#687587;display:grid;place-items:center;font-size:20px;line-height:1}
.team-collapse-button:hover{background:#e9eef5}
.team-members-trigger{border:0;cursor:pointer;transition:transform .14s,box-shadow .14s,filter .14s}
.team-members-trigger:hover{filter:brightness(.97);transform:translateY(-1px);box-shadow:0 3px 9px rgba(35,52,78,.13)}
.team-group-header>b{color:#7e8998;font-size:9px}
.task-drag-mark{color:#a6afbb;font-size:13px}
.row-hide-trigger{width:22px;height:22px;flex:none;border-radius:6px;display:grid;place-items:center;color:#8994a3;font-size:16px;font-weight:700;line-height:1;transition:background .14s,color .14s}
.task-title-cell:hover .row-hide-trigger{background:#edf1f6;color:#526176}
.row-hide-trigger:hover{background:#e6edf7!important;color:#315e98!important}
.hidden-rows-toolbar{min-height:42px;margin-bottom:8px;padding:7px 10px;border:1px solid #dfe6ef;border-radius:11px;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;gap:12px}
.hidden-rows-toolbar span{color:#778396;font-size:9px}
.hidden-rows-toolbar button,.team-hidden-count{min-height:29px;padding:0 9px;border:0;border-radius:8px;background:#e7eef9;color:#426797;font-size:9px;font-weight:750}
.team-hidden-count{min-height:25px;margin-left:2px;background:#eef1f5;color:#7a8595}
.all-rows-hidden{min-height:66px;padding:10px 14px;border-bottom:1px solid #edf0f4;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#8a95a4;font-size:9px}
.all-rows-hidden button{min-height:30px;padding:0 9px;border:0;border-radius:8px;background:#edf3fb;color:#456b9e;font-size:9px;font-weight:700}
.team-members-backdrop,.hidden-rows-backdrop{position:fixed;inset:0;z-index:130;background:rgba(19,28,42,.45);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px}
.team-members-dialog,.hidden-rows-dialog{width:min(720px,100%);max-height:calc(100vh - 40px);display:flex;flex-direction:column;border-radius:19px;background:#fff;overflow:hidden;box-shadow:0 30px 90px rgba(16,27,45,.34)}
.team-members-head,.hidden-rows-head{min-height:92px;padding:17px 19px 14px;border-bottom:1px solid #e8edf3;display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
.team-members-head span,.hidden-rows-head span{display:block;color:#8190a4;text-transform:uppercase;letter-spacing:.09em;font-size:9px;font-weight:800}
.team-members-head h2,.hidden-rows-head h2{margin:6px 0 3px;font-size:22px;letter-spacing:-.6px}
.team-members-head p,.hidden-rows-head p{margin:0;color:#8490a0;font-size:9px}
.team-members-head>button,.hidden-rows-head>button{width:35px;height:35px;border:0;border-radius:10px;background:#f1f4f8;color:#647186;display:grid;place-items:center}
.team-members-list,.hidden-rows-list{padding:9px;overflow-y:auto}
.team-member-card{min-height:74px;padding:10px;border-radius:12px;display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:11px}
.team-member-card:hover{background:#f5f8fc}
.team-member-avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#486d9c,#92b6d0);color:#fff;font-size:10px;font-weight:850}
.team-member-main{min-width:0}
.team-member-main>strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
.team-member-main>span{display:block;margin-top:4px;color:#8490a0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}
.team-member-tags{margin-top:7px;display:flex;flex-wrap:wrap;gap:4px}
.team-member-tags small{padding:3px 6px;border-radius:999px;background:#f0f2f5;color:#7d8795;font-size:7px;font-weight:700}
.team-member-tags small.active{background:#e4edfb;color:#3f669d}
.team-member-actions{display:flex;align-items:center;gap:5px}
.team-member-actions a{min-height:31px;padding:0 8px;border-radius:8px;background:#eef3f9;color:#567095;text-decoration:none;display:inline-flex;align-items:center;font-size:8px;font-weight:700}
.team-member-actions a:hover{background:#dfeaf7}
.hidden-row-card{min-height:62px;padding:9px 10px;border-radius:11px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px}
.hidden-row-card:hover{background:#f5f8fc}
.hidden-row-card strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
.hidden-row-card span{display:block;margin-top:4px;color:#8792a1;font-size:8px}
.hidden-row-card button{min-height:31px;padding:0 10px;border:0;border-radius:8px;background:#e6eef9;color:#426797;font-size:9px;font-weight:700}
.team-members-empty,.hidden-rows-empty{min-height:260px;padding:35px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#8792a1}
.team-members-empty h3,.hidden-rows-empty h3{margin:13px 0 5px;color:#394557;font-size:14px}
.team-members-empty p,.hidden-rows-empty p{margin:0;max-width:350px;font-size:9px;line-height:1.5}
.team-members-footer,.hidden-rows-footer{padding:10px 13px;border-top:1px solid #e8edf3;display:flex;justify-content:flex-end;gap:7px;background:#fafbfd}
.team-members-footer button,.hidden-rows-footer button{min-height:35px;padding:0 13px;border:0;border-radius:9px;background:#e3ecf9;color:#3d6398;font-size:10px;font-weight:750}
.hidden-rows-footer .restore-all-rows{margin-right:auto;background:#eef1f5;color:#657285}
@media(max-width:680px){.team-members-backdrop,.hidden-rows-backdrop{padding:0;place-items:end center}.team-members-dialog,.hidden-rows-dialog{width:100%;max-height:88vh;border-radius:19px 19px 0 0}.team-member-card{grid-template-columns:38px minmax(0,1fr)}.team-member-avatar{width:38px;height:38px}.team-member-actions{grid-column:2;flex-wrap:wrap}.team-member-actions a{min-height:29px}.team-group-header{position:sticky;left:0}.hidden-rows-toolbar{align-items:flex-start;flex-direction:column}.hidden-rows-toolbar button{width:100%}}
`;

export async function applyTeamMembersPatch(){
  const appPath="src/components/tracker-app.js";
  const cssPath="src/app/globals.css";
  let source=await readFile(appPath,"utf8");
  const start=source.indexOf("function ie(");
  const end=source.indexOf("function re(",start);
  if(start<0||end<0)throw new Error("Team table patch markers were not found");
  source=source.slice(0,start)+TEAM_TABLE+source.slice(end);
  await writeFile(appPath,source);
  const css=await readFile(cssPath,"utf8");
  await writeFile(cssPath,css+"\n"+TEAM_STYLES);
}
