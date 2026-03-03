'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File } from 'lucide-react';

export interface FormFileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // en MB
  preview?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  onChange: (file: File | null) => void;
  value?: File | null;
  className?: string;
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  label,
  accept = 'image/*',
  maxSize = 5,
  preview = true,
  error,
  helperText,
  required = false,
  onChange,
  value,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fieldId = `file-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        onChange(null);
        setPreviewUrl(null);
        return;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        onChange(null);
        setPreviewUrl(null);
        return;
      }

      onChange(file);

      // Generate preview for images
      if (preview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange, maxSize, preview]
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
    handleFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

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
              : error
                ? 'border-red-500'
                : 'border-gray-300 hover:border-gray-400'
          }
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
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          required={required}
        />

        {previewUrl ? (
          <div className="relative p-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-label="Supprimer le fichier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : value ? (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700">{value.name}</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 rounded"
              aria-label="Supprimer le fichier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-full p-8 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B6A8E] rounded-lg"
          >
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">
              Cliquez pour télécharger ou glissez-déposez
            </p>
            <p className="text-xs text-gray-400">
              {accept} (max {maxSize}MB)
            </p>
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
