import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ChatProvider } from './context/chatStore'
import { UserProvider } from './context/userStore.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <ChatProvider>
      <App />
    </ChatProvider>
  </UserProvider>
)
