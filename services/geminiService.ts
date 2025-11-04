import { GoogleGenAI, Modality } from '@google/genai';
import { TrainedModel } from '../types';

// A base64 encoded SVG to be displayed when any error occurs during image generation.
// This provides a user-friendly way to handle errors without showing technical messages.
const ERROR_IMAGE_DATA_URL = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjMTgxODFiIi8+CjxjaXJjbGUgY3g9IjE3NiIgY3k9IjIwOCIgcj0iMzIiIGZpbGw9IiNmNDNmNWUiLz4KPGNpcmNsZSBjeD0iMzM2IiBjeT0iMjA4IiByPSIzMiIgZmlsbD0iI2Y0M2Y1ZSIvPgo8cGF0aCBkPSJNMTYwIDM1MiBDIDIwOCAzMDQsIDMwNCAzMDQsIDM1MiAzNTIiIHN0cm9rZT0iI2Y0M2Y1ZSIgc3Ryb2tlLXdpZHRoPSIyNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iNDUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBzdHlsZT0iZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZm9udC1zaXplOiAyOHB4OyBmaWxsOiAjYTFiMWFhOyI+VGhlIEFJIGhhZCBhIGhpY2N1cC48L3RleHQ+Cjx0ZXh0IHg9IjI1NiIgeT0iNDgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBzdHlsZT0iZm9udC1mYW1pbHk6IG1vbm9zcGFjZTsgZm9udC1zaXplOiAyOHB4OyBmaWxsOiAjYTFiMWFhOyI+UGxlYXNlIHRyeSBhIGRpZmZlcmVudCBwcm9tcHQhPC90ZXh0Pgo8L3N2Zz4=`;

/**
 * Creates and returns a GoogleGenAI instance.
 * It uses the environment variable for the API key.
 * Throws an error if no API key is configured.
 */
const getGenAI = () => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    // This error will be caught by the calling functions and handled gracefully.
    throw new Error('API key is not configured for this application.');
  }
  
  return new GoogleGenAI({ apiKey });
};

// We will generate 4 images to provide a good selection in the UI grid.
const IMAGE_GENERATION_COUNT = 4;

/**
 * Converts a data URL string to a base64 data string and its MIME type.
 * @param dataUrl The data URL (e.g., "data:image/png;base64,iVBORw...")
 * @returns An object with the base64 data and the MIME type.
 */
const dataUrlToBlob = (dataUrl: string): { data: string, mimeType: string } => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid data URL');
    }
    const header = parts[0];
    const base64Data = parts[1];
    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
        throw new Error('Could not extract MIME type from data URL');
    }
    const mimeType = mimeTypeMatch[1];
    return { data: base64Data, mimeType };
};


/**
 * Generates images based on a text prompt using the Gemini API.
 * This function now makes four simultaneous requests to generate a grid of images.
 * This version catches all errors and returns a placeholder image data URL instead.
 * @returns A promise that resolves to an array of data URLs (either generated PNGs or an error SVG).
 */
export const generateImage = async (
    prompt: string, 
    modelId: string | null, 
    style: string | null, 
    allModels: TrainedModel[], 
    aspectRatio: string // This parameter is unused but kept for compatibility.
): Promise<string[]> => {
    try {
        const ai = getGenAI();

        let fullPrompt = prompt;
        if (style && style !== 'No Style') {
            fullPrompt = `${style} style: ${prompt}`;
        }
        
        const parts: any[] = [{ text: fullPrompt }];
        
        if (modelId) {
            const customModel = allModels.find(m => m.id === modelId);
            if (!customModel || !customModel.previewImages || customModel.previewImages.length === 0) {
                 console.error(`Custom model with id ${modelId} is invalid or has no preview images.`);
                 return [ERROR_IMAGE_DATA_URL];
            }
            
            fullPrompt = `Using concept "${customModel.name}" (${customModel.description || 'custom concept'}): ${prompt}`;
            
            const { data, mimeType } = dataUrlToBlob(customModel.previewImages[0]);
            const imagePart = { inlineData: { data, mimeType } };

            // Place text part first to prioritize the prompt
            parts.splice(0, parts.length, { text: fullPrompt }, imagePart);
        }

        const generateSingleImage = async (): Promise<string> => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePartResponse?.inlineData) {
                return `data:image/png;base64,${imagePartResponse.inlineData.data}`;
            }
            throw new Error('No image data in response from single generation.');
        };
        
        const promises = Array(IMAGE_GENERATION_COUNT).fill(null).map(() => generateSingleImage());

        const results = await Promise.allSettled(promises);
        
        const successfulImages = results
            .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
            .map(result => result.value);
            
        if (successfulImages.length === 0) {
            console.warn('All image generations failed. The prompt may have been blocked. Returning placeholder.');
            results.forEach(result => {
                if (result.status === 'rejected') {
                    console.error('Individual generation failed:', result.reason);
                }
            });
            return [ERROR_IMAGE_DATA_URL];
        }

        return successfulImages;

    } catch (e) {
        console.error("Error generating image:", e);
        return [ERROR_IMAGE_DATA_URL];
    }
};

/**
 * Edits an existing image. On failure, it returns a placeholder image data URL.
 * @returns A promise resolving to an array with a single data URL (PNG or error SVG).
 */
export const editImage = async (
    prompt: string, 
    image: { data: string, mimeType: string }
): Promise<string[]> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt }, // Text part is first to prioritize the prompt
                    { inlineData: { data: image.data, mimeType: image.mimeType } },
                ],
            },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
            console.warn('No image was generated from the edit. The prompt may have been blocked. Returning placeholder.');
            return [ERROR_IMAGE_DATA_URL];
        }
        
        return [`data:image/png;base64,${imagePart.inlineData.data}`];
    } catch (e) {
        console.error("Error editing image:", e);
        return [ERROR_IMAGE_DATA_URL];
    }
};

/**
 * Generates a new image using context. On failure, it returns a placeholder image data URL.
 * @returns A promise resolving to an array with a single data URL (PNG or error SVG).
 */
export const fluxEditImage = async (
    prompt: string, 
    image: { data: string, mimeType: string }
): Promise<string[]> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt }, // Text part is first to prioritize the prompt
                    { inlineData: { data: image.data, mimeType: image.mimeType } },
                ],
            },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
            console.warn('No image was generated from FLUX. The prompt may have been blocked. Returning placeholder.');
            return [ERROR_IMAGE_DATA_URL];
        }
        
        return [`data:image/png;base64,${imagePart.inlineData.data}`];
    } catch (e) {
        console.error("Error with FLUX image generation:", e);
        return [ERROR_IMAGE_DATA_URL];
    }
};