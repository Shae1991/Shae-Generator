

import React, { useState } from 'react';
import { SavedPrompt, TrainedModel } from '../types';

interface AdvancedOptionsProps {
  savedPrompts: SavedPrompt[];
  onSavePrompt: () => void;
  onUsePrompt: (promptText: string) => void;
  onDeletePrompt: (id: string) => void;
  isLoading: boolean;
  onTrainModel: () => void;
  trainedModels: TrainedModel[];
  selectedCustomModelId: string | null;
  onSelectCustomModel: (id: string | null) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
}

const staticStyles = [
  { value: 'No Style', label: 'No Style (Raw Diffusion)' },
  { value: "late-'90s to early-2000s R&B or pop girl group album cover", label: "90s R&B Album Cover" },
  { value: 'Post-Y2K Glam Neutral', label: 'Post-Y2K Glam Neutral' },
];

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

interface AspectRatio {
  value: string;
  label: string;
  displayValue?: string;
}

const aspectRatios: AspectRatio[] = [
    { value: '1:1', label: 'Square' },
    { value: '16:9', label: 'Landscape' },
    { value: '9:16', label: 'Portrait' },
    { value: '4:3', label: 'Widescreen' },
    { value: '3:4', label: 'Tall' },
    { value: 'ginormous square', label: 'Ginormous Square', displayValue: '1:1' },
];


export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  savedPrompts,
  onSavePrompt,
  onUsePrompt,
  onDeletePrompt,
  isLoading,
  onTrainModel,
  trainedModels,
  selectedCustomModelId,
  onSelectCustomModel,
  selectedStyle,
  setSelectedStyle,
  aspectRatio,
  setAspectRatio,
}) => {
  const readyModels = trainedModels.filter(m => m.status === 'ready');
  const isCustomModelSelected = !!selectedCustomModelId;

  const handleModelSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'nav_to_models') {
      onTrainModel();
      e.target.value = selectedCustomModelId || ''; // Reset visually
      return;
    }
    onSelectCustomModel(value === '' ? null : value);
  };

  return (
    <div className="space-y-6">
       <div className={`space-y-3 transition-opacity ${isCustomModelSelected ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-200">Aspect Ratio</h3>
        <div className="grid grid-cols-3 gap-1 bg-gray-900 rounded-lg p-1">
            {aspectRatios.map(ratio => (
                 <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    disabled={isLoading || isCustomModelSelected}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 ${
                        aspectRatio === ratio.value ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                >
                    {ratio.label} ({ratio.displayValue || ratio.value})
                </button>
            ))}
        </div>
        {isCustomModelSelected && <p className="text-xs text-gray-400 text-center">Aspect ratio is disabled when using a custom trained model to ensure highest fidelity.</p>}
      </div>
      
      <div className={`space-y-3 transition-opacity ${isCustomModelSelected ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-200">Preset Style</h3>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          disabled={isLoading || isCustomModelSelected}
          className="w-full bg-gray-900 text-gray-200 rounded-lg p-2 border border-gray-700 focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
        >
          {staticStyles.map(style => (
            <option key={style.value} value={style.value}>{style.label}</option>
          ))}
        </select>
        {isCustomModelSelected && <p className="text-xs text-gray-400 text-center">Preset styles are disabled when using a custom model to maintain its unique style.</p>}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-200">Custom Models</h3>
         <select 
            value={selectedCustomModelId || ''}
            onChange={handleModelSelectChange}
            disabled={isLoading}
            className="w-full bg-gray-900 text-gray-200 rounded-lg p-2 border border-gray-700 focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
          >
            <option value="">Default Model</option>
            <optgroup label="My Trained Models">
              {readyModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
              <option value="nav_to_models" className="text-pink-400 font-semibold">
                + Train a New Model...
              </option>
            </optgroup>
          </select>
        <button 
          onClick={onTrainModel}
          className="w-full text-sm bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Train New Model
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-200">Saved Prompts</h3>
        <button
          onClick={onSavePrompt}
          disabled={isLoading}
          className="w-full text-sm bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          Save Current Prompt
        </button>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
          {savedPrompts.length > 0 ? (
            savedPrompts.map((p) => (
              <div key={p.id} className="bg-gray-900 p-2 rounded-lg flex justify-between items-center text-sm">
                <p className="truncate text-gray-300 flex-1 mr-2">{p.text}</p>
                <div className="flex gap-1">
                  <Tooltip text="Use Prompt">
                    <button onClick={() => onUsePrompt(p.text)} className="p-1 text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l.293.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" /></svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Delete Prompt">
                    <button onClick={() => onDeletePrompt(p.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">No saved prompts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
