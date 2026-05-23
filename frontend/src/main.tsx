import React from 'react';
import ReactDOM from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './routes/AppRouter';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme accentColor="violet" radius="large" appearance="light">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Theme>
  </React.StrictMode>,
);
