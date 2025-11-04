import React from 'react';
import { AppMode } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onEdit: () => void;
  onFluxEdit: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onFileChange: (file: File | null) => void;
  editImagePreview: string | null;
  onFluxFileChange: (file: File | null) => void;
  fluxImagePreview: string | null;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  isLoading,
  onGenerate,
  onEdit,
  onFluxEdit,
  mode,
  setMode,
  onFileChange,
  editImagePreview,
  onFluxFileChange,
  fluxImagePreview,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files ? e.target.files[0] : null);
  };
  
  const handleFluxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFluxFileChange(e.target.files ? e.target.files[0] : null);
  };
  
  const handleSubmit = () => {
    if (isLoading) return;
    switch(mode) {
      case AppMode.GENERATE: onGenerate(); break;
      case AppMode.EDIT: onEdit(); break;
      case AppMode.FLUX_EDIT: onFluxEdit(); break;
    }
  };
  
  const getButtonText = () => {
    if (isLoading) return "Processing...";
    switch(mode) {
      case AppMode.GENERATE: return "Generate";
      case AppMode.EDIT: return "Apply Edit";
      case AppMode.FLUX_EDIT: return "Generate with Context";
      default: return "Generate";
    }
  }
  
  const getPlaceholderText = () => {
    switch(mode) {
      case AppMode.GENERATE: return "A hyper-realistic photo of a cat programming...";
      case AppMode.EDIT: return "Make the cat wear a wizard hat...";
      case AppMode.FLUX_EDIT: return "A cat in a futuristic city, using image as context...";
      default: return "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex bg-gray-900 rounded-lg p-1">
        <button
          onClick={() => setMode(AppMode.GENERATE)}
          className={`w-1/3 py-2 text-sm font-semibold rounded-md transition-colors ${
            mode === AppMode.GENERATE ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setMode(AppMode.EDIT)}
          className={`w-1/3 py-2 text-sm font-semibold rounded-md transition-colors ${
            mode === AppMode.EDIT ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMode(AppMode.FLUX_EDIT)}
          className={`w-1/3 py-2 text-sm font-semibold rounded-md transition-colors ${
            mode === AppMode.FLUX_EDIT ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          FLUX Kontext
        </button>
      </div>

      {mode === AppMode.EDIT && (
        <div className="flex flex-col items-center justify-center w-full">
            <label htmlFor="dropzone-file-edit" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 relative">
                {editImagePreview ? (
                   <>
                    <img src={editImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                     <button onClick={(e) => { e.preventDefault(); onFileChange(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Upload Image to Edit</span></p>
                    <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                  </div>
                )}
                <input id="dropzone-file-edit" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
        </div>
      )}
      
      {mode === AppMode.FLUX_EDIT && (
        <div className="flex flex-col items-center justify-center w-full">
            <label htmlFor="dropzone-file-flux" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 relative">
                {fluxImagePreview ? (
                  <>
                    <img src={fluxImagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                     <button onClick={(e) => { e.preventDefault(); onFluxFileChange(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Upload Image for FLUX</span></p>
                    <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                  </div>
                )}
                <input id="dropzone-file-flux" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFluxFileChange} />
            </label>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={getPlaceholderText()}
          rows={5}
          className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-pink-500 transition"
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-3 px-4 rounded-lg hover:from-pink-700 hover:to-fuchsia-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          )}
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};
