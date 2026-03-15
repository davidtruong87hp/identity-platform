import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterForm } from '../../../src/components/auth/RegisterForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../src/lib/api', () => ({
  authApi: {
    register: jest.fn(),
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

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all fields and create account button', () => {
    renderWithClient(<RegisterForm />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithClient(<RegisterForm />);

    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('calls register API with correct data on submit', async () => {
    (authApi.register as jest.Mock).mockResolvedValueOnce({ data: {} });

    renderWithClient(<RegisterForm />);

    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalled();
      const callArg = authApi.register.mock.calls[0][0];
      expect(callArg).toEqual({
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });

  it('shows success message after successful registration', async () => {
    (authApi.register as jest.Mock).mockResolvedValueOnce({ data: {} });

    renderWithClient(<RegisterForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed registration', async () => {
    (authApi.register as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' }, status: 409 },
    });

    renderWithClient(<RegisterForm />);

    await userEvent.type(
      screen.getByLabelText(/email/i),
      'existing@example.com'
    );
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
