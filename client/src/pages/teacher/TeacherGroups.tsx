import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "@/services/api.service";
import { Search, Bell } from "lucide-react";
import GroupCard from "@/components/groups/GroupCard";
import GroupInvitation from "@/components/groups/GroupInvitation";
import { Group, TeacherInvitation } from "@/types";
import Swal from "sweetalert2";

const TeacherGroups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvitations, setShowInvitations] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const queryClient = useQueryClient();

  const { data: groups, isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => groupAPI.listUserGroups(),
  });

  const { data: invitations, isLoading: invitationsLoading } = useQuery<
    TeacherInvitation[]
  >({
    queryKey: ["invitations"],
    queryFn: () => groupAPI.getInvitationsForTeacher(),
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupAPI.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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

  const joinGroupMutation = useMutation({
    mutationFn: (data: { group_code: string }) => groupAPI.joinGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setGroupCode("");
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "You have joined the group",
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

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupCode.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter a group code",
      });
      return;
    }
    joinGroupMutation.mutate({ group_code: groupCode });
  };

  const filteredGroups =
    groups?.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const pendingInvitations =
    invitations?.filter((invitation) => invitation.status === "pending") || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {showInvitations ? "Group Invitations" : "My Groups"}
          </h1>
          <p className="text-gray-600">
            {showInvitations
              ? "Manage your group invitations and collaborate with students."
              : "View and manage your teaching groups. You'll be added to groups when you accept invitations from students."}
          </p>
        </div>
        <button
          onClick={() => setShowInvitations(!showInvitations)}
          className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition relative"
        >
          <Bell className="w-5 h-5 mr-2" />
          {showInvitations ? "View Groups" : "View Invitations"}
          {pendingInvitations.length > 0 && !showInvitations && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingInvitations.length}
            </span>
          )}
        </button>
      </div>

      {!showInvitations && (
        <div className="mb-8">
          <form onSubmit={handleJoinGroup} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter group code to join"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={joinGroupMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
            </button>
          </form>
        </div>
      )}

      <div className="mt-8">
        {!showInvitations && (
          <div className="flex items-center mb-6 bg-white rounded-lg shadow-sm px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none focus:outline-none focus:ring-0"
            />
          </div>
        )}

        {showInvitations ? (
          invitationsLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                </div>
              ))}
            </div>
          ) : (invitations || []).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {invitations?.map((invitation) => (
                <GroupInvitation
                  key={invitation.invitation_id}
                  invitation={invitation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No invitations
              </h3>
              <p className="text-gray-500">
                You don't have any group invitations.
              </p>
            </div>
          )
        ) : groupsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.group_id}
                group={group}
                onLeave={leaveGroupMutation.mutate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No groups found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "No groups match your search criteria"
                : "You haven't joined any groups yet. Create or join a group to get started!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherGroups;
