
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { OtaKit } from '@otakit/capacitor-updater'
import './index.css'
import App from './App.jsx'

function AppReadyProvider() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      OtaKit.notifyAppReady()
    }
  }, [])

  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppReadyProvider />
    <App />
  </StrictMode>,
)
