import {IMenu} from "../../menus/menu/_types/IMenu";
import {IOpenableField} from "./IOpenableField";
import {IOpenableContent} from "./IOpenableContent";
import {IOpenableMenu} from "./IOpenableMenu";
import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";

/**
 * Any data that can be opened in a stack
 */
export type IOpenableUI = IOpenableMenu &
    IOpenableField &
    IOpenableContent & {
        keyHandler?: IKeyEventListener | IKeyEventListener[];
    };
