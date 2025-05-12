import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskAPI, groupAPI } from "@/services/api.service";
import { Search, Plus } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import { Group, TaskWithDetails } from "@/types";
import Swal from "sweetalert2";
import { useAuth } from "@/contexts/AuthContext";

const TeacherTasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["teacherGroups"],
    queryFn: () => groupAPI.listUserGroups(),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["teacherTasks", selectedGroup],
    queryFn: () =>
      selectedGroup
        ? taskAPI.getTasksByGroupId(parseInt(selectedGroup))
        : Promise.all(
            groups.map((group) => taskAPI.getTasksByGroupId(group.group_id))
          ).then((groupTasks) => groupTasks.flat()),
    enabled: groups.length > 0,
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) =>
      taskAPI.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherTasks"] });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Task status updated successfully",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update task status",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherTasks"] });
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

  const createTaskMutation = useMutation({
    mutationFn: taskAPI.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherTasks"] });
      setShowCreateForm(false);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create task",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      task_id: number;
      title: string;
      description: string;
      status: string;
      due_date: string;
      group_id: number;
    }) => taskAPI.updateTask(data.task_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherTasks"] });
      setShowEditForm(false);
      setSelectedTask(null);
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

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskStatusMutation.mutate({ taskId, status: newStatus });
  };

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
    
    setSelectedTask(task);
    setShowEditForm(true);
  };

  const filteredTasks = tasks.filter((task: TaskWithDetails) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.creator_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup =
      !selectedGroup || task.group_id.toString() === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Group Tasks</h1>
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
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
            Create Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm">Create a new task to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task: TaskWithDetails) => {
            // Only show edit and delete buttons if current user is the creator
            // Convert to string first to handle different ID types (number vs string)
            const currentUserId = user?.user_id?.toString();
            const taskCreatorId = task.created_by?.toString();
            const canModify = !!currentUserId && !!taskCreatorId && currentUserId === taskCreatorId;
            
            return (
              <TaskCard
                key={task.task_id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={canModify ? handleDelete : undefined}
                onEdit={canModify ? handleEdit : undefined}
                showActions={false}
                onFileUpload={() => queryClient.invalidateQueries({ queryKey: ["teacherTasks"] })}
              />
            );
          })}
        </div>
      )}

      <CreateTaskModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={createTaskMutation.mutate}
        selectedGroup={selectedGroup ? parseInt(selectedGroup) : undefined}
        groups={groups}
      />
      
      <EditTaskModal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={(data) => {
          // Add the status from the selected task or default to "pending"
          const updatedData = {
            ...data,
            status: selectedTask?.status || "pending"
          };
          updateTaskMutation.mutate(updatedData);
        }}
        task={selectedTask}
        groups={groups}
      />
    </div>
  );
};

export default TeacherTasks;
