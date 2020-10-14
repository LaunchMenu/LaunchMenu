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
};
