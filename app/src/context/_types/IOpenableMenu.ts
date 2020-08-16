import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IHighlighter} from "../../textFields/syntax/_types/IHighlighter";
import {IViewStack} from "../../stacks/_types/IViewStack";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IUndoRedoFacility} from "../../undoRedo/_types/IUndoRedoFacility";
import {IPartialIOContext, IIOContext} from "./IIOContext";

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

/**
 * Retrieves the required context data for a openable menu
 */
export type TPartialContextFromMenu<IOpenable> =
    // menu -> panes.menu
    (IOpenable extends {menu: any} ? {panes: {menu: IViewStack}} : unknown) &
        // searchable!=false -> all of IOContext
        (IOpenable extends {searchable: false} ? unknown : IIOContext) &
        // menu==IMenu -> keyHandler
        (IOpenable extends {menu: IMenu} ? {keyHandler: IKeyHandlerStack} : unknown) &
        // menu==IMenu && !menuHandler -> all of IOContext
        (IOpenable extends {menu: IMenu}
            ? IOpenable extends {menuHandler: IKeyEventListener}
                ? unknown
                : IIOContext
            : unknown) &
        IPartialIOContext;
