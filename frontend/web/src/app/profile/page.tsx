'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((res) => res.data),
  });

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-auto px-4"
            >
              Logout
            </Button>
          </div>

          <div className="flex items-center gap-6 mb-8">
            {data?.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                {data?.firstName?.[0] ?? data?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {data?.firstName && data?.lastName
                  ? `${data.firstName} ${data.lastName}`
                  : data?.email}
              </h2>
              <p className="text-gray-500">{data?.email}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                  data?.emailVerifiedAt
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {data?.emailVerifiedAt
                  ? 'Email verified'
                  : 'Email not verified'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-6">
            <div>
              <p className="text-sm text-gray-500">First name</p>
              <p className="font-medium">{data?.firstName ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last name</p>
              <p className="font-medium">{data?.lastName ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">
                {data?.createdAt
                  ? new Date(data.createdAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account status</p>
              <p className="font-medium">
                {data?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
