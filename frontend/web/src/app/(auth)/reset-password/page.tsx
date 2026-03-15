import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Reset your password
      </h2>
      <ResetPasswordForm />
    </Suspense>
  );
}
