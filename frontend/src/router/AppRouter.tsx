import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {AppShell} from '@/components/layout/AppShell';
import {CustomersPage} from '@/pages/CustomersPage';
import {DashboardPage} from '@/pages/DashboardPage';
import {KanbanDetailPage} from '@/pages/KanbanDetailPage';
import {KanbanPage} from '@/pages/KanbanPage';
import {ManagementPage} from '@/pages/ManagementPage';
import {MessagesPage} from '@/pages/MessagesPage';
import {SettingsPage} from '@/pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'kanban',
        element: <KanbanPage />,
      },
      {
        path: 'kanban/:cardId',
        element: <KanbanDetailPage />,
      },
      {
        path: 'management',
        element: <ManagementPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'messages',
        element: <MessagesPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
