import { browser, expect, fixtures, fullUrl } from '../fixtures/fixtures.js';
import { DocsIntroPage } from '../pages/docs-page/DocsIntroPage.js';
import { WritingTestsPage } from '../pages/docs-page/WritingTestsPage.js';

/*
* Atomic tests to validate the Docs Page Leftside Navigation menu navigates correctly
*/

describe('Docs page - Leftside Nav navigation @smoke', () => {
    let docsPage: DocsIntroPage;

    beforeEach(async () => {
        docsPage = await fixtures.docsPage();
    });

    // Leftside Nav of the Docs Page navigates correctly
    it('Leftside Nav - Select Installation', async () => {
        // Open the mobile hamburger menu
        await docsPage.leftSideNav.open();
        // Click the Installation Leftside nav item
        await docsPage.leftSideNav.installationMenuItem.click();
        // URL Should be for the Installation page
        await expect(browser).toHaveUrl(fullUrl('/docs/intro'));
    });

    it('Leftside Nav - Select Writing Tests', async () => {
        const writingTestsPage = new WritingTestsPage();
        // Open the mobile hamburger menu
        await docsPage.leftSideNav.open();
        // Click the Writing Tests Leftside nav item
        await docsPage.leftSideNav.writingTestsMenuItem.click();
        // URL Should be for the Writing Tests page
        await expect(browser).toHaveUrl(fullUrl('/docs/writing-tests'));
        await expect(writingTestsPage.pageHeading).toBeDisplayed();
    });
});
