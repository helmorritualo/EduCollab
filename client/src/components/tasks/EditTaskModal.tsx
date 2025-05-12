import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { TaskWithDetails } from "@/types";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    task_id: number;
    title: string;
    description: string;
    due_date: string;
    group_id: number;
  }) => void;
  task: TaskWithDetails | null;
  groups?: { group_id: number; name: string }[];
}

const EditTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  groups = [],
}: EditTaskModalProps) => {
  const [formData, setFormData] = useState({
    task_id: 0,
    title: "",
    description: "",
    due_date: "",
    group_id: 0,
    status: "pending",
  });

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        task_id: Number(task.task_id),  // Ensure this is a number
        title: task.title,
        description: task.description,
        due_date: task.due_date ? task.due_date.split('T')[0] : "",
        group_id: Number(task.group_id), // Ensure this is a number
        status: task.status || 'pending',
      });
    }
  }, [task]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "group_id" ? (value ? parseInt(value) : 0) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.group_id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select a group",
      });
      return;
    }

    // Submit only the required fields (excluding status)
    onSubmit({
      task_id: formData.task_id,
      title: formData.title,
      description: formData.description,
      due_date: formData.due_date,
      group_id: Number(formData.group_id),
    });
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
          <p className="text-sm text-gray-500 mt-1">Update task details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter task title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                placeholder="Describe your task in detail"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>


          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
