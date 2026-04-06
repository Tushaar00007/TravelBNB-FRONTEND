import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import './i18n.js'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { HostProvider } from './context/HostContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Read from .env (VITE_GOOGLE_CLIENT_ID) — if missing, Google Sign-In is skipped gracefully
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

const app = (
  <StrictMode>
    <CurrencyProvider>
      <HostProvider>
        <App />
      </HostProvider>
    </CurrencyProvider>
  </StrictMode>
)

createRoot(document.getElementById('root')).render(
  GOOGLE_CLIENT_ID
    ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
    : app
)
