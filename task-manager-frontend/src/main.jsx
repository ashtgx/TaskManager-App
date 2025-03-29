import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
