import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../../../src/components/auth/LoginForm';

jest.mock('next/navigation', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();
  return {
    __mockPush: mockPush,
    __mockGet: mockGet,
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => ({ get: mockGet }),
  };
});

const navMocks = jest.requireMock('next/navigation');

jest.mock('../../../src/lib/api', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

const { authApi } = jest.requireMock('../../../src/lib/api');

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    navMocks.__mockGet.mockReturnValue(null);
  });

  it('renders email, password fields and sign in button', () => {
    renderWithClient(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('renders forgot password and register links', () => {
    renderWithClient(<LoginForm />);
    expect(
      screen.getByRole('link', { name: /forgot password/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithClient(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('calls login API with correct data on submit', async () => {
    const { authApi } = jest.requireMock('../../../src/lib/api');
    authApi.login.mockResolvedValueOnce({ data: {} });

    renderWithClient(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
      const callArg = authApi.login.mock.calls[0][0];
      expect(callArg).toMatchObject({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('redirects to profile on successful login', async () => {
    authApi.login.mockResolvedValueOnce({ data: {} });
    renderWithClient(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(navMocks.__mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('shows error message on failed login', async () => {
    authApi.login.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' }, status: 401 },
    });
    renderWithClient(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
