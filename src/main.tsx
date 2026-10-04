import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './state/AppContext';
import './styles/theme.css';
import './styles/components.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('找不到 #root 挂载节点。');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_ROUTER_BASE || import.meta.env.BASE_URL}>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
