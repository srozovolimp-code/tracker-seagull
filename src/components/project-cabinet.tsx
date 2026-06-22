"use client";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  KanbanSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "@/app/projects/projects.module.css";

type Status = "queue" | "in-progress" | "review" | "done";
type Priority = "low" | "normal" | "high";
type ViewMode = "table" | "kanban" | "calendar";

type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  team: string;
  status: Status;
  priority: Priority;
  sprint: string;
  assignees: string[];
  startDate: string;
  dueDate: string;
};

const PROJECTS_KEY = "tracker-seagull-projects-v2";
const ACTIVE_PROJECT_KEY = "tracker-seagull-active-project-v2";
const LEGACY_TASKS_KEY = "tracker-seagull-v1";
const TEAMS = ["Команда Движка", "Команда Интеграций", "Дизайн"];
const COLORS = ["#8b5cf6", "#4f8df7", "#19a974", "#ef7d48", "#d6587c", "#3b7c83"];
const STATUS_LABELS: Record<Status, string> = {
  queue: "На очереди",
  "in-progress": "В работе",
  review: "На проверке",
  done: "Готово",
};
const STATUS_ORDER: Status[] = ["queue", "in-progress", "review", "done"];

function localDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function tasksKey(projectId: string) {
  return `tracker-seagull-project:${projectId}:tasks`;
}

function collapsedKey(projectId: string) {
  return `tracker-seagull-project:${projectId}:collapsed`;
}

function makeProject(name = "Новый проект", description = "Рабочее пространство проекта"): Project {
  return {
    id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    description,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    createdAt: new Date().toISOString(),
  };
}

function emptyTask(team = TEAMS[0]): Task {
  const start = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 7);
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    description: "",
    team,
    status: "queue",
    priority: "normal",
    sprint: "Бэклог",
    assignees: [],
    startDate: localDate(start),
    dueDate: localDate(due),
  };
}

function readProjects(): Project[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "null") as Project[] | null;
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {}

  const initial: Project = {
    id: "project-office",
    name: "Проектный офис",
    description: "Рабочее пространство",
    color: "#8b5cf6",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PROJECTS_KEY, JSON.stringify([initial]));

  try {
    const legacy = localStorage.getItem(LEGACY_TASKS_KEY);
    if (legacy && !localStorage.getItem(tasksKey(initial.id))) {
      localStorage.setItem(tasksKey(initial.id), legacy);
    }
  } catch {}

  return [initial];
}

function readTasks(projectId: string): Task[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(tasksKey(projectId)) || "[]") as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function ProjectCabinet() {
  const [hydrated, setHydrated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const initialProjects = readProjects();
    const storedActive = localStorage.getItem(ACTIVE_PROJECT_KEY);
    setProjects(initialProjects);
    setActiveProjectId(storedActive && initialProjects.some((p) => p.id === storedActive) ? storedActive : null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects, hydrated]);

  function openProject(id: string) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
    setActiveProjectId(id);
  }

  function closeProject() {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
    setActiveProjectId(null);
  }

  function saveProject(project: Project) {
    setProjects((current) => {
      const exists = current.some((item) => item.id === project.id);
      return exists ? current.map((item) => (item.id === project.id ? project : item)) : [...current, project];
    });
    setEditingProject(null);
  }

  function deleteProject(project: Project) {
    if (!window.confirm(`Удалить проект «${project.name}» и все его задачи?`)) return;
    localStorage.removeItem(tasksKey(project.id));
    localStorage.removeItem(collapsedKey(project.id));
    setProjects((current) => current.filter((item) => item.id !== project.id));
    if (activeProjectId === project.id) closeProject();
  }

  const activeProject = projects.find((project) => project.id === activeProjectId) || null;

  if (!hydrated) {
    return <div className={styles.loading}>Загрузка кабинета проектов…</div>;
  }

  return (
    <div className={styles.page}>
      {activeProject ? (
        <ProjectWorkspace
          key={activeProject.id}
          project={activeProject}
          onBack={closeProject}
          onEditProject={() => setEditingProject(activeProject)}
        />
      ) : (
        <ProjectsHome
          projects={projects}
          onOpen={openProject}
          onCreate={() => setEditingProject(makeProject())}
          onEdit={setEditingProject}
          onDelete={deleteProject}
        />
      )}
      {editingProject && (
        <ProjectDialog project={editingProject} onClose={() => setEditingProject(null)} onSave={saveProject} />
      )}
    </div>
  );
}

