import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, CheckCircle } from "lucide-react"

const OfflineIndicator = () => {
  const { isOnline, showOfflineMessage } = useOnlineStatus()

  if (isOnline && !showOfflineMessage) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2">
      <Alert className={`transition-all duration-300 ease-in-out ${
        isOnline 
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' 
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Conexão restaurada! Sincronizando dados...
              </AlertDescription>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                Modo Offline - Funcionalidade limitada
              </AlertDescription>
            </>
          )}
        </div>
      </Alert>
    </div>
  )
}

export default OfflineIndicator