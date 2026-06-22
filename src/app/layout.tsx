import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tracker Seagull — трекер задач",
  description: "Функциональный трекер задач с таблицей, канбаном, календарём и диаграммой Ганта.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
