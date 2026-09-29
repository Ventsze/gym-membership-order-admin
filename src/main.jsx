import React from 'react'
import ReactDOM from 'react-dom/client'
import { App as AntApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#0071e3',
          colorSuccess: '#34c759',
          colorInfo: '#0071e3',
          colorWarning: '#ff9500',
          colorError: '#ff3b30',
          borderRadius: 10,
          colorBgLayout: '#f5f5f7',
          colorBorder: '#e5e5ea',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'PingFang SC', sans-serif",
        },
        components: {
          Button: { controlHeight: 38, fontWeight: 550, primaryShadow: 'none' },
          Input: { controlHeight: 40 },
          Table: {
            headerBg: '#fafafa',
            headerColor: '#6e6e73',
            headerSplitColor: 'transparent',
            rowHoverBg: '#f7f7f8',
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
)
