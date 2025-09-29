import { useEffect, useState } from "react";
import { getTasks } from "../utils/db";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { shareTask } from "../utils/native";
import { analytics } from "../utils/firebase";
import { logEvent } from "firebase/analytics";
import OfflineIndicator from "../components/OfflineIndicator";
import type { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  LogOut, 
  Share2, 
  CheckCircle, 
  Clock, 
  User,
  Trophy,
  Calendar
} from "lucide-react";

async function handleShare(task: Task): Promise<void> {
    try {
        await shareTask(task);
        
        if (analytics) {
            logEvent(analytics, 'task_shared', {
                task_title: task.title,
                task_completed: task.done
            });
        }
    } catch (err: any) {
        if (analytics) {
            logEvent(analytics, 'task_share_error', {
                error_message: err.message
            });
        }
        alert(err.message || 'Não foi possível compartilhar.');
    }
}

function Dashboard() {
    const {currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [, setTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

    async function handleLogout(): Promise<void> {
        try {
            await logout();
            
            if (analytics) {
                logEvent(analytics, 'logout_success');
            }
            
            navigate('/login');
        } catch (error) {
            if (analytics) {
                logEvent(analytics, 'logout_error', {
                    error_message: String(error)
                });
            }
            console.error("Erro ao fazer logout: " + error);
        }
    }
    
    useEffect(() => {
        async function fetchTasks(): Promise<void> {
            const allTasks = await getTasks();
            setTasks(allTasks);
            const filtered = allTasks.filter(t => t.done);
            setCompletedTasks(filtered);
        }
        fetchTasks();
    }, [])

    return(
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <OfflineIndicator />
            
            {/* Top Navigation Bar */}
            <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
                <div className="container mx-auto px-4 py-3 max-w-4xl">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Dashboard
                        </h1>
                        <div className="flex gap-2">
                            <Link to="/">
                                <Button variant="outline" size="sm">
                                    <Home className="h-4 w-4 mr-2" />
                                    Voltar para Home
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
                {/* Welcome Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Bem-vindo de volta!
                        </CardTitle>
                        <CardDescription>
                            Aqui está um resumo das suas tarefas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{currentUser?.email}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Estatísticas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {completedTasks.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Tarefas Concluídas</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {completedTasks.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Total de Tarefas</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {completedTasks.length > 0 ? Math.round((completedTasks.length / completedTasks.length) * 100) : 0}%
                                </div>
                                <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Completed Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Tarefas Concluídas
                        </CardTitle>
                        <CardDescription>
                            Suas tarefas finalizadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {completedTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Nenhuma tarefa concluída ainda.</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Complete algumas tarefas para vê-las aqui!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {completedTasks.map((task) => (
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
                                                </div>
                                                <Badge variant="default" className="bg-green-500">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Concluída
                                                </Badge>
                                            </div>
                                            <Button
                                                onClick={() => handleShare(task)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Share2 className="h-4 w-4 mr-1" />
                                                Compartilhar
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
export default Dashboard;