import { VerifyEmailNotice } from '@/components/auth/VerifyEmailNotice';
import { Suspense } from 'react';

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailNotice />
    </Suspense>
  );
}
