import { test, expect } from "@playwright/test";
import {
  TestRole,
  getCredentials,
  getDeactivatedCredentials,
  loginViaUI,
  logoutViaUI,
} from "../fixtures/auth";

test.describe("Deactivated Account", () => {
  test("1.2.5 — deactivated account shows deactivation message", async ({
    page,
  }) => {
    const creds = getDeactivatedCredentials();
    await loginViaUI(page, creds.email, creds.password);

    const errorAlert = page.getByTestId("login-error");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(
      "This account has been deactivated.",
    );
  });
});

test.describe("Unauthenticated Route Guards", () => {
  test("1.3.1 — /admin/dashboard redirects to /login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/login");
    await expect(page.getByTestId("login-email")).toBeVisible();
  });

  test("1.3.2 — /annotator/dashboard redirects to /login", async ({
    page,
  }) => {
    await page.goto("/annotator/dashboard");
    await page.waitForURL("**/login");
    await expect(page.getByTestId("login-email")).toBeVisible();
  });

  test("1.3.3 — /qa/dashboard redirects to /login", async ({ page }) => {
    await page.goto("/qa/dashboard");
    await page.waitForURL("**/login");
    await expect(page.getByTestId("login-email")).toBeVisible();
  });
});

test.describe("Role-Based Access Control", () => {
  test("1.3.4 — annotator blocked from /admin/dashboard", async ({
    page,
  }) => {
    const creds = getCredentials(TestRole.ANNOTATOR);
    await loginViaUI(page, creds.email, creds.password);
    await page.waitForURL(`**${creds.dashboardPath}`);

    await page.goto("/admin/dashboard");
    await page.waitForURL("**/unauthorized");
    await expect(page.getByTestId("unauthorized-page")).toBeVisible();
  });

  test("1.3.5 — QA blocked from /admin/users", async ({ page }) => {
    const creds = getCredentials(TestRole.QA);
    await loginViaUI(page, creds.email, creds.password);
    await page.waitForURL(`**${creds.dashboardPath}`);

    await page.goto("/admin/users");
    await page.waitForURL("**/unauthorized");
    await expect(page.getByTestId("unauthorized-page")).toBeVisible();
  });

  test("1.3.6 — admin blocked from /annotator/dashboard", async ({
    page,
  }) => {
    const creds = getCredentials(TestRole.ADMIN);
    await loginViaUI(page, creds.email, creds.password);
    await page.waitForURL(`**${creds.dashboardPath}`);

    await page.goto("/annotator/dashboard");
    await page.waitForURL("**/unauthorized");
    await expect(page.getByTestId("unauthorized-page")).toBeVisible();
  });

  test("1.3.7 — admin blocked from /qa/dashboard", async ({ page }) => {
    const creds = getCredentials(TestRole.ADMIN);
    await loginViaUI(page, creds.email, creds.password);
    await page.waitForURL(`**${creds.dashboardPath}`);

    await page.goto("/qa/dashboard");
    await page.waitForURL("**/unauthorized");
    await expect(page.getByTestId("unauthorized-page")).toBeVisible();
  });
});

test.describe("Session Management", () => {
  test("1.3.9 — logout clears session", async ({ page }) => {
    const creds = getCredentials(TestRole.ADMIN);
    await loginViaUI(page, creds.email, creds.password);
    await page.waitForURL(`**${creds.dashboardPath}`);

    await logoutViaUI(page);
    await page.waitForURL("**/login");
    await expect(page.getByTestId("login-email")).toBeVisible();

    // Verify session is truly cleared — navigating to protected route redirects to login
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/login");
    await expect(page.getByTestId("login-email")).toBeVisible();
  });

  test("1.3.10 — root redirects to role dashboard", async ({ page }) => {
    const creds = getCredentials(TestRole.ANNOTATOR);
    await loginViaUI(page, creds.email, creds.password);
    await page.waitForURL(`**${creds.dashboardPath}`);

    await page.goto("/");
    await page.waitForURL("**/annotator/dashboard");
  });
});
