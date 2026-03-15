'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { authApi } from '@/lib/api';
import Link from 'next/link';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      authApi.resetPassword({ token: token!, password: data.password }),
  });

  const onSubmit = (data: ResetPasswordFormData) => mutate(data);

  if (!token) {
    return (
      <Alert
        type="error"
        message="Invalid or missing reset token. Please request a new password reset link."
      />
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <Alert
          type="success"
          message="Your password has been reset successfully!"
        />
        <Link
          href="/login"
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 text-center block"
        >
          Continue to Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 -mt-2">
        Choose a strong new password for your account.
      </p>

      {error && (
        <Alert
          type="error"
          message={
            (error as any).response?.data?.message ?? 'Something went wrong'
          }
        />
      )}

      <Input
        label="New password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm new password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={isPending}>
        Reset password
      </Button>
    </form>
  );
}
