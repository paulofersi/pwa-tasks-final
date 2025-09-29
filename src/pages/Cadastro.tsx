import { useState, type FormEvent } from 'react'
import { register, analytics } from '../utils/firebase'
import { logEvent } from 'firebase/analytics'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus } from "lucide-react"

function Cadastro() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    async function handleRegister(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setLoading(true);
        setError("");

        if(password !== confirmPassword){
            setError("As senhas não coicidem!");
            setLoading(false);
            return;
        }
        if(password.length < 6){
            setError("A senha deve ter pelo menos 6 caracteres");
            setLoading(false);
            return;
        }

        try {
            await register(email, password)
            
            if (analytics) {
                logEvent(analytics, 'sign_up_success', {
                    method: 'email_password'
                });
            }
            
            window.location.href = "/";
        } catch (err: any) {
            if (analytics) {
                logEvent(analytics, 'sign_up_error', {
                    error_message: err.message
                });
            }
            setError("Erro ao criar a conta: " + err.message);
        }
        setLoading(false);
    }



    return(
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <UserPlus className="h-6 w-6" />
                        Criar Conta
                    </CardTitle>
                    <CardDescription>
                        Crie sua conta para começar a gerenciar suas tarefas
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
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
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
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
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                "Criar Conta"
                            )}
                        </Button>
                    </form>
                    <div className="text-center text-sm text-muted-foreground">
                        Já tem conta?{" "}
                        <Link 
                            to="/login" 
                            className="text-primary hover:underline font-medium"
                        >
                            Faça login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Cadastro;