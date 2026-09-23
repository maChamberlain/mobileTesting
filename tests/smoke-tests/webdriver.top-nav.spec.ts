import { expect, fixtures } from '../fixtures/fixtures.js';
import { TopNav } from '../components/top-nav/TopNav.js';

/*
* Atomic tests to validate all items in the top navigation bar are displayed.
*/

// Open the mobile hamburger menu, then expect topNav to display: Docs, MCP, CLI, API
async function expectTopNavItemsVisible(topNav: TopNav) {
    await topNav.open();
    await expect(topNav.docsLink).toBeDisplayed({ withinViewport: true });
    await expect(topNav.mcpLink).toBeDisplayed({ withinViewport: true });
    await expect(topNav.cliLink).toBeDisplayed({ withinViewport: true });
    await expect(topNav.apiLink).toBeDisplayed({ withinViewport: true });
}

describe('Top Nav - item visibility @smoke', () => {

    // Check Top Nav of the Home Page
    it('Playwright Home page - Top nav items are displayed', async () => {
        const homePage = await fixtures.homePage();
        await expectTopNavItemsVisible(homePage.topNav);
    });

    // Check Top Nav of the Docs Page
    it('Playwright Docs page - Top nav items are displayed', async () => {
        const docsPage = await fixtures.docsPage();
        await expectTopNavItemsVisible(docsPage.topNav);
    });

    // Check Top Nav of the MCP Page
    it('Playwright MCP page - Top nav items are displayed', async () => {
        const mcpPage = await fixtures.mcpPage();
        await expectTopNavItemsVisible(mcpPage.topNav);
    });
});
