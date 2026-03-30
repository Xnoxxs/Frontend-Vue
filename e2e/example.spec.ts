import { test, expect } from '@playwright/test'

test('homepage loads and has title', async ({ page }) => {
  await page.goto('http://localhost:5174')

  await expect(page).toHaveTitle(/./)
})

test('this test should fail', async ({ page }) => {
  await page.goto('http://localhost:5174')

  // This will FAIL intentionally
  await expect(page.locator('h1')).toHaveText('THIS DOES NOT EXIST')
})
