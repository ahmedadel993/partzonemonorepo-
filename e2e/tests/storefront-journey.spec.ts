// Phase 7 – Storefront journey: home swipers → cart → full checkout cycle
import { test, expect, request } from "@playwright/test";

const BASE       = "http://localhost:3000";
const API_BASE   = "http://localhost:5000/api/v1";
const USER_EMAIL = "customer@partzone.local";
const USER_PASS  = "Customer@12345";

test.describe("Storefront journey", () => {
  test.describe.configure({ mode: "serial" });

  // ── 0. Ensure customer account exists (runs once before all tests) ─────────
  test.beforeAll(async () => {
    const ctx = await request.newContext();
    // Try to register; ignore failure (user may already exist)
    await ctx.post(`${API_BASE}/identity/auth/register`, {
      data: {
        email: USER_EMAIL,
        password: USER_PASS,
        firstName: "Test",
        lastName: "Customer",
      },
    }).catch(() => {});
    await ctx.dispose();
  });

  // ── Login helper: inject auth cookies directly (bypasses UI form timing issues) ─
  test.beforeEach(async ({ page }) => {
    // 1. Get token from backend API
    const loginRes = await page.request.post(`${API_BASE}/identity/auth/login`, {
      data: { email: USER_EMAIL, password: USER_PASS },
    });
    if (!loginRes.ok()) throw new Error(`Login failed: ${loginRes.status()} ${await loginRes.text()}`);
    const { accessToken } = await loginRes.json();

    // 2. Get user profile
    const meRes = await page.request.get(`${API_BASE}/identity/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const me = meRes.ok() ? await meRes.json() : { email: USER_EMAIL };

    // 3. Inject cookies directly into browser context — same attributes the server sets
    await page.context().addCookies([
      { name: "auth_token", value: accessToken, domain: "localhost", path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
      { name: "auth_user", value: JSON.stringify(me), domain: "localhost", path: "/", httpOnly: true, secure: false, sameSite: "Lax" },
    ]);

    // 4. Navigate to home so server components can read the cookies on first load
    await page.goto(`${BASE}/ar`);
  });

  // ── 1. Home page shows all 4 swiper sections ───────────────────────────────
  // (admin-seed project already seeded a product with all 4 flags enabled)
  test("1. home page shows swiper sections", async ({ page }) => {
    await page.goto(`${BASE}/ar`);

    const swiperHeadings = [
      "منتجات مختارة",
      "الأكثر مبيعاً",
      "وصل حديثاً",
      "عروض وتخفيضات",
    ];

    for (const heading of swiperHeadings) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible({ timeout: 15_000 });
    }
  });

  // ── 2. Product card has add-to-cart button (in-stock products) ───────────
  test("2. product card shows add-to-cart button for in-stock items", async ({ page }) => {
    await page.goto(`${BASE}/ar`);

    // Scroll the featured swiper into view to trigger IntersectionObserver
    // (ProductCard starts opacity-0 until scrolled into viewport)
    const swiperHeading = page.getByRole("heading", { name: "منتجات مختارة" });
    await expect(swiperHeading).toBeVisible({ timeout: 15_000 });
    await swiperHeading.scrollIntoViewIfNeeded();

    // After scroll, card opacity-0 → opacity-100; find the "أضف للسلة" button by text
    // (not getByRole — aria-label overrides accessible name)
    const addBtn = page.locator("button", { hasText: "أضف للسلة" }).first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });

    // The hover overlay div should also be in DOM for in-stock cards
    const inStockCard = addBtn.locator("xpath=ancestor::div[contains(@class,'group')]").first();
    await inStockCard.hover();
    const overlay = inStockCard.locator("div.absolute.inset-0");
    await expect(overlay).toBeAttached();
  });

  // ── 3. Add product to cart and verify cart drawer ─────────────────────────
  test("3. add product to cart and open cart drawer", async ({ page }) => {
    // Search for the seeded product (admin-seed created "منتج اختبار {ts}")
    await page.goto(`${BASE}/ar/search?q=منتج`);

    // Wait for search results to appear; scroll to trigger IntersectionObserver
    const firstCard = page.locator(".group").first();
    if (!(await firstCard.isVisible({ timeout: 10_000 }).catch(() => false))) {
      // Fallback: browse home swipers
      await page.goto(`${BASE}/ar`);
      await page.getByRole("heading", { name: "منتجات مختارة" }).scrollIntoViewIfNeeded();
    }
    // Click the first "أضف للسلة" button (use hasText, not getByRole — aria-label differs)
    const addBtn = page.locator("button", { hasText: "أضف للسلة" }).first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();

    // After successful add, button briefly shows "✓ تمت الإضافة"
    // This confirms addToCart succeeded (null → redirect to login, so this never shows on failure)
    await expect(page.locator("button", { hasText: "تمت الإضافة" })).toBeVisible({ timeout: 10_000 });
    // Cart drawer: role="dialog" aria-label="سلة المشتريات" (use first() in case of duplicate renders)
    const cartDrawer = page.getByRole("dialog", { name: /سلة/ }).first();
    await expect(cartDrawer).toBeInViewport({ timeout: 10_000 });
  });

  // ── 4. Full checkout cycle ─────────────────────────────────────────────────
  test("4. full checkout cycle places order successfully", async ({ page }) => {
    // 4a. Add a product to cart — search for seeded product then click add-to-cart
    await page.goto(`${BASE}/ar/search?q=منتج`);
    let addBtn = page.locator("button", { hasText: "أضف للسلة" }).first();
    if (!(await addBtn.isVisible({ timeout: 10_000 }).catch(() => false))) {
      // Fallback via home swipers
      await page.goto(`${BASE}/ar`);
      await page.getByRole("heading", { name: "منتجات مختارة" }).scrollIntoViewIfNeeded();
      addBtn = page.locator("button", { hasText: "أضف للسلة" }).first();
    }
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();
    // Wait for server action to complete before navigating away
    await expect(page.locator("button", { hasText: "تمت الإضافة" })).toBeVisible({ timeout: 10_000 });

    // 4b. Ensure user has a shipping address before navigating to checkout.
    // We retrieve the token from the cookie to call the API directly — this is more
    // reliable than filling the client-side form (which requires a live server action round-trip).
    const loginRes2 = await page.request.post(`${API_BASE}/identity/auth/login`, {
      data: { email: USER_EMAIL, password: USER_PASS },
    });
    if (loginRes2.ok()) {
      const { accessToken: token2 } = await loginRes2.json();
      const addrsRes = await page.request.get(`${API_BASE}/identity/me/addresses`, {
        headers: { Authorization: `Bearer ${token2}` },
      });
      const existingAddrs = addrsRes.ok() ? await addrsRes.json().catch(() => []) : [];
      if (!Array.isArray(existingAddrs) || existingAddrs.length === 0) {
        await page.request.post(`${API_BASE}/identity/me/addresses`, {
          headers: { Authorization: `Bearer ${token2}`, "Content-Type": "application/json" },
          data: {
            label: "Test Customer",
            streetLine1: "123 Test Street",
            city: "Cairo",
            governorate: "Cairo",
            postalCode: "12345",
            isDefault: true,
          },
        });
      }
    }

    // 4c. Navigate to checkout — server component will now fetch the saved address
    await page.goto(`${BASE}/ar/checkout`);
    await expect(page.getByRole("heading", { name: /عنوان الشحن/i })).toBeVisible({ timeout: 10_000 });

    // 4d. Select first address radio if visible (triggers onSelect which also sets shippingAddress)
    const firstAddressRadio = page.locator("input[name='address']").first();
    if (await firstAddressRadio.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await firstAddressRadio.check();
    }

    // 4e. Payment method — verify at least one radio is visible and auto-selected
    const paymentRadios = page.locator("input[type='radio'][name='payment']");
    await expect(paymentRadios.first()).toBeVisible({ timeout: 10_000 });

    // 4f. Submit checkout — wait for cart to hydrate (getCart() async useEffect)
    const submitBtn = page.getByRole("button", { name: "تأكيد الطلب" });
    await expect(submitBtn).toBeEnabled({ timeout: 20_000 });
    await submitBtn.click();

    // 4g. Assert redirect to order confirmation page with success message
    await page.waitForURL(/\/ar\/orders\/.+\?new=1/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "شكراً لطلبك!" })).toBeVisible({ timeout: 10_000 });
  });

  // ── 5. Dynamic payment methods rendered in checkout ────────────────────────
  test("5. checkout shows dynamic payment methods from backend", async ({ page }) => {
    await page.goto(`${BASE}/ar/checkout`);

    const radios = page.locator("input[type='radio'][name='payment']");
    await expect(radios.first()).toBeVisible({ timeout: 10_000 });

    const count = await radios.count();
    expect(count).toBeGreaterThanOrEqual(1);
    console.log(`Payment method options found: ${count}`);
  });
});
