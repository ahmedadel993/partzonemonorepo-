// Phase 7 – E2E full cycle tests
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Admin seed runs first; storefront depends on it having seeded data
    {
      name: "admin-seed",
      testMatch: "**/admin-seed.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "storefront",
      testMatch: "**/storefront-journey.spec.ts",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["admin-seed"],
    },
    {
      name: "account-checkout",
      testMatch: "**/account-checkout.spec.ts",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["admin-seed"],
    },
  ],
  timeout: 90_000,
});
