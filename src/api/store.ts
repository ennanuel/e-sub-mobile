import { BaseURL_ONE, BaseURL_TWO, getStoreName, STORE_DATA_KEY } from '@/constants/routes';
import authAxios from './utils/axios';
import { StoreInfoResponse } from '@/types';

export const getStoreDetails = async (): Promise<StoreInfoResponse> => {
  const storeName = getStoreName();
  const response = await authAxios.get(`${BaseURL_TWO}/store/store_info/?store_name=${encodeURIComponent(storeName)}`);
  const result = response.data;
  if (result?.data && typeof window !== 'undefined') {
    localStorage.setItem(STORE_DATA_KEY, JSON.stringify(result.data));
  }

  return result;
};

export const uploadFiles = (files: File[], onProgress?: (progress: number) => void) =>
  new Promise<string[]>(async (resolve, reject) => {
    try {
      const url = `${BaseURL_ONE}/investment/upload/`;
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append('files', file, file.name);
      }

      const response = await authAxios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress
          ? (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
              onProgress(percentCompleted);
            }
          : undefined,
      });

      resolve(response.data.data);
    } catch (error) {
      reject(error);
    }
  });
