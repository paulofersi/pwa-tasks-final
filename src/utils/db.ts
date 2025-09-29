import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Task } from "../types";

const DB_NAME = "tasksDB";
const STORE_NAME = "tasks";

interface TasksDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
  };
}

export async function initDB(): Promise<IDBPDatabase<TasksDB>> {
  return openDB<TasksDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function addTask(task: Task): Promise<void> {
  const db = await initDB();
  await db.put(STORE_NAME, task);
}

export async function getTasks(): Promise<Task[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
