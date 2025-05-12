import React from 'react';
import { TaskWithDetails } from "@/types";
import { Trash2, Edit, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TaskCardProps {
  task: TaskWithDetails;
  onStatusChange?: (taskId: number, status: string) => void;
  onDelete?: (taskId: number) => void;
  onEdit?: (task: TaskWithDetails) => void;
  showActions?: boolean;
  onFileUpload?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  onEdit,
  showActions = true
}) => {
  const navigate = useNavigate();
  
  // Navigate to task details page when card is clicked
  const handleTaskClick = () => {
    // Determine the base path based on the user role (student, teacher, admin)
    const basePath = window.location.pathname.includes('/admin') 
      ? '/admin/tasks'
      : window.location.pathname.includes('/teacher')
        ? '/teacher/tasks'
        : '/tasks';
        
    navigate(`${basePath}/${task.task_id}`);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation(); // Prevent navigation when changing status
    if (onStatusChange) {
      onStatusChange(task.task_id!, e.target.value);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when deleting
    if (onDelete) {
      onDelete(task.task_id!);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when editing
    if (onEdit) {
      onEdit(task);
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
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow p-4 ${showActions ? '' : 'mb-4'}`}
      onClick={handleTaskClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <div className="flex gap-2">
          {showActions && onStatusChange && (
            <select
              value={task.status}
              onChange={handleStatusChange}
              onClick={(e) => e.stopPropagation()}
              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          
          {!showActions && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>
          )}
          
          {onEdit && (
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800 mr-2"
              title="Edit task"
            >
              <Edit size={18} />
            </button>
          )}
          
          {/* Only show delete button if onDelete prop is provided */}
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
      
      <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
      
      <div className="text-sm text-gray-500 space-y-1">
        <div className="flex items-center justify-between">
          <p>Group: {task.group_name}</p>
          {/* Only show status here if it's not already shown in the top section */}
          {showActions && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <p>Created by: {task.creator_name}</p>
          <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleTaskClick}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          View Details <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
