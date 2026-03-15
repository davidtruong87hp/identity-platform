import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Sign in to your account
      </h2>
      <LoginForm />
    </>
  );
}
