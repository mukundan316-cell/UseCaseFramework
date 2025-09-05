// Jest setup file for global configuration
global.performance = performance || {
  now: () => Date.now()
};

// Mock console methods if needed for cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn()
// };