import { TopNav } from '../../components/top-nav/TopNav.js'

export class BasePage {
    /**
     * Base Page Object for the Playwright Main Homepage
     */
    topNav = new TopNav();
    // Base URL handled in wdio.conf.ts
}
