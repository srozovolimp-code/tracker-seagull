import { readFile, writeFile } from "node:fs/promises";

const CONTACTS_FUNCTIONS = String.raw`
const CONTACTS_KEY="tracker-seagull-contacts-v1";
const CONTACTS_SEED=[
  {id:"contact-1",name:"Алексей Крылов",role:"Руководитель проекта",team:"Проектный офис",email:"alexey@example.com",phone:"+7 900 111-22-33",telegram:"alexey_krylov",notes:"Координация команды и контроль сроков."},
  {id:"contact-2",name:"Елена Миронова",role:"Продакт-менеджер",team:"Команда Движка",email:"elena@example.com",phone:"+7 900 222-33-44",telegram:"elena_mironova",notes:"Требования, приоритизация и коммуникация с заказчиками."},
  {id:"contact-3",name:"Кирилл Соколов",role:"Frontend-разработчик",team:"Команда Движка",email:"kirill@example.com",phone:"+7 900 333-44-55",telegram:"kirill_sokolov",notes:"Интерфейсы трекера и клиентская логика."},
  {id:"contact-4",name:"Мария Иванова",role:"QA-инженер",team:"Команда Движка",email:"maria@example.com",phone:"+7 900 444-55-66",telegram:"maria_qa",notes:"Проверка релизов и ведение багов."},
  {id:"contact-5",name:"Дмитрий Волков",role:"Backend-разработчик",team:"Команда Интеграций",email:"dmitry@example.com",phone:"+7 900 555-66-77",telegram:"dmitry_volkov",notes:"API, авторизация и интеграции."},
  {id:"contact-6",name:"Анна Новикова",role:"Продуктовый дизайнер",team:"Дизайн",email:"anna@example.com",phone:"+7 900 666-77-88",telegram:"anna_design",notes:"Дизайн-система и пользовательские сценарии."}
];
function contactsInitials(name){return name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()||"").join("")||"?"}
function contactsEmpty(){return{id:"contact-"+Date.now(),name:"",role:"",team:"Проектный офис",email:"",phone:"",telegram:"",notes:""}}
function contactsPanel({onClose}){
  const[contacts,setContacts]=q(CONTACTS_SEED);
  const[query,setQuery]=q("");
  const[editing,setEditing]=q(null);
  const[ready,setReady]=q(false);
  F(()=>{let stored=CONTACTS_SEED;try{const raw=window.localStorage.getItem(CONTACTS_KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))stored=parsed}}catch{}const timer=window.setTimeout(()=>{setContacts(stored);setReady(true)},0);return()=>window.clearTimeout(timer)},[]);
  F(()=>{if(ready)window.localStorage.setItem(CONTACTS_KEY,JSON.stringify(contacts))},[contacts,ready]);
  const visible=A(()=>{const needle=query.trim().toLocaleLowerCase("ru");if(!needle)return contacts;return contacts.filter(contact=>[contact.name,contact.role,contact.team,contact.email,contact.phone,contact.telegram,contact.notes].some(value=>String(value||"").toLocaleLowerCase("ru").includes(needle)))},[contacts,query]);
  function saveContact(contact){setContacts(current=>current.some(item=>item.id===contact.id)?current.map(item=>item.id===contact.id?contact:item):[contact,...current]);setEditing(null)}
  function deleteContact(id){if(window.confirm("Удалить контакт?")){setContacts(current=>current.filter(item=>item.id!==id));setEditing(null)}}
  return a(n,{children:[
    a("section",{className:"contacts-overlay",children:[
      a("header",{className:"contacts-topbar",children:[
        a("div",{children:[e("span",{children:"Tracker Seagull"}),e("h1",{children:"Контакты"}),e("p",{children:"Команда проекта и быстрые способы связи"})]}),
        a("button",{className:"contacts-close",onClick:onClose,children:[e(U,{size:18})," Вернуться в трекер"]})
      ]}),
      a("div",{className:"contacts-toolbar",children:[
        a("label",{className:"contacts-search",children:[e($,{size:17}),e("input",{value:query,onChange:event=>setQuery(event.target.value),placeholder:"Поиск по имени, роли, команде или контактам"}),query&&e("button",{type:"button",onClick:()=>setQuery(""),"aria-label":"Очистить поиск",children:e(U,{size:14})})]}),
        a("div",{className:"contacts-toolbar-actions",children:[e("span",{children:(ready?visible.length:"…")+" контактов"}),a("button",{className:"contacts-primary",onClick:()=>setEditing(contactsEmpty()),children:[e(T,{size:16})," Добавить контакт"]})]})
      ]}),
      visible.length?a("div",{className:"contacts-grid",children:visible.map(contact=>a("article",{className:"contact-card",children:[
        a("div",{className:"contact-card-head",children:[e("div",{className:"contact-avatar",children:contactsInitials(contact.name)}),a("div",{className:"contact-heading",children:[e("strong",{children:contact.name}),e("span",{children:contact.role||"Роль не указана"})]}),e("button",{className:"contact-edit",onClick:()=>setEditing(contact),children:"Изменить"})]}),
        e("div",{className:"contact-team",children:contact.team||"Без команды"}),
        contact.notes&&e("p",{className:"contact-notes",children:contact.notes}),
        a("div",{className:"contact-details",children:[
          contact.email?a("a",{href:"mailto:"+contact.email,children:[e("span",{children:"Email"}),e("b",{children:contact.email})]}):e("span",{className:"contact-empty-line",children:"Email не указан"}),
          contact.phone?a("a",{href:"tel:"+contact.phone.replace(/[^+\d]/g,""),children:[e("span",{children:"Телефон"}),e("b",{children:contact.phone})]}):e("span",{className:"contact-empty-line",children:"Телефон не указан"}),
          contact.telegram?a("a",{href:"https://t.me/"+contact.telegram.replace(/^@/,""),target:"_blank",rel:"noreferrer",children:[e("span",{children:"Telegram"}),e("b",{children:"@"+contact.telegram.replace(/^@/,"")})]}):e("span",{className:"contact-empty-line",children:"Telegram не указан"})
        ]}),
        a("footer",{className:"contact-actions",children:[
          contact.email&&e("a",{href:"mailto:"+contact.email,children:"Написать"}),
          contact.phone&&e("a",{href:"tel:"+contact.phone.replace(/[^+\d]/g,""),children:"Позвонить"}),
          e("button",{onClick:()=>deleteContact(contact.id),children:[e(x,{size:14})," Удалить"]})
        ]})
      ]},contact.id))}):a("div",{className:"contacts-empty",children:[e(O,{size:30}),e("h2",{children:"Контакты не найдены"}),e("p",{children:"Измените поисковый запрос или добавьте нового сотрудника."}),a("button",{className:"contacts-primary",onClick:()=>setEditing(contactsEmpty()),children:[e(T,{size:16})," Добавить контакт"]})]})
    ]}),
    editing&&e(contactEditor,{contact:editing,onClose:()=>setEditing(null),onSave:saveContact,onDelete:contacts.some(item=>item.id===editing.id)?deleteContact:null})
  ]})
}
function contactEditor({contact,onClose,onSave,onDelete}){
  const[draft,setDraft]=q(contact);
  F(()=>{function closeOnEscape(event){if(event.key==="Escape")onClose()}window.addEventListener("keydown",closeOnEscape);return()=>window.removeEventListener("keydown",closeOnEscape)},[onClose]);
  function submit(event){event.preventDefault();if(!draft.name.trim())return;onSave({...draft,name:draft.name.trim(),email:draft.email.trim(),phone:draft.phone.trim(),telegram:draft.telegram.trim().replace(/^@/,"")})}
  return e("div",{className:"contact-dialog-backdrop",onMouseDown:onClose,children:a("section",{className:"contact-dialog",role:"dialog","aria-modal":"true",onMouseDown:event=>event.stopPropagation(),children:[
    a("header",{children:[a("div",{children:[e("span",{children:onDelete?"Карточка контакта":"Новый контакт"}),e("h2",{children:draft.name||"Без имени"})]}),e("button",{onClick:onClose,"aria-label":"Закрыть",children:e(U,{size:19})})]}),
    a("form",{onSubmit:submit,children:[
      a("label",{className:"contact-field full",children:[e("span",{children:"Имя и фамилия"}),e("input",{autoFocus:true,required:true,value:draft.name,onChange:event=>setDraft({...draft,name:event.target.value}),placeholder:"Например, Иван Петров"})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Должность"}),e("input",{value:draft.role,onChange:event=>setDraft({...draft,role:event.target.value}),placeholder:"Руководитель проекта"})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Команда"}),e("input",{value:draft.team,onChange:event=>setDraft({...draft,team:event.target.value}),placeholder:"Проектный офис"})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Email"}),e("input",{type:"email",value:draft.email,onChange:event=>setDraft({...draft,email:event.target.value}),placeholder:"name@company.ru"})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Телефон"}),e("input",{value:draft.phone,onChange:event=>setDraft({...draft,phone:event.target.value}),placeholder:"+7 900 000-00-00"})]}),
      a("label",{className:"contact-field full",children:[e("span",{children:"Telegram"}),e("input",{value:draft.telegram,onChange:event=>setDraft({...draft,telegram:event.target.value}),placeholder:"username"})]}),
      a("label",{className:"contact-field full",children:[e("span",{children:"Заметка"}),e("textarea",{rows:4,value:draft.notes,onChange:event=>setDraft({...draft,notes:event.target.value}),placeholder:"Зона ответственности, доступность, важные комментарии"})]}),
      a("footer",{children:[onDelete?a("button",{type:"button",className:"contacts-danger",onClick:()=>onDelete(draft.id),children:[e(x,{size:15})," Удалить"]}):e("span",{}),a("button",{type:"submit",className:"contacts-primary",children:[e(r,{size:16})," Сохранить"]})]})
    ]})
  ]})})
}
function le({open:l,onClose:s}) {
  const[contactsOpen,setContactsOpen]=q(false);
  const c=[[m,"Трекер",!contactsOpen,()=>setContactsOpen(false)],[O,"Контакты",contactsOpen,()=>{setContactsOpen(true);s()}]];
  return a(n,{children:[
    l&&e("button",{className:"sidebar-backdrop","aria-label":"Закрыть меню",onClick:s}),
    a("aside",{className:_("project-sidebar",l&&"open"),children:[
      a("div",{className:"sidebar-brand",children:[e("strong",{children:"TEAMLY"}),e("button",{onClick:s,"aria-label":"Закрыть",children:e(U,{size:18})})]}),
      a("div",{className:"project-title",children:[e("div",{className:"project-orb"}),a("div",{children:[e("b",{children:"Проектный офис"}),e("span",{children:"Рабочее пространство"})]}),e(o,{size:18})]}),
      e("nav",{className:"project-menu compact-project-menu",children:c.map(([icon,label,active,action])=>a("button",{className:active?"active":"",onClick:action,children:[e(icon,{size:17}),e("span",{children:label}),"Трекер"===label&&e(T,{size:15,className:"menu-plus"})]},label))}),
      a("button",{className:"sidebar-create",onClick:()=>setContactsOpen(true),children:[e(T,{size:17})," создать контакт"]})
    ]}),
    contactsOpen&&e(contactsPanel,{onClose:()=>setContactsOpen(false)})
  ]})
}
`;

