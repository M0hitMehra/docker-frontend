export default {
  // Test environment
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],

  // Module name mapping for imports
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "jest-transform-stub",
  },

  // Transform files
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
      },
    ],
  },

  // File extensions to consider
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],

  // Test match patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)",
    "<rootDir>/src/**/?(*.)(test|spec).(js|jsx|ts|tsx)",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/test/**",
    "!src/**/__tests__/**",
    "!src/**/*.test.*",
    "!src/**/*.spec.*",
    "!src/main.jsx",
    "!src/vite-env.d.ts",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html"],

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/e2e/",
  ],

  // Module directories
  moduleDirectories: ["node_modules", "<rootDir>/src"],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Error on deprecated features
  errorOnDeprecated: true,

  // Fail fast
  bail: false,

  // Max workers
  maxWorkers: "50%",
};
