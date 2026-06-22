import { readFile, writeFile } from "node:fs/promises";

const PROJECT_SYSTEM = String.raw`
const PROJECTS_KEY="tracker-seagull-projects-v1";
const ACTIVE_PROJECT_KEY="tracker-seagull-active-project-v1";
const PROJECT_CABINET_EVENT="tracker-seagull-open-projects";
const DEFAULT_PROJECT={id:"project-office",name:"Проектный офис",description:"Рабочее пространство",color:"purple",createdAt:"2026-06-22"};
function projectScopedKey(section,projectId){const id=projectId||(typeof window!=="undefined"?window.localStorage.getItem(ACTIVE_PROJECT_KEY):null)||DEFAULT_PROJECT.id;return"tracker-seagull-project-"+id+"-"+section+"-v1"}
function projectTasksStorageKey(){
  const key=projectScopedKey("tasks");
  if(typeof window!=="undefined"){
    const active=window.localStorage.getItem(ACTIVE_PROJECT_KEY)||DEFAULT_PROJECT.id;
    if(active===DEFAULT_PROJECT.id&&!window.localStorage.getItem(key)){
      const legacy=window.localStorage.getItem("tracker-seagull"+"-v1");
      if(legacy)window.localStorage.setItem(key,legacy);
    }
  }
  return key;
}
function readProjects(){
  if(typeof window==="undefined")return[DEFAULT_PROJECT];
  try{const parsed=JSON.parse(window.localStorage.getItem(PROJECTS_KEY)||"null");if(Array.isArray(parsed)&&parsed.length)return parsed}catch{}
  window.localStorage.setItem(PROJECTS_KEY,JSON.stringify([DEFAULT_PROJECT]));return[DEFAULT_PROJECT]
}
function activeProjectId(){return typeof window!=="undefined"?(window.localStorage.getItem(ACTIVE_PROJECT_KEY)||DEFAULT_PROJECT.id):DEFAULT_PROJECT.id}
function readProjectTasks(project){
  if(typeof window==="undefined")return[];
  try{const raw=window.localStorage.getItem(projectScopedKey("tasks",project.id));if(raw){const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed:[]}}catch{}
  return project.id===DEFAULT_PROJECT.id?[]:[]
}
function starterTask(project){
  const today=new Date(),due=new Date(today);due.setDate(due.getDate()+7);const input=date=>date.toISOString().slice(0,10);
  return{id:"task-"+Date.now(),title:"Первая задача проекта",description:"Откройте задачу и замените её данными проекта «"+project.name+"».",team:K[0],status:"queue",priority:"normal",sprint:G[0],assignees:[],startDate:input(today),dueDate:input(due),tags:["старт"]}
}
function applyActiveProjectLabels(){
  if(typeof document==="undefined")return;
  const project=readProjects().find(item=>item.id===activeProjectId())||DEFAULT_PROJECT;
  const title=document.querySelector(".project-title b");if(title)title.textContent=project.name;
  const subtitle=document.querySelector(".project-title span");if(subtitle)subtitle.textContent=project.description||"Рабочее пространство";
  const breadcrumb=document.querySelector(".breadcrumb");if(breadcrumb){const span=breadcrumb.querySelector("span");breadcrumb.textContent=project.name+" ";if(span){breadcrumb.append(span);breadcrumb.append(" Трекер")}}
}
function projectCabinet({onClose}){
  const[projects,setProjects]=q([DEFAULT_PROJECT]);
  const[creating,setCreating]=q(false);
  const[draft,setDraft]=q({name:"",description:"",color:"purple"});
  const activeId=activeProjectId();
  F(()=>{setProjects(readProjects())},[]);
  function persist(next){setProjects(next);window.localStorage.setItem(PROJECTS_KEY,JSON.stringify(next))}
  function openProject(id){window.localStorage.setItem(ACTIVE_PROJECT_KEY,id);window.location.reload()}
  function createProject(event){
    event.preventDefault();const name=draft.name.trim();if(!name)return;
    const project={id:"project-"+Date.now(),name,description:draft.description.trim()||"Рабочее пространство",color:draft.color,createdAt:new Date().toISOString().slice(0,10)};
    const next=[...projects,project];window.localStorage.setItem(PROJECTS_KEY,JSON.stringify(next));window.localStorage.setItem(projectScopedKey("tasks",project.id),JSON.stringify([starterTask(project)]));window.localStorage.setItem(ACTIVE_PROJECT_KEY,project.id);window.location.reload()
  }
  function deleteProject(project){
    if(projects.length===1)return;
    if(!window.confirm("Удалить проект «"+project.name+"» и его трекер?"))return;
    const next=projects.filter(item=>item.id!==project.id);window.localStorage.removeItem(projectScopedKey("tasks",project.id));window.localStorage.removeItem(projectScopedKey("collapsed-branches",project.id));window.localStorage.removeItem(projectScopedKey("calendar",project.id));window.localStorage.setItem(PROJECTS_KEY,JSON.stringify(next));
    if(activeId===project.id){window.localStorage.setItem(ACTIVE_PROJECT_KEY,next[0].id);window.location.reload()}else persist(next)
  }
  return a(n,{children:[
    e("section",{className:"projects-overlay",children:a("div",{className:"projects-shell",children:[
      a("header",{className:"projects-header",children:[a("div",{children:[e("span",{children:"Tracker Seagull"}),e("h1",{children:"Кабинет проектов"}),e("p",{children:"Каждый проект получает собственное независимое рабочее поле трекера"})]}),a("div",{children:[e("button",{className:"projects-new",onClick:()=>setCreating(true),children:"＋ Новый проект"}),e("button",{className:"projects-close",onClick:onClose,children:"Вернуться в трекер"})]})]}),
      a("section",{className:"projects-summary",children:[a("div",{children:[e("strong",{children:projects.length}),e("span",{children:"проектов"})]}),a("div",{children:[e("strong",{children:projects.reduce((sum,project)=>sum+readProjectTasks(project).length,0)}),e("span",{children:"задач во всех трекерах"})]}),a("div",{children:[e("strong",{children:projects.filter(project=>readProjectTasks(project).some(task=>task.status==="in-progress")).length}),e("span",{children:"активных проектов"})]})]}),
      e("div",{className:"projects-grid",children:projects.map((project,index)=>{const tasks=readProjectTasks(project),done=tasks.filter(task=>task.status==="done").length,progress=tasks.length?Math.round(done/tasks.length*100):0,isActive=project.id===activeId;return a("article",{className:"project-card color-"+(project.color||"purple")+(isActive?" active":""),children:[
        a("button",{className:"project-card-main",onClick:()=>openProject(project.id),children:[e("div",{className:"project-card-orb",children:(project.name[0]||"П").toUpperCase()}),a("div",{className:"project-card-copy",children:[a("div",{children:[e("strong",{children:project.name}),isActive&&e("small",{children:"Открыт"})]}),e("span",{children:project.description||"Рабочее пространство"})]}),e("b",{children:"Открыть →"})]}),
        a("div",{className:"project-card-stats",children:[a("span",{children:[e("b",{children:tasks.length})," задач"]}),a("span",{children:[e("b",{children:tasks.filter(task=>task.status==="in-progress").length})," в работе"]}),a("span",{children:[e("b",{children:tasks.filter(task=>task.status==="review").length})," на проверке"]})]}),
        a("div",{className:"project-progress",children:[e("div",{children:e("span",{style:{width:progress+"%"}})}),e("small",{children:progress+"% выполнено"})]}),
        a("footer",{children:[e("span",{children:"Создан "+new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(project.createdAt+"T00:00:00"))}),projects.length>1&&e("button",{onClick:()=>deleteProject(project),children:"Удалить"})]})
      ]},project.id)})}),
      e("button",{className:"project-add-card",onClick:()=>setCreating(true),children:[e("span",{children:"＋"}),e("strong",{children:"Создать новый проект"}),e("small",{children:"Будет создан отдельный трекер с собственными задачами"})]})
    ]})}),
    creating&&e("div",{className:"project-create-backdrop",onMouseDown:()=>setCreating(false),children:a("form",{className:"project-create-dialog",onSubmit:createProject,onMouseDown:event=>event.stopPropagation(),children:[a("header",{children:[a("div",{children:[e("span",{children:"Новый проект"}),e("h2",{children:"Создать рабочее пространство"})]}),e("button",{type:"button",onClick:()=>setCreating(false),children:"×"})]}),a("label",{children:[e("span",{children:"Название проекта"}),e("input",{autoFocus:true,required:true,value:draft.name,onChange:event=>setDraft({...draft,name:event.target.value}),placeholder:"Например, Академия TouchSpace"})]}),a("label",{children:[e("span",{children:"Описание"}),e("input",{value:draft.description,onChange:event=>setDraft({...draft,description:event.target.value}),placeholder:"Рабочее пространство"})]}),a("fieldset",{children:[e("legend",{children:"Цвет проекта"}),e("div",{className:"project-color-options",children:["purple","blue","green","orange"].map(color=>e("button",{type:"button",className:color+(draft.color===color?" selected":""),onClick:()=>setDraft({...draft,color}),"aria-label":color},color))})]}),a("footer",{children:[e("button",{type:"button",onClick:()=>setCreating(false),children:"Отмена"}),e("button",{type:"submit",children:"Создать проект"})]})]})})
  ]})
}
export function TrackerApp(){
  const[cabinetOpen,setCabinetOpen]=q(false);
  F(()=>{applyActiveProjectLabels();const open=()=>setCabinetOpen(true);window.addEventListener(PROJECT_CABINET_EVENT,open);return()=>window.removeEventListener(PROJECT_CABINET_EVENT,open)},[]);
  return a(n,{children:[e(ProjectTrackerWorkspace,{}),cabinetOpen&&e(projectCabinet,{onClose:()=>{setCabinetOpen(false);setTimeout(applyActiveProjectLabels,0)}})]})
}
`;

