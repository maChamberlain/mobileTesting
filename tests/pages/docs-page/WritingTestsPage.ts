import { browser, $ } from '@wdio/globals'
import { DocsSectionPage } from './DocsSectionPage.js';

export class WritingTestsPage extends DocsSectionPage {
    /**
     * Page Object for the Writing Tests docs page
     */
    get pageHeading() { return $('h1=Writing tests') }

    async goto() {
        // Entry point path.
        await browser.url('/docs/writing-tests');
    }
}
