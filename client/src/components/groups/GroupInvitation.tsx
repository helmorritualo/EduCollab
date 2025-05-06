import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "@/services/api.service";
import { TeacherInvitation } from "@/types";
import { CheckCircle, XCircle, ClockIcon } from "lucide-react";
import Swal from "sweetalert2";

interface GroupInvitationProps {
  invitation: TeacherInvitation;
}

const GroupInvitation = ({ invitation }: GroupInvitationProps) => {
  const queryClient = useQueryClient();

  const respondToInvitationMutation = useMutation({
    mutationFn: ({
      invitationId,
      status,
    }: {
      invitationId: number;
      status: "approved" | "rejected";
    }) => groupAPI.respondToInvitation(invitationId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Invitation responded successfully",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to respond to invitation",
      });
    },
  });

  const getStatusDisplay = () => {
    switch (invitation.status) {
      case "pending":
        return (
          <div className="flex items-center text-yellow-500">
            <ClockIcon className="w-5 h-5 mr-1" />
            <span>Pending</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle className="w-5 h-5 mr-1" />
            <span>Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center text-red-500">
            <XCircle className="w-5 h-5 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {invitation.group_name}
          </h3>
          <p className="text-sm text-gray-500">
            From: {invitation.inviter_name}
          </p>
        </div>
        {getStatusDisplay()}
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Project Details:
        </h4>
        <p className="text-gray-600 whitespace-pre-wrap">
          {invitation.project_details}
        </p>
      </div>

      {invitation.status === "pending" && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() =>
              respondToInvitationMutation.mutate({
                invitationId: invitation.invitation_id,
                status: "rejected",
              })
            }
            disabled={respondToInvitationMutation.isPending}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
          >
            Decline
          </button>
          <button
            onClick={() =>
              respondToInvitationMutation.mutate({
                invitationId: invitation.invitation_id,
                status: "approved",
              })
            }
            disabled={respondToInvitationMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Accept
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        Received: {new Date(invitation.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default GroupInvitation;
