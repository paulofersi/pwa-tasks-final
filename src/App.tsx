import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from "uuid"
import { addTask, getTasks } from './utils/db'
import { getUserLocation, exportTasksToJson, copyTaskToClipboard, listenTaskByVoice } from './utils/native'
import { getGoogleCalendarUrl } from './utils/calendar'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'
import { syncTasks } from './utils/sync'
import OfflineIndicator from './components/OfflineIndicator'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { analytics } from './utils/firebase'
import { logEvent } from 'firebase/analytics'
import type { Task } from './types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  LogOut, 
  Download, 
  Mic, 
  Copy, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MapPin,
  RefreshCw
} from "lucide-react"

function App() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW registrado: ' + r)
    },
    onRegisterError(error: any) {
      console.log('Erro no registro do SW', error)
    },
  })

  function updateAppBadge(pendingCount: number): void {
    if ('setAppBadge' in navigator) {
      (navigator as any).setAppBadge(pendingCount);
    } else if ('setExperimentalAppBadge' in navigator) {
      (navigator as any).setExperimentalAppBadge(pendingCount);
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await logout();
      // Navigate to login page after successful logout
      navigate('/login');
    } catch (err) {
      console.error("Erro ao fazer logout " + err);
    }
  }

  useEffect(() => {
    loadTasks();
    if(navigator.onLine){
      syncAndReload();
    }
    window.addEventListener('online', syncAndReload);
    window.addEventListener('offline', loadTasks);
    return () => {
      window.removeEventListener('online', syncAndReload);
      window.removeEventListener('offline', loadTasks);
    }
  }, [])

  useEffect(() => {
    const pending = tasks.filter(t => !t.done).length;
    updateAppBadge(pending);
  }, [tasks]);

  async function syncAndReload(): Promise<void> {
    await syncTasks();
    await loadTasks();
  }

  async function handleAdd(): Promise<void> {
    const location = await getUserLocation();
    const task: Task = {
      id: uuidv4(),
      title, 
      hora,
      done,
      lastUpdated: Date.now(),
      synced: false,
      location
    }
    await addTask(task);
    setTitle("")
    setHora("")
    setDone(false)
    await loadTasks();

    if (analytics) {
      logEvent(analytics, 'task_created', {
        task_title: task.title,
        has_time: !!task.hora,
        has_location: !!task.location,
        is_completed: task.done
      });
    }

    let notifyPromise = Promise.resolve();
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Nova tarefa criada", {
          body: `Tarefa: ${task.title}`,
          icon: "/vite.svg"
        });
        notifyPromise = new Promise(res => setTimeout(res, 350));
      } else if (Notification.permission !== "denied") {
        notifyPromise = Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Nova tarefa criada", {
              body: `Tarefa: ${task.title}`,
              icon: "/vite.svg"
            });
            return new Promise(res => setTimeout(res, 350));
          }
        });
      }
    }

    if (navigator.onLine) {
      await notifyPromise;
      await syncAndReload();
    }
  }

  async function loadTasks(): Promise<void> {
    const allTasks = await getTasks();
    allTasks.sort((a, b) => b.lastUpdated - a.lastUpdated)
    setTasks(allTasks);
  }
  
return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <OfflineIndicator />
      {needRefresh && (
        <div className="fixed top-16 left-0 right-0 bg-primary text-primary-foreground p-3 text-center z-50 shadow-lg">
          <span>Nova versão disponível! </span>
          <Button 
            onClick={() => updateServiceWorker(true)}
            variant="secondary"
            size="sm"
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minhas Tarefas</h1>
            <div className="flex gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto p-4 max-w-4xl">

        {/* Add Task Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Tarefa
            </CardTitle>
            <CardDescription>
              Adicione uma nova tarefa à sua lista
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Tarefa</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título da tarefa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="done"
                checked={done}
                onCheckedChange={(checked) => setDone(checked as boolean)}
              />
              <Label htmlFor="done">Marcar como concluída</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tarefa
              </Button>
              <Button onClick={handleVoiceAdd} variant="outline">
                <Mic className="h-4 w-4 mr-2" />
                Voz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <Button onClick={() => exportTasksToJson(tasks)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar JSON
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma tarefa encontrada. Adicione sua primeira tarefa!</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                      {task.hora && (
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {task.hora}
                        </div>
                      )}
                      {task.location && (
                        <div className="flex items-center text-blue-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          Lat: {task.location.lat?.toFixed(5)}, Lng: {task.location.lng?.toFixed(5)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {task.done ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                      {!task.synced && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          Não sincronizada
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyTaskToClipboard(task)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a
                        href={getGoogleCalendarUrl(task)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Adicionar ao Google Agenda"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Google Agenda
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
  function handleVoiceAdd(): void {
    if (analytics) {
      logEvent(analytics, 'voice_input_started');
    }
    
    listenTaskByVoice(
      (transcript: string) => {
        setTitle(transcript);
        if (analytics) {
          logEvent(analytics, 'voice_input_success', {
            transcript_length: transcript.length
          });
        }
        setTimeout(() => {
          const el = document.querySelector('input.styled-input') as HTMLInputElement;
          if (el) el.focus();
        }, 100);
      },
      (err: string) => {
        if (analytics) {
          logEvent(analytics, 'voice_input_error', {
            error_message: err
          });
        }
        alert('Erro no reconhecimento de voz: ' + err);
      }
    );
  }
}

export default App