function ProjectsHome({
  projects,
  onOpen,
  onCreate,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = projects.filter((project) => `${project.name} ${project.description}`.toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru")));

  return (
    <main className={styles.cabinet}>
      <header className={styles.cabinetHeader}>
        <div>
          <span className={styles.eyebrow}>Tracker Seagull</span>
          <h1>Проекты</h1>
          <p>Каждый проект содержит отдельный рабочий трекер и собственный набор задач.</p>
        </div>
        <button className={styles.primaryButton} onClick={onCreate}><Plus size={17} /> Создать проект</button>
      </header>

      <section className={styles.cabinetToolbar}>
        <label className={styles.searchBox}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти проект" /></label>
        <span>{filtered.length} проектов</span>
      </section>

      <section className={styles.projectGrid}>
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />
        ))}
        <button className={styles.newProjectCard} onClick={onCreate}><span><Plus size={24} /></span><strong>Новый проект</strong><small>Создать отдельное рабочее пространство</small></button>
      </section>
    </main>
  );
}

function ProjectCard({ project, onOpen, onEdit, onDelete }: { project: Project; onOpen: (id: string) => void; onEdit: (project: Project) => void; onDelete: (project: Project) => void }) {
  const [stats, setStats] = useState({ total: 0, done: 0, inProgress: 0 });
  useEffect(() => {
    const tasks = readTasks(project.id);
    setStats({ total: tasks.length, done: tasks.filter((task) => task.status === "done").length, inProgress: tasks.filter((task) => task.status === "in-progress").length });
  }, [project.id]);
  const progress = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <article className={styles.projectCard}>
      <div className={styles.projectCardTop}>
        <button className={styles.projectOpenArea} onClick={() => onOpen(project.id)}>
          <span className={styles.projectOrb} style={{ background: project.color }} />
          <span><strong>{project.name}</strong><small>{project.description}</small></span>
        </button>
        <div className={styles.cardMenu}>
          <button onClick={() => onEdit(project)} aria-label="Редактировать проект"><Pencil size={15} /></button>
          <button onClick={() => onDelete(project)} aria-label="Удалить проект"><Trash2 size={15} /></button>
        </div>
      </div>
      <button className={styles.projectCardBody} onClick={() => onOpen(project.id)}>
        <div className={styles.projectStats}>
          <span><b>{stats.total}</b><small>задач</small></span>
          <span><b>{stats.inProgress}</b><small>в работе</small></span>
          <span><b>{progress}%</b><small>готово</small></span>
        </div>
        <div className={styles.progressTrack}><span style={{ width: `${progress}%`, background: project.color }} /></div>
      </button>
    </article>
  );
}

function ProjectWorkspace({ project, onBack, onEditProject }: { project: Project; onBack: () => void; onEditProject: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewMode>("table");
  const [query, setQuery] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => {
    setTasks(readTasks(project.id));
    try {
      const saved = JSON.parse(localStorage.getItem(collapsedKey(project.id)) || "[]") as string[];
      setCollapsed(Array.isArray(saved) ? saved : []);
    } catch {
      setCollapsed([]);
    }
  }, [project.id]);

  useEffect(() => {
    localStorage.setItem(tasksKey(project.id), JSON.stringify(tasks));
  }, [tasks, project.id]);

  useEffect(() => {
    localStorage.setItem(collapsedKey(project.id), JSON.stringify(collapsed));
  }, [collapsed, project.id]);

  const filtered = useMemo(() => {
    const text = query.trim().toLocaleLowerCase("ru");
    return tasks.filter((task) => !text || `${task.title} ${task.description} ${task.team}`.toLocaleLowerCase("ru").includes(text));
  }, [tasks, query]);

  function saveTask(task: Task) {
    setTasks((current) => current.some((item) => item.id === task.id) ? current.map((item) => item.id === task.id ? task : item) : [...current, task]);
    setEditingTask(null);
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setEditingTask(null);
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, ...patch } : task));
  }

  function toggleTeam(team: string) {
    setCollapsed((current) => current.includes(team) ? current.filter((item) => item !== team) : [...current, team]);
  }

  return (
    <main className={styles.workspace}>
      <header className={styles.workspaceHeader}>
        <button className={styles.backButton} onClick={onBack}><ArrowLeft size={17} /> Все проекты</button>
        <div className={styles.workspaceTitle}>
          <span className={styles.projectOrb} style={{ background: project.color }} />
          <div><h1>{project.name}</h1><p>{project.description}</p></div>
        </div>
        <button className={styles.iconButton} onClick={onEditProject} aria-label="Настройки проекта"><MoreHorizontal size={18} /></button>
      </header>

      <nav className={styles.viewTabs}>
        <button className={view === "table" ? styles.activeTab : ""} onClick={() => setView("table")}><Table2 size={16} /> Таблица</button>
        <button className={view === "kanban" ? styles.activeTab : ""} onClick={() => setView("kanban")}><KanbanSquare size={16} /> Канбан</button>
        <button className={view === "calendar" ? styles.activeTab : ""} onClick={() => setView("calendar")}><CalendarDays size={16} /> Календарь</button>
      </nav>

      <section className={styles.workspaceToolbar}>
        <label className={styles.searchBox}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по задачам" /></label>
        <button className={styles.primaryButton} onClick={() => setEditingTask(emptyTask())}><Plus size={16} /> Создать задачу</button>
      </section>

      <section className={styles.workspaceBody}>
        {view === "table" && <TasksTable tasks={filtered} collapsed={collapsed} onToggleTeam={toggleTeam} onEdit={setEditingTask} onCreate={(team) => setEditingTask(emptyTask(team))} onUpdate={updateTask} />}
        {view === "kanban" && <Kanban tasks={filtered} onEdit={setEditingTask} onCreate={(status) => setEditingTask({ ...emptyTask(), status })} onUpdate={updateTask} />}
        {view === "calendar" && <Calendar tasks={filtered} month={month} onMonth={setMonth} onEdit={setEditingTask} onCreate={(date) => setEditingTask({ ...emptyTask(), startDate: date, dueDate: date })} />}
      </section>

      {editingTask && <TaskDialog task={editingTask} exists={tasks.some((task) => task.id === editingTask.id)} onSave={saveTask} onDelete={removeTask} onClose={() => setEditingTask(null)} />}
    </main>
  );
}

