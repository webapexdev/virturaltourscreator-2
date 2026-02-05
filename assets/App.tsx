import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotesPage } from './pages/NotesPage';
import { ConfirmPage } from './pages/ConfirmPage';

console.log('App.tsx loaded');

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirm/:token" element={<ConfirmPage />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route
            path="/notes/*"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/notes" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
