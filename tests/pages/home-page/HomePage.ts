import { browser } from '@wdio/globals'
import { BasePage } from '../base-page/BasePage.js';

export class HomePage extends BasePage {
    /**
     * Page Object for the playwright.dev Home page
     */
    async goto() {
        // Entry point path.
        await browser.url('/');
    }
}
