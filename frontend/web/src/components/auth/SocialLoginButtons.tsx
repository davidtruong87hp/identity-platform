import Link from 'next/link';

const REDIRECT_URI =
  process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL ??
  'http://localhost:3004/api/auth/callback';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

const socialProviders = [
  {
    name: 'Google',
    href: `${API_URL}/auth/google?redirectUri=${encodeURIComponent(
      REDIRECT_URI
    )}`,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  // Add more providers here later, e.g. GitHub, Facebook, etc.
];

export function SocialLoginButtons() {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-400">or continue with</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {socialProviders.map((provider) => (
          <Link
            key={provider.name}
            href={provider.href}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {provider.icon}
            Continue with {provider.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
