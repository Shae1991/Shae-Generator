import React from 'react';
import { PromptInput } from '../components/PromptInput';
import { AdvancedOptions } from '../components/AdvancedOptions';
import { ImageDisplay } from '../components/ImageDisplay';
import { ImageHistory } from '../components/ImageHistory';
import { AppMode, SavedPrompt, GeneratedImageHistoryItem, TrainedModel } from '../types';

interface GeneratorPageProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onEdit: () => void;
  onFluxEdit: () => void;
  onRegenerate: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onFileChange: (file: File | null) => void;
  editImagePreview: string | null;
  onFluxFileChange: (file: File | null) => void;
  fluxImagePreview: string | null;
  savedPrompts: SavedPrompt[];
  onSavePrompt: () => void;
  onUsePrompt: (promptText: string) => void;
  onDeletePrompt: (id: string) => void;
  onNavToModels: () => void;
  imageItem: GeneratedImageHistoryItem | null;
  history: GeneratedImageHistoryItem[];
  onSelectHistory: (item: GeneratedImageHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  trainedModels: TrainedModel[];
  selectedCustomModelId: string | null;
  onSelectCustomModel: (id: string | null) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  editHistory: string[];
  editHistoryIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = (props) => {
  // Create a temporary item for displaying the current state of an edit session
  const editDisplayItem: GeneratedImageHistoryItem | null =
    (props.mode === AppMode.EDIT && props.editHistory.length > 0)
      ? {
          id: 'edit-session',
          imageUrls: [props.editHistory[props.editHistoryIndex]],
          prompt: props.prompt,
          type: 'edit',
          modelId: null,
        }
      : null;

  // The final displayed item is either the one from history/generation or the current edit state
  const displayItem = props.imageItem || editDisplayItem;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-gray-950 rounded-lg p-6 flex flex-col gap-6 sticky top-24">
            <PromptInput
                prompt={props.prompt}
                setPrompt={props.setPrompt}
                isLoading={props.isLoading}
                onGenerate={props.onGenerate}
                onEdit={props.onEdit}
                onFluxEdit={props.onFluxEdit}
                mode={props.mode}
                setMode={props.setMode}
                onFileChange={props.onFileChange}
                editImagePreview={props.editImagePreview}
                onFluxFileChange={props.onFluxFileChange}
                fluxImagePreview={props.fluxImagePreview}
            />
            <div className="border-t border-gray-800"></div>
            <AdvancedOptions
                savedPrompts={props.savedPrompts}
                onSavePrompt={props.onSavePrompt}
                onUsePrompt={props.onUsePrompt}
                onDeletePrompt={props.onDeletePrompt}
                isLoading={props.isLoading}
                onTrainModel={props.onNavToModels}
                trainedModels={props.trainedModels}
                selectedCustomModelId={props.selectedCustomModelId}
                onSelectCustomModel={props.onSelectCustomModel}
                selectedStyle={props.selectedStyle}
                setSelectedStyle={props.setSelectedStyle}
                aspectRatio={props.aspectRatio}
                setAspectRatio={props.setAspectRatio}
            />
        </div>
      </div>
      <div className="lg:col-span-2">
        <ImageDisplay
          imageItem={displayItem}
          isLoading={props.isLoading}
          onRegenerate={props.onRegenerate}
          mode={props.mode}
          onUndo={props.onUndo}
          onRedo={props.onRedo}
          canUndo={props.canUndo}
          canRedo={props.canRedo}
        />
        <ImageHistory 
          history={props.history}
          onSelect={props.onSelectHistory}
          onUsePrompt={props.onUsePrompt}
          onDelete={props.onDeleteHistory}
        />
      </div>
    </div>
  );
};