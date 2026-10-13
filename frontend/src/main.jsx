import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { UIProvider } from './components/UI.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </AuthProvider>
    </MotionConfig>
  </BrowserRouter>
);
