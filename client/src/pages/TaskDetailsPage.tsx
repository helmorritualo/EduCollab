import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileUp, ArrowLeft, Calendar, User, Users, Clock, Upload } from 'lucide-react';
import { fileAPI, taskAPI } from '@/services/api.service';
import { TaskWithDetails, FileUpload } from '@/types';
import Swal from 'sweetalert2';
import Spinner from '@/components/ui/Spinner';
import FileUploadModal from '@/components/tasks/FileUploadModal';
import { formatDate } from '@/utils/dateUtils';

const TaskDetailsPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [taskFiles, setTaskFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);

        // Use the taskAPI service to get task details
        const taskDetails = await taskAPI.getTaskById(parseInt(taskId));
        setTask(taskDetails);
        
        // Fetch files associated with this task
        const files = await fileAPI.getTaskFiles(parseInt(taskId));
        setTaskFiles(files);
      } catch (error) {
        console.error('Error fetching task details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'Failed to load task details. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleDownloadFile = async (fileId: number) => {
    try {
      // Show loading indication
      Swal.fire({
        title: 'Downloading...',
        text: 'Please wait while we prepare your file',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Use the fileAPI service method for downloading task files
      await fileAPI.downloadTaskFile(fileId);
      
      // Close the loading dialog
      Swal.close();
    } catch (error) {
      console.error('Error downloading file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to download file. Please try again.',
      });
    }
  };

  const handleFileUploadComplete = async () => {
    // Refresh the files list after upload
    if (!taskId) return;
    try {
      const files = await fileAPI.getTaskFiles(parseInt(taskId));
      setTaskFiles(files);
    } catch (error) {
      console.error('Error fetching task files after upload:', error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-800">Task not found</h2>
          <p className="mt-2 text-gray-600">The task you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft size={16} className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to tasks
        </button>
      </div>

      {/* Task header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
        >
          {task.status}
        </span>
      </div>

      {/* Task details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Task Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <div className="flex items-center text-gray-600">
                <Users size={18} className="mr-2" />
                <span className="font-medium">Group:</span>
                <span className="ml-2">{task.group_name}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <User size={18} className="mr-2" />
                <span className="font-medium">Created by:</span>
                <span className="ml-2">{task.creator_name}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-gray-600">
                <Calendar size={18} className="mr-2" />
                <span className="font-medium">Due date:</span>
                <span className="ml-2">{formatDate(task.due_date)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock size={18} className="mr-2" />
                <span className="font-medium">Created at:</span>
                <span className="ml-2">{task.created_at ? formatDate(task.created_at) : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
          </div>
        </div>
      </div>

      {/* Task files */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Files</h2>
            <button
              onClick={() => setFileUploadModalOpen(true)}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} className="mr-1" />
              Upload File
            </button>
          </div>
          
          {taskFiles.length > 0 ? (
            <div className="space-y-2">
              {taskFiles.map((file) => (
                <div
                  key={file.file_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FileUp size={20} className="text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">{file.original_filename}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded by {file.uploader?.full_name || file.uploader?.username || 'Unknown'} on {formatDate(file.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(file.file_id)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileUp size={40} className="mx-auto text-gray-300 mb-2" />
              <p>No files have been uploaded for this task yet.</p>
              <p className="text-sm mt-1">Click the Upload button to add files.</p>
            </div>
          )}
        </div>
      </div>

      {/* File upload modal */}
      {fileUploadModalOpen && task && (
        <FileUploadModal
          task={task}
          isOpen={fileUploadModalOpen}
          onClose={() => setFileUploadModalOpen(false)}
          onFileUpload={handleFileUploadComplete}
        />
      )}
    </div>
  );
};

export default TaskDetailsPage;
