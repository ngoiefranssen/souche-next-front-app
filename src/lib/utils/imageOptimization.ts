/**
 * Image optimization utilities
 * Compress and resize images before upload
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 500,
  maxHeight: 500,
  quality: 0.8,
  format: 'image/jpeg',
};

/**
 * Compress and resize an image file
 *
 * @param file - Image file to optimize
 * @param options - Optimization options
 * @returns Optimized image as File
 *
 * @example
 * const optimizedImage = await optimizeImage(file, {
 *   maxWidth: 500,
 *   maxHeight: 500,
 *   quality: 0.8
 * });
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;

          if (width > opts.maxWidth || height > opts.maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
              width = opts.maxWidth;
              height = width / aspectRatio;
            } else {
              height = opts.maxHeight;
              width = height * aspectRatio;
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Use better image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to blob
          canvas.toBlob(
            blob => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              // Create new file from blob
              const optimizedFile = new File([blob], file.name, {
                type: opts.format,
                lastModified: Date.now(),
              });

              resolve(optimizedFile);
            },
            opts.format,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions without loading the full image
 *
 * @param file - Image file
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 *
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export interface ImageValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateImage(
  file: File,
  options: ImageValidationOptions = {}
): Promise<ImageValidationResult> {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxWidth,
    maxHeight,
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB`,
    };
  }

  // Check dimensions if specified
  if (maxWidth || maxHeight) {
    try {
      const dimensions = await getImageDimensions(file);

      if (maxWidth && dimensions.width > maxWidth) {
        return {
          valid: false,
          error: `Image width exceeds ${maxWidth}px`,
        };
      }

      if (maxHeight && dimensions.height > maxHeight) {
        return {
          valid: false,
          error: `Image height exceeds ${maxHeight}px`,
        };
      }
    } catch {
      return {
        valid: false,
        error: 'Failed to validate image dimensions',
      };
    }
  }

  return { valid: true };
}

/**
 * Create a preview URL for an image file
 * Remember to revoke the URL when done: URL.revokeObjectURL(url)
 *
 * @param file - Image file
 * @returns Object URL for preview
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Convert image to base64 string
 *
 * @param file - Image file
 * @returns Base64 string
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
