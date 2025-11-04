import React from 'react';
import { GeneratedImageHistoryItem } from '../types';
import { openImageInNewWindow } from '../utils/fileUtils';

interface ImageHistoryProps {
  history: GeneratedImageHistoryItem[];
  onSelect: (item: GeneratedImageHistoryItem) => void;
  onUsePrompt: (prompt: string) => void;
  onDelete: (id: string) => void;
}

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="relative group flex justify-center">
      {children}
      <span className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {text}
      </span>
    </div>
  );
};


export const ImageHistory: React.FC<ImageHistoryProps> = ({ history, onSelect, onUsePrompt, onDelete }) => {
  
  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `UltimateAIGenerater-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async (imageUrl: string, prompt: string) => {
    if (!navigator.share) return;
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
    <div className="bg-gray-950 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Image History</h3>
      {history.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">Your generated images will appear here.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto pr-2">
          {history.map((item) => (
            <div key={item.id} className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => onSelect(item)}>
              <img src={item.imageUrls[0]} alt={item.prompt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 p-2">
                <Tooltip text="View full size">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openImageInNewWindow(item); }}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip text="Use Prompt">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUsePrompt(item.prompt); }}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l.293.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" /></svg>
                  </button>
                </Tooltip>
                <Tooltip text="Download">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownload(item.imageUrls[0]); }}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                </Tooltip>
                {navigator.share && (
                    <Tooltip text="Share">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(item.imageUrls[0], item.prompt); }}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    </button>
                    </Tooltip>
                )}
                <Tooltip text="Delete">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};