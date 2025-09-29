import type { Task, Location, ShareData } from "../types";

export async function shareTask(task: Task): Promise<void> {
  if (!navigator.share) {
    throw new Error("Web Share API não suportada neste navegador/dispositivo.");
  }
  const text = `Tarefa: ${task.title}\nHora: ${task.hora || ""}\nConcluída: ${
    task.done ? "Sim" : "Não"
  }${
    task.location
      ? `\nLocalização: ${task.location.lat}, ${task.location.lng}`
      : ""
  }`;
  const shareData: ShareData = {
    title: task.title || "Tarefa",
    text,
  };
  await navigator.share(shareData);
}

export async function getUserLocation(): Promise<Location | null> {
  if (!navigator.geolocation) return null;
  try {
    return await new Promise<Location | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  } catch {
    return null;
  }
}

export function exportTasksToJson(tasks: Task[]): void {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-export-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyTaskToClipboard(task: Task): Promise<void> {
  const text = `Tarefa: ${task.title}\nHora: ${task.hora || ""}\nConcluída: ${
    task.done ? "Sim" : "Não"
  }${
    task.location
      ? `\nLocalização: ${task.location.lat}, ${task.location.lng}`
      : ""
  }`;
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

export function listenTaskByVoice(
  onResult: (transcript: string) => void,
  onError: (error: string) => void
): any {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError && onError("Reconhecimento de voz não suportado");
    return null;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  recognition.onerror = (event: any) => {
    onError && onError(event.error);
  };
  recognition.start();
  return recognition;
}
