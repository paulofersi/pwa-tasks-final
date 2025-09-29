import { getTasks, addTask } from "./db";
import { addTaskToFirebase, analytics } from "./firebase";
import { logEvent } from "firebase/analytics";

export async function syncTasks(): Promise<void> {
  const tasks = await getTasks();
  const unsynced = tasks.filter((t) => !t.synced);
  let syncedCount = 0;

  for (const t of unsynced) {
    try {
      await addTaskToFirebase(t);
      t.synced = true;
      await addTask(t);
      syncedCount++;
    } catch (e) {
      console.error("Erro ao sincronizar tarefa", e);
    }
  }

  if (analytics) {
    logEvent(analytics, "sync_completed", {
      synced_count: syncedCount,
      total_unsynced: unsynced.length,
    });
  }

  if (
    syncedCount > 0 &&
    typeof window !== "undefined" &&
    "Notification" in window
  ) {
    if (Notification.permission === "granted") {
      new Notification("Sincronização de tarefas", {
        body: `${syncedCount} tarefa(s) sincronizada(s) com sucesso!`,
        icon: "/vite.svg",
      });
    }
  }
}
