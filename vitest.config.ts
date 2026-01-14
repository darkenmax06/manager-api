import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/**/*.test.ts'],
    globalSetup: ['src/vitest.setup.ts'],
    testTimeout: 10000
  },
})