function TasksTable({ tasks, collapsed, onToggleTeam, onEdit, onCreate, onUpdate }: { tasks: Task[]; collapsed: string[]; onToggleTeam: (team: string) => void; onEdit: (task: Task) => void; onCreate: (team: string) => void; onUpdate: (id: string, patch: Partial<Task>) => void }) {
  const groups = TEAMS.map((team) => ({ team, tasks: tasks.filter((task) => task.team === team) })).filter((group) => group.tasks.length);
  if (!tasks.length) return <EmptyState />;
  return (
    <div className={styles.tableShell}>
      <div className={`${styles.taskGrid} ${styles.tableHead}`}><span>Задача</span><span>Статус</span><span>Приоритет</span><span>Спринт</span><span>Срок</span></div>
      {groups.map((group) => {
        const isCollapsed = collapsed.includes(group.team);
        return <section className={styles.teamGroup} key={group.team}>
          <div className={styles.teamHeader}>
            <button className={styles.collapseButton} onClick={() => onToggleTeam(group.team)} aria-label={isCollapsed ? "Развернуть ветку" : "Свернуть ветку"}><ChevronDown className={isCollapsed ? styles.chevronCollapsed : ""} size={17} /></button>
            <strong>{group.team}</strong><span>{group.tasks.length}</span>
          </div>
          {!isCollapsed && <>
            {group.tasks.map((task) => <div className={`${styles.taskGrid} ${styles.taskRow}`} key={task.id}>
              <button className={styles.taskTitle} onClick={() => onEdit(task)}>{task.title || "Без названия"}</button>
              <select value={task.status} onChange={(event) => onUpdate(task.id, { status: event.target.value as Status })}>{STATUS_ORDER.map((status) => <option value={status} key={status}>{STATUS_LABELS[status]}</option>)}</select>
              <select value={task.priority} onChange={(event) => onUpdate(task.id, { priority: event.target.value as Priority })}><option value="high">Высокий</option><option value="normal">Нормальный</option><option value="low">Низкий</option></select>
              <span>{task.sprint}</span><button className={styles.dateButton} onClick={() => onEdit(task)}>{formatDate(task.dueDate)}</button>
            </div>)}
            <button className={styles.addRow} onClick={() => onCreate(group.team)}><Plus size={14} /> Новая строка</button>
          </>}
        </section>;
      })}
    </div>
  );
}

function Kanban({ tasks, onEdit, onCreate, onUpdate }: { tasks: Task[]; onEdit: (task: Task) => void; onCreate: (status: Status) => void; onUpdate: (id: string, patch: Partial<Task>) => void }) {
  const [dragging, setDragging] = useState<string | null>(null);
  return <div className={styles.kanban}>
    {STATUS_ORDER.map((status) => <section className={styles.kanbanColumn} key={status} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragging) onUpdate(dragging, { status }); setDragging(null); }}>
      <header><strong>{STATUS_LABELS[status]}</strong><span>{tasks.filter((task) => task.status === status).length}</span><button onClick={() => onCreate(status)}><Plus size={15} /></button></header>
      <div>{tasks.filter((task) => task.status === status).map((task) => <button draggable onDragStart={() => setDragging(task.id)} onDragEnd={() => setDragging(null)} className={styles.kanbanCard} key={task.id} onClick={() => onEdit(task)}>
        <small>{task.team}</small><strong>{task.title || "Без названия"}</strong><p>{task.description || "Без описания"}</p><span>{formatDate(task.dueDate)}</span>
      </button>)}</div>
    </section>)}
  </div>;
}

