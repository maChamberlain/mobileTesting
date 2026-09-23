import { browser, $ } from '@wdio/globals'
import { McpSectionPage } from './McpSectionPage.js';

export class McpIntroPage extends McpSectionPage {
    /**
     * Page Object for the MCP Introduction page
     */
    get pageHeading() { return $('h1=Playwright MCP') }

    async goto() {
        // Entry point path.
        await browser.url('/mcp/introduction');
    }
}
