import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "@/services/api.service";
import { Search } from "lucide-react";
import GroupCard from "@/components/groups/GroupCard";
import { Group } from "@/types";
import Swal from "sweetalert2";

const AdminGroups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery<Group[]>({
    queryKey: ["allGroups"],
    queryFn: () => groupAPI.getAllGroups(),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupAPI.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allGroups"] });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Group has been deleted",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to delete group",
      });
    },
  });

  const filteredGroups =
    groups?.filter(
      (group) =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Groups</h1>
        <p className="text-gray-600">
          Manage and monitor all study groups in the system.
        </p>
      </div>

      <div className="mt-8">
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
                onDelete={deleteGroupMutation.mutate}
                showGroupCode={true}
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
                : "There are no groups in the system yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGroups;
