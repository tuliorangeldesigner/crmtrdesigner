import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { registerServiceWorker } from '@/lib/webPush'

const CHUNK_RELOAD_GUARD = 'crm_chunk_reload_once';

function isChunkLoadErrorMessage(message: string) {
  const text = (message || '').toLowerCase();
  return text.includes('failed to fetch dynamically imported module') ||
    text.includes('importing a module script failed') ||
    text.includes('chunkloaderror');
}

function recoverFromChunkError() {
  if (typeof window === 'undefined') return;
  const alreadyRetried = window.sessionStorage.getItem(CHUNK_RELOAD_GUARD) === '1';
  if (alreadyRetried) return;
  window.sessionStorage.setItem(CHUNK_RELOAD_GUARD, '1');
  window.location.reload();
}

window.addEventListener('vite:preloadError', (event: Event) => {
  const customEvent = event as CustomEvent;
  const message = customEvent?.payload?.message || '';
  if (isChunkLoadErrorMessage(String(message))) {
    customEvent.preventDefault();
    recoverFromChunkError();
  }
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const message = String(reason?.message || reason || '');
  if (isChunkLoadErrorMessage(message)) {
    event.preventDefault();
    recoverFromChunkError();
  }
});

registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
