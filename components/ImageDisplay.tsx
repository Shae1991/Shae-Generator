import React from 'react';
import { GeneratedImageHistoryItem, AppMode } from '../types';

interface ImageDisplayProps {
  imageItem: GeneratedImageHistoryItem | null;
  isLoading: boolean;
  onRegenerate: () => void;
  mode: AppMode;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink-400"></div>
    <p className="text-lg mt-4 text-gray-300">Generating your masterpiece...</p>
    <p className="text-sm text-gray-500">This may take a few moments.</p>
  </div>
);

const Placeholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <h3 className="text-xl font-semibold text-gray-300">Your creations will appear here.</h3>
    <p>Describe anything you can dream of and watch it come to life.</p>
  </div>
);

const ImageCell: React.FC<{ imageUrl: string; prompt: string }> = ({ imageUrl, prompt }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `UltimateAIGenerater-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Sharing is not supported on this browser.");
      return;
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `UltimateAIGenerater-${Date.now()}.png`, { type: 'image/png' });
      await navigator.share({
        title: 'AI Generated Image',
        text: `Check out this image I created with UltimateAIGenerator.ai! Prompt: ${prompt}`,
        files: [file],
      });
    } catch (err) {
      console.error('Error sharing:', err);
      if (err.name !== 'AbortError') {
         alert('Could not share the image.');
      }
    }
  };

  return (
    <div className="aspect-square rounded-lg overflow-hidden relative group bg-black/25">
      <img src={imageUrl} alt={prompt} className="w-full h-full object-contain" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button onClick={handleDownload} className="bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white font-bold p-3 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
        {navigator.share && (
          <button onClick={handleShare} className="bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white font-bold p-3 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  imageItem, 
  isLoading, 
  onRegenerate,
  mode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
 }) => {
  const images = imageItem?.imageUrls;
  const isEditMode = mode === AppMode.EDIT;

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (!images || images.length === 0) return <Placeholder />;

    if (images.length === 1) {
      // Single image view with prominent action buttons
      const imageUrl = images[0];
      const prompt = imageItem!.prompt;
      
      const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `UltimateAIGenerater-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    
      const handleShare = async () => {
        if (!navigator.share) {
          alert("Sharing is not supported on this browser.");
          return;
        }
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `UltimateAIGenerater-${Date.now()}.png`, { type: 'image/png' });
          await navigator.share({
            title: 'AI Generated Image',
            text: `Check out this image I created with UltimateAIGenerator.ai! Prompt: ${prompt}`,
            files: [file],
          });
        } catch (err) {
          console.error('Error sharing:', err);
          if (err.name !== 'AbortError') {
             alert('Could not share the image.');
          }
        }
      };

      return (
        <div className="w-full h-full p-2 flex flex-col gap-4">
          <div className="flex-grow rounded-lg overflow-hidden relative bg-black/25 flex items-center justify-center min-h-0">
            <img src={imageUrl} alt={prompt} className="max-w-full max-h-full object-contain" />
            {isEditMode && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  onClick={onUndo} 
                  disabled={!canUndo}
                  className="bg-black/60 hover:bg-black/90 backdrop-blur-sm text-white font-semibold py-2 px-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={onRedo} 
                  disabled={!canRedo}
                  className="bg-black/60 hover:bg-black/90 backdrop-blur-sm text-white font-semibold py-2 px-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center justify-center gap-4">
             <button onClick={handleDownload} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download
            </button>
            {navigator.share && (
              <button onClick={handleShare} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                Share
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // Grid for multiple images
    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-2 p-2">
        {images.map((imgUrl, index) => (
          <ImageCell key={index} imageUrl={imgUrl} prompt={imageItem!.prompt} />
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-950 rounded-lg p-4 aspect-square flex items-center justify-center">
        <div className="w-full h-full border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center">
          {renderContent()}
        </div>
      </div>
      {images && images.length > 0 && !isEditMode && !isLoading && (
        <div className="flex justify-center">
            <button
                onClick={onRegenerate}
                className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                Regenerate
            </button>
        </div>
      )}
    </div>
  );
};