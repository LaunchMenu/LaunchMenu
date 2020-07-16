import {IViewStackItem} from "../../stacks/_types/IViewStackItem";
import {IMenu} from "../../menus/menu/_types/IMenu";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";

/**
 * Menu data that can be opened
 */
export type IOpenableMenu =
    | {menu?: IViewStackItem}
    | {
          menu: IMenu;
          menuView?: IViewStackItem;
          menuHandler?: IKeyEventListener;
      };
