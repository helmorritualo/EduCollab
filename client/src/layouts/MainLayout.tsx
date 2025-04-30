import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import manProfilePic from "../assets/man.png";
import womanProfilePic from "../assets/woman.png";
import {
  Menu,
  LogOut,
  ChevronDown,
  X,
  LayoutDashboard,
  ClipboardList,
  Users,
  Ellipsis,
  Files
} from "lucide-react";

const MainLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState<boolean>(false);
  const location = useLocation();

  const studentNavigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: ClipboardList },
    { name: "Progress", href: "/progress", icon: Ellipsis },
    { name: "Groups", href: "/groups", icon: Users },
  ];

  const teacherNavigation = [
    { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { name: "Tasks", href: "/teacher/tasks", icon: ClipboardList },
    { name: "Groups", href: "/teacher/groups", icon: Users },
  ];

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Tasks", href: "/admin/tasks", icon: ClipboardList },
    { name: "Files", href: "/admin/files", icon: Files },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Groups", href: "/admin/groups", icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-[0.9rem]">
            <h1 className="text-[2rem] font-bold text-blue-600 pl-8">EduCollab</h1>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {/* Render navigation based on user role */}
            {!isAdmin && user?.role === "student" &&
              studentNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}

            {!isAdmin && user?.role === "teacher" &&
              teacherNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}

            {isAdmin && (
              <>
                <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase">
                  Admin Menu
                </div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="px-10 py-6">
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-400 rounded-md flex items-center justify-center space-x-2"
            >
              <LogOut className="h-6 w-6 text-white" />
              <span>Logout</span>
            </button>
          </div>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-blue-600 lg:hidden ml-3">
                EduCollab
              </h1>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <img
                  src={
                    user?.gender === "female" ? womanProfilePic : manProfilePic
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.full_name}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-35 bg-white rounded-md drop-shadow-lg py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
