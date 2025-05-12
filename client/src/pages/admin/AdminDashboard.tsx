import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, groupAPI, taskAPI, fileAPI } from '../../services/api.service';
import { FileUpload, TaskWithDetails } from '../../types';

interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  gender: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface UserResponse {
  success: boolean;
  message?: string;
  users: User[];
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();

  // Fetch users using the userAPI service
  const { data: usersData, isLoading: loadingUsers } = useQuery<UserResponse>({
    queryKey: ['admin-users'],
    queryFn: () => userAPI.getAllUsers(),
    enabled: !!user && isAdmin
  });
  
  // Fetch groups using the groupAPI service - returns Group[] directly
  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: () => groupAPI.getAllGroups(),
    enabled: !!user && isAdmin
  });
  
  // Fetch tasks using the taskAPI service
  const { data: tasksData, isLoading: loadingTasks } = useQuery<TaskWithDetails[]>({
    queryKey: ['admin-tasks'],
    queryFn: () => taskAPI.getAllTasks(),
    enabled: !!user && isAdmin
  });
  
  // Fetch files using the fileAPI service - returns FileUpload[]
  const { data: filesData, isLoading: loadingFiles } = useQuery<FileUpload[]>({
    queryKey: ['admin-files'],
    queryFn: () => fileAPI.getAllFiles(),
    enabled: !!user && isAdmin
  });
  
  // Extract data for display
  const users = usersData?.users || [];
  const recentUsers = users.slice(0, 5).filter(user => user.role !== 'admin'); // Get the 5 most recent users
  const totalUsers = users.filter(user => user.role !== 'admin').length;
  const totalGroups = Array.isArray(groupsData) ? groupsData.length : 0;
  const totalTasks = Array.isArray(tasksData) ? tasksData.length : 0; 
  
  // Calculate total file storage in bytes
  const totalFileStorage = Array.isArray(filesData) ? filesData.reduce((total: number, file: FileUpload) => {
    return total + (file.file_size || 0);
  }, 0) : 0;
  
  // Format bytes to human-readable format
  const formatFileSize = (bytes: number): string => {
    // Added safety check
    if (!bytes && bytes !== 0) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>Access denied. You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          
          {/* Admin Stats Summary */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm text-blue-800 font-medium">Total Users</h3>
                {loadingUsers ? (
                  <div className="animate-pulse h-8 bg-blue-200 rounded w-16 mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">{totalUsers}</p>
                )}
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm text-green-800 font-medium">Active Groups</h3>
                {loadingGroups ? (
                  <div className="animate-pulse h-8 bg-green-200 rounded w-16 mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">{totalGroups}</p>
                )}
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm text-yellow-800 font-medium">Tasks Created</h3>
                {loadingTasks ? (
                  <div className="animate-pulse h-8 bg-yellow-200 rounded w-16 mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">{totalTasks}</p>
                )}
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm text-purple-800 font-medium">File Storage</h3>
                {loadingFiles ? (
                  <div className="animate-pulse h-8 bg-purple-200 rounded w-16 mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold">{formatFileSize(totalFileStorage)}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">Recent Users</h2>
            {loadingUsers ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : recentUsers && recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user: User) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <Link to={`/admin/users/${user.user_id}`} className="text-blue-600 hover:text-blue-800">
                            {user.full_name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-sm">{user.email}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                            {user.gender}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
            <div className="mt-4 text-center">
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm">
                Manage all users
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;