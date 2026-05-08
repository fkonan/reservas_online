import { Injectable } from '@angular/core';
import { environment } from '../../environments/env.dev';

export interface LogEntry {
  id: string;
  ts: string;
  ts_local: string;
  session: string;
  type: 'js_error' | 'promise_rejection' | 'http_error' | 'stuck_loading' | 'angular_error';
  message: string;
  stack?: string;
  url: string;
  httpDetails?: {
    method: string;
    requestUrl: string;
    status: number;
    statusText: string;
  };
  userAgent: string;
  extra?: Record<string, unknown>;
}

const STORAGE_KEY = 'fe_log_queue';
const MAX_ENTRIES = 50;

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private readonly sessionId = this.getOrCreateSessionId();

  log(partial: Pick<LogEntry, 'type' | 'message'> & Partial<LogEntry>): void {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      ts_local: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      session: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...partial,
    };

    this.saveToStorage(entry);
    this.postInBackground(entry);
  }

  exportLogs(): void {
    const entries = this.readStorage();
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fe_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  clearLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage no disponible (modo privado Safari, etc.)
    }
  }

  private saveToStorage(entry: LogEntry): void {
    try {
      const entries = this.readStorage();
      entries.push(entry);
      // Mantener solo las últimas MAX_ENTRIES (descartar las más antiguas)
      const trimmed = entries.length > MAX_ENTRIES ? entries.slice(entries.length - MAX_ENTRIES) : entries;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // QuotaExceededError en Safari modo privado u otros errores de storage
    }
  }

  private readStorage(): LogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private postInBackground(entry: LogEntry): void {
    const logUrl = (environment as { logUrl?: string }).logUrl;
    if (!logUrl) return;

    // fetch nativo con keepalive — NO usa HttpClient para no disparar interceptors
    fetch(logUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true,
    }).catch(() => {
      // Si el POST falla, el log ya está en localStorage — no hacer nada más
    });
  }

  private getOrCreateSessionId(): string {
    try {
      const existing = sessionStorage.getItem('fe_session_id');
      if (existing) return existing;
      const newId = crypto.randomUUID();
      sessionStorage.setItem('fe_session_id', newId);
      return newId;
    } catch {
      return 'unknown';
    }
  }
}
