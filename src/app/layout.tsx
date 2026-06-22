import type { Metadata } from "next";
import { ProjectCabinetLink } from "@/components/project-cabinet-link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tracker Seagull — трекер задач",
  description: "Функциональный трекер задач с таблицей, канбаном, календарём и диаграммой Ганта.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <ProjectCabinetLink />
        {children}
      </body>
    </html>
  );
}