function Calendar({ tasks, month, onMonth, onEdit, onCreate }: { tasks: Task[]; month: Date; onMonth: (date: Date) => void; onEdit: (task: Task) => void; onCreate: (date: string) => void }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - offset);
  const days = Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(day.getDate() + index); return day; });
  const label = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(month);
  return <div className={styles.calendarShell}>
    <header className={styles.calendarHeader}><button onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={17} /></button><h2>{label}</h2><button onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={17} /></button></header>
    <div className={styles.weekdays}>{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className={styles.calendarGrid}>{days.map((day) => {
      const key = localDate(day);
      const dayTasks = tasks.filter((task) => task.startDate <= key && task.dueDate >= key);
      return <div className={`${styles.calendarDay} ${day.getMonth() !== month.getMonth() ? styles.outsideMonth : ""}`} key={key}>
        <button className={styles.dayNumber} onClick={() => onCreate(key)}>{day.getDate()}</button>
        <div>{dayTasks.map((task) => <button className={`${styles.calendarTask} ${styles[`status_${task.status}`]}`} key={task.id} onClick={() => onEdit(task)} title={task.title}>{task.title}</button>)}</div>
      </div>;
    })}</div>
  </div>;
}

function ProjectDialog({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (project: Project) => void }) {
  const [draft, setDraft] = useState(project);
  function submit(event: FormEvent) { event.preventDefault(); if (draft.name.trim()) onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim() }); }
  return <Modal title={project.name === "Новый проект" ? "Создание проекта" : "Настройки проекта"} onClose={onClose}>
    <form className={styles.form} onSubmit={submit}>
      <label><span>Название проекта</span><input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
      <label><span>Описание</span><textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
      <fieldset><legend>Цвет проекта</legend><div className={styles.colorPicker}>{COLORS.map((color) => <button type="button" aria-label={`Цвет ${color}`} className={draft.color === color ? styles.selectedColor : ""} style={{ background: color }} onClick={() => setDraft({ ...draft, color })} key={color}>{draft.color === color && <Check size={14} />}</button>)}</div></fieldset>
      <footer><button type="button" className={styles.secondaryButton} onClick={onClose}>Отмена</button><button className={styles.primaryButton} type="submit"><Check size={16} /> Сохранить</button></footer>
    </form>
  </Modal>;
}

function TaskDialog({ task, exists, onSave, onDelete, onClose }: { task: Task; exists: boolean; onSave: (task: Task) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(task);
  function submit(event: FormEvent) { event.preventDefault(); if (draft.title.trim()) onSave({ ...draft, title: draft.title.trim() }); }
  return <Modal title={exists ? "Редактирование задачи" : "Новая задача"} onClose={onClose}>
    <form className={styles.form} onSubmit={submit}>
      <label><span>Название</span><input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></label>
      <label><span>Описание</span><textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
      <div className={styles.formGrid}>
        <label><span>Команда</span><select value={draft.team} onChange={(event) => setDraft({ ...draft, team: event.target.value })}>{TEAMS.map((team) => <option key={team}>{team}</option>)}</select></label>
        <label><span>Статус</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Status })}>{STATUS_ORDER.map((status) => <option value={status} key={status}>{STATUS_LABELS[status]}</option>)}</select></label>
        <label><span>Приоритет</span><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}><option value="high">Высокий</option><option value="normal">Нормальный</option><option value="low">Низкий</option></select></label>
        <label><span>Спринт</span><input value={draft.sprint} onChange={(event) => setDraft({ ...draft, sprint: event.target.value })} /></label>
        <label><span>Начало</span><input type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /></label>
        <label><span>Срок</span><input type="date" min={draft.startDate} value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
      </div>
      <footer>{exists ? <button type="button" className={styles.dangerButton} onClick={() => window.confirm("Удалить задачу?") && onDelete(draft.id)}><Trash2 size={15} /> Удалить</button> : <span />}<div><button type="button" className={styles.secondaryButton} onClick={onClose}>Отмена</button><button className={styles.primaryButton} type="submit"><Check size={16} /> Сохранить</button></div></footer>
    </form>
  </Modal>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className={styles.modalBackdrop} onMouseDown={onClose}><section className={styles.modal} onMouseDown={(event) => event.stopPropagation()}><header><h2>{title}</h2><button onClick={onClose}><X size={18} /></button></header>{children}</section></div>;
}

function EmptyState() {
  return <div className={styles.empty}><span><ClipboardList size={30} /></span><h2>Задач пока нет</h2><p>Создайте первую задачу для этого проекта.</p></div>;
}
