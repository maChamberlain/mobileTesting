import { browser } from '@wdio/globals'
import { DocsSectionPage } from './DocsSectionPage.js';

export class DocsIntroPage extends DocsSectionPage {
    /**
     * Page Object for the Docs Intro page (/docs/intro)
     */
    async goto() {
        // Entry point path.
        await browser.url('/docs/intro');
    }
}
