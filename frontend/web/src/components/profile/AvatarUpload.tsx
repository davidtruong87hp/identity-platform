'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { Alert } from '../ui/Alert';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  fallbackLetter?: string;
}

export function AvatarUpload({
  currentAvatarUrl,
  fallbackLetter,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setPreview(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    mutate(file);
  };

  const avatarSrc = preview ?? currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-24 h-24 rounded-full cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
            {fallbackLetter}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {isPending ? 'Uploading...' : 'Change'}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <Alert
          type="error"
          message={
            (error as any).response?.data?.message ?? 'Failed to upload avatar'
          }
        />
      )}
    </div>
  );
}
