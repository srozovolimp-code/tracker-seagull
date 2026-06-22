import { readFile, writeFile } from "node:fs/promises";

const ASSIGNEE_COMPONENTS = String.raw`
function normalizedAssigneeValues(values,contacts){return(values||[]).map(value=>findContact(value,contacts)?.id||value)}
function assigneeCode(value,contacts){const contact=findContact(value,contacts);return contact?.code||contactsInitials(contact?.name)||String(value||"?").slice(0,3)}
function se({people}){
  const[contacts]=useContactsDirectory();
  return e("div",{className:"avatar-stack","aria-label":"Ответственные: "+(people||[]).map(value=>findContact(value,contacts)?.name||value).join(", "),children:(people||[]).map((value,index)=>e("span",{style:{zIndex:(people||[]).length-index},title:findContact(value,contacts)?.name||value,children:assigneeCode(value,contacts)},value+"-"+index))})
}
function taskAssigneePicker({task,onChange}){
  const[contacts]=useContactsDirectory();
  const[open,setOpen]=q(false);
  const root=R(null);
  const matching=contacts.filter(contact=>contact.tags.includes(task.team));
  const normalized=normalizedAssigneeValues(task.assignees,contacts);
  const outside=normalized.map(value=>findContact(value,contacts)).filter(contact=>contact&&!matching.some(item=>item.id===contact.id));
  F(()=>{if(!open)return;function close(event){if(root.current&&!root.current.contains(event.target))setOpen(false)}window.addEventListener("mousedown",close);return()=>window.removeEventListener("mousedown",close)},[open]);
  function toggle(contact){const selected=normalized.includes(contact.id);const next=selected?normalized.filter(value=>value!==contact.id):[...normalized,contact.id];onChange(task.id,{assignees:next})}
  return a("div",{className:"assignee-picker",ref:root,children:[
    e("button",{type:"button",className:"assignee-field-button",onClick:()=>setOpen(value=>!value),"aria-expanded":open,children:task.assignees?.length?e(se,{people:task.assignees}):e("span",{className:"assignee-placeholder",children:"Назначить"})}),
    open&&a("div",{className:"assignee-menu",children:[
      a("div",{className:"assignee-menu-head",children:[a("div",{children:[e("strong",{children:"Ответственные"}),e("small",{children:"Тег: "+task.team})]}),e("button",{type:"button",onClick:()=>setOpen(false),children:e(U,{size:14})})]}),
      matching.length?e("div",{className:"assignee-options",children:matching.map(contact=>a("button",{type:"button",className:normalized.includes(contact.id)?"selected":"",onClick:()=>toggle(contact),children:[e("span",{className:"assignee-option-avatar",children:contact.code||contactsInitials(contact.name)}),a("span",{className:"assignee-option-copy",children:[e("strong",{children:contact.name}),e("small",{children:contact.role||"Без должности"})]}),normalized.includes(contact.id)&&e(r,{size:14})]},contact.id))}):a("div",{className:"assignee-empty",children:[e(O,{size:19}),e("span",{children:"Нет контактов с тегом «"+task.team+"»"})]}),
      outside.length>0&&a("div",{className:"assignee-outside",children:[e("span",{children:"Назначены вне текущего тега"}),outside.map(contact=>a("button",{type:"button",onClick:()=>toggle(contact),children:[e("span",{children:contact.code}),e("b",{children:contact.name}),e(U,{size:13})]},contact.id))]})
    ]})
  ]})
}
`;

