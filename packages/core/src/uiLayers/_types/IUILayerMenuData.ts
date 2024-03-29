import {IMenu} from "../../menus/menu/_types/IMenu";
import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IUUID} from "../../_types/IUUID";
import {IViewStackItem} from "./IViewStackItem";
import {IMenuItemExecuteCallback} from "../../menus/menu/_types/IMenuItemExecuteCallback";

/** The menu data for the ui layer */
export type IUILayerMenuData = {
    /** A unique ID for the given menu */
    ID: IUUID;
    /** The menu's view */
    menuView: IViewStackItem;
    /** The menu data structure */
    menu?: IMenu;
    /** The menu's key handler */
    menuHandler?: IKeyEventListener;
    /** The callback to perform when an item in the menu is executed */
    onExecute?: IMenuItemExecuteCallback;
    /** Whether a search field should be generated for the passed menu (defaults to true) */
    searchable?: boolean;
    /** Whether the content of this menu should be displayed */
    hideItemContent?: boolean;
    /** Whether to destroy the menu when closing this layer (defaults to true) */
    destroyOnClose?: boolean;
    /** The overlay group to use, making sure that only the bottom view with the same group in a continuous sequence is shown */
    overlayGroup?: Symbol;
    /** Whether to prevent the layer from closing when the user uses their back key, defaults to whether a menu handler is present */
    handleClose?: boolean;
};
