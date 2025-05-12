import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskAPI, groupAPI } from "@/services/api.service";
import { Search, BookOpen, Plus } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import StudentCreateTaskModal from "@/components/tasks/StudentCreateTaskModal";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import { TaskWithDetails, Group } from "@/types";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/AuthContext";

const StudentTasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["studentTasks"],
    queryFn: () => taskAPI.getMyTasks(),
  });
  
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["studentGroups"],
    queryFn: () => groupAPI.listUserGroups(),
  });
  
  const createTaskMutation = useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentTasks"] });
      setShowCreateForm(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      let errorMessage = error.message || "Failed to create task";
      
      // Check for specific authorization error
      if (errorMessage.includes("Only teachers can create tasks") || 
          errorMessage.includes("ForbiddenError") || 
          errorMessage.includes("Invalid request body")) {
        errorMessage = "Only teachers are authorized to create tasks in the system. Please contact your teacher if you need to create a task.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    },
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentTasks"] });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Task deleted successfully",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to delete task",
      });
    },
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      task_id: number;
      title: string;
      description: string;
      due_date: string;
      group_id: number;
    }) => taskAPI.updateTask(data.task_id, {
      title: data.title,
      description: data.description,
      status: editingTask?.status || "pending",
      due_date: data.due_date,
      group_id: data.group_id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentTasks"] });
      setEditingTask(null);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update task",
      });
    },
  });

  // Status updates are only handled in the Progress page

  const handleDelete = async (taskId: number) => {
    // Find the task to check if current user is the creator
    const taskToDelete = tasks.find(task => task.task_id === taskId);
    
    // Only allow deletion if current user is the creator of the task
    if (!taskToDelete || !user || taskToDelete.created_by !== user.user_id) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "You can only delete tasks that you created.",
      });
      return;
    }
    
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      deleteTaskMutation.mutate(taskId);
    }
  };
  
  const handleEdit = (task: TaskWithDetails) => {
    // Only allow editing if current user is the creator of the task
    if (!user || task.created_by !== user.user_id) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "You can only edit tasks that you created.",
      });
      return;
    }
    
    setEditingTask(task);
  };

  const filteredTasks = tasks.filter((task: TaskWithDetails) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.creator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.group_name &&
        task.group_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Improved status filtering that handles both case and formatting differences
    const matchesStatus = 
      statusFilter === "all" || 
      task.status.toLowerCase().replace("_", " ") === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BookOpen className="text-blue-600 mr-2" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">My Tasks & Assignments</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Task Status</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm">Tasks and assignments will appear here when your teacher creates them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task: TaskWithDetails) => {
            // Only show delete button if current user is the creator
            // Only the creator of a task can delete it
            // Convert to string first to handle different ID types (number vs string)
            const currentUserId = user?.user_id?.toString();
            const taskCreatorId = task.created_by?.toString();
            const canDelete = !!currentUserId && !!taskCreatorId && currentUserId === taskCreatorId;
            
            return (
              <TaskCard
                key={task.task_id}
                task={task}
                onDelete={canDelete ? handleDelete : undefined}
                onEdit={canDelete ? handleEdit : undefined}
                onFileUpload={() => queryClient.invalidateQueries({ queryKey: ["studentTasks"] })}
              />
            );
          })}
        </div>
      )}
      
      <StudentCreateTaskModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={createTaskMutation.mutate}
        groups={groups}
      />
      
      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={updateTaskMutation.mutate}
        task={editingTask}
        groups={groups}
      />
    </div>
  );
};

export default StudentTasks;
