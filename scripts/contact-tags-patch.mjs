import { readFile, writeFile } from "node:fs/promises";

const CONTACT_DIRECTORY = String.raw`
const CONTACTS_KEY="tracker-seagull-contacts-v1";
const CONTACTS_EVENT="tracker-seagull-contacts-change";
const CONTACTS_SEED=[
  {id:"contact-1",code:"АК",name:"Алексей Крылов",role:"Руководитель проекта",tags:["Команда Движка","Команда Интеграций"],email:"alexey@example.com",phone:"+7 900 111-22-33",telegram:"alexey_krylov",notes:"Координация команды и контроль сроков."},
  {id:"contact-2",code:"ЕМ",name:"Елена Миронова",role:"Продакт-менеджер",tags:["Команда Движка","Команда Интеграций"],email:"elena@example.com",phone:"+7 900 222-33-44",telegram:"elena_mironova",notes:"Требования, приоритизация и коммуникация с заказчиками."},
  {id:"contact-3",code:"КС",name:"Кирилл Соколов",role:"Frontend-разработчик",tags:["Команда Движка","Команда Интеграций"],email:"kirill@example.com",phone:"+7 900 333-44-55",telegram:"kirill_sokolov",notes:"Интерфейсы трекера и клиентская логика."},
  {id:"contact-4",code:"МИ",name:"Мария Иванова",role:"QA-инженер",tags:["Команда Движка","Команда Интеграций"],email:"maria@example.com",phone:"+7 900 444-55-66",telegram:"maria_qa",notes:"Проверка релизов и ведение багов."},
  {id:"contact-5",code:"ОР",name:"Олег Романов",role:"Инженер интеграций",tags:["Команда Движка","Команда Интеграций"],email:"oleg@example.com",phone:"+7 900 555-66-77",telegram:"oleg_romanov",notes:"Интеграции, уведомления и техническая поддержка."},
  {id:"contact-6",code:"АН",name:"Анна Новикова",role:"Продуктовый дизайнер",tags:["Команда Движка","Дизайн"],email:"anna@example.com",phone:"+7 900 666-77-88",telegram:"anna_design",notes:"Дизайн-система и пользовательские сценарии."},
  {id:"contact-7",code:"ДВ",name:"Дмитрий Волков",role:"Backend-разработчик",tags:["Команда Интеграций"],email:"dmitry@example.com",phone:"+7 900 777-88-99",telegram:"dmitry_volkov",notes:"API, авторизация и серверная логика."},
  {id:"contact-8",code:"СП",name:"Сергей Павлов",role:"Backend-разработчик",tags:["Команда Интеграций"],email:"sergey@example.com",phone:"+7 900 888-99-00",telegram:"sergey_pavlov",notes:"Инфраструктура, API и сопровождение интеграций."}
];
function contactsInitials(name){return String(name||"").split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()||"").join("")||"?"}
function normalizeContact(contact){
  const legacyTag=contact.team&&K.includes(contact.team)?[contact.team]:[];
  const tags=Array.isArray(contact.tags)?contact.tags.filter(tag=>K.includes(tag)):legacyTag;
  return{...contact,code:contact.code||contactsInitials(contact.name),tags:Array.from(new Set(tags))};
}
function normalizeContacts(contacts){return(Array.isArray(contacts)?contacts:CONTACTS_SEED).map(normalizeContact)}
function readContactsDirectory(){try{const raw=window.localStorage.getItem(CONTACTS_KEY);if(raw)return normalizeContacts(JSON.parse(raw))}catch{}return normalizeContacts(CONTACTS_SEED)}
function writeContactsDirectory(contacts){const normalized=normalizeContacts(contacts);window.localStorage.setItem(CONTACTS_KEY,JSON.stringify(normalized));window.dispatchEvent(new CustomEvent(CONTACTS_EVENT,{detail:normalized}));return normalized}
function useContactsDirectory(){
  const[contacts,setContacts]=q(CONTACTS_SEED);
  F(()=>{setContacts(readContactsDirectory());const sync=event=>setContacts(Array.isArray(event.detail)?normalizeContacts(event.detail):readContactsDirectory());const storage=event=>{if(event.key===CONTACTS_KEY)setContacts(readContactsDirectory())};window.addEventListener(CONTACTS_EVENT,sync);window.addEventListener("storage",storage);return()=>{window.removeEventListener(CONTACTS_EVENT,sync);window.removeEventListener("storage",storage)}},[]);
  function update(nextOrUpdater){setContacts(current=>{const next=typeof nextOrUpdater==="function"?nextOrUpdater(current):nextOrUpdater;return writeContactsDirectory(next)})}
  return[contacts,update];
}
function findContact(value,contacts){return contacts.find(contact=>contact.id===value||contact.code===value||contactsInitials(contact.name)===value)}
function contactsEmpty(){return{id:"contact-"+Date.now(),code:"",name:"",role:"",tags:[],email:"",phone:"",telegram:"",notes:""}}
function contactsPanel({onClose}){
  const[contacts,setContacts]=useContactsDirectory();
  const[query,setQuery]=q("");
  const[tagFilter,setTagFilter]=q("all");
  const[editing,setEditing]=q(null);
  const visible=A(()=>{const needle=query.trim().toLocaleLowerCase("ru");return contacts.filter(contact=>{const textMatch=!needle||[contact.name,contact.role,contact.email,contact.phone,contact.telegram,contact.notes,...contact.tags].some(value=>String(value||"").toLocaleLowerCase("ru").includes(needle));const tagMatch=tagFilter==="all"||(tagFilter==="untagged"?contact.tags.length===0:contact.tags.includes(tagFilter));return textMatch&&tagMatch})},[contacts,query,tagFilter]);
  function saveContact(contact){const normalized=normalizeContact({...contact,name:contact.name.trim(),email:contact.email.trim(),phone:contact.phone.trim(),telegram:contact.telegram.trim().replace(/^@/,""),code:contact.code||contactsInitials(contact.name)});setContacts(current=>current.some(item=>item.id===normalized.id)?current.map(item=>item.id===normalized.id?normalized:item):[normalized,...current]);setEditing(null)}
  function deleteContact(id){if(window.confirm("Удалить контакт?")){setContacts(current=>current.filter(item=>item.id!==id));setEditing(null)}}
  return a(n,{children:[
    a("section",{className:"contacts-overlay",children:[
      a("header",{className:"contacts-topbar",children:[a("div",{children:[e("span",{children:"Tracker Seagull"}),e("h1",{children:"Контакты"}),e("p",{children:"Команда проекта, теги и быстрые способы связи"})]}),a("button",{className:"contacts-close",onClick:onClose,children:[e(U,{size:18})," Вернуться в трекер"]})]}),
      a("div",{className:"contacts-toolbar",children:[a("label",{className:"contacts-search",children:[e($,{size:17}),e("input",{value:query,onChange:event=>setQuery(event.target.value),placeholder:"Поиск по имени, роли, тегу или контактам"}),query&&e("button",{type:"button",onClick:()=>setQuery(""),"aria-label":"Очистить поиск",children:e(U,{size:14})})]}),a("div",{className:"contacts-toolbar-actions",children:[e("span",{children:visible.length+" контактов"}),a("button",{className:"contacts-primary",onClick:()=>setEditing(contactsEmpty()),children:[e(T,{size:16})," Добавить контакт"]})]})]}),
      e("div",{className:"contact-tag-filters",children:[["all","Все"],...K.map(tag=>[tag,tag]),["untagged","Без тегов"]].map(([value,label])=>e("button",{className:tagFilter===value?"active":"",onClick:()=>setTagFilter(value),children:label},value))}),
      visible.length?a("div",{className:"contacts-grid",children:visible.map(contact=>a("article",{className:"contact-card",children:[
        a("div",{className:"contact-card-head",children:[e("div",{className:"contact-avatar",children:contact.code||contactsInitials(contact.name)}),a("div",{className:"contact-heading",children:[e("strong",{children:contact.name}),e("span",{children:contact.role||"Роль не указана"})]}),e("button",{className:"contact-edit",onClick:()=>setEditing(contact),children:"Изменить"})]}),
        contact.tags.length?e("div",{className:"contact-tags",children:contact.tags.map((tag,index)=>e("span",{className:"contact-team tag-"+index%3,children:tag},tag))}):e("div",{className:"contact-tags",children:e("span",{className:"contact-team untagged",children:"Без тегов"})}),
        contact.notes&&e("p",{className:"contact-notes",children:contact.notes}),
        a("div",{className:"contact-details",children:[contact.email?a("a",{href:"mailto:"+contact.email,children:[e("span",{children:"Email"}),e("b",{children:contact.email})]}):e("span",{className:"contact-empty-line",children:"Email не указан"}),contact.phone?a("a",{href:"tel:"+contact.phone.replace(/[^+\d]/g,""),children:[e("span",{children:"Телефон"}),e("b",{children:contact.phone})]}):e("span",{className:"contact-empty-line",children:"Телефон не указан"}),contact.telegram?a("a",{href:"https://t.me/"+contact.telegram.replace(/^@/,""),target:"_blank",rel:"noreferrer",children:[e("span",{children:"Telegram"}),e("b",{children:"@"+contact.telegram.replace(/^@/,"")})]}):e("span",{className:"contact-empty-line",children:"Telegram не указан"})]}),
        a("footer",{className:"contact-actions",children:[contact.email&&e("a",{href:"mailto:"+contact.email,children:"Написать"}),contact.phone&&e("a",{href:"tel:"+contact.phone.replace(/[^+\d]/g,""),children:"Позвонить"}),e("button",{onClick:()=>deleteContact(contact.id),children:[e(x,{size:14})," Удалить"]})]})
      ]},contact.id))}):a("div",{className:"contacts-empty",children:[e(O,{size:30}),e("h2",{children:"Контакты не найдены"}),e("p",{children:"Измените поиск или фильтр тегов либо добавьте нового сотрудника."}),a("button",{className:"contacts-primary",onClick:()=>setEditing(contactsEmpty()),children:[e(T,{size:16})," Добавить контакт"]})]})
    ]}),
    editing&&e(contactEditor,{contact:editing,onClose:()=>setEditing(null),onSave:saveContact,onDelete:contacts.some(item=>item.id===editing.id)?deleteContact:null})
  ]})
}
function contactEditor({contact,onClose,onSave,onDelete}){
  const[draft,setDraft]=q(normalizeContact(contact));
  F(()=>{function closeOnEscape(event){if(event.key==="Escape")onClose()}window.addEventListener("keydown",closeOnEscape);return()=>window.removeEventListener("keydown",closeOnEscape)},[onClose]);
  function toggleTag(tag){setDraft(current=>({...current,tags:current.tags.includes(tag)?current.tags.filter(item=>item!==tag):[...current.tags,tag]}))}
  function submit(event){event.preventDefault();if(!draft.name.trim())return;onSave(draft)}
  return e("div",{className:"contact-dialog-backdrop",onMouseDown:onClose,children:a("section",{className:"contact-dialog",role:"dialog","aria-modal":"true",onMouseDown:event=>event.stopPropagation(),children:[
    a("header",{children:[a("div",{children:[e("span",{children:onDelete?"Карточка контакта":"Новый контакт"}),e("h2",{children:draft.name||"Без имени"})]}),e("button",{onClick:onClose,"aria-label":"Закрыть",children:e(U,{size:19})})]}),
    a("form",{onSubmit:submit,children:[
      a("label",{className:"contact-field full",children:[e("span",{children:"Имя и фамилия"}),e("input",{autoFocus:true,required:true,value:draft.name,onChange:event=>setDraft({...draft,name:event.target.value}),placeholder:"Например, Иван Петров"})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Должность"}),e("input",{value:draft.role,onChange:event=>setDraft({...draft,role:event.target.value}),placeholder:"Руководитель проекта"})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Код в задачах"}),e("input",{maxLength:4,value:draft.code,onChange:event=>setDraft({...draft,code:event.target.value.toUpperCase()}),placeholder:"ИП"})]}),
      a("fieldset",{className:"contact-field full contact-tags-field",children:[e("legend",{children:"Теги команд — можно выбрать несколько или не выбирать ни одного"}),e("div",{children:K.map(tag=>a("button",{type:"button",className:draft.tags.includes(tag)?"selected":"",onClick:()=>toggleTag(tag),children:[tag,draft.tags.includes(tag)&&e(r,{size:12})]},tag))})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Email"}),e("input",{type:"email",value:draft.email,onChange:event=>setDraft({...draft,email:event.target.value}),placeholder:"name@company.ru"})]}),
      a("label",{className:"contact-field",children:[e("span",{children:"Телефон"}),e("input",{value:draft.phone,onChange:event=>setDraft({...draft,phone:event.target.value}),placeholder:"+7 900 000-00-00"})]}),
      a("label",{className:"contact-field full",children:[e("span",{children:"Telegram"}),e("input",{value:draft.telegram,onChange:event=>setDraft({...draft,telegram:event.target.value}),placeholder:"username"})]}),
      a("label",{className:"contact-field full",children:[e("span",{children:"Заметка"}),e("textarea",{rows:4,value:draft.notes,onChange:event=>setDraft({...draft,notes:event.target.value}),placeholder:"Зона ответственности, доступность, важные комментарии"})]}),
      a("footer",{children:[onDelete?a("button",{type:"button",className:"contacts-danger",onClick:()=>onDelete(draft.id),children:[e(x,{size:15})," Удалить"]}):e("span",{}),a("button",{type:"submit",className:"contacts-primary",children:[e(r,{size:16})," Сохранить"]})]})
    ]})
  ]})})
}
`;