const PROJECT_STYLES = String.raw`
/* Project cabinet */
.project-title.project-cabinet-trigger{cursor:pointer;border-radius:12px;transition:background .15s,transform .15s}
.project-title.project-cabinet-trigger:hover{background:#eef2f8;transform:translateY(-1px)}
.projects-overlay{position:fixed;inset:0;z-index:200;background:#f2f5fa;overflow-y:auto;color:#202735}
.projects-shell{max-width:1380px;min-height:100%;margin:0 auto;padding:28px 34px 50px}
.projects-header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:24px}
.projects-header>div:first-child>span{color:#67778d;text-transform:uppercase;letter-spacing:.12em;font-size:9px;font-weight:850}
.projects-header h1{margin:7px 0 5px;font-size:30px;letter-spacing:-1.1px}
.projects-header p{margin:0;color:#7a8799;font-size:11px}
.projects-header>div:last-child{display:flex;gap:8px}
.projects-new,.projects-close{min-height:39px;padding:0 14px;border:0;border-radius:10px;font-size:10px;font-weight:780}
.projects-new{background:#3776c5;color:#fff;box-shadow:0 8px 20px rgba(55,118,197,.22)}
.projects-close{background:#e5ebf3;color:#566579}
.projects-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:19px}
.projects-summary>div{min-height:82px;padding:15px 17px;border:1px solid #e1e7ef;border-radius:14px;background:#fff;box-shadow:0 8px 25px rgba(37,51,72,.04)}
.projects-summary strong{display:block;font-size:24px;letter-spacing:-.7px}
.projects-summary span{display:block;margin-top:5px;color:#8390a1;font-size:9px}
.projects-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.project-card{position:relative;border:1px solid #dfe5ed;border-radius:17px;background:#fff;overflow:hidden;box-shadow:0 12px 32px rgba(33,47,67,.06);transition:transform .16s,box-shadow .16s,border-color .16s}
.project-card:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(33,47,67,.10)}
.project-card.active{border-color:#a9bddc;box-shadow:0 14px 36px rgba(65,99,150,.13)}
.project-card-main{width:100%;min-height:91px;padding:15px;border:0;background:transparent;display:grid;grid-template-columns:45px minmax(0,1fr) auto;align-items:center;gap:11px;text-align:left}
.project-card-orb{width:45px;height:45px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:13px;font-weight:850;background:linear-gradient(145deg,#8257e5,#c77cf4)}
.color-blue .project-card-orb{background:linear-gradient(145deg,#3776c5,#72b4ee)}.color-green .project-card-orb{background:linear-gradient(145deg,#399b73,#79cea7)}.color-orange .project-card-orb{background:linear-gradient(145deg,#d77a38,#f2b168)}
.project-card-copy{min-width:0}.project-card-copy>div{display:flex;align-items:center;gap:7px}.project-card-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.project-card-copy small{padding:3px 6px;border-radius:999px;background:#e8f0fb;color:#4770a6;font-size:7px;font-weight:800}.project-card-copy>span{display:block;margin-top:5px;color:#8490a0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}.project-card-main>b{color:#6680a5;font-size:8px}
.project-card-stats{padding:0 15px 12px;display:flex;gap:7px;flex-wrap:wrap}.project-card-stats span{padding:5px 7px;border-radius:8px;background:#f1f4f8;color:#7a8798;font-size:8px}.project-card-stats b{color:#3d4a5c}
.project-progress{padding:0 15px 14px}.project-progress>div{height:5px;border-radius:999px;background:#edf1f5;overflow:hidden}.project-progress>div span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#5a83bc,#8e6ed6)}.project-progress small{display:block;margin-top:5px;color:#8b96a5;font-size:7px}
.project-card footer{min-height:39px;padding:8px 12px 8px 15px;border-top:1px solid #edf0f4;background:#fafbfd;display:flex;align-items:center;justify-content:space-between;gap:10px}.project-card footer span{color:#929cab;font-size:7px}.project-card footer button{border:0;background:transparent;color:#a05f66;font-size:8px;font-weight:700}
.project-add-card{min-height:188px;border:1px dashed #bfcbd9;border-radius:17px;background:rgba(255,255,255,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:#66768b}.project-add-card:hover{border-color:#7c9bc5;background:#fff}.project-add-card>span{width:39px;height:39px;border-radius:50%;background:#e4ecf7;display:grid;place-items:center;color:#4870a6;font-size:20px}.project-add-card strong{font-size:11px}.project-add-card small{max-width:240px;color:#8b96a5;text-align:center;font-size:8px;line-height:1.45}
.project-create-backdrop{position:fixed;inset:0;z-index:240;background:rgba(20,29,43,.5);backdrop-filter:blur(7px);display:grid;place-items:center;padding:18px}.project-create-dialog{width:min(500px,100%);padding:18px;border-radius:18px;background:#fff;box-shadow:0 28px 90px rgba(15,24,39,.34)}.project-create-dialog header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:17px}.project-create-dialog header span{color:#8090a4;text-transform:uppercase;letter-spacing:.1em;font-size:8px;font-weight:800}.project-create-dialog h2{margin:6px 0 0;font-size:19px}.project-create-dialog header button{width:33px;height:33px;border:0;border-radius:9px;background:#f0f3f7;color:#667489;font-size:19px}.project-create-dialog label{display:block;margin-top:11px}.project-create-dialog label>span,.project-create-dialog legend{display:block;margin-bottom:6px;color:#6e7b8d;font-size:9px;font-weight:700}.project-create-dialog input{width:100%;min-height:41px;padding:0 11px;border:1px solid #dce3ec;border-radius:10px;font:inherit;font-size:10px}.project-create-dialog fieldset{border:0;margin:13px 0 0;padding:0}.project-color-options{display:flex;gap:8px}.project-color-options button{width:34px;height:34px;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #d7dee8;background:#9d69e9}.project-color-options .blue{background:#5594d7}.project-color-options .green{background:#55ad82}.project-color-options .orange{background:#e79752}.project-color-options button.selected{box-shadow:0 0 0 2px #4d78b0}.project-create-dialog footer{margin-top:19px;display:flex;justify-content:flex-end;gap:8px}.project-create-dialog footer button{min-height:37px;padding:0 13px;border:0;border-radius:9px;background:#e9edf3;color:#607087;font-size:9px;font-weight:750}.project-create-dialog footer button[type="submit"]{background:#3978c7;color:#fff}
@media(max-width:1000px){.projects-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:680px){.projects-shell{padding:18px 12px 35px}.projects-header{flex-direction:column}.projects-header>div:last-child{width:100%}.projects-new,.projects-close{flex:1}.projects-summary{grid-template-columns:1fr}.projects-grid{grid-template-columns:1fr}.project-card-main{grid-template-columns:42px minmax(0,1fr)}.project-card-main>b{display:none}}
`;

