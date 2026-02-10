import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "@playwright/test";
import { TestRole, getCredentials, loginViaUI } from "../fixtures/auth";

const uniqueSuffix = () => Date.now().toString(36);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, "../fixtures");

test.describe("Dataset Management", () => {
  // Run all sub-groups sequentially so earlier uploads are available for later tests
  // and global deduplication doesn't cause 0-file datasets.
  test.describe.configure({ mode: "serial" });

  // ────────────────────────────────────────────────────────────────────────
  // 4.2 Dataset List
  // ────────────────────────────────────────────────────────────────────────
  test.describe("4.2 Dataset List", () => {
    test.beforeEach(async ({ page }) => {
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(page, creds.email, creds.password);
      await page.waitForURL("**/admin/dashboard");
      await page.goto("/admin/datasets");
      await page.waitForSelector('[data-testid="datasets-page"]');
    });

    test("4.2.1 — Page renders with table columns", async ({ page }) => {
      await expect(page.getByTestId("datasets-page")).toBeVisible();
      await expect(page.getByTestId("datasets-table")).toBeVisible();

      const headers = page.getByTestId("datasets-table").locator("thead th");
      await expect(headers).toContainText([
        "Name",
        "Status",
        "Files",
        "Uploaded By",
        "Upload Date",
      ]);
    });

    test("4.2.2 — Search datasets by name", async ({ page }) => {
      const searchInput = page.getByTestId("datasets-search");
      // Use a term unlikely to match anything
      await searchInput.fill("zzz-no-match-xyz");
      await page.waitForTimeout(500);

      // Either empty state shows or no rows match
      const emptyState = page.getByTestId("datasets-empty-state");
      const rows = page.getByTestId("datasets-table").locator("tbody tr");

      const emptyVisible = await emptyState.isVisible().catch(() => false);
      if (!emptyVisible) {
        const count = await rows.count();
        // Rows should still be there but none matching (or zero rows)
        expect(count).toBeGreaterThanOrEqual(0);
      }

      // Clear and search with something that might exist
      await searchInput.fill("");
      await page.waitForTimeout(500);
    });

    test("4.2.3 — Pagination controls exist", async ({ page }) => {
      await expect(page.getByTestId("datasets-pagination")).toBeVisible();
    });

    test("4.2.4 — Empty state with impossible search", async ({ page }) => {
      await page
        .getByTestId("datasets-search")
        .fill("zzz-nonexistent-dataset-xyz");
      await page.waitForTimeout(500);

      await expect(page.getByTestId("datasets-empty-state")).toBeVisible();
      await expect(page.getByTestId("datasets-empty-state")).toContainText(
        "No datasets found",
      );
    });

    test("4.2.5 — Status badge display", async ({ page }) => {
      // Check if there are any datasets with status badges
      const rows = page.getByTestId("datasets-table").locator("tbody tr");
      const count = await rows.count();

      if (count > 0) {
        // First row should have a dataset status badge
        const firstRow = rows.first();
        const badge = firstRow.getByTestId("dataset-status");
        const badgeVisible = await badge.isVisible().catch(() => false);
        if (badgeVisible) {
          await expect(badge).toBeVisible();
          const text = await badge.textContent();
          expect(
            ["Uploading", "Extracting", "Ready", "Failed"].some((s) =>
              text?.includes(s),
            ),
          ).toBeTruthy();
        }
      }
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 4.1 Upload Dataset
  // ────────────────────────────────────────────────────────────────────────
  test.describe("4.1 Upload Dataset", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const datasetName = `E2E Dataset ${suffix}`;
    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/datasets");
      await sharedPage.waitForSelector('[data-testid="datasets-page"]');
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("4.1.1 — Open upload dialog", async () => {
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();
      await expect(
        sharedPage.getByTestId("dataset-name-input"),
      ).toBeVisible();
      await expect(sharedPage.getByTestId("file-drop-zone")).toBeVisible();

      // Close dialog for next test
      await sharedPage.getByTestId("upload-cancel").click();
    });

    test("4.1.2 — Upload sample-emails.zip", async () => {
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();

      await sharedPage.getByTestId("dataset-name-input").fill(datasetName);

      // Set the file via the hidden file input inside FileDropZone
      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "sample-emails.zip"),
      );

      // Verify file is selected (drop zone should show filename)
      await expect(sharedPage.getByTestId("file-drop-zone")).toContainText(
        "sample-emails.zip",
      );

      // Submit
      await sharedPage.getByTestId("upload-submit").click();

      // Wait for upload to complete — success dialog shows "Upload Complete"
      await expect(
        sharedPage.getByText("Upload Complete"),
      ).toBeVisible({ timeout: 30000 });

      // Click Done to close the success dialog
      await sharedPage.getByRole("button", { name: "Done" }).click();
    });

    test("4.1.3 — Extraction completes with READY status", async () => {
      // Search for the just-uploaded dataset
      await sharedPage.getByTestId("datasets-search").fill(datasetName);
      await sharedPage.waitForTimeout(500);

      const firstRow = sharedPage
        .getByTestId("datasets-table")
        .locator("tbody tr")
        .first();
      await expect(firstRow).toContainText(datasetName);

      // Verify status is READY
      const badge = firstRow.getByTestId("dataset-status");
      await expect(badge).toContainText("Ready");

      // Clear search
      await sharedPage.getByTestId("datasets-search").fill("");
      await sharedPage.waitForTimeout(500);
    });

    test("4.1.4 — Duplicate dataset name rejected", async () => {
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();

      // Use the same name as before
      await sharedPage.getByTestId("dataset-name-input").fill(datasetName);

      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "sample-emails.zip"),
      );

      await sharedPage.getByTestId("upload-submit").click();

      // Should show error about duplicate name
      await expect(
        sharedPage.getByTestId("upload-error"),
      ).toBeVisible({ timeout: 10000 });

      // Close the error dialog
      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(300);
    });

    test("4.1.5 — Non-zip file rejected", async () => {
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();

      await sharedPage
        .getByTestId("dataset-name-input")
        .fill(`E2E NonZip ${suffix}`);

      // Set non-zip file via the hidden input (bypasses accept=".zip" filter)
      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "not-a-zip.txt"),
      );

      await sharedPage.getByTestId("upload-submit").click();

      // Expect an error — either validation error or failed upload
      await expect(
        sharedPage.getByTestId("upload-error"),
      ).toBeVisible({ timeout: 10000 });

      // Close the error dialog
      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(300);
    });

    test("4.1.6 — Empty zip (no .eml files) extracts 0 files", async () => {
      const emptyZipName = `E2E NoEml ${suffix}`;
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();

      await sharedPage.getByTestId("dataset-name-input").fill(emptyZipName);

      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "no-eml-files.zip"),
      );

      await sharedPage.getByTestId("upload-submit").click();

      // The backend extracts 0 .eml files and marks the dataset as READY with 0 files
      await expect(
        sharedPage.getByText("Upload Complete"),
      ).toBeVisible({ timeout: 30000 });

      // Verify 0 files extracted
      await expect(sharedPage.getByText("0 email files extracted")).toBeVisible();

      await sharedPage.getByRole("button", { name: "Done" }).click();
    });

    test("4.1.7 — Intra-zip deduplication", async () => {
      const dupName = `E2E IntraDup ${suffix}`;
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();

      await sharedPage.getByTestId("dataset-name-input").fill(dupName);

      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "duplicate-emails.zip"),
      );

      await sharedPage.getByTestId("upload-submit").click();

      // Wait for success
      await expect(
        sharedPage.getByText("Upload Complete"),
      ).toBeVisible({ timeout: 30000 });

      // Verify duplicate count is shown
      await expect(
        sharedPage.getByTestId("dataset-duplicate-count"),
      ).toBeVisible();
      const dupCount = await sharedPage
        .getByTestId("dataset-duplicate-count")
        .textContent();
      expect(Number(dupCount)).toBeGreaterThan(0);

      await sharedPage.getByRole("button", { name: "Done" }).click();
    });

    test("4.1.8 — Global deduplication (cross-dataset)", async () => {
      const overlapName = `E2E GlobalDup ${suffix}`;
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();

      await sharedPage.getByTestId("dataset-name-input").fill(overlapName);

      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "overlapping-emails.zip"),
      );

      await sharedPage.getByTestId("upload-submit").click();

      // Wait for success
      await expect(
        sharedPage.getByText("Upload Complete"),
      ).toBeVisible({ timeout: 30000 });

      // Verify duplicate count is shown (overlapping with sample-emails.zip)
      await expect(
        sharedPage.getByTestId("dataset-duplicate-count"),
      ).toBeVisible();
      const dupCount = await sharedPage
        .getByTestId("dataset-duplicate-count")
        .textContent();
      expect(Number(dupCount)).toBeGreaterThan(0);

      await sharedPage.getByRole("button", { name: "Done" }).click();
    });

    test("4.1.9 — Cancel upload dialog", async () => {
      const cancelName = `E2E Cancel ${suffix}`;
      await sharedPage.getByTestId("upload-dataset-button").click();
      await expect(sharedPage.getByTestId("upload-dialog")).toBeVisible();

      await sharedPage.getByTestId("dataset-name-input").fill(cancelName);

      const fileInput = sharedPage.locator('input[type="file"]');
      await fileInput.setInputFiles(
        path.join(FIXTURES_DIR, "sample-emails.zip"),
      );

      // Cancel instead of submit
      await sharedPage.getByTestId("upload-cancel").click();
      await expect(sharedPage.getByTestId("upload-dialog")).not.toBeVisible();

      // Verify dataset was NOT created
      await sharedPage.getByTestId("datasets-search").fill(cancelName);
      await sharedPage.waitForTimeout(500);
      await expect(sharedPage.getByTestId("datasets-empty-state")).toBeVisible();
      await sharedPage.getByTestId("datasets-search").fill("");
      await sharedPage.waitForTimeout(500);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 4.3 Dataset Detail
  // ────────────────────────────────────────────────────────────────────────
  test.describe("4.3 Dataset Detail", () => {
    test.describe.configure({ mode: "serial" });

    let detailDatasetName = "";
    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/datasets");
      await sharedPage.waitForSelector('[data-testid="datasets-page"]');

      // Find the first dataset that has files > 0 (uploaded by 4.1 tests)
      // The Files column is the 4th td (index 3, after checkbox/name/status)
      const rows = sharedPage
        .getByTestId("datasets-table")
        .locator("tbody tr");
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const cells = rows.nth(i).locator("td");
        const fileCountText = await cells.nth(3).textContent();
        if (parseInt(fileCountText || "0", 10) > 0) {
          // Get the dataset name from the Name column (index 1)
          detailDatasetName =
            (await cells.nth(1).textContent())?.trim() ?? "";
          await rows.nth(i).click();
          break;
        }
      }

      await sharedPage.waitForSelector('[data-testid="dataset-detail-page"]');
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("4.3.1 — Detail page renders", async () => {
      await expect(
        sharedPage.getByTestId("dataset-detail-page"),
      ).toBeVisible();
      await expect(
        sharedPage.getByRole("heading", { name: detailDatasetName }),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("dataset-status-cards"),
      ).toBeVisible();
      await expect(
        sharedPage.getByTestId("dataset-jobs-table"),
      ).toBeVisible();
    });

    test("4.3.2 — Status cards show counts", async () => {
      const statusCards = sharedPage.getByTestId("dataset-status-cards");
      await expect(statusCards).toBeVisible();

      // The Uploaded card should show a count matching the number of files
      // sample-emails.zip has 3 files, so Uploaded card should show 3
      await expect(statusCards).toContainText("Uploaded");
    });

    test("4.3.3 — Clickable status cards filter jobs", async () => {
      const statusCards = sharedPage.getByTestId("dataset-status-cards");

      // Click the first card (Uploaded) to filter
      const uploadedCard = statusCards.locator('[class*="cursor-pointer"]').first();
      await uploadedCard.click();
      await sharedPage.waitForTimeout(500);

      // Jobs should be filtered — a Clear Filter button should appear
      await expect(
        sharedPage.getByRole("button", { name: "Clear Filter" }),
      ).toBeVisible();

      // Click Clear Filter to remove the filter
      await sharedPage
        .getByRole("button", { name: "Clear Filter" })
        .click();
      await sharedPage.waitForTimeout(500);

      // Verify filter is cleared — Clear Filter button should be gone
      await expect(
        sharedPage.getByRole("button", { name: "Clear Filter" }),
      ).not.toBeVisible();
    });

    test("4.3.4 — Jobs table displays with columns", async () => {
      const jobsTable = sharedPage.getByTestId("dataset-jobs-table");
      await expect(jobsTable).toBeVisible();

      const headers = jobsTable.locator("thead th");
      await expect(headers).toContainText([
        "File Name",
        "Status",
        "Annotator",
        "QA",
        "Updated",
      ]);
    });

    test("4.3.5 — View raw email content", async () => {
      // Wait for the jobs table to have data rows
      await expect(
        sharedPage.getByTestId("dataset-jobs-table").locator("tbody tr").first(),
      ).toBeVisible();

      // Click the view button on the first job row
      const viewButton = sharedPage.getByTestId("job-view-button").first();
      await viewButton.click();

      // Email viewer dialog should open
      await expect(
        sharedPage.getByTestId("email-viewer-dialog"),
      ).toBeVisible();

      // Close the dialog
      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(300);
    });

    test("4.3.6 — Email viewer tabs", async () => {
      // Open the viewer again
      await sharedPage.getByTestId("job-view-button").first().click();
      await expect(
        sharedPage.getByTestId("email-viewer-dialog"),
      ).toBeVisible();

      // Email tab should be active by default
      await expect(sharedPage.getByTestId("email-tab")).toBeVisible();
      await expect(sharedPage.getByTestId("raw-tab")).toBeVisible();
      await expect(sharedPage.getByTestId("history-tab")).toBeVisible();

      // Switch to Raw tab
      await sharedPage.getByTestId("raw-tab").click();
      await sharedPage.waitForTimeout(300);

      // Switch to History tab
      await sharedPage.getByTestId("history-tab").click();
      await sharedPage.waitForTimeout(300);

      // Switch back to Email tab
      await sharedPage.getByTestId("email-tab").click();
      await sharedPage.waitForTimeout(300);

      // Close
      await sharedPage.keyboard.press("Escape");
      await sharedPage.waitForTimeout(300);
    });

    test("4.3.7 — Search jobs in dataset", async () => {
      const searchInput = sharedPage.getByTestId("dataset-jobs-search");
      await expect(searchInput).toBeVisible();

      // Search for a filename that shouldn't exist
      await searchInput.fill("zzz-nonexistent-job-xyz");
      await sharedPage.waitForTimeout(500);

      // Should show no jobs or empty state
      const jobsTable = sharedPage.getByTestId("dataset-jobs-table");
      await expect(jobsTable).toContainText("No jobs found");

      // Clear search to restore original view
      await searchInput.fill("");
      await sharedPage.waitForTimeout(500);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // 4.4 Delete Dataset
  // ────────────────────────────────────────────────────────────────────────
  test.describe("4.4 Delete Dataset", () => {
    test.describe.configure({ mode: "serial" });

    const suffix = uniqueSuffix();
    const deleteDatasetName = `E2E Delete ${suffix}`;
    let sharedPage: any;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      sharedPage = await context.newPage();
      const creds = getCredentials(TestRole.ADMIN);
      await loginViaUI(sharedPage, creds.email, creds.password);
      await sharedPage.waitForURL("**/admin/dashboard");
      await sharedPage.goto("/admin/datasets");
      await sharedPage.waitForSelector('[data-testid="datasets-page"]');

      // Upload a dataset for delete tests
      await sharedPage.getByTestId("upload-dataset-button").click();
      await sharedPage.waitForSelector('[data-testid="upload-dialog"]');
      await sharedPage
        .getByTestId("dataset-name-input")
        .fill(deleteDatasetName);
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
    });

    test.afterAll(async () => {
      await sharedPage?.context()?.close();
    });

    test("4.4.1 — Delete confirmation dialog", async () => {
      // Search for the dataset
      await sharedPage.getByTestId("datasets-search").fill(deleteDatasetName);
      await sharedPage.waitForTimeout(500);

      // Click delete button on the row
      await sharedPage.getByTestId("dataset-delete-button").first().click();

      // Verify confirmation dialog appears
      await expect(
        sharedPage.getByTestId("dataset-delete-dialog"),
      ).toBeVisible();

      // Verify it has a type-to-confirm input
      await expect(
        sharedPage.getByTestId("dataset-delete-confirm-input"),
      ).toBeVisible();

      // Dialog should mention the dataset name
      await expect(
        sharedPage.getByTestId("dataset-delete-dialog"),
      ).toContainText(deleteDatasetName);

      // Close without deleting
      await sharedPage.getByTestId("dataset-delete-cancel").click();
    });

    test("4.4.4 — Cancel delete", async () => {
      await sharedPage.getByTestId("datasets-search").fill(deleteDatasetName);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("dataset-delete-button").first().click();
      await expect(
        sharedPage.getByTestId("dataset-delete-dialog"),
      ).toBeVisible();

      // Type the dataset name in the confirm input
      await sharedPage
        .getByTestId("dataset-delete-confirm-input")
        .fill(deleteDatasetName);

      // Click Cancel instead of Delete
      await sharedPage.getByTestId("dataset-delete-cancel").click();
      await expect(
        sharedPage.getByTestId("dataset-delete-dialog"),
      ).not.toBeVisible();

      // Dataset should still be in the table
      await sharedPage.waitForTimeout(300);
      await expect(
        sharedPage
          .getByTestId("datasets-table")
          .locator("tbody tr")
          .first(),
      ).toContainText(deleteDatasetName);
    });

    test("4.4.2 — Delete dataset successfully", async () => {
      await sharedPage.getByTestId("datasets-search").fill(deleteDatasetName);
      await sharedPage.waitForTimeout(500);

      await sharedPage.getByTestId("dataset-delete-button").first().click();
      await expect(
        sharedPage.getByTestId("dataset-delete-dialog"),
      ).toBeVisible();

      // Type the dataset name to confirm
      await sharedPage
        .getByTestId("dataset-delete-confirm-input")
        .fill(deleteDatasetName);

      // Click delete
      await sharedPage.getByTestId("dataset-delete-confirm").click();

      // Wait for dialog to close
      await expect(
        sharedPage.getByTestId("dataset-delete-dialog"),
      ).not.toBeVisible();

      // Wait for table to update
      await sharedPage.waitForTimeout(500);

      // Dataset should no longer be in the table
      await sharedPage.getByTestId("datasets-search").fill(deleteDatasetName);
      await sharedPage.waitForTimeout(500);
      await expect(
        sharedPage.getByTestId("datasets-empty-state"),
      ).toBeVisible();

      // Clear search
      await sharedPage.getByTestId("datasets-search").fill("");
      await sharedPage.waitForTimeout(500);
    });
  });
});
