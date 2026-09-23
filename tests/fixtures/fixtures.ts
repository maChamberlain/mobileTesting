import { browser } from '@wdio/globals'
import { HomePage } from '../pages/home-page/HomePage.js';
import { DocsIntroPage } from '../pages/docs-page/DocsIntroPage.js';
import { WritingTestsPage } from '../pages/docs-page/WritingTestsPage.js';
import { McpIntroPage } from '../pages/mcp-page/McpIntroPage.js';

/*
* Mocha has no fixtures, so each one is a setup function: it creates the page object,
* navigates to it, and returns it. Call them from a beforeEach in the spec.
*/
export const fixtures = {
    homePage: async () => {
        const homePage = new HomePage();
        await homePage.goto();
        return homePage;
    },

    docsPage: async () => {
        const docsPage = new DocsIntroPage();
        await docsPage.goto();
        return docsPage;
    },

    writingTestsPage: async () => {
        const writingTestsPage = new WritingTestsPage();
        await writingTestsPage.goto();
        return writingTestsPage;
    },

    mcpPage: async () => {
        const mcpPage = new McpIntroPage();
        await mcpPage.goto();
        return mcpPage;
    },
};

// toHaveUrl() needs an absolute URL: resolve a path against baseUrl in wdio.conf.ts
export function fullUrl(path: string) {
    return new URL(path, browser.options.baseUrl).href;
}

export { $, browser, expect } from '@wdio/globals';
