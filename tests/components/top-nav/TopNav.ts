import { $, browser } from '@wdio/globals'

export class TopNav {
    /**
     * Component for the top nav bar common to pages.
     * On mobile the nav links are collapsed behind the hamburger menu: call open() first.
     */
    get mainContainer() { return $('nav[aria-label="Main"]') }
    get menuButton() { return this.mainContainer.$('button[aria-label="Toggle navigation bar"]') }
    // The opened hamburger menu (drawer) holding the nav links on mobile
    get menuDrawer() { return this.mainContainer.$('.navbar-sidebar') }
    // On Docs/MCP pages the drawer opens on the section's sidebar (the secondary menu)
    get secondaryMenuShown() { return this.menuDrawer.$('.navbar-sidebar__items--show-secondary') }
    // Returns from the section's sidebar to the nav links
    get backToMainMenuButton() { return this.menuDrawer.$('button=← Back to main menu') }
    get docsLink() { return this.menuDrawer.$('=Docs') }
    get mcpLink() { return this.menuDrawer.$('=MCP') }
    get cliLink() { return this.menuDrawer.$('=CLI') }
    get apiLink() { return this.menuDrawer.$('=API') }
    get searchButton() { return this.mainContainer.$('button[aria-label^="Search"]') }
    // The search bar renders inside a modal outside the nav, so it is page scoped
    get searchBar() { return $('input[type="search"]') }

    // Press the on-screen keyboard's Search key. A WebDriver Enter key arrives mid-IME-composition
    // on Android Chrome, and the search modal ignores it; the IME action key commits it first.
    async pressKeyboardSearchKey() {
        await browser.execute('mobile: performEditorAction', { action: 'search' });
    }

    // Open the hamburger menu and show the top nav links
    async open() {
        await this.menuButton.click();
        if (await this.secondaryMenuShown.isExisting()) {
            await this.backToMainMenuButton.click();
        }
        await this.docsLink.waitForDisplayed({ withinViewport: true });
    }
}
