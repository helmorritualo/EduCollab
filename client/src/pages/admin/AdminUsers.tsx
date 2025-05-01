import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI } from "@/services/api.service";
import Swal from "sweetalert2";
import manProfilePic from "../../assets/man.png";
import womanProfilePic from "../../assets/woman.png";

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userAPI.getAllUsers(),
  });

  const users = Array.isArray(data) ? data : data?.users || [];

  const filteredUsers = users.filter((user: {
    username: string;
    email: string;
    full_name: string;
    role: string;
  }) => {
    const matchesSearch =
      !searchQuery ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const UnrchiveUser = useMutation({
    mutationFn: (userId: number) => userAPI.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to activate user"
      })
    }
  });

  const ArchiveUser = useMutation({
    mutationFn: (userId: number) => userAPI.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to deactivate user"
      })
    }
  });

  const handleUnarchive = (userId: number) => {
    Swal.fire({
      title: "Unarchive User",
      text: "Are you sure you want to unarchive this user?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        UnrchiveUser.mutate(userId);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User Unarchive successfully"
        })
      }
    });
  };

  const handleArchive = (userId: number) => {
    Swal.fire({
      title: "Archive User",
      text: "Are you sure you want to archive this user?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        ArchiveUser.mutate(userId);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User Archive successfully"
        })
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-300 w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-300 w-full md:w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="" disabled selected hidden>Roles</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-left">Profile</th>
              <th className="bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-left">Name</th>
              <th className="bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-left">Email</th>
              <th className="bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-left">Role</th>
              <th className="bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-left">Phone Number</th>
              <th className="bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-left">Gender</th>
              <th className="bg-gray-100 text-gray-700 font-semibold px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers
              .filter((user: { role: string }) => user.role !== "admin") 
              .map((user: {
                user_id: number;
                full_name: string;
                email: string;
                role: string;
                phone_number: string;
                is_active: boolean;
                gender: string;
              }) => (
                <tr key={user.user_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <img
                      src={user.gender === "female" ? womanProfilePic : manProfilePic}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  </td>
                  <td className="px-4 py-3">{user.full_name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                  <td className="px-4 py-3">{user.phone_number}</td>
                  <td className="px-4 py-3">{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <button
                        onClick={() => handleArchive(user.user_id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 transition disabled:opacity-60"
                        disabled={ArchiveUser.isPending}
                      >
                        Archive
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnarchive(user.user_id)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 transition disabled:opacity-60"
                        disabled={UnrchiveUser.isPending}
                      >
                        Unarchive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
};

export default AdminUsers