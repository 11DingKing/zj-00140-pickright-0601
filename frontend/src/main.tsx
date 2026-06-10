import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import { ParentProvider } from './context/ParentContext';
import './index.css';
import api from './services/api';

api.defaults.headers.common['x-parent-id'] = '1';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <ParentProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ParentProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
