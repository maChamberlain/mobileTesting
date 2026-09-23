import { BasePage } from '../base-page/BasePage.js';
import { LeftSideNav } from '../../components/left-side-nav/LeftSideNav.js'

export class McpSectionPage extends BasePage {
    /**
     * Section base for all MCP pages: adds the MCP left sidebar.
     */
    leftSideNav = new LeftSideNav();
}
