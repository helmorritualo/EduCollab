import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "@/services/api.service";
import { Search } from "lucide-react";
import GroupCard from "@/components/groups/GroupCard";
import { Group } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";

const StudentGroups = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => groupAPI.listUserGroups(),
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

  const filteredGroups =
    groups?.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply group type filter
      if (filterType === "created") {
        return matchesSearch && group.created_by === user?.user_id;
      } else if (filterType === "joined") {
        return matchesSearch && group.created_by !== user?.user_id;
      }
      return matchesSearch;
    }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Groups</h1>
        <p className="text-gray-600">
          Join existing groups or create your own study group to collaborate
          with others.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none focus:outline-none focus:ring-0"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white rounded-lg shadow-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Groups</option>
            <option value="created">Created by Me</option>
            <option value="joined">Joined Groups</option>
          </select>
        </div>

        {isLoading ? (
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
                showGroupCode={user?.user_id === group.created_by}
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
                : filterType !== "all"
                ? `No ${
                    filterType === "created" ? "created" : "joined"
                  } groups found`
                : "You haven't joined any groups yet. Create or join a group to get started!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGroups;
