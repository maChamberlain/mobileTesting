import { $, browser, expect, fixtures, fullUrl } from '../fixtures/fixtures.js';
import { HomePage } from '../pages/home-page/HomePage.js';
import { McpIntroPage } from '../pages/mcp-page/McpIntroPage.js';

/*
* Basic test to validate searching from the top nav directs to the correct page
*/

describe('Top Nav - search @search', () => {
    let homePage: HomePage;

    beforeEach(async () => {
        homePage = await fixtures.homePage();
    });

    // Search for 'mcp' and land on the MCP Introduction page
    it('Search - Searching for mcp navigates to the MCP Introduction page', async () => {
        // Open the search modal
        await homePage.topNav.searchButton.click();
        // Click the search bar input field
        await homePage.topNav.searchBar.click();
        // Fill the search text
        await homePage.topNav.searchBar.setValue('mcp');
        // Results load async, wait for the top result
        await expect($('[role="option"]')).toBeDisplayed();
        // Submit to select the top result, using the keyboard's Search key
        await homePage.topNav.pressKeyboardSearchKey();
        // URL Should be for the MCP Introduction page
        await expect(browser).toHaveUrl(fullUrl('/mcp/introduction'));
        // The MCP Introduction page heading should be displayed
        const mcpPage = new McpIntroPage();
        await expect(mcpPage.pageHeading).toBeDisplayed();
    });
});
