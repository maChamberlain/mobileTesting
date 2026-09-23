import { $ } from '@wdio/globals'

export class LeftSideNav {
    /**
     * Component for the left side nav bar common to Docs and MCP pages.
     * On mobile the sidebar lives inside the hamburger menu: call open() first.
     */
    get menuButton() { return $('nav[aria-label="Main"] button[aria-label="Toggle navigation bar"]') }
    get leftSideNav() { return $('.navbar-sidebar .theme-doc-sidebar-menu') }
    get installationMenuItem() { return this.leftSideNav.$('=Installation') }
    get writingTestsMenuItem() { return this.leftSideNav.$('=Writing tests') }

    // Open the hamburger menu, which shows the section sidebar on Docs/MCP pages
    async open() {
        await this.menuButton.click();
        await this.leftSideNav.waitForDisplayed({ withinViewport: true });
    }
}
