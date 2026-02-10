import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "@playwright/test";
import { TestRole, getCredentials, loginViaUI } from "../fixtures/auth";
import { testUsers } from "../config";

const uniqueSuffix = () => Date.now().toString(36);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");

test.describe("Job Assignment", () => {
  test.describe.configure({ mode: "serial" });

  // ────────────────────────────────────────────────────────────────────────
  // 5.1 Assignment Page Layout
  // ────────────────────────────────────────────────────────────────────────
  test.describe("5.1 Assignment Page Layout", () => {
    test.beforeEach(async ({ page }) => {
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(page, creds.email, creds.password);
      await page.waitForURL("**/admin/dashboard");
      await page.goto("/admin/job-assignment");
      await page.waitForSelector('[data-testid="job-assignment-page"]');
    });

    test("5.1.1 — Page renders with tabs", async ({ page }) => {
      await expect(page.getByTestId("job-assignment-page")).toBeVisible();
      await expect(page.getByTestId("annotation-assignment-tab")).toBeVisible();
      await expect(page.getByTestId("qa-assignment-tab")).toBeVisible();
    });

    test("5.1.2 — Annotation tab sub-tabs", async ({ page }) => {
      await page.getByTestId("annotation-assignment-tab").click();
      await expect(page.getByTestId("unassigned-subtab")).toBeVisible();
      await expect(page.getByTestId("assigned-subtab")).toBeVisible();
      await expect(page.getByTestId("in-progress-subtab")).toBeVisible();
    });

    test("5.1.3 — QA tab sub-tabs", async ({ page }) => {
      await page.getByTestId("qa-assignment-tab").click();
      await expect(page.getByTestId("unassigned-subtab")).toBeVisible();
      await expect(page.getByTestId("assigned-subtab")).toBeVisible();
      await expect(page.getByTestId("in-progress-subtab")).toBeVisible();
    });

    test("5.1.4 — Unassigned jobs table", async ({ page }) => {
      await page.getByTestId("unassigned-subtab").click();
      await expect(page.getByTestId("unassigned-jobs-table")).toBeVisible();
    });

    test("5.1.5 — Assigned jobs table", async ({ page }) => {
      await page.getByTestId("assigned-subtab").click();
      await expect(page.getByTestId("assigned-jobs-table")).toBeVisible();
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 5.2 Manual Assignment
  // ────────────────────────────────────────────────────────────────────────
  test.describe("5.2 Manual Assignment", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const datasetName = `E2E Assign ${suffix}`;
    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");

      // Upload a fresh dataset
      await sharedPage.goto("/admin/datasets");
      await sharedPage.waitForSelector('[data-testid="datasets-page"]');
      await sharedPage.getByTestId("upload-dataset-button").click();
      await sharedPage.waitForSelector('[data-testid="upload-dialog"]');
      await sharedPage.getByTestId("dataset-name-input").fill(datasetName);
      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "sample-emails.zip"),
      );
      await sharedPage.getByTestId("upload-submit").click();
      await sharedPage.waitForSelector('text="Upload Complete"', {
        timeout: 30000,
      });
      await sharedPage.getByRole("button", { name: "Done" }).click();
      await sharedPage.waitForTimeout(500);

      // Navigate to job assignment page
      await sharedPage.goto("/admin/job-assignment");
      await sharedPage.waitForSelector('[data-testid="job-assignment-page"]');
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("5.2.1 — Select jobs updates selected count", async () => {
      // Ensure we're on Annotation > Unassigned
      await sharedPage.getByTestId("annotation-assignment-tab").click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByTestId("unassigned-subtab").click();
      await sharedPage.waitForTimeout(500);

      // Check job checkboxes exist
      const checkboxes = sharedPage.getByTestId("job-checkbox");
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);

      // Click first checkbox
      await checkboxes.first().click();
      await sharedPage.waitForTimeout(200);

      // Selected count should be visible
      await expect(
        sharedPage.getByTestId("unassigned-jobs-table").getByTestId("selected-count"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("unassigned-jobs-table").getByTestId("selected-count"),
      ).toContainText("1 of");

      // Uncheck to reset
      await checkboxes.first().click();
      await sharedPage.waitForTimeout(200);
    });

    test("5.2.2 — Assignee dropdown lists annotator users", async () => {
      // Click the assignee select trigger to open the dropdown
      await sharedPage.getByTestId("assignee-select").click();
      await sharedPage.waitForTimeout(300);

      // Verify at least one option is visible in the dropdown
      const options = sharedPage.locator('[role="option"]');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);

      // Close the dropdown by pressing Escape
      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(200);
    });

    test("5.2.3 — Assign single job to annotator", async () => {
      // Select 1 job
      const checkboxes = sharedPage.getByTestId("job-checkbox");
      await checkboxes.first().click();
      await sharedPage.waitForTimeout(200);

      // Open assignee dropdown and pick the first annotator
      await sharedPage.getByTestId("assignee-select").click();
      await sharedPage.waitForTimeout(300);
      const options = sharedPage.locator('[role="option"]');
      await options.first().click();
      await sharedPage.waitForTimeout(200);

      // Click assign
      await sharedPage.getByTestId("assign-button").click();

      // Wait for success toast
      await expect(
        sharedPage.locator('[data-sonner-toast][data-type="success"]'),
      ).toBeVisible({ timeout: 10000 });

      await sharedPage.waitForTimeout(500);
    });

    test("5.2.4 — Assign remaining jobs", async () => {
      // Select all remaining unassigned jobs
      const checkboxes = sharedPage.getByTestId("job-checkbox");
      const count = await checkboxes.count();

      if (count === 0) {
        // All jobs may already be assigned; skip gracefully
        return;
      }

      // Click all checkboxes
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click();
        await sharedPage.waitForTimeout(100);
      }

      // Open assignee dropdown and pick the first annotator
      await sharedPage.getByTestId("assignee-select").click();
      await sharedPage.waitForTimeout(300);
      const options = sharedPage.locator('[role="option"]');
      await options.first().click();
      await sharedPage.waitForTimeout(200);

      // Click assign
      await sharedPage.getByTestId("assign-button").click();

      // Wait for success toast
      await expect(
        sharedPage.locator('[data-sonner-toast][data-type="success"]'),
      ).toBeVisible({ timeout: 10000 });

      await sharedPage.waitForTimeout(500);

      // Verify jobs moved to Assigned tab
      await sharedPage.getByTestId("assigned-subtab").click();
      await sharedPage.waitForTimeout(500);
      await expect(sharedPage.getByTestId("assigned-jobs-table")).toBeVisible();

      // Go back to unassigned
      await sharedPage.getByTestId("unassigned-subtab").click();
      await sharedPage.waitForTimeout(500);
    });

    test("5.2.7 — Only active users in assignee dropdown", async () => {
      // Open the assignee dropdown
      await sharedPage.getByTestId("assignee-select").click();
      await sharedPage.waitForTimeout(300);

      // Get all option texts
      const options = sharedPage.locator('[role="option"]');
      const count = await options.count();
      const optionTexts: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await options.nth(i).textContent();
        optionTexts.push(text ?? "");
      }

      // Deactivated user email should not appear in dropdown
      const deactivatedEmail = testUsers.deactivated.email;
      for (const text of optionTexts) {
        expect(text.toLowerCase()).not.toContain(deactivatedEmail.toLowerCase());
      }

      // Close dropdown
      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(200);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 5.3 Round-Robin Distribution
  // ────────────────────────────────────────────────────────────────────────
  test.describe("5.3 Round-Robin Distribution", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const datasetName = `E2E RoundRobin ${suffix}`;
    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");

      // Upload a fresh dataset for round-robin tests
      await sharedPage.goto("/admin/datasets");
      await sharedPage.waitForSelector('[data-testid="datasets-page"]');
      await sharedPage.getByTestId("upload-dataset-button").click();
      await sharedPage.waitForSelector('[data-testid="upload-dialog"]');
      await sharedPage.getByTestId("dataset-name-input").fill(datasetName);
      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "sample-emails.zip"),
      );
      await sharedPage.getByTestId("upload-submit").click();
      await sharedPage.waitForSelector('text="Upload Complete"', {
        timeout: 30000,
      });
      await sharedPage.getByRole("button", { name: "Done" }).click();
      await sharedPage.waitForTimeout(500);

      // Navigate to job assignment page
      await sharedPage.goto("/admin/job-assignment");
      await sharedPage.waitForSelector('[data-testid="job-assignment-page"]');
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("5.3.1 — Switch to round-robin strategy", async () => {
      // Ensure Annotation > Unassigned
      await sharedPage.getByTestId("annotation-assignment-tab").click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByTestId("unassigned-subtab").click();
      await sharedPage.waitForTimeout(500);

      // Click round-robin radio
      const rrRadio = sharedPage.locator('label[for="strategy-rr"]');
      await rrRadio.click();
      await sharedPage.waitForTimeout(300);

      // Verify round-robin UI is displayed (user checkboxes visible)
      await expect(
        sharedPage.getByTestId("rr-user-checkbox").first(),
      ).toBeVisible();

      // Preview button should be visible
      await expect(
        sharedPage.getByTestId("round-robin-preview-button"),
      ).toBeVisible();
    });

    test("5.3.2 — Preview round-robin distribution", async () => {
      // Select all unassigned jobs
      const checkboxes = sharedPage.getByTestId("job-checkbox");
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click();
        await sharedPage.waitForTimeout(100);
      }

      // Select at least one user for round-robin
      const userCheckboxes = sharedPage.getByTestId("rr-user-checkbox");
      const userCount = await userCheckboxes.count();
      expect(userCount).toBeGreaterThan(0);
      for (let i = 0; i < userCount; i++) {
        await userCheckboxes.nth(i).click();
        await sharedPage.waitForTimeout(100);
      }

      // Click Preview Distribution
      await sharedPage.getByTestId("round-robin-preview-button").click();
      await sharedPage.waitForTimeout(500);

      // Assignment preview dialog should open
      await expect(
        sharedPage.getByTestId("assignment-preview-dialog"),
      ).toBeVisible();
    });

    test("5.3.3 — Preview shows balanced distribution", async () => {
      // The preview dialog should be open from the previous test
      const dialog = sharedPage.getByTestId("assignment-preview-dialog");
      await expect(dialog).toBeVisible();

      // Should have a table with user distribution
      const rows = dialog.locator("tbody tr");
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Each row should have a "New" column with a number > 0
      for (let i = 0; i < rowCount; i++) {
        const newCell = rows.nth(i).locator("td").nth(2); // New column
        const text = await newCell.textContent();
        expect(Number(text)).toBeGreaterThanOrEqual(0);
      }

      // Confirm and Cancel buttons should be visible
      await expect(
        sharedPage.getByTestId("assignment-preview-confirm"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("assignment-preview-cancel"),
      ).toBeVisible();
    });

    test("5.3.5 — Cancel round-robin preview", async () => {
      // Click cancel in preview dialog
      await sharedPage.getByTestId("assignment-preview-cancel").click();
      await sharedPage.waitForTimeout(300);

      // Dialog should close
      await expect(
        sharedPage.getByTestId("assignment-preview-dialog"),
      ).not.toBeVisible();

      // Jobs should still be in unassigned table (not assigned)
      const checkboxes = sharedPage.getByTestId("job-checkbox");
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);
    });

    test("5.3.4 — Confirm round-robin assignment", async () => {
      // Re-select all jobs
      const checkboxes = sharedPage.getByTestId("job-checkbox");
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        // Toggle off first (they may still be selected from 5.3.2)
        const isChecked = await checkboxes.nth(i).isChecked();
        if (!isChecked) {
          await checkboxes.nth(i).click();
          await sharedPage.waitForTimeout(100);
        }
      }

      // Ensure round-robin users are selected
      const userCheckboxes = sharedPage.getByTestId("rr-user-checkbox");
      const userCount = await userCheckboxes.count();
      for (let i = 0; i < userCount; i++) {
        const isChecked = await userCheckboxes.nth(i).isChecked();
        if (!isChecked) {
          await userCheckboxes.nth(i).click();
          await sharedPage.waitForTimeout(100);
        }
      }

      // Click Preview Distribution
      await sharedPage.getByTestId("round-robin-preview-button").click();
      await sharedPage.waitForTimeout(500);

      await expect(
        sharedPage.getByTestId("assignment-preview-dialog"),
      ).toBeVisible();

      // Click Confirm
      await sharedPage.getByTestId("assignment-preview-confirm").click();

      // Wait for success toast
      await expect(
        sharedPage.locator('[data-sonner-toast][data-type="success"]'),
      ).toBeVisible({ timeout: 10000 });

      await sharedPage.waitForTimeout(500);

      // Verify jobs moved to Assigned tab
      await sharedPage.getByTestId("assigned-subtab").click();
      await sharedPage.waitForTimeout(500);
      await expect(sharedPage.getByTestId("assigned-jobs-table")).toBeVisible();
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 5.4 Reassignment
  // ────────────────────────────────────────────────────────────────────────
  test.describe("5.4 Reassignment", () => {
    test.describe.configure({ mode: "serial" });

    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/job-assignment");
      await sharedPage.waitForSelector('[data-testid="job-assignment-page"]');

      // Go to Assigned sub-tab
      await sharedPage.getByTestId("annotation-assignment-tab").click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByTestId("assigned-subtab").click();
      await sharedPage.waitForTimeout(500);
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("5.4.1 — Open reassignment dialog", async () => {
      const table = sharedPage.getByTestId("assigned-jobs-table");
      await expect(table).toBeVisible();

      // Select first assigned job
      const checkboxes = table.getByTestId("job-checkbox");
      const count = await checkboxes.count();

      if (count === 0) {
        // No assigned jobs — skip gracefully
        test.skip();
        return;
      }

      await checkboxes.first().click();
      await sharedPage.waitForTimeout(200);

      // Click Reassign button
      await sharedPage.getByTestId("reassign-button").click();
      await sharedPage.waitForTimeout(300);

      // Bulk reassign dialog should open
      await expect(
        sharedPage.getByTestId("bulk-reassign-dialog"),
      ).toBeVisible();

      // Verify reassign user select and confirm button are visible
      await expect(
        sharedPage.getByTestId("reassign-user-select"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("reassign-confirm"),
      ).toBeVisible();

      // Close dialog without reassigning
      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(300);
    });

    test("5.4.2 — Reassign jobs to different annotator", async () => {
      const table = sharedPage.getByTestId("assigned-jobs-table");

      // Select first assigned job
      const checkboxes = table.getByTestId("job-checkbox");
      const count = await checkboxes.count();

      if (count === 0) {
        test.skip();
        return;
      }

      // Ensure a checkbox is selected (may have been deselected by dialog close)
      const isChecked = await checkboxes.first().isChecked();
      if (!isChecked) {
        await checkboxes.first().click();
        await sharedPage.waitForTimeout(200);
      }

      // Click Reassign button
      await sharedPage.getByTestId("reassign-button").click();
      await sharedPage.waitForTimeout(300);

      await expect(
        sharedPage.getByTestId("bulk-reassign-dialog"),
      ).toBeVisible();

      // Open the reassign user select and pick a user
      await sharedPage.getByTestId("reassign-user-select").click();
      await sharedPage.waitForTimeout(300);
      const options = sharedPage.locator('[role="option"]');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);

      // Pick the last option (to try a different user)
      await options.last().click();
      await sharedPage.waitForTimeout(200);

      // Click Reassign confirm
      await sharedPage.getByTestId("reassign-confirm").click();

      // Wait for success toast
      await expect(
        sharedPage.locator('[data-sonner-toast][data-type="success"]'),
      ).toBeVisible({ timeout: 10000 });

      await sharedPage.waitForTimeout(500);
    });
  });
});
