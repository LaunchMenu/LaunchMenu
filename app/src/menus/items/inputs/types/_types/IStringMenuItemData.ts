import {IInputFieldError} from "../../../../../textFields/types/inputField/_types/IInputFieldError";
import {IActionBinding} from "../../../../actions/_types/IActionBinding";

/** The input data to create a string menu item */
export type IStringMenuItemData = {
    /** The default value for the field */
    init: string;
    /** Whether to update the field as you type, defaults to false */
    liveUpdate?: boolean;
    /** Whether the change in value should be undoable, defaults to false, can't be used together with liveUpdate */
    undoable?: boolean;
    /** The name of the field */
    name: string;
    /** The description of the menu item */
    description?: string;
    /** The tags for the menu item */
    tags?: string[];
    /** Checks whether the given input is valid */
    checkValidity?: (v: string) => IInputFieldError | undefined;
    /** The extra action bindings */
    actionBindings?: IActionBinding<any>[];
    /** Whether the field should be resetable to the initial value, defaults to false */
    resetable?: boolean;
    /** Whether the reset should be undoable, defaults to value of undoable */
    resetUndoable?: boolean;
};
