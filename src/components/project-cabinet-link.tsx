"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import styles from "./project-cabinet-link.module.css";

type ProjectListItem = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

const PROJECTS_KEY = "tracker-seagull-projects-v2";
const ACTIVE_PROJECT_KEY = "tracker-seagull-active-project-v2";

const FALLBACK_PROJECT: ProjectListItem = {
  id: "project-office",
  name: "Проектный офис",
  description: "Рабочее пространство",
  color: "#8b5cf6",
};

function readProjects(): ProjectListItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]") as ProjectListItem[];
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.filter((project) => project?.id && project?.name);
    }
  } catch {}

  return [FALLBACK_PROJECT];
}

export function ProjectCabinetLink() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("project-office");
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0, width: 260 });
  const triggerRef = useRef<SVGSVGElement | null>(null);
  const projectTitleRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const projectTitle = document.querySelector<HTMLElement>(".project-title");
    const trigger = projectTitle?.querySelector<SVGSVGElement>(":scope > svg:last-of-type");
    if (!projectTitle || !trigger) return;

    projectTitleRef.current = projectTitle;
    triggerRef.current = trigger;

    projectTitle.style.cursor = "default";
    projectTitle.removeAttribute("role");
    projectTitle.removeAttribute("tabindex");
    projectTitle.removeAttribute("title");

    trigger.classList.add("project-switcher-trigger");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-label", "Открыть список проектов");

    const refreshPosition = () => {
      const rect = projectTitle.getBoundingClientRect();
      const viewportPadding = 12;
      const desiredWidth = Math.max(240, rect.width);
      const width = Math.min(desiredWidth, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - width - viewportPadding,
      );
      setPosition({
        top: rect.bottom + 8,
        left,
        width,
      });
    };

    const toggleMenu = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      setProjects(readProjects());
      setActiveProjectId(localStorage.getItem(ACTIVE_PROJECT_KEY) || "project-office");
      refreshPosition();
      setOpen((current) => !current);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        toggleMenu(event);
      }
    };

    trigger.addEventListener("click", toggleMenu);
    trigger.addEventListener("keydown", onKeyDown);

    return () => {
      trigger.removeEventListener("click", toggleMenu);
      trigger.removeEventListener("keydown", onKeyDown);
      trigger.classList.remove("project-switcher-trigger");
      trigger.removeAttribute("role");
      trigger.removeAttribute("tabindex");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-label");
      trigger.removeAttribute("aria-expanded");
      trigger.removeAttribute("data-open");
    };
  }, []);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("data-open", String(open));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const reposition = () => {
      const rect = projectTitleRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportPadding = 12;
      const desiredWidth = Math.max(240, rect.width);
      const width = Math.min(desiredWidth, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - width - viewportPadding,
      );
      setPosition({ top: rect.bottom + 8, left, width });
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  function selectProject(projectId: string) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
    setOpen(false);
    window.location.href = "/projects";
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={styles.menu}
      role="listbox"
      aria-label="Список проектов"
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      <div className={styles.list}>
        {projects.map((project) => {
          const active = project.id === activeProjectId;
          return (
            <button
              key={project.id}
              type="button"
              role="option"
              aria-selected={active}
              className={`${styles.projectButton} ${active ? styles.projectButtonActive : ""}`}
              onClick={() => selectProject(project.id)}
            >
              <span
                className={styles.projectOrb}
                style={{ background: project.color || "#8b5cf6" }}
                aria-hidden="true"
              />
              <span className={styles.projectText}>
                <strong>{project.name}</strong>
                <span>{project.description || "Рабочее пространство"}</span>
              </span>
              <span className={styles.check} aria-hidden="true">{active ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