const TASK_FORM = String.raw`function pe({task:n,onChange:t,onSubmit:l,submitLabel:i,footerStart:s}){
  const[contacts]=useContactsDirectory();
  const tagged=contacts.filter(contact=>contact.tags.includes(n.team));
  const normalized=normalizedAssigneeValues(n.assignees,contacts);
  const outside=normalized.map(value=>findContact(value,contacts)).filter(contact=>contact&&!tagged.some(item=>item.id===contact.id));
  function toggleContact(contact){const selected=normalized.includes(contact.id);const next=selected?normalized.filter(value=>value!==contact.id):[...normalized,contact.id];t({...n,assignees:next})}
  function changeTeam(team){const allowed=contacts.filter(contact=>contact.tags.includes(team)).map(contact=>contact.id);const next=normalized.filter(value=>allowed.includes(value));t({...n,team,assignees:next})}
  return a("form",{className:"task-form",onSubmit:l,children:[
    a("label",{className:"field full",children:[e("span",{children:"Название"}),e("input",{autoFocus:true,value:n.title,onChange:event=>t({...n,title:event.target.value}),placeholder:"Что нужно сделать?",required:true})]}),
    a("label",{className:"field full",children:[e("span",{children:"Описание"}),e("textarea",{value:n.description,onChange:event=>t({...n,description:event.target.value}),placeholder:"Контекст, критерии готовности и полезные ссылки",rows:4})]}),
    a("label",{className:"field",children:[e("span",{children:"Команда"}),e("select",{value:n.team,onChange:event=>changeTeam(event.target.value),children:K.map(team=>e("option",{children:team},team))})]}),
    a("label",{className:"field",children:[e("span",{children:"Статус"}),e("select",{value:n.status,onChange:event=>t({...n,status:event.target.value}),children:W.map(status=>e("option",{value:status,children:H[status]},status))})]}),
    a("label",{className:"field",children:[e("span",{children:"Приоритет"}),e("select",{value:n.priority,onChange:event=>t({...n,priority:event.target.value}),children:X.map(priority=>e("option",{value:priority,children:P[priority]},priority))})]}),
    a("label",{className:"field",children:[e("span",{children:"Спринт"}),e("select",{value:n.sprint,onChange:event=>t({...n,sprint:event.target.value}),children:G.map(sprint=>e("option",{children:sprint},sprint))})]}),
    a("label",{className:"field",children:[e("span",{children:"Начало"}),e("input",{type:"date",value:n.startDate,onChange:event=>t({...n,startDate:event.target.value})})]}),
    a("label",{className:"field",children:[e("span",{children:"Срок"}),e("input",{type:"date",min:n.startDate,value:n.dueDate,onChange:event=>t({...n,dueDate:event.target.value})})]}),
    a("label",{className:"field full",children:[e("span",{children:"Теги через запятую"}),e("input",{value:n.tags.join(", "),onChange:event=>t({...n,tags:event.target.value.split(",").map(value=>value.trim())}),placeholder:"api, дизайн, баг"})]}),
    a("fieldset",{className:"field full people-field contact-assignees-field",children:[
      a("legend",{children:["Ответственные — контакты с тегом «",e("b",{children:n.team}),"»"]}),
      tagged.length?e("div",{className:"contact-assignee-options",children:tagged.map(contact=>a("button",{type:"button",className:normalized.includes(contact.id)?"selected":"",onClick:()=>toggleContact(contact),children:[e("span",{className:"contact-assignee-avatar",children:contact.code||contactsInitials(contact.name)}),a("span",{children:[e("strong",{children:contact.name}),e("small",{children:contact.role||"Без должности"})]}),normalized.includes(contact.id)&&e(r,{size:12})]},contact.id))}):a("div",{className:"contact-assignee-empty",children:[e(O,{size:18}),e("span",{children:"В контактах пока нет людей с этим тегом"})]}),
      outside.length>0&&a("div",{className:"contact-assignee-outside",children:[e("span",{children:"Назначены вне тега"}),outside.map(contact=>a("button",{type:"button",onClick:()=>toggleContact(contact),children:[contact.code," ",contact.name,e(U,{size:12})]},contact.id))]})
    ]}),
    a("footer",{children:[s??e("span",{}),a("button",{className:"primary-button",type:"submit",children:[e(r,{size:16})," ",i]})]})
  ]})
}
`;

