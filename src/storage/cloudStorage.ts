import type { StorageAdapter } from './storage';

const TG_VALUE_MAX_BYTES = 4096;

export const cloudStorage: StorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      window.Telegram!.WebApp.CloudStorage.getItem(key, (error, value) => {
        if (error) {
          resolve(null);
        } else {
          resolve(value || null);
        }
      });
    });
  },

  setItem: (key: string, value: string): Promise<void> => {
    const byteSize = new TextEncoder().encode(value).length;
    if (byteSize > TG_VALUE_MAX_BYTES) {
      console.warn(
        `[cloudStorage] Value for key "${key}" is ${byteSize} bytes, exceeds TG limit of ${TG_VALUE_MAX_BYTES}. Skipping save.`,
      );
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.Telegram!.WebApp.CloudStorage.setItem(key, value, (error) => {
        if (error) {
          console.warn(`[cloudStorage] setItem error for key "${key}":`, error);
        }
        resolve();
      });
    });
  },

  removeItem: (key: string): Promise<void> => {
    return new Promise((resolve) => {
      window.Telegram!.WebApp.CloudStorage.removeItem(key, (error) => {
        if (error) {
          console.warn(`[cloudStorage] removeItem error for key "${key}":`, error);
        }
        resolve();
      });
    });
  },
};
