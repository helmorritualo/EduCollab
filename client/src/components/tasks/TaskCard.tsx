import { TaskWithDetails } from "@/types";
import { taskAPI } from "@/services/api.service";
import { Trash2 } from "lucide-react";

interface TaskCardProps {
  task: TaskWithDetails;
  onStatusChange?: (taskId: number, status: string) => void;
  onDelete?: (taskId: number) => void;
  showActions?: boolean;
}

const TaskCard = ({
  task,
  onStatusChange,
  onDelete,
  showActions = true,
}: TaskCardProps) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusChange) {
      onStatusChange(task.task_id!, e.target.value);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.task_id!);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <div className="flex gap-2">
          {showActions && onStatusChange && (
            <select
              value={task.status}
              onChange={handleStatusChange}
              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          {/* {!showActions && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>
          )} */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800"
              title="Delete task"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-600 mb-4">{task.description}</p>
      <div className="text-sm text-gray-500 space-y-1">
        <div className="flex items-center justify-between">
          <p>Group: {task.group_name}</p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              task.status
            )}`}
          >
            {task.status}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p>Created by: {task.creator_name}</p>
          <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
        </div>
        {task.file && (
          <button
            onClick={() => taskAPI.downloadTaskFile(task.file!.file_id)}
            className="text-blue-500 hover:text-blue-700 underline mt-2 w-full text-left"
          >
            📎 {task.file.original_filename}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
