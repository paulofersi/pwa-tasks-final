export interface Task {
  id: string;
  title: string;
  hora: string;
  done: boolean;
  lastUpdated: number;
  synced: boolean;
  location?: {
    lat: number;
    lng: number;
  } | null;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface AuthContextType {
  currentUser: any;
  logout: () => Promise<void>;
}

export interface OnlineStatus {
  isOnline: boolean;
  showOfflineMessage: boolean;
}

export interface VoiceRecognitionResult {
  transcript: string;
}

export interface VoiceRecognitionError {
  error: string;
}

export interface ShareData {
  title: string;
  text: string;
}

export interface FirebaseTask extends Task {
  id: string;
}

export interface ServiceWorkerMessage {
  type: string;
  data?: any;
}
