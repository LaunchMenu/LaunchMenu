import {IOpenableField} from "./IOpenableField";
import {IOpenableContent} from "./IOpenableContent";
import {IOpenableMenu} from "./IOpenableMenu";
import {IOpenableKeyHandler} from "./IOpenableKeyHandler";

/**
 * Any data that can be opened in a stack
 */
export type IOpenableUI = IOpenableMenu &
    IOpenableField &
    IOpenableContent &
    IOpenableKeyHandler;
