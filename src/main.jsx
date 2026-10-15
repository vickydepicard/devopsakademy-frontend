import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './theme/campaignButtons.css'
import './hooks/usePublicOffers'   // mémorise un code promo reçu par lien (?promo=CODE)
import './i18n'
import ErrorBoundary from './components/Common/ErrorBoundary'
import { localizeLogos } from './utils/logos'
import DialogHost from './components/Common/DialogHost'
import { installNativeAlert } from './utils/dialog'
import { bootTheme } from './theme/ThemeProvider'

installNativeAlert()
bootTheme() // thème d'événement connu : appliqué avant le premier rendu (pas de flash)

// Les pages qui utilisent fetch() (et non axios) reçoivent aussi les logos servis localement.
const nativeJson = Response.prototype.json
Response.prototype.json = async function () { return localizeLogos(await nativeJson.call(this)) }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
        <DialogHost />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)
