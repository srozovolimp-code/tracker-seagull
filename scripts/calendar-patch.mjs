import { readFile, writeFile } from "node:fs/promises";

const CALENDAR_FUNCTION = String.raw`function oe({tasks,cursor,onCursorChange,onEdit,onCreate}) {
  const [displayMode,setDisplayMode]=q("period");
  const [selectedDate,setSelectedDate]=q(null);
  const PrevIcon=c;
  const NextIcon=d;
  const AddIcon=T;
  const CalendarIcon=i;
  const monthLabel=new Intl.DateTimeFormat("ru-RU",{month:"long",year:"numeric"}).format(cursor);
  const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);
  const last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);
  const monthStart=ae(first);
  const monthEnd=ae(last);
  const startOffset=(first.getDay()+6)%7;
  const gridStart=new Date(cursor.getFullYear(),cursor.getMonth(),1-startOffset);
  const days=Array.from({length:42},(_,index)=>{const day=new Date(gridStart);day.setDate(day.getDate()+index);return day});
  const monthTasks=A(()=>tasks.filter(task=>task.startDate<=monthEnd&&task.dueDate>=monthStart).sort((left,right)=>left.dueDate.localeCompare(right.dueDate)||left.title.localeCompare(right.title,"ru")),[tasks,monthEnd,monthStart]);
  const selectedDayTasks=A(()=>{if(!selectedDate)return[];return tasks.filter(task=>task.startDate<=selectedDate&&task.dueDate>=selectedDate).sort((left,right)=>left.dueDate.localeCompare(right.dueDate))},[selectedDate,tasks]);
  const visibleAgenda=selectedDate?selectedDayTasks:monthTasks;
  const doneCount=monthTasks.filter(task=>task.status==="done").length;
  const overdueCount=monthTasks.filter(task=>task.status!=="done"&&task.dueDate<ae(new Date())).length;
  function tasksForDay(key){return tasks.filter(task=>displayMode==="deadline"?task.dueDate===key:task.startDate<=key&&task.dueDate>=key).sort((left,right)=>left.dueDate.localeCompare(right.dueDate)||left.title.localeCompare(right.title,"ru"))}
  function moveMonth(offset){setSelectedDate(null);onCursorChange(new Date(cursor.getFullYear(),cursor.getMonth()+offset,1))}
  function goToday(){const today=new Date();setSelectedDate(ae(today));onCursorChange(new Date(today.getFullYear(),today.getMonth(),1))}
  return <div className="calendar-workspace">
    <section className="calendar-shell">
      <div className="calendar-toolbar">
        <div className="calendar-navigation">
          <button onClick={()=>moveMonth(-1)} aria-label="Предыдущий месяц"><PrevIcon size={18}/></button>
          <button onClick={goToday}>Сегодня</button>
          <button onClick={()=>moveMonth(1)} aria-label="Следующий месяц"><NextIcon size={18}/></button>
        </div>
        <h2>{monthLabel}</h2>
        <div className="calendar-mode" role="group" aria-label="Режим отображения задач">
          <button className={displayMode==="period"?"active":""} onClick={()=>setDisplayMode("period")}>Периоды</button>
          <button className={displayMode==="deadline"?"active":""} onClick={()=>setDisplayMode("deadline")}>Сроки</button>
        </div>
      </div>
      <div className="calendar-weekdays">{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(day=><div key={day}>{day}</div>)}</div>
      <div className="calendar-grid">
        {days.map(day=>{
          const key=ae(day);
          const dayTasks=tasksForDay(key);
          const currentMonth=day.getMonth()===cursor.getMonth();
          const isToday=key===ae(new Date());
          const isSelected=key===selectedDate;
          return <div key={key} className={_("calendar-day",!currentMonth&&"muted",isSelected&&"selected")}>
            <div className="calendar-day-head">
              <button className={_("day-number",isToday&&"today")} onClick={()=>setSelectedDate(current=>current===key?null:key)} aria-label={"Показать задачи за "+ee(key)}>{day.getDate()}</button>
              <button className="calendar-day-add" onClick={()=>onCreate({startDate:key,dueDate:key})} aria-label={"Создать задачу на "+ee(key)}><AddIcon size={13}/></button>
            </div>
            <div className="calendar-events">
              {dayTasks.map(task=>{
                const isStart=task.startDate===key;
                const isEnd=task.dueDate===key;
                return <button key={task.id} className={_("calendar-event","status-"+task.status,isStart&&"range-start",isEnd&&"range-end")} onClick={()=>onEdit(task)} title={task.title+" · "+ee(task.startDate)+" — "+ee(task.dueDate)}>
                  <span>{task.title}</span>
                  {displayMode==="period"&&<small>{isEnd?"срок":isStart?"старт":""}</small>}
                </button>
              })}
              {!dayTasks.length&&currentMonth&&<span className="calendar-no-events">Нет задач</span>}
            </div>
          </div>
        })}
      </div>
    </section>
    <aside className="calendar-agenda">
      <div className="calendar-agenda-head">
        <div><span>{selectedDate?ee(selectedDate,{day:"numeric",month:"long",year:"numeric"}):"Все задачи месяца"}</span><small>{visibleAgenda.length} задач</small></div>
        {selectedDate&&<button onClick={()=>setSelectedDate(null)}>Весь месяц</button>}
      </div>
      <div className="calendar-stats">
        <div><strong>{monthTasks.length}</strong><span>в месяце</span></div>
        <div><strong>{doneCount}</strong><span>готово</span></div>
        <div><strong>{overdueCount}</strong><span>просрочено</span></div>
      </div>
      <div className="calendar-agenda-list">
        {visibleAgenda.map(task=><button key={task.id} className="calendar-agenda-item" onClick={()=>onEdit(task)}>
          <span className={"calendar-agenda-status status-"+task.status}/>
          <span className="calendar-agenda-copy"><strong>{task.title}</strong><small>{task.team+" · "+H[task.status]}</small></span>
          <span className="calendar-agenda-date">{ee(task.dueDate,{day:"2-digit",month:"short"})}</span>
        </button>)}
        {!visibleAgenda.length&&<div className="calendar-agenda-empty"><CalendarIcon size={24}/><strong>Задач нет</strong><span>Создайте задачу или измените текущие фильтры.</span></div>}
      </div>
      <button className="calendar-create-button" onClick={()=>onCreate(selectedDate?{startDate:selectedDate,dueDate:selectedDate}:undefined)}><AddIcon size={15}/> Создать задачу</button>
    </aside>
  </div>
}
`;

