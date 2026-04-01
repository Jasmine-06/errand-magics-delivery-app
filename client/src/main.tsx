import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from 'sonner';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <>
    <Toaster richColors position="top-center" />
    <App />
  </>);
