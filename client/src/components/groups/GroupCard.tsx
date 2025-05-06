import { useState } from "react";
import { AlertCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { groupAPI } from "@/services/api.service";
import GroupActions from "./GroupActions";

interface GroupCardProps {
  group: {
    group_id: number;
    name: string;
    description: string;
    group_code?: string;
    creator_name: string;
    created_by: number;
  };
  onDelete?: (groupId: number) => void;
  onLeave?: (groupId: number) => void;
  showGroupCode?: boolean;
}

const GroupCard = ({
  group,
  onDelete,
  onLeave,
  showGroupCode,
}: GroupCardProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch full group details including members
  const { data: groupDetails } = useQuery({
    queryKey: ["groupDetails", group.group_id],
    queryFn: () => groupAPI.getGroupDetails(group.group_id),
    enabled: user?.role === "student" && user?.user_id === group.created_by, // Only fetch if user is the student creator
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3
          className="text-xl font-semibold text-gray-800 hover:text-blue-600 cursor-pointer"
          onClick={() => navigate(`/groups/${group.group_id}`)}
        >
          {group.name}
        </h3>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">
          Created by: {group.creator_name}
        </p>
        {showGroupCode && group.group_code && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-600">
              Group Code:
            </span>
            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
              {group.group_code}
            </code>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
        {/* Show GroupActions only for student creators */}
        {user?.role === "student" &&
          user?.user_id === group.created_by &&
          groupDetails && <GroupActions group={groupDetails} />}

        {onDelete && user?.role === "admin" && (
          <>
            {showConfirmDelete ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-600">Are you sure?</span>
                <button
                  onClick={() => onDelete(group.group_id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Delete Group
              </button>
            )}
          </>
        )}

        {onLeave && user?.role !== "admin" && (
          <>
            {showConfirmLeave ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-600">Leave group?</span>
                <button
                  onClick={() => onLeave(group.group_id)}
                  className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                >
                  Yes, leave
                </button>
                <button
                  onClick={() => setShowConfirmLeave(false)}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmLeave(true)}
                className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
              >
                Leave Group
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
