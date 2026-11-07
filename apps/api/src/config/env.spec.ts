import { validateEnv } from './env';

const valid = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('applies defaults', () => {
    const config = validateEnv(valid);
    expect(config.API_PORT).toBe(4000);
    expect(config.RENTER_SERVICE_FEE_BPS).toBe(1000);
    expect(config.CORS_ORIGINS).toEqual(['http://localhost:3000']);
  });

  it('splits CORS origins', () => {
    const config = validateEnv({ ...valid, CORS_ORIGINS: 'https://a.example, https://b.example' });
    expect(config.CORS_ORIGINS).toEqual(['https://a.example', 'https://b.example']);
  });

  it('rejects a short JWT secret', () => {
    expect(() => validateEnv({ ...valid, JWT_ACCESS_SECRET: 'short' })).toThrow(
      /JWT_ACCESS_SECRET/,
    );
  });
});
