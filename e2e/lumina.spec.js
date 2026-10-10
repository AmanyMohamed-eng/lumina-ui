import { test, expect } from '@playwright/test';

/*
 * NOTE FOR REVIEWERS: why beforeEach/afterEach changed
 *
 * BEFORE: page.on('pageerror', (e) => { throw e; });
 *   Throwing inside an event listener does not reliably fail the test.
 *   The error is thrown in the browser-event callback, not in the test's
 *   own flow, so it can be missed or reported against the wrong test.
 *
 * NOW: collect every uncaught page error into an array, then assert the
 *   array is empty after each test. A failing expect() inside afterEach
 *   fails the test normally, and the failure message shows the real error.
 *
 * EFFECT: if any component throws on load or during a test (a typo in
 *   button.js, a bad customElements.define call), the run fails instead
 *   of passing silently.
 *
 * HOW IT WAS CHECKED: added `throw new Error('boom')` to button.js and
 *   confirmed the run failed. Removed it; all tests pass.
 *
 * Nothing else in this file was changed.
 */
let errors;

test.beforeEach(async ({ page }) => {
  errors = [];                                  // fresh list for every test
  page.on('pageerror', (e) => errors.push(e));  // attach BEFORE goto so load-time errors are caught
  await page.goto('/');
});

test.afterEach(() => {
  expect(errors).toEqual([]);                   // any collected page error fails the test
});

test('registry defines all three tags', async ({ page }) => {
  const defined = await page.evaluate(() =>
    ['lumina-button', 'lumina-modal', 'lumina-tabs'].map((t) => !!customElements.get(t)));
  expect(defined).toEqual([true, true, true]);
});

test('button: disabled and loading disable the inner button', async ({ page }) => {
  const inner = (sel) => page.locator(sel).locator('button');
  await expect(inner('lumina-button:has-text("Disabled")')).toBeDisabled();
  await expect(inner('lumina-button:has-text("Loading")')).toBeDisabled();
  await expect(inner('lumina-button:has-text("Loading")')).toHaveAttribute('aria-busy', 'true');
  await expect(inner('lumina-button:has-text("Primary")')).toBeEnabled();
});

test('modal: Escape closes, close event fires, focus returns', async ({ page }) => {
  const trigger = page.locator('#open-modal');
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#demo-modal')).not.toHaveAttribute('open', '');
  await expect(page.locator('#modal-status')).toHaveText('Modal closed.');
  await expect(trigger.locator('button')).toBeFocused();
});

test('modal: backdrop click closes it', async ({ page }) => {
  await page.locator('#open-modal').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('tabs: arrows, wrap, Home and End', async ({ page }) => {
  const tabs = page.getByRole('tab');
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tabs.nth(0)).toBeFocused();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
});

test('tabs: ARIA ids are linked', async ({ page }) => {
  const tab = page.getByRole('tab').nth(1);
  const controls = await tab.getAttribute('aria-controls');
  await expect(page.locator(`[id="${controls}"]`)).toHaveAttribute('aria-labelledby', (await tab.getAttribute('id')));
});

test('playground: control updates preview and snippet', async ({ page }) => {
  await page.locator('#pg-variant').selectOption('danger');
  await page.locator('#pg-disabled').check();
  await expect(page.locator('#pg-preview')).toHaveAttribute('variant', 'danger');
  await expect(page.locator('#pg-code')).toHaveText(
    '<lumina-button variant="danger" size="md" disabled>Button</lumina-button>');
});

test('theme: toggle flips data-theme and persists', async ({ page }) => {
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator('#theme-toggle').click();
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(after).not.toBe(before);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(after);
});
