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
const StudentGroups = lazy(() => import("./pages/students/StudentGroups"));
const StudentProgress = lazy(() => import("./pages/students/StudentProgress"));
const StudentTasks = lazy(() => import("./pages/students/StudentTasks"));

//Teacher
const TeacherGroups = lazy(() => import("./pages/teacher/TeacherGroups"));
const TeacherTasks = lazy(() => import("./pages/teacher/TeacherTasks"));

//Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks"));
const AdminGroups = lazy(() => import("./pages/admin/AdminGroups"));
const AdminFiles = lazy(() => import("./pages/admin/AdminFiles"));
const AdminSubscriptions = lazy(() => import("./pages/admin/SubscriptionManagement"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));

// Subscription Pages
const SubscriptionPage = lazy(() => import("./pages/subscription/SubscriptionPage"));
const SubscriptionSuccessPage = lazy(() => import("./pages/subscription/SubscriptionSuccessPage"));
const SubscriptionCancelPage = lazy(() => import("./pages/subscription/SubscriptionCancelPage"));

// Shared
const GroupDetails = lazy(() => import("./pages/groups/GroupDetails"));
const TaskDetailsPage = lazy(() => import("./pages/TaskDetailsPage"));

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

              {/* Private Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<MainLayout />}>
                  <Route path="profile" element={<Profile />} />



                  {/* Student Routes */}
                  <Route index element={<Navigate to="/tasks" replace />} />
                  <Route path="tasks" element={<StudentTasks />} />
                  <Route path="tasks/:taskId" element={<TaskDetailsPage />} />
                  <Route path="progress" element={<StudentProgress />} />
                  <Route path="groups" element={<StudentGroups />} />
                  <Route path="groups/:groupId" element={<GroupDetails />} />

                  {/* Teacher Routes */}
                  <Route path="teacher">
                    <Route index element={<Navigate to="/teacher/tasks" replace />} />
                    <Route path="tasks" element={<TeacherTasks />} />
                    <Route path="tasks/:taskId" element={<TaskDetailsPage />} />
                    <Route path="groups" element={<TeacherGroups />} />
                    <Route path="groups/:groupId" element={<GroupDetails />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="admin">
                    <Route index element={<AdminDashboard />} />
                    <Route path="tasks" element={<AdminTasks />} />
                    <Route path="tasks/:taskId" element={<TaskDetailsPage />} />
                    <Route path="files" element={<AdminFiles />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="groups" element={<AdminGroups />} />
                    <Route path="groups/:groupId" element={<GroupDetails />} />
                    <Route path="subscriptions" element={<AdminSubscriptions />} />
                  </Route>

                  {/* Subscription Routes */}
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path="payment/success" element={<SubscriptionSuccessPage />} />
                  <Route path="payment/cancel" element={<SubscriptionCancelPage />} />
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