const ASSIGNEE_STYLES = String.raw`
/* Contact-based task assignees */
.assignee-picker{position:relative;min-width:0}
.assignee-field-button{width:100%;min-height:36px;padding:3px 6px;border:1px solid transparent;border-radius:9px;background:transparent;display:flex;align-items:center;justify-content:flex-start}
.assignee-field-button:hover,.assignee-field-button[aria-expanded="true"]{border-color:#d9e3f0;background:#f3f7fc}
.assignee-placeholder{color:#9aa4b2;font-size:10px}
.assignee-menu{position:absolute;z-index:70;top:calc(100% + 6px);right:0;width:310px;max-height:390px;border:1px solid #dce3ed;border-radius:13px;background:#fff;overflow:hidden;box-shadow:0 18px 45px rgba(29,43,64,.19)}
.assignee-menu-head{min-height:54px;padding:9px 10px 8px 12px;border-bottom:1px solid #edf0f4;display:flex;align-items:center;justify-content:space-between;gap:10px}
.assignee-menu-head strong{display:block;font-size:11px}
.assignee-menu-head small{display:block;color:#8994a3;margin-top:3px;font-size:8px}
.assignee-menu-head button{width:28px;height:28px;border:0;border-radius:7px;background:#f2f5f9;display:grid;place-items:center}
.assignee-options{max-height:245px;overflow-y:auto;padding:6px}
.assignee-options>button{width:100%;min-height:48px;padding:6px 7px;border:0;border-radius:9px;background:transparent;display:grid;grid-template-columns:34px minmax(0,1fr) 20px;align-items:center;gap:8px;text-align:left}
.assignee-options>button:hover{background:#f4f7fb}
.assignee-options>button.selected{background:#eaf2fd}
.assignee-option-avatar,.contact-assignee-avatar{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#496e9d,#91b4cf);color:#fff;font-size:8px;font-weight:850}
.assignee-option-copy{min-width:0}
.assignee-option-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}
.assignee-option-copy small{display:block;color:#8a95a4;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:8px}
.assignee-empty{min-height:116px;padding:20px;color:#8792a2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;font-size:9px}
.assignee-outside{padding:7px;border-top:1px solid #edf0f4;background:#fafbfd}
.assignee-outside>span{display:block;color:#929cab;padding:2px 4px 6px;font-size:8px;font-weight:700}
.assignee-outside button{width:100%;min-height:32px;border:0;border-radius:7px;background:transparent;display:grid;grid-template-columns:28px minmax(0,1fr) 16px;align-items:center;gap:6px;text-align:left;font-size:8px}
.assignee-outside button:hover{background:#f1f4f8}
.contact-assignees-field{border:0;margin:0;padding:0}
.contact-assignees-field legend{margin-bottom:8px}
.contact-assignees-field legend b{color:#3e6499}
.contact-assignee-options{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px!important}
.contact-assignee-options>button{min-height:48px;width:100%!important;border-radius:10px!important;display:grid!important;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:8px;text-align:left;padding:6px 8px!important}
.contact-assignee-options>button>span:nth-child(2){min-width:0}
.contact-assignee-options strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}
.contact-assignee-options small{display:block;color:#8a95a3;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:7px}
.contact-assignee-empty{min-height:74px;border:1px dashed #d5dce6;border-radius:10px;color:#8a95a4;display:flex;align-items:center;justify-content:center;gap:8px;font-size:9px}
.contact-assignee-outside{margin-top:8px;padding-top:8px;border-top:1px solid #edf0f4;display:flex!important;flex-wrap:wrap;gap:6px!important}
.contact-assignee-outside>span{width:100%;color:#939daa;font-size:8px}
.contact-assignee-outside button{width:auto!important;min-height:30px!important;border-radius:8px!important;padding:0 8px!important;display:inline-flex!important;align-items:center;gap:5px}
@media(max-width:680px){.assignee-menu{position:fixed;left:10px;right:10px;top:auto;bottom:10px;width:auto;max-height:70vh}.contact-assignee-options{grid-template-columns:1fr}}
`;

export async function applyTaskAssigneesPatch(){
  const appPath="src/components/tracker-app.js";
  const cssPath="src/app/globals.css";
  let source=await readFile(appPath,"utf8");
  const avatarStart=source.indexOf("function se(");
  const avatarEnd=source.indexOf("function ce(",avatarStart);
  if(avatarStart<0||avatarEnd<0)throw new Error("Assignee component markers were not found");
  source=source.slice(0,avatarStart)+ASSIGNEE_COMPONENTS+source.slice(avatarEnd);
  const tableStart=source.indexOf("function ie(");
  const tableEnd=source.indexOf("function re(",tableStart);
  if(tableStart<0||tableEnd<0)throw new Error("Task table markers were not found");
  const tableSource=source.slice(tableStart,tableEnd).replace("e(se,{people:n.assignees})","e(taskAssigneePicker,{task:n,onChange:c})");
  source=source.slice(0,tableStart)+tableSource+source.slice(tableEnd);
  const formStart=source.indexOf("function pe(");
  const formEnd=source.indexOf("function ge(",formStart);
  if(formStart<0||formEnd<0)throw new Error("Task form markers were not found");
  source=source.slice(0,formStart)+TASK_FORM+source.slice(formEnd);
  await writeFile(appPath,source);
  const css=await readFile(cssPath,"utf8");
  await writeFile(cssPath,css+"\n"+ASSIGNEE_STYLES);
}
