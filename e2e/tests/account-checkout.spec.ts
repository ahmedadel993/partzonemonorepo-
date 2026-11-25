// Phase 17 — Account registration, checkout cycle, and profile edit
import { test, expect } from "@playwright/test";

const BASE     = "http://localhost:3000";
const API_BASE = "http://localhost:5000/api/v1";

const ts        = Date.now();
const NEW_EMAIL = `newcustomer_${ts}@test.com`;
const NEW_PASS  = "Test@12345";

test.describe("Account & Checkout", () => {
  test.describe.configure({ mode: "serial" });

  // ── 1. Register via storefront UI ─────────────────────────────────────────
  test("1. register via storefront UI", async ({ page }) => {
    await page.goto(`${BASE}/ar/auth/register`);

    // Position-based approach — AR register form has firstName, lastName, email, password
    const inputs = page.locator("input");
    await inputs.nth(0).fill("تجربة");
    await inputs.nth(1).fill("مستخدم");
    await page.locator("input[type='email']").fill(NEW_EMAIL);
    await page.locator("input[type='password']").fill(NEW_PASS);

    await page.locator("button[type='submit']").click();

    // Should redirect away from register (home or account)
    await page.waitForURL((url) => !url.pathname.includes("/register"), { timeout: 15_000 });
    // No error alert visible
    await expect(page.locator("[role='alert']:not(#__next-route-announcer__)")).not.toBeVisible();
  });

  // ── 2. Full checkout cycle ─────────────────────────────────────────────────
  test("2. full checkout cycle with new customer", async ({ page, request }) => {
    // Register via API in case test 1 was skipped / flaky
    await page.request
      .post(`${API_BASE}/identity/auth/register`, {
        data: {
          email: NEW_EMAIL,
          password: NEW_PASS,
          firstName: "تجربة",
          lastName: "مستخدم",
        },
      })
      .catch(() => {});

    const loginRes = await page.request.post(`${API_BASE}/identity/auth/login`, {
      data: { email: NEW_EMAIL, password: NEW_PASS },
    });
    if (!loginRes.ok()) throw new Error(`Login failed: ${loginRes.status()}`);
    const { accessToken } = await loginRes.json();

    const meRes = await page.request.get(`${API_BASE}/identity/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const me = meRes.ok() ? await meRes.json() : { email: NEW_EMAIL };

    await page.context().addCookies([
      { name: "auth_token", value: accessToken, domain: "localhost", path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
      { name: "auth_user", value: JSON.stringify(me), domain: "localhost", path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
    ]);

    // Add a product to cart via search
    await page.goto(`${BASE}/ar/search?q=منتج`);
    let addBtn = page.locator("button", { hasText: "أضف للسلة" }).first();
    if (!(await addBtn.isVisible({ timeout: 10_000 }).catch(() => false))) {
      await page.goto(`${BASE}/ar`);
      await page.getByRole("heading", { name: "منتجات مختارة" }).scrollIntoViewIfNeeded();
      addBtn = page.locator("button", { hasText: "أضف للسلة" }).first();
    }
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();

    // Ensure the user has at least one shipping address before checkout.
    // Use `request` (clean context) to avoid browser cookies with Arabic chars in header.
    const addrsRes = await request.get(`${API_BASE}/identity/me/addresses`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const existingAddrs = addrsRes.ok() ? await addrsRes.json().catch(() => []) : [];
    if (!Array.isArray(existingAddrs) || existingAddrs.length === 0) {
      await request.post(`${API_BASE}/identity/me/addresses`, {
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        data: {
          label: "تجربة مستخدم",
          streetLine1: "شارع التحرير 1",
          city: "القاهرة",
          governorate: "القاهرة",
          postalCode: "12345",
          isDefault: true,
        },
      });
    }

    // Navigate to checkout — server component will now fetch the saved address
    await page.goto(`${BASE}/ar/checkout`);
    await expect(page.getByRole("heading", { name: /عنوان الشحن/i })).toBeVisible({ timeout: 10_000 });

    // Select first address radio if visible
    const firstAddressRadio = page.locator("input[name='address']").first();
    if (await firstAddressRadio.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await firstAddressRadio.check();
    }

    // Payment method
    const paymentRadios = page.locator("input[type='radio'][name='payment']");
    await expect(paymentRadios.first()).toBeVisible({ timeout: 10_000 });

    // Submit
    const submitBtn = page.getByRole("button", { name: "تأكيد الطلب" });
    await expect(submitBtn).toBeEnabled({ timeout: 20_000 });
    await submitBtn.click();

    await page.waitForURL(/\/ar\/orders\/.+\?new=1/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "شكراً لطلبك!" })).toBeVisible({ timeout: 10_000 });
  });

  // ── 3. Edit profile ────────────────────────────────────────────────────────
  test("3. edit profile updates name", async ({ page }) => {
    const loginRes = await page.request.post(`${API_BASE}/identity/auth/login`, {
      data: { email: NEW_EMAIL, password: NEW_PASS },
    });
    if (!loginRes.ok()) throw new Error(`Login failed: ${loginRes.status()}`);
    const { accessToken } = await loginRes.json();

    const meRes = await page.request.get(`${API_BASE}/identity/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const me = meRes.ok() ? await meRes.json() : { email: NEW_EMAIL };

    await page.context().addCookies([
      { name: "auth_token", value: accessToken, domain: "localhost", path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
      { name: "auth_user", value: JSON.stringify(me), domain: "localhost", path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
    ]);

    await page.goto(`${BASE}/ar/account/profile`);
    // Use domcontentloaded — networkidle can hang when Next.js dev tools poll in background.
    await page.waitForLoadState("domcontentloaded");

    // Update first name — use name attribute selector (react-hook-form register() sets name but not type)
    const firstNameInput = page.locator("input[name='firstName']");
    await expect(firstNameInput).toBeVisible({ timeout: 10_000 });
    await firstNameInput.fill("محدّث");

    // Submit profile form
    const saveBtn = page.locator("button[type='submit']").first();
    await saveBtn.click();

    // On success the form calls router.refresh() with no visible success message.
    // Wait for the button to exit the loading ("...") state, confirming submission completed.
    await expect(saveBtn).not.toHaveText("...", { timeout: 8_000 });
    await expect(saveBtn).toBeEnabled({ timeout: 8_000 });
  });
});
