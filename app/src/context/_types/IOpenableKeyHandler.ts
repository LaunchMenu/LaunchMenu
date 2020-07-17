import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";

/**
 * Any key handler(s) that can be opened in a stack
 */
export type IOpenableKeyHandler = {
    keyHandler?: IKeyEventListener | IKeyEventListener[];
};
