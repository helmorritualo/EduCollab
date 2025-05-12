import { useState, useEffect, useCallback } from "react";
import { FileUp, Upload, X, Download } from "lucide-react";
import { TaskWithDetails, FileUpload } from "@/types";
import { fileAPI } from "@/services/api.service";
import Swal from "sweetalert2";

interface TaskDetailViewProps {
  task: TaskWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onFileUpload?: () => void;
}

const TaskDetailView = ({
  task,
  isOpen,
  onClose,
  onFileUpload,
}: TaskDetailViewProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [taskFiles, setTaskFiles] = useState<FileUpload[]>([]);
  
  // Fetch files uploaded for this task
  const fetchTaskFiles = useCallback(async () => {
    if (!task || !task.task_id) return;
    
    try {
      const response = await fileAPI.getTaskFiles(task.task_id);
      if (response && Array.isArray(response)) {
        setTaskFiles(response);
      }
    } catch (error) {
      console.error('Error fetching task files:', error);
    }
  }, [task]);
  
  // Fetch task files when the component loads
  useEffect(() => {
    if (task && task.task_id) {
      fetchTaskFiles();
    }
  }, [task, fetchTaskFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      // Limit to 3 files total
      const newFiles = [...files, ...selectedFiles].slice(0, 3);
      setFiles(newFiles);
      setFileNames(newFiles.map(file => file.name));
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      // Limit to 3 files total
      const newFiles = [...files, ...droppedFiles].slice(0, 3);
      setFiles(newFiles);
      setFileNames(newFiles.map(file => file.name));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setFileNames(newFiles.map(file => file.name));
  };

  // Pre-validate files before attempting upload
  const validateFiles = (filesToValidate: File[]): { valid: boolean; message?: string } => {
    // Check if we have files
    if (filesToValidate.length === 0) {
      return { valid: false, message: "Please select at least one file to upload" };
    }
    
    // Check file types and sizes
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    for (const file of filesToValidate) {
      // Check file size
      if (file.size > maxSizeInBytes) {
        return { 
          valid: false, 
          message: `File '${file.name}' exceeds size limit of 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
        };
      }
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return { 
          valid: false, 
          message: `File '${file.name}' has invalid type: ${file.type || 'unknown'}. Only PDF and Word documents are allowed.` 
        };
      }
    }
    
    return { valid: true };
  };
  
  const handleUpload = async () => {
    // Validate files first
    const validation = validateFiles(files);
    if (!validation.valid) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: validation.message,
      });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    const failedFiles: string[] = [];
    
    // Create and show the loading alert
    Swal.fire({
      title: 'Uploading files...',
      html: 'Please wait while your files are being uploaded',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      // Process each file individually to handle errors better
      for (const file of files) {
        try {
          // Update the loading message
          Swal.update({
            html: `Uploading ${file.name}...`
          });
          
          // Upload the file
          await fileAPI.uploadFile(file, task.group_id, task.task_id);
          successCount++;
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          failedFiles.push(file.name);
        }
      }
      
      // Close the loading dialog
      Swal.close();
      
      // Show appropriate message based on results
      if (successCount === files.length) {
        // All files uploaded successfully
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `${successCount} ${successCount === 1 ? 'file' : 'files'} uploaded successfully`,
        });
        
        // Reset the form
        setFiles([]);
        setFileNames([]);
        
        // Refresh the task list if callback provided
        if (onFileUpload) {
          onFileUpload();
        }
      } else if (successCount > 0) {
        // Some files uploaded, some failed
        Swal.fire({
          icon: "warning",
          title: "Partial Success",
          html: `${successCount} ${successCount === 1 ? 'file' : 'files'} uploaded successfully.<br><br>` +
                `Failed to upload: ${failedFiles.join(', ')}`,
        });
        
        // Reset the form
        setFiles([]);
        setFileNames([]);
        
        // Refresh the task list if callback provided
        if (onFileUpload) {
          onFileUpload();
        }
      } else {
        // All files failed
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "All files failed to upload. Please try again.",
        });
      }
    } catch (error) {
      // Close the loading dialog if it's still open
      Swal.close();
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to upload files",
      });
    } finally {
      setIsUploading(false);
    }
  };


  
  // Handle downloading a task submission file
 const handleFileDownload = async (e: React.MouseEvent, fileId: number) => {
     e.stopPropagation(); // Prevent navigation when downloading file
     
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
       
       // Get auth token
       const token = localStorage.getItem('token');
       if (!token) {
         throw new Error('You must be logged in to download files');
       }
       
       // Make direct fetch request to download file
       const response = await fetch(`http://localhost:5000/api/files/${fileId}/download`, {
         headers: {
           'Authorization': `Bearer ${token}`
         },
         method: 'GET'
       });
       
       if (!response.ok) {
         throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
       }
       
       // Get content type and create proper blob
       const contentType = response.headers.get('content-type') || 'application/octet-stream';
       console.log(`Downloading file with content type: ${contentType}`);
       
       // Get the file as blob with correct content type
       const blob = await response.blob();
       const blobWithType = new Blob([blob], { type: contentType });
       
       // Create blob URL and trigger download
       const url = window.URL.createObjectURL(blobWithType);
       const link = document.createElement('a');
       link.href = url;
       
       // Get filename from Content-Disposition header if available
       const contentDisposition = response.headers.get('content-disposition');
       let filename = `file-${fileId}`;
       
       if (contentDisposition) {
         const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
         if (filenameMatch && filenameMatch[1]) {
           filename = decodeURIComponent(filenameMatch[1]);
         }
       }
       
       link.setAttribute('download', filename);
       document.body.appendChild(link);
       link.click();
       link.remove();
       window.URL.revokeObjectURL(url);
       
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

  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{task.title}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-800">{task.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Group</h3>
                <p className="mt-1 text-gray-800">{task.group_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                <p className="mt-1 text-gray-800">{task.creator_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                <p className="mt-1 text-gray-800">{new Date(task.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="mt-1 text-gray-800">{task.created_at ? new Date(task.created_at).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            
            {task.file && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Attached File</h3>
                <button
                  onClick={async () => {
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
                      
                      // Get auth token
                      const token = localStorage.getItem('token');
                      if (!token) {
                        throw new Error('You must be logged in to download files');
                      }
                      
                      // Make direct fetch request to download file
                      const response = await fetch(`http://localhost:5000/api/files/${task.file!.file_id}/download`, {
                        headers: {
                          'Authorization': `Bearer ${token}`
                        },
                        method: 'GET'
                      });
                      
                      if (!response.ok) {
                        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
                      }
                      
                      // Get content type and create proper blob
                      const contentType = response.headers.get('content-type') || 'application/octet-stream';
                      console.log(`Downloading file with content type: ${contentType}`);
                      
                      // Get the file as blob with correct content type
                      const blob = await response.blob();
                      const blobWithType = new Blob([blob], { type: contentType });
                      
                      // Create blob URL and trigger download
                      const url = window.URL.createObjectURL(blobWithType);
                      const link = document.createElement('a');
                      link.href = url;
                      
                      // Get filename from Content-Disposition header if available
                      const contentDisposition = response.headers.get('content-disposition');
                      let filename = task.file!.original_filename;
                      
                      if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
                        if (filenameMatch && filenameMatch[1]) {
                          filename = decodeURIComponent(filenameMatch[1]);
                        }
                      }
                      
                      link.setAttribute('download', filename);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                      
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
                  }}
                  className="mt-1 flex items-center text-blue-500 hover:text-blue-700"
                >
                  <FileUp size={16} className="mr-1" />
                  {task.file.original_filename}
                </button>
              </div>
            )}
            
            {/* Display task submission files section */}
            {taskFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Submitted Files</h3>
                <div className="mt-2 space-y-2">
                  {taskFiles.map((file) => (
                    <div key={file.file_id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <FileUp className="text-blue-500 mr-2" size={16} />
                        <span className="text-sm text-gray-700">{file.original_filename}</span>
                        {file.uploader && (
                          <span className="text-xs text-gray-500 ml-2">by {file.uploader.full_name}</span>
                        )}
                      </div>
                      <button 
                        type="button" 
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={ (e) => {
                          e.stopPropagation();
                          handleFileDownload(e, file.file_id);
                        }
                        }
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Upload Files (Max 3)</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                
                {fileNames.length > 0 ? (
                  <div className="space-y-2">
                    {fileNames.map((name, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <FileUp className="text-blue-500 mr-2" size={16} />
                          <span className="text-sm text-gray-700">{name}</span>
                        </div>
                        <button 
                          type="button" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeFile(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {fileNames.length < 3 && (
                      <div className="text-center mt-2">
                        <label htmlFor="file-upload" className="text-blue-500 cursor-pointer hover:text-blue-700">
                          Add more files ({3 - fileNames.length} remaining)
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Drag and drop files here, or
                      <label htmlFor="file-upload" className="ml-1 text-blue-500 cursor-pointer hover:text-blue-700">
                        browse
                      </label>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, Images, etc.</p>
                  </div>
                )}
              </div>
              
              {fileNames.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  >
                    {isUploading ? "Uploading..." : "Upload Files"}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailView;