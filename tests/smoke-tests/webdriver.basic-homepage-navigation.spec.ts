import { browser, expect, fixtures, fullUrl } from '../fixtures/fixtures.js';
import { HomePage } from '../pages/home-page/HomePage.js';

/*
* Atomic tests to validate the Top Navigation menu of the Home page navigates correctly
*/

describe('Home page - Top Nav navigation @smoke', () => {
    let homePage: HomePage;

    beforeEach(async () => {
        homePage = await fixtures.homePage();
    });

    // Check Top Nav of the Home Page
    it('Top Nav - From Home page to Docs Page navigation', async () => {
        // Open the mobile hamburger menu
        await homePage.topNav.open();
        // Click the Docs top nav item
        await homePage.topNav.docsLink.click();
        // URL Should be for the Docs page
        await expect(browser).toHaveUrl(fullUrl('/docs/intro'));
    });

    // Check Top Nav of the Docs Page
    it('Top Nav - MCP link navigates to MCP documentation URL', async () => {
        // Open the mobile hamburger menu
        await homePage.topNav.open();
        // Click the MCP top nav item
        await homePage.topNav.mcpLink.click();
        // URL Should be for the Docs page
        await expect(browser).toHaveUrl(fullUrl('/mcp/introduction'));
    });
});
