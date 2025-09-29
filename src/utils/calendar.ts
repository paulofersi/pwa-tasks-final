import type { Task } from "../types";

export function getGoogleCalendarUrl(task: Task): string {
  const title = encodeURIComponent(task.title);
  const details = encodeURIComponent(`Tarefa: ${task.title}`);
  const [h, m] = task.hora.split(":");
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    parseInt(h),
    parseInt(m)
  );
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  const fmt = (d: Date): string =>
    d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(
    start
  )}/${fmt(end)}&details=${details}`;
}
