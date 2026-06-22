export type TaskStatus = "queue" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "normal" | "high";
export type TrackerView = "table" | "kanban" | "gantt" | "calendar" | "analytics" | "form";

export interface Task {
  id: string;
  title: string;
  description: string;
  team: string;
  status: TaskStatus;
  priority: TaskPriority;
  sprint: string;
  assignees: string[];
  startDate: string;
  dueDate: string;
  parentId?: string;
  tags: string[];
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  queue: "На очереди",
  "in-progress": "В работе",
  review: "На проверке",
  done: "Готово",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Низкий",
  normal: "Нормальный",
  high: "Высокий",
};

export const TEAMS = ["Команда Движка", "Команда Интеграций", "Дизайн"];
export const SPRINTS = ["Спринт 1", "Спринт 2", "Спринт 3", "Бэклог"];
export const PEOPLE = ["АК", "ЕМ", "КС", "МИ", "ОР", "АН", "ДВ", "СП"];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Шаблон раздела и пространства",
    description: "Подготовить базовый шаблон раздела, структуру блоков и состояния.",
    team: "Команда Движка",
    status: "done",
    priority: "high",
    sprint: "Спринт 1",
    assignees: ["АК", "ЕМ"],
    startDate: "2026-06-08",
    dueDate: "2026-06-15",
    tags: ["core", "template"],
  },
  {
    id: "task-2",
    title: "Хранение и применение вложенного дерева",
    description: "Добавить хранение и применение вложенной структуры разделов.",
    team: "Команда Движка",
    status: "done",
    priority: "high",
    sprint: "Спринт 1",
    assignees: ["ЕМ", "КС"],
    startDate: "2026-06-09",
    dueDate: "2026-06-16",
    parentId: "task-1",
    tags: ["data"],
  },
  {
    id: "task-3",
    title: "Сохранение виджета в шаблоне",
    description: "Сохранять настройки виджета при повторном открытии шаблона.",
    team: "Команда Движка",
    status: "in-progress",
    priority: "normal",
    sprint: "Спринт 1",
    assignees: ["КС"],
    startDate: "2026-06-13",
    dueDate: "2026-06-18",
    parentId: "task-1",
    tags: ["widget"],
  },
  {
    id: "task-4",
    title: "Дизайн интерфейса",
    description: "Привести таблицу и панели управления к единой дизайн-системе.",
    team: "Команда Движка",
    status: "in-progress",
    priority: "normal",
    sprint: "Спринт 2",
    assignees: ["АН", "ОР"],
    startDate: "2026-06-15",
    dueDate: "2026-06-21",
    parentId: "task-1",
    tags: ["ui", "design"],
  },
  {
    id: "task-5",
    title: "Корректное создание строки при фильтре по исполнителю",
    description: "Новая строка должна наследовать активный фильтр исполнителя.",
    team: "Команда Движка",
    status: "review",
    priority: "normal",
    sprint: "Спринт 2",
    assignees: ["МИ"],
    startDate: "2026-06-17",
    dueDate: "2026-06-24",
    tags: ["bug", "filters"],
  },
  {
    id: "task-6",
    title: "Создание сущности по API",
    description: "Реализовать endpoint и документацию создания сущности.",
    team: "Команда Интеграций",
    status: "in-progress",
    priority: "high",
    sprint: "Спринт 3",
    assignees: ["ДВ", "СП"],
    startDate: "2026-06-12",
    dueDate: "2026-06-20",
    tags: ["api"],
  },
  {
    id: "task-7",
    title: "Telegram-бот",
    description: "Собрать уведомления о новых задачах и просрочках.",
    team: "Команда Интеграций",
    status: "in-progress",
    priority: "normal",
    sprint: "Спринт 3",
    assignees: ["ОР", "ЕМ"],
    startDate: "2026-06-18",
    dueDate: "2026-06-30",
    tags: ["telegram", "notifications"],
  },
  {
    id: "task-8",
    title: "Реализовать авторизацию",
    description: "Добавить вход, выход и восстановление сессии.",
    team: "Команда Интеграций",
    status: "queue",
    priority: "normal",
    sprint: "Спринт 3",
    assignees: ["АК", "ДВ"],
    startDate: "2026-06-21",
    dueDate: "2026-07-02",
    tags: ["auth"],
  },
  {
    id: "task-9",
    title: "Интеграция формы авторизации WebApp",
    description: "Связать форму с endpoint авторизации и обработать ошибки.",
    team: "Команда Интеграций",
    status: "queue",
    priority: "normal",
    sprint: "Спринт 3",
    assignees: ["КС", "ДВ"],
    startDate: "2026-06-23",
    dueDate: "2026-07-04",
    parentId: "task-8",
    tags: ["auth", "webapp"],
  },
  {
    id: "task-10",
    title: "Обработка запроса авторизации из WebApp",
    description: "Проверить подпись, срок действия и сформировать сессию.",
    team: "Команда Интеграций",
    status: "queue",
    priority: "low",
    sprint: "Спринт 3",
    assignees: ["СП", "МИ"],
    startDate: "2026-06-24",
    dueDate: "2026-07-06",
    parentId: "task-8",
    tags: ["auth", "backend"],
  },
  {
    id: "task-11",
    title: "Релизация отправки запроса авторизации",
    description: "Подготовить клиентский запрос и состояния загрузки.",
    team: "Команда Интеграций",
    status: "queue",
    priority: "low",
    sprint: "Спринт 3",
    assignees: ["КС"],
    startDate: "2026-06-25",
    dueDate: "2026-07-08",
    parentId: "task-8",
    tags: ["auth", "frontend"],
  },
  {
    id: "task-12",
    title: "Система дизайн-токенов",
    description: "Зафиксировать цвета, типографику, радиусы и состояния компонентов.",
    team: "Дизайн",
    status: "review",
    priority: "high",
    sprint: "Спринт 2",
    assignees: ["АН", "ОР"],
    startDate: "2026-06-10",
    dueDate: "2026-06-22",
    tags: ["design-system"],
  },
];

export function createEmptyTask(): Task {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 7);
  const toInput = (date: Date) => date.toISOString().slice(0, 10);

  return {
    id: `task-${Date.now()}`,
    title: "",
    description: "",
    team: TEAMS[0],
    status: "queue",
    priority: "normal",
    sprint: SPRINTS[0],
    assignees: [PEOPLE[0]],
    startDate: toInput(today),
    dueDate: toInput(due),
    tags: [],
  };
}
