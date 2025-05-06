import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { groupAPI } from "@/services/api.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { GroupWithMembers } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface GroupActionsProps {
  group?: GroupWithMembers;
}

const GroupActions = ({ group }: GroupActionsProps) => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupCode: "",
    teacherName: "",
    projectDetails: "",
  });

  const queryClient = useQueryClient();

  const hasTeacher = group?.members.some((member) => member.role === "teacher");
  const canInviteTeacher =
    user?.role === "student" &&
    group?.created_by === user?.user_id &&
    !hasTeacher;

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      groupAPI.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowCreateForm(false);
      setFormData({
        name: "",
        description: "",
        groupCode: "",
        teacherName: "",
        projectDetails: "",
      });
      Swal.fire({
        icon: "success",
        title: "Group Created!",
        text: "Your group has been created successfully.",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create group",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: (data: { group_code: string }) => groupAPI.joinGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowJoinForm(false);
      setFormData({
        name: "",
        description: "",
        groupCode: "",
        teacherName: "",
        projectDetails: "",
      });
      Swal.fire({
        icon: "success",
        title: "Joined Successfully!",
        text: "You have joined the group.",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to join group",
      });
    },
  });

  const inviteTeacherMutation = useMutation({
    mutationFn: (data: {
      group_name: string;
      invited_teacher_name: string;
      project_details: string;
    }) => groupAPI.createTeacherGroupInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowInviteForm(false);
      setFormData({
        name: "",
        description: "",
        groupCode: "",
        teacherName: "",
        projectDetails: "",
      });
      Swal.fire({
        icon: "success",
        title: "Invitation Sent!",
        text: "Teacher invitation has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to invite teacher",
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroupMutation.mutate({
      name: formData.name,
      description: formData.description,
    });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinGroupMutation.mutate({
      group_code: formData.groupCode,
    });
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    inviteTeacherMutation.mutate({
      group_name: group.name,
      invited_teacher_name: formData.teacherName,
      project_details: formData.projectDetails,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {!group && (
          <>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setShowJoinForm(false);
                setShowInviteForm(false);
              }}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </button>
            <button
              onClick={() => {
                setShowJoinForm(!showJoinForm);
                setShowCreateForm(false);
                setShowInviteForm(false);
              }}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Join Group
            </button>
          </>
        )}

        {canInviteTeacher && (
          <button
            onClick={() => {
              setShowInviteForm(!showInviteForm);
              setShowCreateForm(false);
              setShowJoinForm(false);
            }}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Teacher
          </button>
        )}
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createGroupMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </form>
      )}

      {showJoinForm && (
        <form
          onSubmit={handleJoinSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">Join Group</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Code
              </label>
              <input
                type="text"
                value={formData.groupCode}
                onChange={(e) =>
                  setFormData({ ...formData, groupCode: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowJoinForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={joinGroupMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
              </button>
            </div>
          </div>
        </form>
      )}

      {showInviteForm && (
        <form
          onSubmit={handleInviteSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold mb-4">Invite Teacher</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Name
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) =>
                  setFormData({ ...formData, teacherName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Details
              </label>
              <textarea
                value={formData.projectDetails}
                onChange={(e) =>
                  setFormData({ ...formData, projectDetails: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                required
                placeholder="Describe the project and what you're looking for in a teacher..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteTeacherMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {inviteTeacherMutation.isPending
                  ? "Sending..."
                  : "Send Invitation"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default GroupActions;
