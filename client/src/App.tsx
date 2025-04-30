import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";

//* load auth
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));

//* load components layout
const MainLayout = lazy(() => import("./layouts/MainLayout"));

//* load pages
// profile
const Profile = lazy(() => import("./pages/Profile"));

//Student
const StudentDashboard = lazy(
  () => import("./pages/students/StudentDashboard")
);
const StudentGroups = lazy(() => import("./pages/students/StudentGroups"));
const StudentProgress = lazy(() => import("./pages/students/StudentProgress"));
const StudentTasks = lazy(() => import("./pages/students/StudentTasks"));

//Teacher
const TeacherDashboard = lazy(
  () => import("./pages/teacher/TeacherDashBoard")
);
const TeacherGroups = lazy(() => import("./pages/teacher/TeacherGroups"));
const TeacherTasks = lazy(() => import("./pages/teacher/TeacherTasks"));

//Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks"));
const AdminGroups = lazy(() => import("./pages/admin/AdminGroups"));
const AdminFiles = lazy(() => import("./pages/admin/AdminFiles"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // data is cached for 10 minutes
      refetchOnMount: "always",
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route path="profile" element={<Profile />} />

                {/* Student Routes */}
                <Route index element={<StudentDashboard />} />
                <Route path="tasks" element={<StudentTasks />} />
                <Route path="progress" element={<StudentProgress />} />
                <Route path="groups" element={<StudentGroups />} />

                <Route path="teacher">
                  <Route index element={<TeacherDashboard />} />
                  <Route path="tasks" element={<TeacherTasks />} />
                  <Route path="groups" element={<TeacherGroups />} />
                </Route>

                <Route path="admin">
                  <Route index element={<AdminDashboard />} />
                  <Route path="tasks" element={<AdminTasks />} />
                  <Route path="files" element={<AdminFiles />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="groups" element={<AdminGroups />} />
                </Route>
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