const CONTACTS_STYLES = String.raw`
/* Functional contacts section */
.contacts-overlay{position:fixed;inset:0;z-index:90;background:#f5f7fb;overflow-y:auto;padding:0 28px 42px}
.contacts-topbar{max-width:1380px;margin:0 auto;min-height:116px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid #e2e7ef}
.contacts-topbar>div>span{display:block;color:#7890b5;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:800}
.contacts-topbar h1{margin:7px 0 4px;letter-spacing:-2px;font-size:42px}
.contacts-topbar p{margin:0;color:#7d8797;font-size:12px}
.contacts-close{height:38px;padding:0 13px;border:1px solid #dde4ee;border-radius:10px;background:#fff;display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700}
.contacts-toolbar{max-width:1380px;margin:18px auto 14px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.contacts-search{width:min(520px,55vw);height:42px;padding:0 12px;border:1px solid #dfe5ee;border-radius:12px;background:#fff;display:flex;align-items:center;gap:9px;color:#8792a2}
.contacts-search:focus-within{border-color:#a8c1e8;box-shadow:0 0 0 3px #eaf2ff}
.contacts-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:12px}
.contacts-search button{border:0;background:transparent;display:grid;place-items:center}
.contacts-toolbar-actions{display:flex;align-items:center;gap:12px;color:#8490a1;font-size:11px}
.contacts-primary{min-height:38px;padding:0 14px;border:0;border-radius:10px;background:#dce8fb;color:#31598f;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:11px;font-weight:750}
.contacts-primary:hover{background:#cbdcf7}
.contacts-grid{max-width:1380px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.contact-card{background:#fff;border:1px solid #e2e7ef;border-radius:16px;padding:16px;box-shadow:0 7px 20px rgba(35,49,72,.05)}
.contact-card-head{display:grid;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:11px}
.contact-avatar{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#466b9b,#95b8d1);color:#fff;font-size:13px;font-weight:850}
.contact-heading{min-width:0}
.contact-heading strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
.contact-heading span{display:block;margin-top:4px;color:#8390a1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}
.contact-edit{border:0;border-radius:8px;background:#f0f4fa;color:#54719c;padding:7px 9px;font-size:9px;font-weight:700}
.contact-team{display:inline-flex;margin-top:13px;padding:5px 8px;border-radius:999px;background:#edf3fb;color:#4f6f9d;font-size:9px;font-weight:700}
.contact-notes{min-height:40px;margin:12px 0;color:#697588;font-size:10px;line-height:1.5}
.contact-details{display:grid;gap:4px;border-top:1px solid #edf0f4;padding-top:10px}
.contact-details a{min-height:36px;padding:6px 8px;border-radius:8px;text-decoration:none;color:inherit;display:grid;grid-template-columns:70px minmax(0,1fr);align-items:center;gap:8px}
.contact-details a:hover{background:#f5f8fc}
.contact-details span{color:#919baa;font-size:9px}
.contact-details b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:650}
.contact-empty-line{display:block;padding:8px;color:#afb6c0;font-size:9px}
.contact-actions{margin-top:10px;padding-top:10px;border-top:1px solid #edf0f4;display:flex;align-items:center;gap:6px}
.contact-actions a,.contact-actions button{min-height:31px;padding:0 9px;border:0;border-radius:8px;background:#f2f5f9;color:#647187;text-decoration:none;display:inline-flex;align-items:center;gap:5px;font-size:9px}
.contact-actions button{margin-left:auto;color:#a15361;background:#fff0f2}
.contacts-empty{max-width:1380px;margin:40px auto;min-height:420px;border:1px dashed #cdd6e2;border-radius:16px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#7c8797}
.contacts-empty h2{margin:14px 0 5px;color:#303a49;font-size:17px}
.contacts-empty p{margin:0 0 15px;font-size:11px}
.contact-dialog-backdrop{position:fixed;inset:0;z-index:110;background:rgba(20,29,43,.42);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px}
.contact-dialog{width:min(650px,100%);max-height:calc(100vh - 40px);overflow-y:auto;border-radius:18px;background:#fff;box-shadow:0 28px 80px rgba(18,29,47,.3)}
.contact-dialog>header{min-height:76px;padding:16px 18px 13px;border-bottom:1px solid #e9edf2;display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
.contact-dialog>header span{color:#8792a2;text-transform:uppercase;letter-spacing:.08em;font-size:9px;font-weight:800}
.contact-dialog>header h2{margin:5px 0 0;font-size:19px}
.contact-dialog>header button{width:34px;height:34px;border:0;border-radius:9px;background:#f3f6fa;display:grid;place-items:center}
.contact-dialog form{padding:17px 18px 19px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.contact-field{display:grid;gap:6px;color:#687486;font-size:10px;font-weight:700}
.contact-field.full{grid-column:1/-1}
.contact-field input,.contact-field textarea{min-height:39px;padding:8px 10px;border:1px solid #dfe5ee;border-radius:10px;outline:0;background:#fff;color:#283142}
.contact-field textarea{resize:vertical;min-height:94px}
.contact-field input:focus,.contact-field textarea:focus{border-color:#9db8e4;box-shadow:0 0 0 3px #edf4ff}
.contact-dialog footer{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid #edf0f4}
.contacts-danger{min-height:36px;padding:0 12px;border:0;border-radius:9px;background:#fff0f2;color:#a6505f;display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700}
@media(max-width:1050px){.contacts-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:680px){.contacts-overlay{padding:0 12px 28px}.contacts-topbar{min-height:104px}.contacts-topbar h1{font-size:34px}.contacts-topbar p{display:none}.contacts-close{font-size:0;width:38px;padding:0;justify-content:center}.contacts-toolbar{align-items:stretch;flex-direction:column}.contacts-search{width:100%}.contacts-toolbar-actions{justify-content:space-between}.contacts-grid{grid-template-columns:1fr}.contact-dialog-backdrop{padding:0;place-items:end center}.contact-dialog{width:100%;max-height:92vh;border-radius:18px 18px 0 0}.contact-dialog form{grid-template-columns:1fr}.contact-field.full,.contact-dialog footer{grid-column:1}}
`;

export async function applyContactsPatch() {
  const appPath = "src/components/tracker-app.js";
  const cssPath = "src/app/globals.css";
  let source = await readFile(appPath, "utf8");
  const menuStart = source.indexOf("function le(");
  const menuEnd = source.indexOf("function ie(", menuStart);
  if (menuStart < 0 || menuEnd < 0) throw new Error("Contacts patch markers were not found in tracker-app.js");
  source = source.slice(0, menuStart) + CONTACTS_FUNCTIONS + source.slice(menuEnd);
  await writeFile(appPath, source);
  const css = await readFile(cssPath, "utf8");
  await writeFile(cssPath, css + "\n" + CONTACTS_STYLES);
}
