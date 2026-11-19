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
    await expect(page.locator("[role='alert']")).not.toBeVisible();
  });

  // ── 2. Full checkout cycle ─────────────────────────────────────────────────
  test("2. full checkout cycle with new customer", async ({ page }) => {
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

    // Navigate to checkout
    await page.goto(`${BASE}/ar/checkout`);
    await expect(page.getByRole("heading", { name: /عنوان الشحن/i })).toBeVisible({ timeout: 10_000 });

    // Add shipping address if the form is showing (new customer with no addresses)
    const saveAddrBtn = page.getByRole("button", { name: "حفظ العنوان" });
    if (await saveAddrBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await page.getByPlaceholder("الاسم الكامل").fill("تجربة مستخدم");
      await page.getByPlaceholder("رقم الهاتف").fill("01000000000");
      await page.getByPlaceholder("العنوان (السطر الأول)").fill("شارع التحرير 1");
      await page.getByPlaceholder("المدينة").fill("القاهرة");
      await page.getByPlaceholder("المحافظة").fill("القاهرة");
      await page.getByPlaceholder("الرمز البريدي").fill("12345");
      await saveAddrBtn.click();
      await expect(page.locator("input[name='address']").first()).toBeVisible({ timeout: 10_000 });
    } else {
      const firstAddressRadio = page.locator("input[name='address']").first();
      if (await firstAddressRadio.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await firstAddressRadio.check();
      }
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
    await page.waitForLoadState("networkidle");

    // Update first name (first text input in the profile form)
    const firstNameInput = page.locator("input[type='text']").first();
    await firstNameInput.clear();
    await firstNameInput.fill("محدّث");

    // Submit profile form (first submit button)
    const saveBtn = page.locator("button[type='submit']").first();
    await saveBtn.click();

    // Assert success message
    await expect(page.locator("p").filter({ hasText: /تم حفظ|saved successfully/i }).first()).toBeVisible({ timeout: 8_000 });
  });
});