const CALENDAR_STYLES = String.raw`
/* Calendar v2: full task periods, complete month agenda and timezone-safe dates */
.calendar-workspace{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;align-items:start}
.calendar-workspace .calendar-shell{min-width:0;background:#fff;overflow:auto}
.calendar-workspace .calendar-toolbar{min-width:790px;min-height:62px;height:auto;display:grid;grid-template-columns:1fr auto 1fr;gap:12px;padding:8px 14px}
.calendar-workspace .calendar-toolbar h2{text-align:center}
.calendar-navigation,.calendar-mode{display:flex!important;align-items:center;gap:5px}
.calendar-mode{justify-content:flex-end}
.calendar-mode button.active{color:#315f9d;background:#e8f0ff;border-color:#c7d8f5;font-weight:700}
.calendar-workspace .calendar-weekdays,.calendar-workspace .calendar-grid{min-width:790px;grid-template-columns:repeat(7,minmax(112px,1fr))}
.calendar-workspace .calendar-weekdays>div{background:#fafbfd}
.calendar-workspace .calendar-day{min-height:146px;transition:background .16s,box-shadow .16s}
.calendar-workspace .calendar-day:nth-child(7n){border-right:0}
.calendar-workspace .calendar-day.selected{background:#f5f8ff;box-shadow:inset 0 0 0 2px #9ab5e2}
.calendar-day-head{display:flex;justify-content:space-between;align-items:center;min-height:28px}
.calendar-day-add{width:25px;height:25px;border:0;border-radius:7px;display:grid;place-items:center;color:#8b97a8;background:transparent;opacity:0;transition:opacity .15s,background .15s}
.calendar-day:hover .calendar-day-add,.calendar-day.selected .calendar-day-add{opacity:1}
.calendar-day-add:hover{color:#416da9;background:#eaf1fc}
.calendar-workspace .calendar-event{min-width:0;min-height:24px;height:auto;padding:3px 6px;display:flex;align-items:center;justify-content:space-between;gap:5px;line-height:1.25}
.calendar-workspace .calendar-event:hover{filter:brightness(.975);box-shadow:0 2px 6px rgba(39,57,85,.12)}
.calendar-event>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.calendar-event small{flex:none;opacity:.72;text-transform:uppercase;font-size:7px;font-weight:800;letter-spacing:.04em}
.calendar-event.range-start{border-left:3px solid currentColor}
.calendar-event.range-end{border-right:3px solid currentColor}
.calendar-no-events{color:#bdc4ce;padding:4px 5px;font-size:9px}
.calendar-agenda{position:sticky;top:10px;border:1px solid var(--line);border-radius:14px;background:#fff;min-height:560px;max-height:calc(100vh - 230px);display:flex;flex-direction:column;overflow:hidden}
.calendar-agenda-head{min-height:62px;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 13px;border-bottom:1px solid #edf0f4}
.calendar-agenda-head span{display:block;font-size:12px;font-weight:750}
.calendar-agenda-head small{display:block;color:#929cab;margin-top:3px;font-size:9px}
.calendar-agenda-head button{color:#4d70a6;background:#edf3fc;border:0;border-radius:7px;min-height:29px;padding:0 8px;font-size:9px}
.calendar-stats{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #edf0f4;background:#fafbfd}
.calendar-stats div{padding:10px 7px;text-align:center;border-right:1px solid #edf0f4}
.calendar-stats div:last-child{border-right:0}
.calendar-stats strong{display:block;font-size:17px}
.calendar-stats span{display:block;color:#8e98a7;margin-top:2px;font-size:8px}
.calendar-agenda-list{flex:1;overflow-y:auto;padding:7px}
.calendar-agenda-item{width:100%;min-height:58px;display:grid;grid-template-columns:8px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 7px;text-align:left;background:transparent;border:0;border-radius:9px}
.calendar-agenda-item:hover{background:#f5f8fc}
.calendar-agenda-status{width:7px;height:32px;border-radius:999px}
.calendar-agenda-copy{min-width:0}
.calendar-agenda-copy strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
.calendar-agenda-copy small{display:block;color:#8b95a4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:4px;font-size:8px}
.calendar-agenda-date{color:#687487;white-space:nowrap;font-size:9px}
.calendar-agenda-empty{color:#8c96a6;min-height:230px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-align:center;padding:20px}
.calendar-agenda-empty strong{color:#455164;font-size:12px}
.calendar-agenda-empty span{max-width:190px;font-size:9px;line-height:1.45}
.calendar-create-button{margin:8px;min-height:38px;border:0;border-radius:10px;color:#315a91;background:#e6eefb;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:11px;font-weight:700}
.calendar-create-button:hover{background:#d9e6f8}
@media(max-width:1180px){.calendar-workspace{grid-template-columns:1fr}.calendar-agenda{position:static;max-height:none;min-height:360px}}
@media(max-width:680px){.calendar-workspace .calendar-day{min-height:132px}.calendar-workspace .calendar-toolbar{grid-template-columns:1fr auto;align-items:center}.calendar-workspace .calendar-toolbar h2{grid-row:1;grid-column:2}.calendar-mode{grid-column:1/-1;justify-content:flex-start}}
`;

export async function applyCalendarPatch() {
  const appPath = "src/components/tracker-app.js";
  const cssPath = "src/app/globals.css";
  let source = await readFile(appPath, "utf8");

  const helperPattern = /function ae\(e\)\{return e\.toISOString\(\)\.slice\(0,10\)\}/;
  source = source.replace(helperPattern, 'function ae(e){const a=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),t=String(e.getDate()).padStart(2,"0");return a+"-"+n+"-"+t}');
  source = source.replace('q((()=>new Date(2026,5,1)))', 'q((()=>{const e=new Date;return new Date(e.getFullYear(),e.getMonth(),1)}))');

  const calendarStart = source.indexOf("function oe(");
  const calendarEnd = source.indexOf("function he(", calendarStart);
  if (calendarStart < 0 || calendarEnd < 0) {
    throw new Error("Calendar patch markers were not found in tracker-app.js");
  }
  source = source.slice(0, calendarStart) + CALENDAR_FUNCTION + source.slice(calendarEnd);
  await writeFile(appPath, source);

  const css = await readFile(cssPath, "utf8");
  await writeFile(cssPath, css + "\n" + CALENDAR_STYLES);
}
