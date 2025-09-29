import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "../utils/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import type { AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;    
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        })
        return unsubscribe;

    }, []);

    const logout = (): Promise<void> => {
        return signOut(auth);
    }

    const value: AuthContextType = {
        currentUser,
        logout
    }

    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}