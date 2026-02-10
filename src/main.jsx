import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConfigProvider, theme } from 'antd'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.85)',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
