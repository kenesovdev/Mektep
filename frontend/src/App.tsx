import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import PrivateRoute from '@/components/PrivateRoute';
import AdminSchoolsPage from '@/pages/admin/SchoolsPage';
import AdminUsersPage from '@/pages/admin/UsersPage';
import LoginPage from '@/pages/LoginPage';
import ManagerDashboard from '@/pages/manager/Dashboard';
import ManagerTeacherDetail from '@/pages/manager/TeacherDetail';
import TeacherDashboard from '@/pages/TeacherDashboard';
import TeacherProfilePage from '@/pages/teacher/TeacherProfilePage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import { ROLES } from '@/utils/roles';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute role={ROLES.ADMIN}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="schools" element={<AdminSchoolsPage />} />
        </Route>

        <Route
          path="/admin/dashboard"
          element={<Navigate to="/admin/users" replace />}
        />

        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute role={ROLES.MANAGER}>
              <ManagerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/manager/teachers/:id"
          element={
            <PrivateRoute role={ROLES.MANAGER}>
              <ManagerTeacherDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher/dashboard"
          element={
            <PrivateRoute role={ROLES.TEACHER}>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher/profile"
          element={
            <PrivateRoute role={ROLES.TEACHER}>
              <TeacherProfilePage />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
