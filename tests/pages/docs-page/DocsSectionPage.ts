import { BasePage } from '../base-page/BasePage.js';
import { LeftSideNav } from '../../components/left-side-nav/LeftSideNav.js'

export class DocsSectionPage extends BasePage {
    /**
     * Section base for all Docs pages: adds the docs left sidebar.
     */
    leftSideNav = new LeftSideNav();
}
