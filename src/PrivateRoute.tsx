import { useAuth } from './contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface PrivateRouteProps {
    children: ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
    const { currentUser } = useAuth();
    
    return currentUser ? <>{children}</> : <Navigate to='/login'></Navigate>
}

export default PrivateRoute;