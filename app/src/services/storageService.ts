/**
 * Storage Service - Casa Latina Premium
 * 
 * Handles file uploads to Firebase Storage
 * Primarily used for profile photos and event images
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

// Constants for validation
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/**
 * Custom error class for storage operations
 */
export class StorageError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

/**
 * Validates file before upload
 */
function validateFile(blob: Blob): void {
  // Check file size
  if (blob.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
    throw new StorageError(
      `Image is too large (${sizeMB}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB. Please choose a smaller image.`,
      'file-too-large'
    );
  }

  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(blob.type) && blob.type !== '') {
    throw new StorageError(
      'Invalid file type. Please select a JPEG, PNG, or WebP image.',
      'invalid-file-type'
    );
  }
}

/**
 * Parses Firebase Storage error codes into user-friendly messages
 */
function parseStorageError(error: any): StorageError {
  const errorCode = error?.code || '';
  
  switch (errorCode) {
    case 'storage/unauthorized':
      return new StorageError(
        'You don\'t have permission to upload photos. Please try logging in again.',
        'unauthorized'
      );
    case 'storage/canceled':
      return new StorageError(
        'Upload was cancelled.',
        'cancelled'
      );
    case 'storage/retry-limit-exceeded':
      return new StorageError(
        'Upload failed due to network issues. Please check your connection and try again.',
        'network-error'
      );
    case 'storage/quota-exceeded':
      return new StorageError(
        'Storage quota exceeded. Please contact support.',
        'quota-exceeded'
      );
    case 'storage/invalid-format':
      return new StorageError(
        'Invalid image format. Please select a valid image file.',
        'invalid-format'
      );
    default:
      return new StorageError(
        'Unable to upload photo. Please check your connection and try again.',
        'unknown'
      );
  }
}

/**
 * Deletes a file from Firebase Storage given its download URL
 *
 * @param downloadUrl - The full download URL of the file to delete
 */
export async function deleteFileByUrl(downloadUrl: string): Promise<void> {
  try {
    // Extract the storage path from the download URL
    // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const url = new URL(downloadUrl);
    const pathEncoded = url.pathname.split('/o/')[1]?.split('?')[0];

    if (!pathEncoded) {
      console.warn('Could not extract path from URL:', downloadUrl);
      return;
    }

    const path = decodeURIComponent(pathEncoded);
    const fileRef = ref(storage, path);

    await deleteObject(fileRef);
  } catch (error: any) {
    // Silently fail - don't block upload if old file can't be deleted
    // File might not exist or permissions might have changed
    if (error?.code !== 'storage/object-not-found') {
      console.warn('Could not delete previous photo:', error?.code);
    }
  }
}

/**
 * Uploads a profile photo to Firebase Storage
 *
 * @param userId - The user's UID
 * @param uri - Local URI of the image to upload
 * @param oldPhotoUrl - Optional URL of the previous photo to delete after successful upload
 * @returns Promise with the download URL of the uploaded image
 * @throws StorageError with user-friendly message
 */
export async function uploadProfilePhoto(
  userId: string,
  uri: string,
  oldPhotoUrl?: string | null
): Promise<string> {
  try {
    // Fetch the image as blob
    const response = await fetch(uri);
    if (!response.ok) {
      throw new StorageError(
        'Could not read the selected image. Please try selecting a different photo.',
        'read-error'
      );
    }

    const blob = await response.blob();

    // Validate file before upload
    validateFile(blob);

    // Create a unique filename with timestamp to bust cache
    const timestamp = Date.now();
    const filename = `profile_${timestamp}.jpg`;
    const storageRef = ref(storage, `profiles/${userId}/${filename}`);

    // Upload to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: blob.type || 'image/jpeg',
      customMetadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Delete old photo AFTER successful upload (best practice)
    if (oldPhotoUrl) {
      await deleteFileByUrl(oldPhotoUrl);
    }

    return downloadURL;
  } catch (error) {
    // Re-throw StorageError as-is
    if (error instanceof StorageError) {
      throw error;
    }

    // Parse Firebase errors
    console.error('Error uploading profile photo:', error);
    throw parseStorageError(error);
  }
}

/**
 * Gets the storage path for a user's profile photos
 *
 * @param userId - The user's UID
 * @returns The storage path string
 */
export function getProfilePhotoPath(userId: string): string {
  return `profiles/${userId}`;
}

/**
 * Uploads an event photo to Firebase Storage
 *
 * @param eventId - The event's ID (can be temporary for new events)
 * @param uri - Local URI of the image to upload
 * @returns Promise with the download URL of the uploaded image
 * @throws StorageError with user-friendly message
 */
export async function uploadEventPhoto(
  eventId: string,
  uri: string
): Promise<string> {
  try {
    // Fetch the image as blob
    const response = await fetch(uri);
    if (!response.ok) {
      throw new StorageError(
        'Could not read the selected image. Please try selecting a different photo.',
        'read-error'
      );
    }

    const blob = await response.blob();

    // Validate file before upload
    validateFile(blob);

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const filename = `event_${timestamp}.jpg`;
    const storageRef = ref(storage, `events/${eventId}/${filename}`);

    // Upload with metadata
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        eventId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    // Re-throw StorageError as-is
    if (error instanceof StorageError) {
      throw error;
    }

    // Parse Firebase errors
    console.error('Error uploading event photo:', error);
    throw parseStorageError(error);
  }
}

