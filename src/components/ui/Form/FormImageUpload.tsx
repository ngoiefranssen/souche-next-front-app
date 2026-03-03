/**
 * Optimized image upload component with automatic compression and resizing
 * Use this for profile photos and other images that need optimization
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import {
  optimizeImage,
  validateImage,
  createImagePreview,
} from '@/lib/utils/imageOptimization';

export interface FormImageUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB (before optimization)
  maxWidth?: number; // max width after optimization
  maxHeight?: number; // max height after optimization
  quality?: number; // 0-1
  error?: string;
  helperText?: string;
  required?: boolean;
  onChange: (file: File | null) => void;
  value?: File | null;
  className?: string;
  autoOptimize?: boolean; // automatically optimize on upload
}

export const FormImageUpload: React.FC<FormImageUploadProps> = ({
  label,
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = 5,
  maxWidth = 500,
  maxHeight = 500,
  quality = 0.8,
  error,
  helperText,
  required = false,
  onChange,
  value,
  className = '',
  autoOptimize = true,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fieldId = `image-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const displayError = error || validationError;

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        onChange(null);
        setPreviewUrl(null);
        setValidationError(null);
        return;
      }

      try {
        setOptimizing(true);
        setValidationError(null);

        // Validate image
        const validation = await validateImage(file, {
          maxSize: maxSize * 1024 * 1024,
          allowedTypes: accept.split(',').map(t => t.trim()),
        });

        if (!validation.valid) {
          setValidationError(validation.error || 'Invalid image');
          onChange(null);
          setPreviewUrl(null);
          return;
        }

        // Optimize image if enabled
        let processedFile = file;
        if (autoOptimize) {
          processedFile = await optimizeImage(file, {
            maxWidth,
            maxHeight,
            quality,
            format: 'image/jpeg',
          });
        }

        // Create preview
        const preview = createImagePreview(processedFile);
        setPreviewUrl(preview);

        // Call onChange with optimized file
        onChange(processedFile);
      } catch (err) {
        console.error('Error processing image:', err);
        setValidationError('Failed to process image');
        onChange(null);
        setPreviewUrl(null);
      } finally {
        setOptimizing(false);
      }
    },
    [onChange, maxSize, maxWidth, maxHeight, quality, accept, autoOptimize]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    handleFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFile, previewUrl]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg
          transition-all duration-200
          ${
            dragActive
              ? 'border-[#2B6A8E] bg-blue-50'
              : displayError
                ? 'border-red-500'
                : 'border-gray-300 hover:border-gray-400'
          }
          ${optimizing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={fieldId}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          aria-invalid={displayError ? 'true' : 'false'}
          aria-describedby={
            displayError ? errorId : helperText ? helperId : undefined
          }
          required={required}
          disabled={optimizing}
        />

        {optimizing ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-[#2B6A8E] animate-spin" />
            <p className="text-sm text-gray-600">Optimizing image...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative p-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            {autoOptimize && value && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Optimized: {(value.size / 1024).toFixed(1)}KB
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-full p-8 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B6A8E] rounded-lg"
          >
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              {accept.split(',').join(', ')} (max {maxSize}MB)
            </p>
            {autoOptimize && (
              <p className="text-xs text-gray-400">
                Images will be optimized to {maxWidth}x{maxHeight}px
              </p>
            )}
          </button>
        )}
      </div>

      {displayError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}

      {helperText && !displayError && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
