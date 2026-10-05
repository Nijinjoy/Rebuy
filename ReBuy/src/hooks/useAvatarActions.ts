import { useState } from 'react';
import axios from 'axios';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { showAlert } from '../components/ui/AlertProvider';
import { useAuth } from '../context/AuthContext';
import {
  ProfileResponse,
  removeAvatar,
  uploadAvatar,
} from '../services/api/profile/profileService';

// A reasonably small photo is plenty for an avatar.
const pickerOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 800,
};

// Change / remove the signed-in user's profile photo. Each prompt keeps to
// three buttons because Android alerts drop any beyond that.
export function useAvatarActions() {
  const { user, updateUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const save = async (request: () => Promise<ProfileResponse>) => {
    setBusy(true);
    try {
      const response = await request();
      if (response.user) {
        updateUser(response.user);
      }
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      showAlert(
        "Couldn't update photo",
        message ?? 'Please check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePicked = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    const asset = response.assets?.[0];
    if (response.errorCode || !asset?.uri) {
      showAlert(
        "Couldn't open photo",
        response.errorCode === 'camera_unavailable'
          ? 'No camera is available on this device.'
          : response.errorCode === 'permission'
          ? 'Allow ReBuy to access your photos in Settings.'
          : 'Please try again.',
      );
      return;
    }
    const file = {
      uri: asset.uri,
      type: asset.type,
      fileName: asset.fileName,
    };
    save(() => uploadAvatar(file));
  };

  // Rejects when the native picker is missing from the app build.
  const pick = (launch: () => Promise<ImagePickerResponse>) => {
    launch()
      .then(handlePicked)
      .catch(() =>
        showAlert(
          "Couldn't open photos",
          'The photo picker is not available in this build of the app.',
        ),
      );
  };

  const changePhoto = () => {
    showAlert(
      user?.avatar_url ? 'Change photo' : 'Add photo',
      undefined,
      [
        {
          text: 'Take photo',
          onPress: () =>
            pick(() =>
              launchCamera({
                ...pickerOptions,
                cameraType: 'front',
                saveToPhotos: false,
              }),
            ),
        },
        {
          text: 'Choose from library',
          onPress: () => pick(() => launchImageLibrary(pickerOptions)),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { icon: 'camera' },
    );
  };

  const removePhoto = () => {
    showAlert(
      'Remove profile photo?',
      'Your initials will show instead.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => save(removeAvatar),
        },
      ],
      { icon: 'trash', tone: 'danger' },
    );
  };

  return {
    hasPhoto: !!user?.avatar_url,
    busy,
    changePhoto,
    removePhoto,
  };
}