export async function applyProjectCabinetPatch(){
  const appPath="src/components/tracker-app.js";
  const cssPath="src/app/globals.css";
  let source=await readFile(appPath,"utf8");

  const exportPattern=/export function TrackerApp\(\)\s*\{/;
  if(!exportPattern.test(source))throw new Error("TrackerApp export marker was not found");
  source=source.replace(exportPattern,"function ProjectTrackerWorkspace(){");

  const oldStorage=(source.match(/[\"']tracker-seagull-v1[\"']/)||[])[0];
  if(!oldStorage)throw new Error("Task storage key marker was not found");
  source=source.replace(oldStorage,"projectTasksStorageKey()");
  source=source.replace(/[\"']tracker-seagull-collapsed-branches-v1[\"']/g,'projectScopedKey("collapsed-branches")');

  const projectTitle='className:"project-title"';
  if(!source.includes(projectTitle))throw new Error("Project title marker was not found");
  source=source.replace(projectTitle,'className:"project-title project-cabinet-trigger",role:"button",tabIndex:0,onClick:()=>window.dispatchEvent(new CustomEvent(PROJECT_CABINET_EVENT)),onKeyDown:event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();window.dispatchEvent(new CustomEvent(PROJECT_CABINET_EVENT))}}');

  source+="\n"+PROJECT_SYSTEM;
  await writeFile(appPath,source);
  const css=await readFile(cssPath,"utf8");
  await writeFile(cssPath,css+"\n"+PROJECT_STYLES);
}
