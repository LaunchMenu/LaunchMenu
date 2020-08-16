import {IKeyEventListener} from "../../stacks/keyHandlerStack/_types/IKeyEventListener";
import {IKeyHandlerStack} from "../../stacks/keyHandlerStack/_types/IKeyHandlerStack";
import {IPartialIOContext} from "./IIOContext";

/**
 * Any key handler(s) that can be opened in a stack
 */
export type IOpenableKeyHandler = {
    /** The key handler(s) to add to the stack, with the last listener on top */
    keyHandler?: IKeyEventListener | IKeyEventListener[];
    /** Whether or not to destroy the field when removed from the stack, defaults to true */
    destroyOnClose?: boolean;
};

/**
 * Retrieves the required context data for a openable key handler
 */
export type TPartialContextFromKeyHandler<IOpenable> =
    // keyHandler -> keyHandler
    (IOpenable extends {keyHandler: any} ? {keyHandler: IKeyHandlerStack} : unknown) &
        IPartialIOContext;
