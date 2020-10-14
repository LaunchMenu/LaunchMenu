import {IMenu} from "../../menus/menu/_types/IMenu";
import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IHighlighter} from "../../textFields/syntax/_types/IHighlighter";
import {IViewStackItem} from "../../uiLayers/_types/IViewStackItem";
import {IMenuItemExecuteCallback} from "../../menus/menu/_types/IMenuItemExecuteCallback";

/**
 * Menu data that can be opened
 */
export type IOpenableMenu =
    | {
          /** UI to open in the menu stack */
          menu?: IViewStackItem;
      }
    | {
          /** The menu to be opened */
          menu: IMenu;
          /** The view of the menu, will be generated if left out */
          menuView?: IViewStackItem;
          /** The key handler of the menu, will be generated if left out */
          menuHandler?: IKeyEventListener;
          /** A onExecute callback that will be forwarded to the created menuHandler (doesn't work if menuHandler is specified) */
          onExecute?: IMenuItemExecuteCallback;
          /** Whether the UI should close on escape */
          closable?: boolean;
          /** Whether to create a search field for this menu, defaults to true. Only generates search fields if no other field is specified */
          searchable?: boolean;
          /** The syntax highlighter to use for the search field, will be ignored if search is false or a field is provided */
          highlighter?: IHighlighter;
          /** Whether or not to destroy the menu when removed from the stack, defaults to true */
          destroyOnClose?: boolean;
      };
