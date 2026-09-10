import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MonedaProvider } from './hooks/useMoneda'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MonedaProvider>
      <App />
    </MonedaProvider>
  </StrictMode>,
)