const CONTACT_TAG_STYLES = String.raw`
/* Contact team tags */
.contact-tag-filters{max-width:1380px;margin:0 auto 14px;display:flex;flex-wrap:wrap;gap:7px}
.contact-tag-filters button{min-height:31px;padding:0 10px;border:1px solid #dfe5ee;border-radius:999px;background:#fff;color:#697587;font-size:9px;font-weight:700}
.contact-tag-filters button:hover,.contact-tag-filters button.active{border-color:#b9cceb;background:#eaf1fc;color:#3d659e}
.contact-tags{min-height:30px;margin-top:11px;display:flex;flex-wrap:wrap;gap:5px;align-items:flex-start}
.contact-tags .contact-team{margin-top:0}
.contact-team.tag-1{color:#7652a4;background:#eee8ff}
.contact-team.tag-2{color:#9a6b20;background:#fff1ce}
.contact-team.untagged{color:#7e8795;background:#f0f2f5}
.contact-tags-field{border:0;margin:0;padding:0}
.contact-tags-field legend{margin-bottom:7px}
.contact-tags-field>div{display:flex;flex-wrap:wrap;gap:7px}
.contact-tags-field button{min-height:34px;padding:0 10px;border:1px solid #dfe5ee;border-radius:10px;background:#fff;color:#677487;display:inline-flex;align-items:center;gap:6px;font-size:9px;font-weight:700}
.contact-tags-field button.selected{border-color:#8eaddb;background:#e9f1fd;color:#345f98}
`;

export async function applyContactTagsPatch() {
  const appPath="src/components/tracker-app.js";
  const cssPath="src/app/globals.css";
  let source=await readFile(appPath,"utf8");
  const contactsStart=source.indexOf("const CONTACTS_KEY=");
  const contactsEnd=source.indexOf("function le(",contactsStart);
  if(contactsStart<0||contactsEnd<0)throw new Error("Contact directory patch markers were not found");
  source=source.slice(0,contactsStart)+CONTACT_DIRECTORY+source.slice(contactsEnd);
  await writeFile(appPath,source);
  const css=await readFile(cssPath,"utf8");
  await writeFile(cssPath,css+"\n"+CONTACT_TAG_STYLES);
}
