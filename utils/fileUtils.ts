import { GeneratedImageHistoryItem } from '../types';

export const fileToBase64 = (file: File): Promise<{ data: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- IndexedDB Utilities ---

const DB_NAME = 'UltimateAIGeneraterDB';
const DB_VERSION = 1;
let dbInstance: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(new Error('Error opening DB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Use 'id' as the keyPath to store user-specific data objects
      if (!db.objectStoreNames.contains('imageHistory')) {
        db.createObjectStore('imageHistory', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('savedPrompts')) {
        db.createObjectStore('savedPrompts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('trainedModels')) {
        db.createObjectStore('trainedModels', { keyPath: 'id' });
      }
    };
  });
};

/**
 * Saves user-specific data to an IndexedDB store.
 * The data is stored in an object { id: userKey, value: data }, where userKey is e.g., 'trainedModels_guest'.
 * @param storeName The name of the object store (e.g., 'trainedModels').
 * @param userKey The unique key for this user's data within the store.
 * @param data The array of data to save.
 */
export const idbSaveData = (storeName: string, userKey: string, data: any[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (!Array.isArray(data)) {
      console.error("idbSaveData only supports array data.");
      return reject(new Error("Data to be saved must be an array."));
    }
    
    try {
      const db = await initDB();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        console.error(`Transaction error while saving to ${storeName}:`, transaction.error);
        reject(transaction.error);
      };
      transaction.onabort = () => {
        console.warn(`Transaction aborted while saving to ${storeName}.`);
        reject(new Error("Database transaction was aborted."));
      };

      // Create a clean version of the data to avoid DataCloneErrors with Proxies from React state.
      const value = data.map(item => ({...item}));
      store.put({ id: userKey, value });

    } catch (dbError) {
      console.error(`Failed to initiate save transaction for ${storeName}:`, dbError);
      reject(dbError);
    }
  });
};

/**
 * Retrieves a specific user's data from an IndexedDB store.
 * @param storeName The name of the object store (e.g., 'trainedModels').
 * @param userKey The unique key for the user's data.
 * @returns A promise that resolves to the user's data array, or null if not found.
 */
export const idbGetAllData = async (storeName: string, userKey: string): Promise<any[] | null> => {
  const db = await initDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(userKey);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const result = request.result; // This is { id: '...', value: [...] }
      if (result && Array.isArray(result.value)) {
        const data = result.value as Array<{id: string}>;
        // Sort by timestamp-based ID to ensure newest items appear first
        if (data.length > 0 && typeof data[0]?.id !== 'undefined') {
          data.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
        }
        resolve(data);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const openImageInNewWindow = (item: GeneratedImageHistoryItem) => {
  const imageUrl = item.imageUrls[0];
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    const safePrompt = item.prompt.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    newWindow.document.write(`
      <html>
        <head>
          <title>Image Preview: ${safePrompt}</title>
          <style>
            body { 
              margin: 0; 
              padding: 2rem;
              background-color: #0a0a0a; 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              font-family: sans-serif;
              color: #e5e7eb;
              box-sizing: border-box;
            }
            img { 
              max-width: 90%; 
              max-height: 80vh; 
              object-fit: contain;
              border-radius: 8px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            }
            div {
              margin-top: 1.5rem;
              padding: 1rem 1.5rem;
              background-color: #111;
              border: 1px solid #374151;
              border-radius: 8px;
              max-width: 90%;
              text-align: left;
              word-break: break-word;
            }
            h2 {
              margin: 0 0 0.5rem;
              font-size: 1.25rem;
              color: #fff;
            }
            p {
              margin: 0;
              font-size: 1rem;
              color: #d1d5db;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="${safePrompt}" />
          <div>
            <h2>Prompt</h2>
            <p>${safePrompt}</p>
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
  }
};
