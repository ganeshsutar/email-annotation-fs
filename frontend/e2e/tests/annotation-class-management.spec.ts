import { test, expect } from "@playwright/test";
import { TestRole, getCredentials, loginViaUI } from "../fixtures/auth";

const uniqueSuffix = () => Date.now().toString(36);

test.describe("Annotation Class Management", () => {
  // ────────────────────────────────────────────────────────────────────────
  // 3.1 Annotation Classes List
  // ────────────────────────────────────────────────────────────────────────
  test.describe("3.1 Annotation Classes List", () => {
    test.beforeEach(async ({ page }) => {
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(page, creds.email, creds.password);
      await page.waitForURL("**/admin/dashboard");
      await page.goto("/admin/annotation-classes");
      await page.waitForSelector('[data-testid="annotation-classes-table"]');
    });

    test("3.1.1 — Page renders with table columns", async ({ page }) => {
      await expect(
        page.getByTestId("annotation-classes-page"),
      ).toBeVisible();
      await expect(
        page.getByTestId("annotation-classes-table"),
      ).toBeVisible();

      const headers = page
        .getByTestId("annotation-classes-table")
        .locator("thead th");
      await expect(headers).toContainText([
        "Color",
        "Display Label",
        "Name",
        "Description",
        "Actions",
      ]);
    });

    test("3.1.2 — Color swatches displayed", async ({ page }) => {
      const swatches = page.getByTestId("class-color-swatch");
      const count = await swatches.count();

      if (count > 0) {
        // Each swatch should have a background color style
        for (let i = 0; i < count; i++) {
          const bgColor = await swatches
            .nth(i)
            .evaluate(
              (el) => (el as HTMLElement).style.backgroundColor,
            );
          expect(bgColor).toBeTruthy();
        }
      }
    });

    test("3.1.3 — Sorted display (by display_label)", async ({ page }) => {
      const rows = page
        .getByTestId("annotation-classes-table")
        .locator("tbody tr");
      const count = await rows.count();

      if (count > 1) {
        const labels: string[] = [];
        for (let i = 0; i < count; i++) {
          // Display Label is the second column (index 1)
          const label = await rows
            .nth(i)
            .locator("td")
            .nth(1)
            .textContent();
          labels.push((label ?? "").trim().toLowerCase());
        }
        const sorted = [...labels].sort();
        expect(labels).toEqual(sorted);
      }
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 3.2 Create Annotation Class
  // ────────────────────────────────────────────────────────────────────────
  test.describe("3.2 Create Annotation Class", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const testLabel = `E2E Test Create ${suffix}`;
    const testName = `e2e_test_create_${suffix}`;

    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/annotation-classes");
      await sharedPage.waitForSelector(
        '[data-testid="annotation-classes-table"]',
      );
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("3.2.1 — Open create dialog", async () => {
      await sharedPage.getByTestId("add-class-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-label-input"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-name-input"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-color-input"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-description-input"),
      ).toBeVisible();
      // Close dialog for next test
      await sharedPage.getByTestId("class-form-cancel").click();
    });

    test("3.2.2 — Auto-generated name from label", async () => {
      await sharedPage.getByTestId("add-class-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await sharedPage
        .getByTestId("class-label-input")
        .fill("Account Number");
      await expect(sharedPage.getByTestId("class-name-input")).toHaveValue(
        "account_number",
      );

      await sharedPage.getByTestId("class-form-cancel").click();
    });

    test("3.2.3 — Create class successfully", async () => {
      await sharedPage.getByTestId("add-class-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await sharedPage.getByTestId("class-label-input").fill(testLabel);
      // Verify auto-generated name
      await expect(sharedPage.getByTestId("class-name-input")).toHaveValue(
        testName,
      );

      await sharedPage.getByTestId("class-color-input").fill("#3182CE");
      await sharedPage
        .getByTestId("class-description-input")
        .fill("E2E test class description");
      await sharedPage.getByTestId("class-form-submit").click();

      // Dialog should close after successful creation
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();

      // Wait for table to refresh
      await sharedPage.waitForTimeout(500);

      // Verify class appears in table
      await expect(
        sharedPage.getByTestId("annotation-classes-table"),
      ).toContainText(testLabel);
    });

    test("3.2.4 — Duplicate name rejected", async () => {
      await sharedPage.getByTestId("add-class-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      // Use a different label but manually set the same name
      await sharedPage
        .getByTestId("class-label-input")
        .fill("Different Label");
      await sharedPage.getByTestId("class-name-input").fill("");
      await sharedPage.getByTestId("class-name-input").fill(testName);
      await sharedPage.getByTestId("class-form-submit").click();

      // Should show error
      await expect(
        sharedPage.getByTestId("class-form-error"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-form-error"),
      ).toContainText("name already exists");

      await sharedPage.getByTestId("class-form-cancel").click();
    });

    test("3.2.5 — Duplicate label rejected", async () => {
      await sharedPage.getByTestId("add-class-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      // Use the same label as the class we created in 3.2.3
      await sharedPage.getByTestId("class-label-input").fill(testLabel);
      // Change the name to something unique so only the label triggers the error
      await sharedPage.getByTestId("class-name-input").fill("");
      await sharedPage
        .getByTestId("class-name-input")
        .fill(`e2e_test_dup_label_${suffix}`);
      await sharedPage.getByTestId("class-form-submit").click();

      // Should show error about duplicate label
      await expect(
        sharedPage.getByTestId("class-form-error"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-form-error"),
      ).toContainText("display label already exists");

      await sharedPage.getByTestId("class-form-cancel").click();
    });

    test("3.2.6 — Invalid name format rejected", async () => {
      await sharedPage.getByTestId("add-class-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await sharedPage
        .getByTestId("class-label-input")
        .fill("Invalid Name Test");
      // Clear auto-generated name and type invalid one
      await sharedPage.getByTestId("class-name-input").fill("");
      await sharedPage.getByTestId("class-name-input").fill("123-invalid");
      await sharedPage.getByTestId("class-form-submit").click();

      // Should show error about invalid name format
      await expect(
        sharedPage.getByTestId("class-form-error"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-form-error"),
      ).toContainText("lowercase letter");

      await sharedPage.getByTestId("class-form-cancel").click();
    });

    test("3.2.7 — Cancel create", async () => {
      await sharedPage.getByTestId("add-class-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await sharedPage
        .getByTestId("class-label-input")
        .fill("Cancel Test Class");
      await sharedPage.getByTestId("class-form-cancel").click();

      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();

      // Verify class was NOT created
      await sharedPage.waitForTimeout(300);
      const table = sharedPage.getByTestId("annotation-classes-table");
      await expect(table).not.toContainText("Cancel Test Class");
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 3.3 Edit Annotation Class
  // ────────────────────────────────────────────────────────────────────────
  test.describe("3.3 Edit Annotation Class", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const editLabel = `E2E Test Edit ${suffix}`;
    const editName = `e2e_test_edit_${suffix}`;
    const updatedLabel = `E2E Edited ${suffix}`;

    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/annotation-classes");
      await sharedPage.waitForSelector(
        '[data-testid="annotation-classes-table"]',
      );

      // Create a class to edit
      await sharedPage.getByTestId("add-class-button").click();
      await sharedPage.waitForSelector('[data-testid="class-form-dialog"]');
      await sharedPage.getByTestId("class-label-input").fill(editLabel);
      await sharedPage.getByTestId("class-name-input").fill("");
      await sharedPage.getByTestId("class-name-input").fill(editName);
      await sharedPage.getByTestId("class-color-input").fill("#E53E3E");
      await sharedPage
        .getByTestId("class-description-input")
        .fill("Original description");
      await sharedPage.getByTestId("class-form-submit").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();
      await sharedPage.waitForTimeout(500);
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("3.3.1 — Open edit dialog (pre-filled)", async () => {
      // Find the row with our test class and click edit
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: editLabel });
      await row.getByTestId("class-edit-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      // Verify pre-filled values
      await expect(sharedPage.getByTestId("class-label-input")).toHaveValue(
        editLabel,
      );
      await expect(sharedPage.getByTestId("class-name-input")).toHaveValue(
        editName,
      );

      await sharedPage.getByTestId("class-form-cancel").click();
    });

    test("3.3.2 — Name is immutable (disabled)", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: editLabel });
      await row.getByTestId("class-edit-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await expect(
        sharedPage.getByTestId("class-name-input"),
      ).toBeDisabled();

      await sharedPage.getByTestId("class-form-cancel").click();
    });

    test("3.3.3 — Edit label", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: editLabel });
      await row.getByTestId("class-edit-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await sharedPage.getByTestId("class-label-input").fill("");
      await sharedPage.getByTestId("class-label-input").fill(updatedLabel);
      await sharedPage.getByTestId("class-form-submit").click();

      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();

      // Verify label updated in table
      await sharedPage.waitForTimeout(500);
      await expect(
        sharedPage.getByTestId("annotation-classes-table"),
      ).toContainText(updatedLabel);
    });

    test("3.3.4 — Edit color", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: updatedLabel });
      await row.getByTestId("class-edit-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await sharedPage.getByTestId("class-color-input").fill("#00FF00");
      await sharedPage.getByTestId("class-form-submit").click();

      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();
      await sharedPage.waitForTimeout(500);

      // Verify the color swatch changed
      const updatedRow = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: updatedLabel });
      const swatch = updatedRow.getByTestId("class-color-swatch");
      const bgColor = await swatch.evaluate(
        (el: HTMLElement) => el.style.backgroundColor,
      );
      // #00FF00 normalizes to rgb(0, 255, 0)
      expect(bgColor).toBe("rgb(0, 255, 0)");
    });

    test("3.3.5 — Edit description", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: updatedLabel });
      await row.getByTestId("class-edit-button").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).toBeVisible();

      await sharedPage.getByTestId("class-description-input").fill("");
      await sharedPage
        .getByTestId("class-description-input")
        .fill("Updated description");
      await sharedPage.getByTestId("class-form-submit").click();

      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();
      await sharedPage.waitForTimeout(500);

      // Verify description updated in table
      await expect(
        sharedPage
          .getByTestId("annotation-classes-table")
          .locator("tbody tr", { hasText: updatedLabel }),
      ).toContainText("Updated description");
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 3.4 Delete Annotation Class
  // ────────────────────────────────────────────────────────────────────────
  test.describe("3.4 Delete Annotation Class", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const deleteLabel = `E2E Test Delete ${suffix}`;
    const deleteName = `e2e_test_delete_${suffix}`;
    const deleteLabel2 = `E2E Test Del2 ${suffix}`;
    const deleteName2 = `e2e_test_del2_${suffix}`;

    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/annotation-classes");
      await sharedPage.waitForSelector(
        '[data-testid="annotation-classes-table"]',
      );

      // Create first class to delete
      await sharedPage.getByTestId("add-class-button").click();
      await sharedPage.waitForSelector('[data-testid="class-form-dialog"]');
      await sharedPage.getByTestId("class-label-input").fill(deleteLabel);
      await sharedPage.getByTestId("class-name-input").fill("");
      await sharedPage.getByTestId("class-name-input").fill(deleteName);
      await sharedPage.getByTestId("class-form-submit").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();
      await sharedPage.waitForTimeout(500);

      // Create second class for the confirm-delete test
      await sharedPage.getByTestId("add-class-button").click();
      await sharedPage.waitForSelector('[data-testid="class-form-dialog"]');
      await sharedPage.getByTestId("class-label-input").fill(deleteLabel2);
      await sharedPage.getByTestId("class-name-input").fill("");
      await sharedPage.getByTestId("class-name-input").fill(deleteName2);
      await sharedPage.getByTestId("class-form-submit").click();
      await expect(
        sharedPage.getByTestId("class-form-dialog"),
      ).not.toBeVisible();
      await sharedPage.waitForTimeout(500);
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("3.4.4 — Delete unused class (shows 0 usage)", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: deleteLabel });
      await row.getByTestId("class-delete-button").click();

      await expect(
        sharedPage.getByTestId("class-delete-dialog"),
      ).toBeVisible();

      // Verify usage count shows 0
      await expect(
        sharedPage.getByTestId("class-usage-count"),
      ).toContainText("0");

      // Cancel — we'll delete in a later test
      await sharedPage.getByTestId("class-delete-cancel").click();
      await expect(
        sharedPage.getByTestId("class-delete-dialog"),
      ).not.toBeVisible();
    });

    test("3.4.1 — Delete shows usage dialog", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: deleteLabel2 });
      await row.getByTestId("class-delete-button").click();

      // Verify delete dialog opens with usage count
      await expect(
        sharedPage.getByTestId("class-delete-dialog"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("class-usage-count"),
      ).toBeVisible();

      await sharedPage.getByTestId("class-delete-cancel").click();
    });

    test("3.4.3 — Cancel delete", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: deleteLabel });
      await row.getByTestId("class-delete-button").click();
      await expect(
        sharedPage.getByTestId("class-delete-dialog"),
      ).toBeVisible();

      await sharedPage.getByTestId("class-delete-cancel").click();
      await expect(
        sharedPage.getByTestId("class-delete-dialog"),
      ).not.toBeVisible();

      // Class should still be in the table
      await expect(
        sharedPage.getByTestId("annotation-classes-table"),
      ).toContainText(deleteLabel);
    });

    test("3.4.2 — Confirm delete (soft)", async () => {
      const row = sharedPage
        .getByTestId("annotation-classes-table")
        .locator("tbody tr", { hasText: deleteLabel });
      await row.getByTestId("class-delete-button").click();
      await expect(
        sharedPage.getByTestId("class-delete-dialog"),
      ).toBeVisible();

      await sharedPage.getByTestId("class-delete-confirm").click();

      // Dialog should close
      await expect(
        sharedPage.getByTestId("class-delete-dialog"),
      ).not.toBeVisible();

      // Wait for table to refresh
      await sharedPage.waitForTimeout(500);

      // Class should no longer appear in table
      await expect(
        sharedPage.getByTestId("annotation-classes-table"),
      ).not.toContainText(deleteLabel);
    });

    test("3.1.4 — Deleted classes hidden", async () => {
      // Reload the page to confirm soft-deleted class stays hidden
      await sharedPage.reload();
      await sharedPage.waitForSelector(
        '[data-testid="annotation-classes-table"]',
      );

      // The first deleted class should not appear
      await expect(
        sharedPage.getByTestId("annotation-classes-table"),
      ).not.toContainText(deleteName);
    });
  });
});
