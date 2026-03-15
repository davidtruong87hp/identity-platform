'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Alert } from '../ui/Alert';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export function VerifyEmailNotice() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verified, setVerified] = useState(false);

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: () => authApi.verifyEmail(token!),
    onSuccess: () => setVerified(true),
  });

  useEffect(() => {
    if (token) mutate();
  }, [token]);

  // Case 1: has token — show verification result
  if (token) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Email Verification
        </h2>

        {isPending && (
          <Alert type="info" message="Verifying your email, please wait..." />
        )}

        {verified && (
          <>
            <Alert
              type="success"
              message="Your email has been verified successfully!"
            />
            <Link
              href="/login"
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 text-center block"
            >
              Continue to Sign in
            </Link>
          </>
        )}

        {error && (
          <Alert
            type="error"
            message={
              (error as any).response?.data?.message ??
              'Verification failed. The link may have expired.'
            }
          />
        )}
      </div>
    );
  }

  // Case 2: no token — just registered, waiting for email
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
        <MailCheck className="w-7 h-7 text-indigo-600" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800">Check your inbox</h2>

      <p className="text-sm text-gray-500">
        We sent a verification link to your email address. Click the link to
        activate your account.
      </p>

      <p className="text-sm text-gray-400">
        Already verified?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
