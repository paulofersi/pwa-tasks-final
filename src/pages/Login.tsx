import { useState, type FormEvent } from 'react'
import { login, analytics } from '../utils/firebase'
import { logEvent } from 'firebase/analytics'
import { Link } from "react-router-dom"
import OfflineIndicator from "../components/OfflineIndicator"
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn } from "lucide-react"

function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { isOnline } = useOnlineStatus();

    async function handleLogin(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(email, password);
            
            if (analytics) {
                logEvent(analytics, 'login_success', {
                    method: 'email_password'
                });
            }
            
            window.location.href = '/';

        } catch (err: any) {
            if (analytics) {
                logEvent(analytics, 'login_error', {
                    error_message: err.message
                });
            }
            setError("Erro ao fazer login " + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <OfflineIndicator />
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <LogIn className="h-6 w-6" />
                        Entrar
                    </CardTitle>
                    <CardDescription>
                        Entre com suas credenciais para acessar sua conta
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={!isOnline}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={!isOnline}
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !isOnline}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : !isOnline ? (
                                "Offline - Login Indisponível"
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>
                    <div className="text-center text-sm text-muted-foreground">
                        Não tem conta?{" "}
                        {isOnline ? (
                            <Link 
                                to="/cadastro" 
                                className="text-primary hover:underline font-medium"
                            >
                                Cadastre-se
                            </Link>
                        ) : (
                            <span 
                                className="text-muted-foreground/50 cursor-not-allowed line-through"
                                title="Cadastro não disponível offline"
                            >
                                Cadastre-se
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}

export default Login;