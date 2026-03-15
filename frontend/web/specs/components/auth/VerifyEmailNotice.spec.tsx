import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VerifyEmailNotice } from '../../../src/components/auth/VerifyEmailNotice';

// Mock useSearchParams
const mockGet = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGet }),
}));

jest.mock('../../../src/lib/api', () => ({
  authApi: {
    verifyEmail: jest.fn(),
  },
}));

import { authApi } from '../../../src/lib/api';

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('VerifyEmailNotice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('without token', () => {
    beforeEach(() => {
      mockGet.mockReturnValue(null);
    });

    it('shows check your inbox message', () => {
      renderWithClient(<VerifyEmailNotice />);

      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
    });

    it('shows sign in link', () => {
      renderWithClient(<VerifyEmailNotice />);

      expect(
        screen.getByRole('link', { name: /sign in/i })
      ).toBeInTheDocument();
    });
  });

  describe('with token', () => {
    beforeEach(() => {
      mockGet.mockReturnValue('valid-token-123');
    });

    it('calls verifyEmail API with the token', async () => {
      (authApi.verifyEmail as jest.Mock).mockResolvedValueOnce({ data: {} });

      renderWithClient(<VerifyEmailNotice />);

      await waitFor(() => {
        expect(authApi.verifyEmail).toHaveBeenCalledWith('valid-token-123');
      });
    });

    it('shows success message after verification', async () => {
      (authApi.verifyEmail as jest.Mock).mockResolvedValueOnce({ data: {} });

      renderWithClient(<VerifyEmailNotice />);

      await waitFor(() => {
        expect(
          screen.getByText(/email has been verified successfully/i)
        ).toBeInTheDocument();
      });
    });

    it('shows error message when verification fails', async () => {
      (authApi.verifyEmail as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: 'Token expired' }, status: 400 },
      });

      renderWithClient(<VerifyEmailNotice />);

      await waitFor(() => {
        expect(screen.getByText(/token expired/i)).toBeInTheDocument();
      });
    });

    it('shows continue to sign in link after successful verification', async () => {
      (authApi.verifyEmail as jest.Mock).mockResolvedValueOnce({ data: {} });

      renderWithClient(<VerifyEmailNotice />);

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /continue to sign in/i })
        ).toBeInTheDocument();
      });
    });
  });
});
