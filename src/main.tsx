import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { message, notification } from 'antd';
import './index.css';
import App from './App.tsx';

message.config({ duration: 4, maxCount: 3 });
notification.config({ duration: 5, maxCount: 3, placement: 'topRight' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
