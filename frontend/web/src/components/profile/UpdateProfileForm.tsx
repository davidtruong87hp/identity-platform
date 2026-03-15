'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { authApi } from '@/lib/api';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type UpdateProfileFormData = z.infer<typeof schema>;

interface UpdateProfileFormProps {
  defaultValues: UpdateProfileFormData;
  onSuccess: () => void;
}

export function UpdateProfileForm({
  defaultValues,
  onSuccess,
}: UpdateProfileFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      onSuccess();
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {error && (
        <Alert
          type="error"
          message={
            (error as any).response?.data?.message ?? 'Failed to update profile'
          }
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <div className="flex gap-3 justify-end mt-2">
        <Button type="submit" loading={isPending} className="w-auto px-6">
          Save changes
        </Button>
      </div>
    </form>
  );
}
