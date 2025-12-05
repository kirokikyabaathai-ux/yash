require('dotenv').config({ path: '.env' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testTimeout: 60000, // 60 seconds for property-based tests with database operations
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth|@auth)/)',
  ],
};
