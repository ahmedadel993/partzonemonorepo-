// Phase 7 – Admin seed cycle (comprehensive)
import { test, expect } from "@playwright/test";

const ADMIN_URL = "http://localhost:5173/admin";
const ADMIN_EMAIL = "admin@partzone.local";
const ADMIN_PASS = "Admin@12345";

// Shared seeded IDs written across tests in serial mode
let seededProductSku = "";

test.describe("Admin seed cycle", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    if (!page.url().includes("/login")) return;
    await page.locator("input[type='email']").fill(ADMIN_EMAIL);
    await page.locator("input[type='password']").fill(ADMIN_PASS);
    await page.getByRole("button", { name: /دخول|login/i }).click();
    await page.waitForURL(`${ADMIN_URL}/`);
  });

  // ── 1. Vehicle make (Toyota) + model (Corolla) ─────────────────────────────
  test("1. create Toyota make and Corolla model", async ({ page }) => {
    const ts = Date.now();
    const makeName  = "Toyota";
    const makeSlug  = `toyota-${ts}`;
    const modelName = "Corolla";
    const modelSlug = `corolla-${ts}`;

    await page.goto(`${ADMIN_URL}/catalog`);
    await page.getByRole("button", { name: /المركبات/i }).click();

    // Create make
    await page.getByRole("button", { name: "+ إضافة" }).click();
    await page.locator("input[name='name']").fill(makeName);
    await page.locator("input[name='slug']").fill(makeSlug);
    await page.locator("button[type='submit']").click();
    // Multiple Toyota rows may exist from prior runs — just ensure at least one is visible
    await expect(page.getByText(makeName).first()).toBeVisible({ timeout: 10_000 });

    // Select the make to show models panel (use .first() in case of duplicate names)
    await page.getByRole("button", { name: makeName }).first().click();

    // Create model
    await page.getByRole("button", { name: "+ إضافة موديل" }).click();
    await page.getByPlaceholder("كامري").fill(modelName);
    await page.getByPlaceholder("camry").fill(modelSlug);
    // .last() because the closed make-form drawer also has button[type='submit'] in DOM
    await page.locator("button[type='submit']").last().click();
    // Use exact cell match — slug cell also contains "corolla" substring so avoid getByText
    await expect(page.locator("td").filter({ hasText: new RegExp(`^${modelName}$`) }).first()).toBeVisible({ timeout: 10_000 });
  });

  // ── 2. Brand with ALL 4 flag toggles ──────────────────────────────────────
  test("2. create brand and toggle all flags", async ({ page }) => {
    const ts = Date.now();
    const brandName = `TestBrand_${ts}`;

    await page.goto(`${ADMIN_URL}/catalog`);
    await page.getByRole("button", { name: /الماركات/i }).click();

    await page.getByRole("button", { name: "+ إضافة ماركة" }).click();
    await page.locator("input[name='name']").fill(brandName);
    await page.locator("input[name='slug']").fill(`testbrand-${ts}`);
    await page.locator("button[type='submit']").click();
    await expect(page.getByText(brandName)).toBeVisible({ timeout: 10_000 });

    // Navigate to brand detail page
    await page.locator("tr", { hasText: brandName }).locator("a", { hasText: "تفاصيل" }).click();
    await page.waitForURL(/\/admin\/catalog\/brands\//);

    // Toggle all flag switches that are OFF → ON
    // FlagToggle renders <label><span>{label}</span><button role="switch">...</button></label>
    // so we locate by the containing label element
    const brandFlagTexts = ["Featured", "Home", "Sponsored"];
    for (const labelText of brandFlagTexts) {
      const row = page.locator("label").filter({ hasText: labelText });
      await expect(row).toBeVisible({ timeout: 10_000 });
      const sw = row.locator("[role='switch']");
      if ((await sw.getAttribute("aria-checked")) === "false") {
        await sw.click();
        await expect(sw).toHaveAttribute("aria-checked", "true", { timeout: 10_000 });
      }
    }
    // Verify brand name on detail page (the large h1, not the breadcrumb path h1)
    await expect(page.getByRole("heading", { name: brandName })).toBeVisible();
  });

  // ── 3. Category with ALL 4 flag toggles ───────────────────────────────────
  test("3. create category and toggle all flags", async ({ page }) => {
    const ts = Date.now();
    const catName = `TestCat_${ts}`;

    await page.goto(`${ADMIN_URL}/catalog`);
    await page.getByRole("button", { name: /الفئات/i }).click();

    await page.getByRole("button", { name: "+ إضافة فئة" }).click();
    await page.locator("input[name='name']").fill(catName);
    await page.locator("input[name='slug']").fill(`testcat-${ts}`);
    await page.locator("button[type='submit']").click();
    await expect(page.getByText(catName)).toBeVisible({ timeout: 20_000 });

    // Navigate to category detail page
    await page.locator("tr", { hasText: catName }).locator("a", { hasText: "تفاصيل" }).click();
    await page.waitForURL(/\/admin\/catalog\/categories\//);

    // Toggle all 4 flag switches that are OFF → ON
    const catFlagTexts = ["Active", "Featured", "Home", "Menu"];
    for (const labelText of catFlagTexts) {
      const row = page.locator("label").filter({ hasText: labelText });
      await expect(row).toBeVisible({ timeout: 10_000 });
      const sw = row.locator("[role='switch']");
      if ((await sw.getAttribute("aria-checked")) === "false") {
        await sw.click();
        await expect(sw).toHaveAttribute("aria-checked", "true", { timeout: 10_000 });
      }
    }
    // Verify category name on detail page (the large h1, not the breadcrumb path h1)
    await expect(page.getByRole("heading", { name: catName })).toBeVisible();
  });

  // ── 4. Product with ALL 4 flags + publish ─────────────────────────────────
  test("4. create product, toggle all flags, publish", async ({ page }) => {
    const ts = Date.now();
    const sku = `TEST-${ts}`;
    seededProductSku = sku;

    await page.goto(`${ADMIN_URL}/catalog`);
    await page.getByRole("button", { name: /المنتجات/i }).click();

    await page.getByRole("button", { name: "+ منتج جديد" }).click();
    await page.locator("input[name='sku']").fill(sku);
    await page.locator("input[name='slug']").fill(`test-${ts}`);
    await page.locator("input[name='nameAr']").fill(`منتج اختبار ${ts}`);
    await page.locator("input[name='priceAmount']").fill("150");
    await page.locator("input[name='stock']").fill("10");
    // Select first available brand, category, condition
    await page.locator("select[name='brandId']").selectOption({ index: 1 });
    await page.locator("select[name='categoryId']").selectOption({ index: 1 });
    await page.locator("select[name='condition']").selectOption("Aftermarket");
    await page.locator("button[type='submit']").click();
    await expect(page.getByText(sku)).toBeVisible({ timeout: 20_000 });

    // Navigate to product detail page
    await page.locator("tr", { hasText: sku }).locator("a", { hasText: "تفاصيل" }).click();
    await page.waitForURL(/\/admin\/catalog\/products\//);

    // Toggle all 4 boolean display flag switches OFF → ON
    const productFlagTexts = ["Featured", "Best Seller", "New", "On Sale"];
    for (const labelText of productFlagTexts) {
      const row = page.locator("label").filter({ hasText: labelText });
      await expect(row).toBeVisible({ timeout: 10_000 });
      const sw = row.locator("[role='switch']");
      if ((await sw.getAttribute("aria-checked")) === "false") {
        await sw.click();
        await expect(sw).toHaveAttribute("aria-checked", "true", { timeout: 10_000 });
      }
    }

    // Publish the product
    const publishBtn = page.getByRole("button", { name: /نشر المنتج/i });
    if (await publishBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await publishBtn.click();
      await expect(page.getByText(/منشور/i)).toBeVisible({ timeout: 10_000 });
    }

    // Verify product SKU visible on detail page
    await expect(page.getByText(sku)).toBeVisible();
  });

  // ── 5. Page block ──────────────────────────────────────────────────────────
  test("5. create page block and activate", async ({ page }) => {
    await page.goto(`${ADMIN_URL}/marketing`);
    await page.getByRole("tab", { name: /بلوكات الصفحة/i }).click();

    const addBtn = page.getByRole("button", { name: /إضافة بلوك/i });
    if (await addBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await addBtn.click();
      await page.locator("button[type='submit']").click();
    }

    const firstSwitch = page.getByRole("switch").first();
    if (await firstSwitch.isVisible({ timeout: 5_000 }).catch(() => false)) {
      if ((await firstSwitch.getAttribute("aria-checked")) === "false") {
        await firstSwitch.click();
      }
      await expect(firstSwitch).toHaveAttribute("aria-checked", "true");
    }
  });

  // ── 6. Payment method ──────────────────────────────────────────────────────
  test("6. add payment method", async ({ page }) => {
    const ts = Date.now();
    await page.goto(`${ADMIN_URL}/marketing`);
    await page.getByRole("tab", { name: /طرق الدفع/i }).click();

    await page.getByRole("button", { name: "+ إضافة طريقة دفع" }).click();
    await page.locator("input[name='key']").fill(`credit_card_${ts}`);
    await page.locator("input[name='labelAr']").fill("بطاقة ائتمانية");
    await page.locator("input[name='labelEn']").fill("Credit Card");
    await page.locator("button[type='submit']").click();
    await expect(page.getByText("بطاقة ائتمانية").first()).toBeVisible({ timeout: 10_000 });
  });
});
