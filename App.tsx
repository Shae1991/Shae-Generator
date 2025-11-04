import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { generateImage, editImage, fluxEditImage } from './services/geminiService';
import { AppMode, SavedPrompt, GeneratedImageHistoryItem, TrainedModel } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fileToBase64, fileToDataURL } from './utils/fileUtils';
import { GeneratorPage } from './pages/GeneratorPage';
import { GalleryPage } from './pages/GalleryPage';
import { ModelsPage } from './pages/ModelsPage';

type Page = 'generate' | 'gallery' | 'models';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('generate');
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
  const [prompt, setPrompt] = useState<string>('');
  const [activeImageItem, setActiveImageItem] = useState<GeneratedImageHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [fluxImageFile, setFluxImageFile] = useState<File | null>(null);
  const [fluxImagePreview, setFluxImagePreview] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  
  const [imageHistory, setImageHistory] = useLocalStorage<GeneratedImageHistoryItem[]>('imageHistory', []);
  const [savedPrompts, setSavedPrompts] = useLocalStorage<SavedPrompt[]>('savedPrompts', []);
  const [trainedModels, setTrainedModels] = useLocalStorage<TrainedModel[]>('trainedModels', []);
  
  const [selectedCustomModelId, setSelectedCustomModelId] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('No Style');

  // State for edit session history (undo/redo)
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [editHistoryIndex, setEditHistoryIndex] = useState<number>(-1);

  const resetGeneratorState = () => {
    setActiveImageItem(null);
    setPrompt('');
    setMode(AppMode.GENERATE);
    setEditImageFile(null);
    setEditImagePreview(null);
    setFluxImageFile(null);
    setFluxImagePreview(null);
    setEditHistory([]);
    setEditHistoryIndex(-1);
    setSelectedCustomModelId(null);
    setSelectedStyle('No Style');
  };

  const handleFileChange = useCallback(async (file: File | null) => {
    setEditImageFile(file);
    if (file) {
      const dataUrl = await fileToDataURL(file);
      setEditImagePreview(dataUrl);
      // Start a new edit history session
      setEditHistory([dataUrl]);
      setEditHistoryIndex(0);
      setActiveImageItem(null); // Clear main display when new image is uploaded
    } else {
      setEditImagePreview(null);
      setEditHistory([]);
      setEditHistoryIndex(-1);
    }
  }, []);

  const handleFluxFileChange = useCallback(async (file: File | null) => {
    setFluxImageFile(file);
    if (file) {
      const dataUrl = await fileToDataURL(file);
      setFluxImagePreview(dataUrl);
    } else {
      setFluxImagePreview(null);
    }
  }, []);

  const processAndSaveHistory = (imageDataUrls: string[], type: 'generate' | 'edit' | 'flux-edit') => {
    const newItem: GeneratedImageHistoryItem = {
      id: Date.now().toString(),
      imageUrls: imageDataUrls, // The service now returns full data URLs
      prompt: prompt,
      type: type,
      modelId: selectedCustomModelId,
      style: selectedStyle,
      aspectRatio: aspectRatio,
    };
    
    setImageHistory(prev => [newItem, ...prev]);
    setActiveImageItem(newItem);
  };
  
  const handleGenerate = useCallback(async () => {
    if (isLoading || !prompt) return;
    setIsLoading(true);
    setActiveImageItem(null);
    try {
      const images = await generateImage(prompt, selectedCustomModelId, selectedStyle, trainedModels, aspectRatio);
      processAndSaveHistory(images, 'generate');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, selectedCustomModelId, selectedStyle, trainedModels, aspectRatio]);

  const handleEdit = useCallback(async () => {
    if (isLoading || !prompt || !editImageFile) return;
    setIsLoading(true);
    try {
      const { data, mimeType } = await fileToBase64(editImageFile);
      const images = await editImage(prompt, { data, mimeType });
      const newImageUrl = images[0]; // This is now a full data URL
      
      setEditHistory(prev => {
        const newHistory = prev.slice(0, editHistoryIndex + 1);
        newHistory.push(newImageUrl);
        return newHistory;
      });
      setEditHistoryIndex(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, editImageFile, editHistoryIndex]);

  const handleFluxEdit = useCallback(async () => {
    if (isLoading || !prompt || !fluxImageFile) return;
    setIsLoading(true);
    setActiveImageItem(null);
    try {
      const { data, mimeType } = await fileToBase64(fluxImageFile);
      const images = await fluxEditImage(prompt, { data, mimeType });
      processAndSaveHistory(images, 'flux-edit');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, fluxImageFile, selectedCustomModelId, selectedStyle, aspectRatio]);

  const handleRegenerate = () => {
    if (activeImageItem) {
      setPrompt(activeImageItem.prompt);
      setSelectedCustomModelId(activeImageItem.modelId || null);
      setSelectedStyle(activeImageItem.style || 'No Style');
      setAspectRatio(activeImageItem.aspectRatio || '1:1');
      // Trigger generation after state updates
      setTimeout(() => handleGenerate(), 0);
    }
  };
  
  const handleSelectHistory = (item: GeneratedImageHistoryItem) => {
    setActiveImageItem(item);
    setPrompt(item.prompt);
    setEditImageFile(null); // Clear edit mode when selecting from history
    setEditImagePreview(null);
    setFluxImageFile(null);
    setFluxImagePreview(null);
  };
  
  const handleDeleteHistory = (id: string) => {
    setImageHistory(prev => prev.filter(item => item.id !== id));
    if (activeImageItem?.id === id) {
      setActiveImageItem(null);
    }
  };
  
  const handleSavePrompt = () => {
    if (prompt.trim() && !savedPrompts.find(p => p.text === prompt)) {
      const newPrompt: SavedPrompt = { id: Date.now().toString(), text: prompt };
      setSavedPrompts(prev => [newPrompt, ...prev]);
    }
  };

  const handleUsePrompt = (promptText: string) => {
    setPrompt(promptText);
  };

  const handleDeletePrompt = (id: string) => {
    setSavedPrompts(prev => prev.filter(p => p.id !== id));
  };
  
  const handleTrainModel = (modelName: string, images: File[], description: string) => {
    const newModel: TrainedModel = {
      id: Date.now().toString(),
      name: modelName,
      description,
      status: 'training',
      previewImages: [],
    };
  
    setTrainedModels(prev => [newModel, ...prev]);
  
    Promise.all(images.map(fileToDataURL))
      .then(previews => {
        setTrainedModels(prev => 
          prev.map(m => m.id === newModel.id ? { ...m, previewImages: previews, status: 'ready' } : m)
        );
      })
      .catch(error => {
        console.error("Error processing training images:", error);
        setTrainedModels(prev => 
          prev.map(m => m.id === newModel.id ? { ...m, status: 'failed' } : m)
        );
      });
    
    setPage('models');
  };

  const handleUpdateModel = (modelId: string, data: { name: string; description: string }) => {
    setTrainedModels(prev => prev.map(m => m.id === modelId ? { ...m, ...data } : m));
  };
  
  const handleDeleteModel = (modelId: string) => {
    setTrainedModels(prev => prev.filter(m => m.id !== modelId));
    if (selectedCustomModelId === modelId) {
        setSelectedCustomModelId(null);
    }
  };

  const handleUndo = () => {
    if (editHistoryIndex > 0) {
      setEditHistoryIndex(prev => prev - 1);
    }
  };

  const handleRedo = () => {
    if (editHistoryIndex < editHistory.length - 1) {
      setEditHistoryIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page !== 'generate') {
      setActiveImageItem(null);
    }
  }, [page]);


  const renderPage = () => {
    switch (page) {
      case 'gallery':
        return <GalleryPage 
                  history={imageHistory} 
                  onDelete={handleDeleteHistory} 
                  onSelect={(item) => {
                    handleSelectHistory(item);
                    setPage('generate');
                  }}
                  onUsePrompt={(p) => {
                    handleUsePrompt(p);
                    setPage('generate');
                  }}
                />;
      case 'models':
        return <ModelsPage 
                  models={trainedModels} 
                  onTrain={handleTrainModel} 
                  onUpdate={handleUpdateModel} 
                  onDelete={handleDeleteModel}
                />;
      case 'generate':
      default:
        return <GeneratorPage
          prompt={prompt}
          setPrompt={setPrompt}
          isLoading={isLoading}
          onGenerate={handleGenerate}
          onEdit={handleEdit}
          onFluxEdit={handleFluxEdit}
          onRegenerate={handleRegenerate}
          mode={mode}
          setMode={setMode}
          onFileChange={handleFileChange}
          editImagePreview={editImagePreview}
          onFluxFileChange={handleFluxFileChange}
          fluxImagePreview={fluxImagePreview}
          savedPrompts={savedPrompts}
          onSavePrompt={handleSavePrompt}
          onUsePrompt={handleUsePrompt}
          onDeletePrompt={handleDeletePrompt}
          onNavToModels={() => setPage('models')}
          imageItem={activeImageItem}
          history={imageHistory}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
          trainedModels={trainedModels}
          selectedCustomModelId={selectedCustomModelId}
          onSelectCustomModel={setSelectedCustomModelId}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          editHistory={editHistory}
          editHistoryIndex={editHistoryIndex}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={editHistoryIndex > 0}
          canRedo={editHistoryIndex < editHistory.length - 1}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col">
      <Header
        activePage={page}
        onNavigate={(p) => setPage(p)}
      />
      <main className="container mx-auto px-4 lg:px-8 py-8 flex-grow">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;