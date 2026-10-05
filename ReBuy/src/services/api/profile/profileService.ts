import type { AxiosRequestConfig } from 'axios';
import apiClient from '../../client';
import type { AuthUser } from '../auth/authService';

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
}

// Requires a signed-in session: the bearer token is attached by apiClient.
export const getProfile = async (
  config?: AxiosRequestConfig,
): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>(
    '/user/profile',
    config,
  );

  return response.data;
};

export interface AvatarFile {
  uri: string;
  type?: string;
  fileName?: string;
}

// Uploads a new profile photo; the response carries the updated user.
export const uploadAvatar = async (
  file: AvatarFile,
): Promise<ProfileResponse> => {
  const type = file.type ?? 'image/jpeg';
  const formData = new FormData();
  formData.append('avatar', {
    uri: file.uri,
    type,
    name: file.fileName ?? `avatar.${type.split('/')[1] ?? 'jpg'}`,
  } as unknown as Blob);

  const response = await apiClient.put<ProfileResponse>(
    '/user/avatar',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Hand FormData to React Native's networking as-is instead of letting
      // axios serialise it.
      transformRequest: data => data,
      timeout: 30000,
    },
  );

  return response.data;
};

export const removeAvatar = async (): Promise<ProfileResponse> => {
  const response = await apiClient.delete<ProfileResponse>('/user/avatar');

  return response.data;
};
