"use client";

import { useEffect } from "react";

export function ProjectCabinetLink() {
  useEffect(() => {
    const projectTitle = document.querySelector<HTMLElement>(".project-title");
    if (!projectTitle) return;

    const openCabinet = () => {
      window.location.href = "/projects";
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCabinet();
      }
    };

    projectTitle.style.cursor = "pointer";
    projectTitle.setAttribute("role", "link");
    projectTitle.setAttribute("tabindex", "0");
    projectTitle.setAttribute("title", "Открыть кабинет проектов");
    projectTitle.addEventListener("click", openCabinet);
    projectTitle.addEventListener("keydown", onKeyDown);

    return () => {
      projectTitle.removeEventListener("click", openCabinet);
      projectTitle.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
