import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/services/api.service";
import Swal from "sweetalert2";
import manProfilePic from "../assets/man.png";
import womanProfilePic from "../assets/woman.png";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    gender: user?.gender || "",
    role: user?.role || ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Change Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">No user data found.</div>
      </div>
    );
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const success = await updateProfile(editData);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Passwords do not match.",
      });
      return;
    }
    setIsChangingPassword(true);
    try {
      await userAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      Swal.fire({
        icon: "success",
        title: "Password Changed",
        text: "Your password has successfully Changed.",
      });
      setShowPasswordForm(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: Error | unknown) {
      let errorMsg = "Failed to change password.";
      if ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) {
        errorMsg = (err as { response: { data: { message: string } } }).response.data.message;
      } else if (err instanceof Error && err.message) {
        errorMsg = err.message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col gap-8">
        {!showPasswordForm ? (
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md mb-2">
                <img
                  src={user.gender === "male"? manProfilePic : womanProfilePic}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-800 tracking-tight">{user.full_name || user.username}</h2>
              <span className="text-sm text-blue-500">{user.role}</span>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleEditChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base ${isEditing ? "border-blue-300" : "border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base ${isEditing ? "border-blue-300" : "border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editData.full_name}
                    onChange={handleEditChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base ${isEditing ? "border-blue-300" : "border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={editData.phone_number}
                    onChange={handleEditChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base ${isEditing ? "border-blue-300" : "border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={editData.gender}
                    onChange={handleEditChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-base ${isEditing ? "border-blue-300" : "border-gray-200"}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-1">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={editData.role}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          username: user.username,
                          email: user.email,
                          full_name: user.full_name,
                          phone_number: user.phone_number,
                          gender: user.gender,
                          role: user.role || ""
                        });
                      }}
                      className="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full sm:w-auto px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow transition"
                >
                  Change Password
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center mt-0">
            <form onSubmit={handlePasswordChange} className="w-full flex flex-col gap-5">
              <h3 className="text-2xl font-bold text-blue-700 mb-2 text-center">Change Password</h3>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700"
                    onClick={() => setShowOldPassword((v) => !v)}
                  >
                    {showOldPassword ? (
                      // Eye open SVG
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      // Eye closed SVG
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m2.1-2.1A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700"
                    onClick={() => setShowNewPassword((v) => !v)}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m2.1-2.1A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m2.1-2.1A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow transition"
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="w-full px-6 py-2 mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg shadow transition"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;