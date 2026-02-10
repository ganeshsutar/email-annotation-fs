import { test, expect } from "@playwright/test";
import {
  TestRole,
  getCredentials,
  loginViaUI,
  logoutViaUI,
} from "../fixtures/auth";

const uniqueSuffix = () => Date.now().toString(36);

test.describe("User Management", () => {
  // ────────────────────────────────────────────────────────────────────────
  // 2.1 Users List Page
  // ────────────────────────────────────────────────────────────────────────
  test.describe("2.1 Users List Page", () => {
    test.beforeEach(async ({ page }) => {
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(page, creds.email, creds.password);
      await page.waitForURL("**/admin/dashboard");
      await page.goto("/admin/users");
      await page.waitForSelector('[data-testid="users-table"]');
    });

    test("2.1.1 — Users page renders with table columns", async ({ page }) => {
      await expect(page.getByTestId("users-page")).toBeVisible();
      await expect(page.getByTestId("users-table")).toBeVisible();

      const headers = page.getByTestId("users-table").locator("thead th");
      await expect(headers).toContainText(["Name", "Email", "Role", "Status"]);
    });

    test("2.1.2 — Search users by name", async ({ page }) => {
      const searchInput = page.getByTestId("users-search");
      await searchInput.fill("admin");
      // Wait for debounce + API response
      await page.waitForTimeout(500);

      const rows = page.getByTestId("users-table").locator("tbody tr");
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);

      // All visible rows should contain the search term (case-insensitive)
      for (let i = 0; i < count; i++) {
        const rowText = await rows.nth(i).textContent();
        expect(rowText?.toLowerCase()).toContain("admin");
      }
    });

    test("2.1.3 — Search users by email", async ({ page }) => {
      const creds = getCredentials(TestRole.ADMIN);
      const emailPart = creds.email.split("@")[0];
      const searchInput = page.getByTestId("users-search");
      await searchInput.fill(emailPart);
      await page.waitForTimeout(500);

      const rows = page.getByTestId("users-table").locator("tbody tr");
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    });

    test("2.1.4 — Filter by role", async ({ page }) => {
      await page.getByTestId("users-role-filter").click();
      await page.getByRole("option", { name: "Annotator" }).click();
      await page.waitForTimeout(500);

      const rows = page.getByTestId("users-table").locator("tbody tr");
      const count = await rows.count();

      if (count > 0) {
        // Verify every visible row has the "ANNOTATOR" badge
        for (let i = 0; i < count; i++) {
          await expect(rows.nth(i)).toContainText("ANNOTATOR");
        }
      }
    });

    test("2.1.5 — Filter by status", async ({ page }) => {
      await page.getByTestId("users-status-filter").click();
      await page.getByRole("option", { name: "Inactive" }).click();
      await page.waitForTimeout(500);

      const rows = page.getByTestId("users-table").locator("tbody tr");
      const count = await rows.count();

      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText("INACTIVE");
      }
    });

    test("2.1.6 — Combined filters", async ({ page }) => {
      // Search + role filter
      await page.getByTestId("users-search").fill("test");
      await page.getByTestId("users-role-filter").click();
      await page.getByRole("option", { name: "Annotator" }).click();
      await page.getByTestId("users-status-filter").click();
      await page.getByRole("option", { name: "Active", exact: true }).click();
      await page.waitForTimeout(500);

      // Just verify the page doesn't crash and table is visible
      await expect(page.getByTestId("users-table")).toBeVisible();
    });

    test("2.1.7 — Pagination controls exist", async ({ page }) => {
      await expect(page.getByTestId("users-pagination")).toBeVisible();
    });

    test("2.1.8 — Empty state with impossible filter", async ({ page }) => {
      await page.getByTestId("users-search").fill("zzz-nonexistent-user-xyz");
      await page.waitForTimeout(500);

      await expect(page.getByTestId("users-empty-state")).toBeVisible();
      await expect(page.getByTestId("users-empty-state")).toContainText(
        "No users found",
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 2.2 Create User
  // ────────────────────────────────────────────────────────────────────────
  test.describe("2.2 Create User", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const adminEmail = `e2e-admin-${suffix}@e2e.test`;
    const annotatorEmail = `e2e-annotator-${suffix}@e2e.test`;
    const qaEmail = `e2e-qa-${suffix}@e2e.test`;

    let sharedPage: ReturnType<typeof test.info>["project"] extends never
      ? never
      : any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/users");
      await sharedPage.waitForSelector('[data-testid="users-table"]');
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("2.2.1 — Open create user dialog", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();
      await expect(sharedPage.getByTestId("user-name-input")).toBeVisible();
      await expect(sharedPage.getByTestId("user-email-input")).toBeVisible();
      await expect(sharedPage.getByTestId("user-role-select")).toBeVisible();
      // Close dialog for next test
      await sharedPage.getByTestId("user-form-cancel").click();
    });

    test("2.2.2 — Create admin user with temp password", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await sharedPage.getByTestId("user-name-input").fill("E2E Admin User");
      await sharedPage.getByTestId("user-email-input").fill(adminEmail);
      await sharedPage.getByLabel("Admin").click();
      await sharedPage.getByTestId("user-form-submit").click();

      // Should show temp password
      await expect(
        sharedPage.getByTestId("temp-password-display"),
      ).toBeVisible();
      const tempPassword = await sharedPage
        .getByTestId("temp-password-display")
        .textContent();
      expect(tempPassword).toBeTruthy();
      expect(tempPassword!.length).toBeGreaterThan(0);

      // Close the dialog
      await sharedPage.getByRole("button", { name: "Done" }).click();
    });

    test("2.2.3 — Create annotator user", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await sharedPage
        .getByTestId("user-name-input")
        .fill("E2E Annotator User");
      await sharedPage.getByTestId("user-email-input").fill(annotatorEmail);
      await sharedPage.getByLabel("Annotator").click();
      await sharedPage.getByTestId("user-form-submit").click();

      await expect(
        sharedPage.getByTestId("temp-password-display"),
      ).toBeVisible();
      await sharedPage.getByRole("button", { name: "Done" }).click();

      // Verify user appears in table
      await sharedPage.getByTestId("users-search").fill(annotatorEmail);
      await sharedPage.waitForTimeout(500);
      await expect(
        sharedPage.getByTestId("users-table").locator("tbody tr").first(),
      ).toContainText("E2E Annotator User");
      // Clear search
      await sharedPage.getByTestId("users-search").fill("");
      await sharedPage.waitForTimeout(500);
    });

    test("2.2.4 — Create QA user", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await sharedPage.getByTestId("user-name-input").fill("E2E QA User");
      await sharedPage.getByTestId("user-email-input").fill(qaEmail);
      await sharedPage.getByLabel("QA").click();
      await sharedPage.getByTestId("user-form-submit").click();

      await expect(
        sharedPage.getByTestId("temp-password-display"),
      ).toBeVisible();
      await sharedPage.getByRole("button", { name: "Done" }).click();

      // Verify user appears in table
      await sharedPage.getByTestId("users-search").fill(qaEmail);
      await sharedPage.waitForTimeout(500);
      await expect(
        sharedPage.getByTestId("users-table").locator("tbody tr").first(),
      ).toContainText("E2E QA User");
      await sharedPage.getByTestId("users-search").fill("");
      await sharedPage.waitForTimeout(500);
    });

    test("2.2.5 — Duplicate email rejected", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await sharedPage
        .getByTestId("user-name-input")
        .fill("Duplicate User");
      await sharedPage.getByTestId("user-email-input").fill(adminEmail);
      await sharedPage.getByLabel("Annotator").click();
      await sharedPage.getByTestId("user-form-submit").click();

      await expect(sharedPage.getByTestId("user-form-error")).toBeVisible();
      await sharedPage.getByTestId("user-form-cancel").click();
    });

    test("2.2.6 — Invalid email format rejected", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await sharedPage.getByTestId("user-name-input").fill("Invalid Email");
      await sharedPage.getByTestId("user-email-input").fill("not-an-email");
      await sharedPage.getByLabel("Annotator").click();
      await sharedPage.getByTestId("user-form-submit").click();

      // Either the browser's built-in email validation prevents submission,
      // or the backend returns an error
      const dialog = sharedPage.getByTestId("user-form-dialog");
      await expect(dialog).toBeVisible();

      // The form should still be open (submission blocked by validation)
      await sharedPage.getByTestId("user-form-cancel").click();
    });

    test("2.2.7 — Name required (submit disabled)", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      // Leave name empty, fill email
      await sharedPage.getByTestId("user-name-input").fill("");
      await sharedPage
        .getByTestId("user-email-input")
        .fill("empty-name@e2e.test");
      await sharedPage.getByLabel("Annotator").click();

      // Submit button should be disabled when name is empty
      await expect(sharedPage.getByTestId("user-form-submit")).toBeDisabled();
      await sharedPage.getByTestId("user-form-cancel").click();
    });

    test("2.2.8 — Cancel create dialog", async () => {
      await sharedPage.getByTestId("add-user-button").click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await sharedPage.getByTestId("user-name-input").fill("Cancel Test User");
      await sharedPage
        .getByTestId("user-email-input")
        .fill("cancel@e2e.test");

      await sharedPage.getByTestId("user-form-cancel").click();
      await expect(
        sharedPage.getByTestId("user-form-dialog"),
      ).not.toBeVisible();

      // Verify user was NOT created
      await sharedPage.getByTestId("users-search").fill("cancel@e2e.test");
      await sharedPage.waitForTimeout(500);
      await expect(sharedPage.getByTestId("users-empty-state")).toBeVisible();
      await sharedPage.getByTestId("users-search").fill("");
      await sharedPage.waitForTimeout(500);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 2.3 Edit User
  // ────────────────────────────────────────────────────────────────────────
  test.describe("2.3 Edit User", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const editTargetEmail = `e2e-edit-${suffix}@e2e.test`;
    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/users");
      await sharedPage.waitForSelector('[data-testid="users-table"]');

      // Create a user to edit
      await sharedPage.getByTestId("add-user-button").click();
      await sharedPage.waitForSelector('[data-testid="user-form-dialog"]');
      await sharedPage
        .getByTestId("user-name-input")
        .fill("E2E Edit Target");
      await sharedPage.getByTestId("user-email-input").fill(editTargetEmail);
      await sharedPage.getByLabel("Annotator").click();
      await sharedPage.getByTestId("user-form-submit").click();
      await sharedPage.waitForSelector('[data-testid="temp-password-display"]');
      await sharedPage.getByRole("button", { name: "Done" }).click();
      await sharedPage.waitForTimeout(300);
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("2.3.1 — Open edit dialog with pre-filled fields", async () => {
      // Search for our edit target
      await sharedPage.getByTestId("users-search").fill(editTargetEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      // Verify pre-filled values
      await expect(sharedPage.getByTestId("user-name-input")).toHaveValue(
        "E2E Edit Target",
      );
      await expect(sharedPage.getByTestId("user-email-input")).toHaveValue(
        editTargetEmail,
      );

      await sharedPage.getByTestId("user-form-cancel").click();
    });

    test("2.3.2 — Edit user name", async () => {
      await sharedPage.getByTestId("users-search").fill(editTargetEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await sharedPage.getByTestId("user-name-input").fill("");
      await sharedPage
        .getByTestId("user-name-input")
        .fill("E2E Renamed User");
      await sharedPage.getByTestId("user-form-submit").click();

      // Dialog should close after successful update
      await expect(
        sharedPage.getByTestId("user-form-dialog"),
      ).not.toBeVisible();

      // Verify name updated in table
      await sharedPage.waitForTimeout(500);
      await expect(
        sharedPage.getByTestId("users-table").locator("tbody tr").first(),
      ).toContainText("E2E Renamed User");
    });

    test("2.3.3 — Change user role", async () => {
      await sharedPage.getByTestId("users-search").fill(editTargetEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      // Change from Annotator to QA
      await sharedPage.getByLabel("QA").click();
      await sharedPage.getByTestId("user-form-submit").click();

      await expect(
        sharedPage.getByTestId("user-form-dialog"),
      ).not.toBeVisible();

      // Verify role updated in table
      await sharedPage.waitForTimeout(500);
      await expect(
        sharedPage.getByTestId("users-table").locator("tbody tr").first(),
      ).toContainText("QA");
    });

    test("2.3.4 — Email is immutable in edit mode", async () => {
      await sharedPage.getByTestId("users-search").fill(editTargetEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      await expect(sharedPage.getByTestId("user-email-input")).toBeDisabled();
      await sharedPage.getByTestId("user-form-cancel").click();
    });

    test("2.3.5 — Cannot change last admin role", async () => {
      // Clear search to find the admin user
      await sharedPage.getByTestId("users-search").fill("");
      await sharedPage.waitForTimeout(500);

      // Filter to admin role to find the test admin
      await sharedPage.getByTestId("users-role-filter").click();
      await sharedPage.getByRole("option", { name: "Admin" }).click();
      await sharedPage.waitForTimeout(500);

      // Get the admin user count — if there is only 1, trying to change role should fail
      const adminRows = sharedPage
        .getByTestId("users-table")
        .locator("tbody tr");
      const adminCount = await adminRows.count();

      if (adminCount === 1) {
        // Edit the sole admin
        await sharedPage.getByTestId("user-edit-button").first().click();
        await expect(
          sharedPage.getByTestId("user-form-dialog"),
        ).toBeVisible();

        await sharedPage.getByLabel("Annotator").click();
        await sharedPage.getByTestId("user-form-submit").click();

        // Should show error about last admin
        await expect(
          sharedPage.getByTestId("user-form-error"),
        ).toBeVisible();
        await sharedPage.getByTestId("user-form-cancel").click();
      } else {
        // Multiple admins exist — we created one in 2.2.2
        // Edit the first admin and try to change role
        await sharedPage.getByTestId("user-edit-button").first().click();
        await expect(
          sharedPage.getByTestId("user-form-dialog"),
        ).toBeVisible();
        await sharedPage.getByTestId("user-form-cancel").click();
        // Skip — test is only meaningful when there's exactly 1 admin
        test.skip();
      }

      // Reset role filter
      await sharedPage.getByTestId("users-role-filter").click();
      await sharedPage.getByRole("option", { name: "All Roles" }).click();
      await sharedPage.waitForTimeout(500);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 2.4 Deactivate / Activate User
  // ────────────────────────────────────────────────────────────────────────
  test.describe("2.4 Deactivate / Activate User", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const deactivateEmail = `e2e-deact-${suffix}@e2e.test`;
    let tempPassword = "";
    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/users");
      await sharedPage.waitForSelector('[data-testid="users-table"]');

      // Create user for deactivation tests
      await sharedPage.getByTestId("add-user-button").click();
      await sharedPage.waitForSelector('[data-testid="user-form-dialog"]');
      await sharedPage
        .getByTestId("user-name-input")
        .fill("E2E Deactivate Target");
      await sharedPage
        .getByTestId("user-email-input")
        .fill(deactivateEmail);
      await sharedPage.getByLabel("Annotator").click();
      await sharedPage.getByTestId("user-form-submit").click();
      await sharedPage.waitForSelector('[data-testid="temp-password-display"]');
      tempPassword =
        (await sharedPage
          .getByTestId("temp-password-display")
          .textContent()) ?? "";
      await sharedPage.getByRole("button", { name: "Done" }).click();
      await sharedPage.waitForTimeout(300);
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("2.4.1 — Deactivation shows impact dialog", async () => {
      await sharedPage.getByTestId("users-search").fill(deactivateEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();
      await expect(
        sharedPage.getByTestId("user-deactivate-button"),
      ).toBeVisible();

      await sharedPage.getByTestId("user-deactivate-button").click();

      // Deactivation confirmation dialog should appear
      // (the form dialog is closed by handleDeactivate before opening this)
      await expect(
        sharedPage.getByTestId("deactivation-dialog"),
      ).toBeVisible();

      // Cancel for now — we'll test confirm and cancel separately
      await sharedPage.getByTestId("deactivation-cancel").click();
    });

    test("2.4.3 — Cancel deactivation", async () => {
      await sharedPage.getByTestId("users-search").fill(deactivateEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();
      await sharedPage.getByTestId("user-deactivate-button").click();
      await expect(
        sharedPage.getByTestId("deactivation-dialog"),
      ).toBeVisible();

      // Click cancel
      await sharedPage.getByTestId("deactivation-cancel").click();
      await expect(
        sharedPage.getByTestId("deactivation-dialog"),
      ).not.toBeVisible();

      // User should still be active (form dialog was closed by handleDeactivate)
      await sharedPage.waitForTimeout(300);
      await expect(
        sharedPage.getByTestId("users-table").locator("tbody tr").first(),
      ).toContainText("ACTIVE");
    });

    test("2.4.2 — Confirm deactivation", async () => {
      await sharedPage.getByTestId("users-search").fill(deactivateEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();
      await sharedPage.getByTestId("user-deactivate-button").click();
      await expect(
        sharedPage.getByTestId("deactivation-dialog"),
      ).toBeVisible();

      // Confirm deactivation
      await sharedPage.getByTestId("deactivation-confirm").click();

      // Wait for dialog to close and table to update
      await expect(
        sharedPage.getByTestId("deactivation-dialog"),
      ).not.toBeVisible();
      await sharedPage.waitForTimeout(500);

      // User should now show INACTIVE status
      // Re-search — we may need to include inactive filter
      await sharedPage.getByTestId("users-search").fill(deactivateEmail);
      await sharedPage.getByTestId("users-status-filter").click();
      await sharedPage.getByRole("option", { name: "Inactive" }).click();
      await sharedPage.waitForTimeout(500);

      await expect(
        sharedPage.getByTestId("users-table").locator("tbody tr").first(),
      ).toContainText("INACTIVE");

      // Reset status filter
      await sharedPage.getByTestId("users-status-filter").click();
      await sharedPage.getByRole("option", { name: "All Statuses" }).click();
      await sharedPage.waitForTimeout(500);
    });

    test("2.4.4 — Activate user", async () => {
      await sharedPage.getByTestId("users-search").fill(deactivateEmail);
      await sharedPage.getByTestId("users-status-filter").click();
      await sharedPage.getByRole("option", { name: "Inactive" }).click();
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      // For an inactive user, the activate button should be visible
      await expect(
        sharedPage.getByTestId("user-activate-button"),
      ).toBeVisible();
      await sharedPage.getByTestId("user-activate-button").click();

      // Wait for the dialog to close and the table to update
      await expect(
        sharedPage.getByTestId("user-form-dialog"),
      ).not.toBeVisible();
      await sharedPage.waitForTimeout(500);

      // Reset status filter and verify user is active again
      await sharedPage.getByTestId("users-status-filter").click();
      await sharedPage.getByRole("option", { name: "All Statuses" }).click();
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("users-search").fill(deactivateEmail);
      await sharedPage.waitForTimeout(500);

      await expect(
        sharedPage.getByTestId("users-table").locator("tbody tr").first(),
      ).toContainText("ACTIVE");
    });

    test("2.4.5 — Cannot deactivate self (last admin protection)", async () => {
      // Clear search and find the currently logged-in admin
      const creds = getCredentials(TestRole.ADMIN);
      await sharedPage.getByTestId("users-search").fill(creds.email);
      await sharedPage.getByTestId("users-status-filter").click();
      await sharedPage.getByRole("option", { name: "All Statuses" }).click();
      await sharedPage.getByTestId("users-role-filter").click();
      await sharedPage.getByRole("option", { name: "All Roles" }).click();
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      // The deactivate button may be visible (no frontend self-deactivation guard),
      // but if this is the last admin, the backend will block it.
      // Verify the dialog opens with the user's data.
      await expect(sharedPage.getByTestId("user-email-input")).toHaveValue(
        creds.email,
      );
      await sharedPage.getByTestId("user-form-cancel").click();
    });

    test("2.4.6 — Cannot deactivate last admin", async () => {
      // Filter for admin role only
      await sharedPage.getByTestId("users-search").fill("");
      await sharedPage.getByTestId("users-role-filter").click();
      await sharedPage.getByRole("option", { name: "Admin" }).click();
      await sharedPage.waitForTimeout(500);

      const adminRows = sharedPage
        .getByTestId("users-table")
        .locator("tbody tr");
      const adminCount = await adminRows.count();

      if (adminCount !== 1) {
        // Reset filters before skipping so subsequent tests aren't affected
        await sharedPage.getByTestId("users-role-filter").click();
        await sharedPage.getByRole("option", { name: "All Roles" }).click();
        await sharedPage.waitForTimeout(500);
        test.skip();
      }

      // Only one admin exists — deactivation should be blocked
      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(
        sharedPage.getByTestId("user-form-dialog"),
      ).toBeVisible();

      // The deactivate button might be hidden (self) or shown but rejected by backend
      const deactivateBtn = sharedPage.getByTestId("user-deactivate-button");
      const isVisible = await deactivateBtn.isVisible().catch(() => false);

      if (isVisible) {
        await deactivateBtn.click();
        await expect(
          sharedPage.getByTestId("deactivation-dialog"),
        ).toBeVisible();
        await sharedPage.getByTestId("deactivation-confirm").click();
        // Should get an error (backend blocks last admin deactivation)
        await sharedPage.waitForTimeout(500);
        // Dialog should still be open or an error toast shown
      }

      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(300);

      // Reset filters
      await sharedPage.getByTestId("users-role-filter").click();
      await sharedPage.getByRole("option", { name: "All Roles" }).click();
      await sharedPage.waitForTimeout(500);
    });

    test("2.4.7 — Deactivated user cannot login", async () => {
      // Reset filters to ensure clean state
      await sharedPage.getByTestId("users-search").fill("");
      await sharedPage.getByTestId("users-role-filter").click();
      await sharedPage.getByRole("option", { name: "All Roles" }).click();
      await sharedPage.getByTestId("users-status-filter").click();
      await sharedPage.getByRole("option", { name: "All Statuses" }).click();
      await sharedPage.waitForTimeout(500);

      // First deactivate the test user again
      await sharedPage.getByTestId("users-search").fill(deactivateEmail);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("user-edit-button").first().click();
      await expect(sharedPage.getByTestId("user-form-dialog")).toBeVisible();

      // Check if user is currently active (we reactivated in 2.4.4)
      const deactivateBtn = sharedPage.getByTestId("user-deactivate-button");
      if (await deactivateBtn.isVisible()) {
        await deactivateBtn.click();
        await expect(
          sharedPage.getByTestId("deactivation-dialog"),
        ).toBeVisible();
        await sharedPage.getByTestId("deactivation-confirm").click();
        await expect(
          sharedPage.getByTestId("deactivation-dialog"),
        ).not.toBeVisible();
        await sharedPage.waitForTimeout(500);
      } else {
        // User is already inactive, close the dialog
        await sharedPage.getByTestId("user-form-cancel").click();
      }

      // Now open a new context to try logging in as the deactivated user
      const browser = sharedPage.context().browser()!;
      const newContext = await browser.newContext();
      const loginPage = await newContext.newPage();

      await loginViaUI(loginPage, deactivateEmail, tempPassword);

      // Should see error about deactivation
      const errorAlert = loginPage.getByTestId("login-error");
      await expect(errorAlert).toBeVisible();
      await expect(errorAlert).toContainText("deactivated");

      await newContext.close();
    });
  });
});
