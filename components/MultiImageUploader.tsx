import React, { useState, useCallback, useEffect } from 'react';

interface MultiImageUploaderProps {
  onFilesChange: (files: File[]) => void;
}

interface FilePreview {
  file: File;
  previewUrl: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ onFilesChange }) => {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Effect to clean up object URLs when the component unmounts
  useEffect(() => {
    return () => {
      filePreviews.forEach(fp => URL.revokeObjectURL(fp.previewUrl));
    };
  }, [filePreviews]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const newFilePreviews = fileArray.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      // Replace the current selection, cleaning up old URLs
      setFilePreviews(currentPreviews => {
        currentPreviews.forEach(fp => URL.revokeObjectURL(fp.previewUrl));
        return newFilePreviews;
      });

      onFilesChange(fileArray);
    }
  }, [onFilesChange]);

  const handleDelete = (indexToDelete: number) => {
    setFilePreviews(currentPreviews => {
      const previewsCopy = [...currentPreviews];
      const [deletedItem] = previewsCopy.splice(indexToDelete, 1);

      // Revoke the URL of the deleted item to prevent memory leaks
      if (deletedItem) {
        URL.revokeObjectURL(deletedItem.previewUrl);
      }
      
      onFilesChange(previewsCopy.map(fp => fp.file));
      return previewsCopy;
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Allow re-uploading the same file(s)
  };

  return (
    <div>
      <label
        htmlFor="multi-dropzone-file"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full min-h-[10rem] border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900 transition-colors ${isDragging ? 'border-pink-500 bg-gray-800' : 'hover:bg-gray-800'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
          <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
        </div>
        <input id="multi-dropzone-file" type="file" className="hidden" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      </label>
      {filePreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filePreviews.map((fp, index) => (
            <div key={`${fp.file.name}-${index}`} className="aspect-square rounded-md overflow-hidden relative group">
              <img src={fp.previewUrl} alt={`preview ${index}`} className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.preventDefault(); handleDelete(index); }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                aria-label="Delete image"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};