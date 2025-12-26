import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import NotFound from './pages/NotFound';
import Login from './pages/Login';

// Panels
import MyAssets from './pages/app/MyAssets';
import AdminUsers from './pages/admin/Users';
import AdminAssign from './pages/admin/Assign';
import AdminAssignments from './pages/admin/Assignments';
import CategoriesManager from './pages/admin/CategoriesManager';
import AssignmentEdit from './pages/admin/AssignmentEdit';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Guards
import RequireAuth from './routes/RequireAuth';
import RedirectByRole from './routes/RedirectByRole';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Routes>
                  <Route path="/login" element={<Login />} />

                  <Route element={<RequireAuth />}>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<RedirectByRole />} />

                      {/* User */}
                      <Route path="app/my-assets" element={<MyAssets />} />

                      {/* Admin (protected) */}
                      <Route element={<RequireAuth adminOnly />}> 
                        <Route path="admin/users" element={<AdminUsers />} />
                        <Route path="admin/assign" element={<AdminAssign />} />
                        <Route path="admin/assignments" element={<AdminAssignments />} />
                        <Route path="admin/assignments/:id/edit" element={<AssignmentEdit />} />
                        <Route path="admin/categories" element={<CategoriesManager />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Route>
                </Routes>
                <Toaster position="top-right" />
              </div>
            </Router>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
