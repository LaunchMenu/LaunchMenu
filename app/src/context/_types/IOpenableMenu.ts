import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IHighlighter} from "../../textFields/syntax/_types/IHighlighter";

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
          /** Whether to create a search field for this menu, defaults to true. Only generates search fields if no other field is specified */
          searchable?: boolean;
          /** The syntax highlighter to use for the search field, will be ignored if search is false or a field is provided */
          highlighter?: IHighlighter;
          /** Whether or not to destroy the menu when removed from the stack, defaults to true */
          destroyOnClose?: boolean;
      };
