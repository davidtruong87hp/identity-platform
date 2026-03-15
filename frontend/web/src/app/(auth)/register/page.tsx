import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Create your account
      </h2>
      <RegisterForm />
    </>
  );
}
