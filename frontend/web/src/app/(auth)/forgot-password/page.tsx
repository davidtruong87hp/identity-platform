import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Forgot your password?
      </h2>
      <ForgotPasswordForm />
    </>
  );
}
