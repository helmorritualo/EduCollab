import { useState } from 'react';
import { Upload, X, FileUp } from 'lucide-react';
import { TaskWithDetails } from '@/types';
import Swal from 'sweetalert2';

interface FileUploadModalProps {
  task: TaskWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onFileUpload?: () => void;
}

const FileUploadModal = ({ task, isOpen, onClose, onFileUpload }: FileUploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to upload files');
      }

      // Process each file individually to handle errors better
      for (const file of files) {
        try {
          // Update the loading message
          Swal.update({
            html: `Uploading ${file.name}...`
          });
          
          // Create form data for this file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('groupId', task.group_id.toString()); // Using correct field names matching server-side expectations
          if (task.task_id) {
            formData.append('taskId', task.task_id.toString()); // Using correct field names matching server-side expectations
          }
          
          console.log(`Uploading file ${file.name} to group ${task.group_id}${task.task_id ? ` and task ${task.task_id}` : ''}`);
          
          // Upload file using the correct endpoint path
          const response = await fetch('http://localhost:5000/api/files', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error: ${response.status}`);
          }
          
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
        
        // Close the modal
        onClose();
        
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
        
        // Close the modal
        onClose();
        
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Upload Files for {task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Upload Files (Max 3)</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload-modal"
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
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">{name}</span>
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
                      <label htmlFor="file-upload-modal" className="text-blue-500 cursor-pointer hover:text-blue-700">
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
                    <label htmlFor="file-upload-modal" className="ml-1 text-blue-500 cursor-pointer hover:text-blue-700">
                      browse
                    </label>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Only PDF and Word documents are allowed (max 5MB).</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
