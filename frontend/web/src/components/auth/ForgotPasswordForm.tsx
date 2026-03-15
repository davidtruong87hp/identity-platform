'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { authApi } from '@/lib/api';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: (data: ForgotPasswordFormData) =>
      authApi.forgotPassword(data.email),
  });

  const onSubmit = (data: ForgotPasswordFormData) => mutate(data);

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-4">
        <Alert
          type="success"
          message="If that email exists, we've sent a password reset link. Check your inbox."
        />
        <p className="text-center text-sm text-gray-500">
          Back to{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 -mt-2">
        Enter your email and we'll send you a link to reset your password.
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
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" loading={isPending}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
