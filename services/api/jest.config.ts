export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '@shalkaar/shared-types': '<rootDir>/../../packages/shared-types/src/index.ts',
    '@shalkaar/shared-utils': '<rootDir>/../../packages/shared-utils/src/index.ts',
    '@shalkaar/api-client': '<rootDir>/../../packages/api-client/src/index.ts',
    '@shalkaar/config': '<rootDir>/../../packages/config/src/index.ts',
    '@shalkaar/logging': '<rootDir>/../../packages/logging/src/index.ts',
    '@shalkaar/resilience': '<rootDir>/../../packages/resilience/src/index.ts',
    '@shalkaar/security': '<rootDir>/../../packages/security/src/index.ts',
    '@shalkaar/deployment-tools': '<rootDir>/../../packages/deployment-tools/src/index.ts',
  },
};
