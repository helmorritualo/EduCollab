import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "@/services/api.service";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, UserPlus, Users, User } from "lucide-react";
import { GroupWithMembers } from "@/types";
import Swal from "sweetalert2";

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteTeacher, setShowInviteTeacher] = useState(false);
  const [inviteData, setInviteData] = useState({
    teacherName: "",
    projectDetails: "",
  });

  const { data: group, isLoading } = useQuery<GroupWithMembers>({
    queryKey: ["groupDetails", groupId],
    queryFn: () => groupAPI.getGroupDetails(Number(groupId)),
    enabled: !!groupId,
  });

  const inviteTeacherMutation = useMutation({
    mutationFn: async (data: {
      teacherName: string;
      projectDetails: string;
    }) => {
      if (!group) throw new Error("Group not found");
      return groupAPI.createTeacherGroupInvitation({
        group_name: group.name,
        invited_teacher_name: data.teacherName,
        project_details: data.projectDetails,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupDetails", groupId] });
      setShowInviteTeacher(false);
      setInviteData({ teacherName: "", projectDetails: "" });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Teacher invitation sent successfully",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to send invitation",
      });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupAPI.leaveGroup(groupId),
    onSuccess: () => {
      navigate("/groups");
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "You have left the group",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to leave group",
      });
    },
  });

  const handleInviteTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    inviteTeacherMutation.mutate({
      teacherName: inviteData.teacherName,
      projectDetails: inviteData.projectDetails,
    });
  };

  if (isLoading || !group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {group.name}
            </h1>
            <p className="text-gray-500">Created by {group.creator_name}</p>
          </div>
          {user?.role !== "admin" && (
            <button
              onClick={() => leaveGroupMutation.mutate(Number(groupId))}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Leave Group
            </button>
          )}
        </div>

        <p className="text-gray-700 mb-8">{group.description}</p>

        <div className="border-t pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Group Members
            </h2>
            {(user?.user_id === group.created_by) && (
              <button
                onClick={() => setShowInviteTeacher(true)}
                className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition mb-6"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Invite Teacher
              </button>
            )}
          </div>

          {showInviteTeacher && (
            <form
              onSubmit={handleInviteTeacher}
              className="bg-gray-50 p-6 rounded-lg mb-6"
            >
              <h3 className="text-lg font-semibold mb-4">Invite Teacher</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    value={inviteData.teacherName}
                    onChange={(e) =>
                      setInviteData({
                        ...inviteData,
                        teacherName: e.target.value,
                      })
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
                    value={inviteData.projectDetails}
                    onChange={(e) =>
                      setInviteData({
                        ...inviteData,
                        projectDetails: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteTeacher(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteTeacherMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {inviteTeacherMutation.isPending
                      ? "Sending..."
                      : "Send Invitation"}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {group.members?.map((member) => (
              <div
                key={member.user_id}
                className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg"
              >
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">
                    {member.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
