import React, { useState } from 'react';
import { TrainedModel } from '../types';
import { MultiImageUploader } from '../components/MultiImageUploader';

interface ModelsPageProps {
  models: TrainedModel[];
  onTrain: (modelName: string, images: File[], description: string) => void;
  onUpdate: (modelId: string, data: { name: string, description: string }) => void;
  onDelete: (modelId: string) => void;
}

const ModelCard: React.FC<{ model: TrainedModel; onEdit: (model: TrainedModel) => void; }> = ({ model, onEdit }) => {
    const getStatusIndicator = () => {
        switch(model.status) {
            case 'training': return <div className="absolute top-2 right-2 text-xs bg-yellow-500/80 text-white px-2 py-1 rounded-full flex items-center gap-1"><svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Training</div>;
            case 'ready': return <div className="absolute top-2 right-2 text-xs bg-green-500/80 text-white px-2 py-1 rounded-full">Ready</div>;
            case 'failed': return <div className="absolute top-2 right-2 text-xs bg-red-500/80 text-white px-2 py-1 rounded-full">Failed</div>;
        }
    }
    return (
        <div className={`bg-gray-800 rounded-lg overflow-hidden relative flex flex-col ${model.status === 'failed' ? 'ring-2 ring-red-600/70' : ''}`}>
            <div className="aspect-square bg-gray-900 grid grid-cols-2 grid-rows-2 gap-1">
                {model.previewImages.slice(0, 4).map((src, index) => (
                    <img key={index} src={src} className="w-full h-full object-cover" alt={`preview ${index}`}/>
                ))}
            </div>
            <div className="p-3 flex-grow flex flex-col">
                <h4 className="font-semibold text-white truncate">{model.name}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 flex-grow min-h-[2.5rem]">{model.description || 'No description.'}</p>
                <button 
                    onClick={() => onEdit(model)}
                    className="mt-2 w-full text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1.5 px-2 rounded-md transition-colors"
                >
                    Edit
                </button>
            </div>
            {getStatusIndicator()}
        </div>
    )
}

const NewModelForm: React.FC<{ onCancel: () => void; onTrain: (modelName: string, images: File[], description: string) => void; }> = ({ onCancel, onTrain }) => {
    const [modelName, setModelName] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (modelName.trim() && images.length > 0) {
            onTrain(modelName, images, description);
        } else {
            alert('Please provide a model name and at least one image.');
        }
    }

    return (
        <div className="bg-gray-950 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Train New Model</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="model-name" className="block text-sm font-medium text-gray-300 mb-1">Model Name</label>
                    <input 
                        type="text"
                        id="model-name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="e.g., My Character, Product Style, Artistic Vibe"
                        className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-pink-500"
                    />
                </div>
                 <div>
                    <label htmlFor="model-desc" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
                    <textarea
                        id="model-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="e.g., A model trained on my cat, fluffy."
                        className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-pink-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Training Images</label>
                    <MultiImageUploader onFilesChange={setImages} />
                    <p className="text-xs text-gray-500 mt-2">Upload 10-20 high-quality images of your subject for the best results.</p>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg hover:from-pink-700 hover:to-fuchsia-700 transition-colors">Start Training</button>
                </div>
            </div>
        </div>
    )
}

const EditModelForm: React.FC<{ model: TrainedModel; onCancel: () => void; onSave: (modelId: string, data: { name: string; description: string }) => void; onDelete: (modelId: string) => void; }> = ({ model, onCancel, onSave, onDelete }) => {
    const [modelName, setModelName] = useState(model.name);
    const [description, setDescription] = useState(model.description || '');
    const isFailed = model.status === 'failed';

    const handleSubmit = () => {
        if (isFailed) return;
        if (modelName.trim()) {
            onSave(model.id, { name: modelName, description });
        } else {
            alert('Model name cannot be empty.');
        }
    }

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the model "${model.name}"? This action cannot be undone.`)) {
            onDelete(model.id);
            onCancel(); // Close form after deletion
        }
    };

    return (
        <div className="bg-gray-950 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Edit Model</h3>
            {isFailed && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-4" role="alert">
                <strong className="font-bold">Training Failed!</strong>
                <span className="block sm:inline ml-2"> This model could not be trained. You can delete it to remove it from your list.</span>
              </div>
            )}
            <div className="space-y-4">
                <div>
                    <label htmlFor="edit-model-name" className="block text-sm font-medium text-gray-300 mb-1">Model Name</label>
                    <input 
                        type="text"
                        id="edit-model-name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        disabled={isFailed}
                        className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
                 <div>
                    <label htmlFor="edit-model-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                        id="edit-model-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        disabled={isFailed}
                        className="w-full bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-700 focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
                <div className="flex justify-between items-center gap-4 pt-4">
                    <button onClick={handleDelete} className="bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Delete Model
                    </button>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleSubmit} disabled={isFailed} className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg hover:from-pink-700 hover:to-fuchsia-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export const ModelsPage: React.FC<ModelsPageProps> = ({ models, onTrain, onUpdate, onDelete }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingModel, setEditingModel] = useState<TrainedModel | null>(null);

  const trainingModels = models.filter(m => m.status === 'training');
  const readyModels = models.filter(m => m.status === 'ready');
  const failedModels = models.filter(m => m.status === 'failed');

  const handleStartTraining = (modelName: string, images: File[], description: string) => {
    onTrain(modelName, images, description);
    setIsCreating(false);
  }

  const handleSaveEdit = (modelId: string, data: { name: string; description: string }) => {
    onUpdate(modelId, data);
    setEditingModel(null);
  };
  
  const handleModelDelete = (modelId: string) => {
    onDelete(modelId);
    setEditingModel(null);
  }

  if (isCreating) {
    return <NewModelForm onCancel={() => setIsCreating(false)} onTrain={handleStartTraining} />;
  }

  if (editingModel) {
    return <EditModelForm model={editingModel} onCancel={() => setEditingModel(null)} onSave={handleSaveEdit} onDelete={handleModelDelete} />;
  }

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Trained Models</h2>
        <button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg hover:from-pink-700 hover:to-fuchsia-700 transition-colors">
            Train New Model
        </button>
      </div>
      {models.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-950 rounded-lg">
          <p>You haven't trained any models yet.</p>
          <p className="text-sm">Click 'Train New Model' to get started.</p>
        </div>
      ) : (
        <>
          {trainingModels.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-800 pb-2">Currently Training</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                {trainingModels.map(model => <ModelCard key={model.id} model={model} onEdit={setEditingModel} />)}
              </div>
            </section>
          )}
           {readyModels.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-800 pb-2">Ready Models</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                {readyModels.map(model => <ModelCard key={model.id} model={model} onEdit={setEditingModel} />)}
              </div>
            </section>
          )}
          {failedModels.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-red-400 mb-4 border-b border-red-800 pb-2">Failed Trainings</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
                {failedModels.map(model => <ModelCard key={model.id} model={model} onEdit={setEditingModel} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};