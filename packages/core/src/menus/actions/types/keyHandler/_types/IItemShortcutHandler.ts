import {IIOContext} from "../../../../../context/_types/IIOContext";
import {KeyPattern} from "../../../../items/inputs/handlers/keyPattern/KeyPattern";
import {IExecutable} from "../../execute/_types/IExecutable";

/**
 * The data used to create a shortcut handler
 */
export type IItemShortcutHandler = {
    shortcut: KeyPattern | ((context: IIOContext) => KeyPattern);
    onExecute?: IExecutable["execute"];
};
