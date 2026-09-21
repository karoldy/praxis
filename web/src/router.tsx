import { createBrowserRouter, Navigate } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import NotesPage from '@/pages/notes';
import ExamsPage from '@/pages/exams';
import DocumentsPage from '@/pages/documents';

/**
 * 应用路由（设计 §9 对齐后端 /api/notes /exams /documents）：
 * 根重定向到学习中心 /notes）。
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/notes" replace /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'exams', element: <ExamsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
    ],
  },
]);