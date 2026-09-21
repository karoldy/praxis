import { createBrowserRouter, Navigate } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import NotesPage from '@/pages/notes';
import ExamsPage from '@/pages/exams';
import DocumentsPage from '@/pages/documents';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';

/**
 * 应用路由（设计 §9 对齐后端 /api/notes /exams /documents）。
 * /login /register 公开；三大中心需登录（ProtectedRoute），根重定向到 /notes。
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/notes" replace /> },
          { path: 'notes', element: <NotesPage /> },
          { path: 'exams', element: <ExamsPage /> },
          { path: 'documents', element: <DocumentsPage /> },
        ],
      },
    ],
  },
]);