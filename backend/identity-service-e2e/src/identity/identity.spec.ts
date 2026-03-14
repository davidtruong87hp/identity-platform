import axios from 'axios';

describe('Auth E2E', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  };

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await axios.post('/auth/register', testUser);
      expect(res.status).toBe(201);
      expect(res.data).toEqual({
        message: 'Registration successful, please verify your email',
      });
    });

    it('should throw if email already exists', async () => {
      try {
        await axios.post('/auth/register', testUser);
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });

    it('should throw if email is invalid', async () => {
      try {
        await axios.post('/auth/register', { ...testUser, email: 'invalid' });
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });

    it('should throw if password is too short', async () => {
      try {
        await axios.post('/auth/register', {
          ...testUser,
          email: 'new@example.com',
          password: '123',
        });
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });
  });

  describe('POST /auth/login', () => {
    it('should throw if email is not verified', async () => {
      try {
        await axios.post('/auth/login', {
          email: testUser.email,
          password: testUser.password,
        });
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });

    it('should throw if user does not exist', async () => {
      try {
        await axios.post('/auth/login', {
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });

    it('should throw if password is wrong', async () => {
      try {
        await axios.post('/auth/login', {
          email: testUser.email,
          password: 'wrongpassword',
        });
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });
  });

  describe('GET /auth/verify-email', () => {
    it('should throw if token is invalid', async () => {
      try {
        await axios.get('/auth/verify-email?token=invalid-token');
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });
  });

  describe('POST /auth/refresh', () => {
    it('should throw if refresh token is invalid', async () => {
      try {
        await axios.post('/auth/refresh', { refreshToken: 'invalid-token' });
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });
  });

  describe('GET /auth/me', () => {
    it('should throw if no token provided', async () => {
      try {
        await axios.get('/auth/me');
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });
  });
});
